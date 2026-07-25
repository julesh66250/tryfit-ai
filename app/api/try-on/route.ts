import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// La génération d'image peut prendre 20-40s
export const maxDuration = 60

const GEMINI_MODEL = 'gemini-3.1-flash-image'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'

type Piece = { url: string; category: string }

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'haut (t-shirt, pull, veste, chemise...)',
  bottoms: 'bas (pantalon, short, jupe...)',
  'one-pieces': 'robe ou combinaison',
  shoes: 'chaussures',
  hats: 'couvre-chef (casquette, chapeau, bonnet...)',
  jewelry: 'accessoire (bijou, lunettes, sac, montre...)',
}

/** Télécharge une image et la convertit en base64 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Impossible de télécharger l'image : ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const mimeType = res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg'
  return { data: buffer.toString('base64'), mimeType }
}

/** Cherche l'image générée dans la réponse (l'API a plusieurs formes possibles) */
function extractImage(json: unknown): { data: string; mimeType: string } | null {
  const obj = json as Record<string, unknown>

  // Forme "interactions" : { output_image: { data, mime_type } }
  const outputImage = obj?.output_image as Record<string, unknown> | undefined
  if (outputImage?.data && typeof outputImage.data === 'string') {
    return {
      data: outputImage.data,
      mimeType: (outputImage.mime_type as string) ?? 'image/png',
    }
  }

  // Forme "generateContent" : { candidates: [{ content: { parts: [{ inlineData }] } }] }
  const candidates = obj?.candidates as Array<Record<string, unknown>> | undefined
  const parts = (candidates?.[0]?.content as Record<string, unknown> | undefined)?.parts as
    | Array<Record<string, unknown>>
    | undefined

  if (parts) {
    for (const part of parts) {
      const inline = (part.inlineData ?? part.inline_data) as Record<string, unknown> | undefined
      if (inline?.data && typeof inline.data === 'string') {
        return {
          data: inline.data,
          mimeType: (inline.mimeType as string) ?? (inline.mime_type as string) ?? 'image/png',
        }
      }
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits, is_premium')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 })
  }

  if (profile.credits <= 0) {
    return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })
  }

  let generationId: string | undefined

  try {
    const body = await req.json()
    const { personImageUrl, pieces, generationId: genId } = body as {
      personImageUrl: string
      pieces: Piece[]
      generationId: string
    }
    generationId = genId

    if (!personImageUrl || !Array.isArray(pieces) || pieces.length === 0 || !generationId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY manquante')
      return NextResponse.json({ error: 'Configuration serveur incomplète' }, { status: 500 })
    }

    await supabase
      .from('generations')
      .update({ status: 'processing' })
      .eq('id', generationId)
      .eq('user_id', user.id)

    // Télécharger toutes les images en parallèle
    const [personImage, ...garmentImages] = await Promise.all([
      fetchImageAsBase64(personImageUrl),
      ...pieces.map((p) => fetchImageAsBase64(p.url)),
    ])

    // Construire le prompt
    const garmentList = pieces
      .map((p, i) => `- Image ${i + 2} : ${CATEGORY_LABELS[p.category] ?? 'vêtement'}`)
      .join('\n')

    const prompt = `Tu es un moteur d'essayage virtuel photoréaliste.

L'image 1 est la photo d'une personne. Les images suivantes sont des vêtements ou accessoires :
${garmentList}

Génère une seule photo montrant EXACTEMENT la même personne que sur l'image 1, portant TOUS les vêtements et accessoires des images suivantes en même temps.

Règles strictes :
- Le visage, la coiffure, la carnation, la morphologie et la pose de la personne doivent rester rigoureusement identiques à l'image 1.
- L'arrière-plan, le cadrage et l'éclairage de l'image 1 doivent être conservés.
- Chaque vêtement doit garder sa couleur, sa texture, son motif et sa coupe exacts tels qu'ils apparaissent sur son image de référence.
- Les vêtements doivent tomber naturellement sur le corps, avec des plis et des ombres réalistes.
- Remplace les vêtements d'origine de la personne par ceux fournis, sans rien ajouter d'autre.
- Le résultat doit ressembler à une vraie photographie, pas à un montage ni à une illustration.`

    const input = [
      { type: 'text', text: prompt },
      { type: 'image', mime_type: personImage.mimeType, data: personImage.data },
      ...garmentImages.map((img) => ({
        type: 'image',
        mime_type: img.mimeType,
        data: img.data,
      })),
    ]

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input,
        response_format: {
          type: 'image',
          aspect_ratio: '3:4',
          image_size: profile.is_premium ? '2K' : '1K',
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Erreur Gemini:', geminiRes.status, errText)

      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Erreur de génération' })
        .eq('id', generationId)

      return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
    }

    const geminiJson = await geminiRes.json()
    const image = extractImage(geminiJson)

    if (!image) {
      console.error('Aucune image dans la réponse Gemini:', JSON.stringify(geminiJson).slice(0, 500))

      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Aucune image générée' })
        .eq('id', generationId)

      return NextResponse.json({ error: 'Aucune image générée' }, { status: 500 })
    }

    // Sauvegarder l'image dans Supabase Storage (bucket public)
    const ext = image.mimeType.includes('jpeg') ? 'jpg' : 'png'
    const path = `${user.id}/result_${Date.now()}.${ext}`

    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('result-images')
      .upload(path, Buffer.from(image.data, 'base64'), {
        contentType: image.mimeType,
        upsert: true,
      })

    if (uploadError || !uploaded) {
      console.error('Erreur upload résultat:', uploadError)

      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Erreur de sauvegarde' })
        .eq('id', generationId)

      return NextResponse.json({ error: 'Erreur de sauvegarde' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('result-images').getPublicUrl(uploaded.path)
    const resultUrl = urlData.publicUrl

    await supabase
      .from('generations')
      .update({ status: 'completed', result_image_url: resultUrl })
      .eq('id', generationId)

    // 1 crédit par génération, quel que soit le nombre de pièces
    await supabase.rpc('deduct_credit', { user_id_input: user.id })

    return NextResponse.json({ resultUrl, generationId })

  } catch (error) {
    console.error('Erreur API try-on:', error)

    if (generationId) {
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Erreur interne' })
        .eq('id', generationId)
    }

    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
