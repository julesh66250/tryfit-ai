import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

// La génération d'image peut prendre 20-40s
export const maxDuration = 60

const GEMINI_MODEL = 'gemini-3.1-flash-image'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'

const PERSON_BUCKET = 'person-images'
const GARMENT_BUCKET = 'garment-images'
const RESULT_BUCKET = 'result-images'

/** Une image envoyée par le client : soit un fichier stocké, soit un lien externe */
type ImageRef = { path?: string; url?: string }
type PieceRef = ImageRef & { category: string }

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'haut (t-shirt, pull, veste, chemise...)',
  bottoms: 'bas (pantalon, short, jupe...)',
  'one-pieces': 'robe ou combinaison',
  shoes: 'chaussures',
  hats: 'couvre-chef (casquette, chapeau, bonnet...)',
  jewelry: 'accessoire (bijou, lunettes, sac, montre...)',
}

type LoadedImage = { data: string; mimeType: string }

/**
 * Charge une image en base64.
 * Les fichiers uploadés sont lus directement depuis le bucket privé
 * (pas d'URL publique : les photos des utilisateurs ne sortent jamais).
 */
async function loadImage(
  ref: ImageRef,
  bucket: string,
  supabase: ReturnType<typeof createClient>
): Promise<LoadedImage> {
  if (ref.path) {
    const { data, error } = await supabase.storage.from(bucket).download(ref.path)
    if (error || !data) throw new Error(`Lecture impossible : ${bucket}/${ref.path}`)
    const buffer = Buffer.from(await data.arrayBuffer())
    return { data: buffer.toString('base64'), mimeType: data.type || 'image/jpeg' }
  }

  if (ref.url) {
    const res = await fetch(ref.url)
    if (!res.ok) throw new Error(`Téléchargement impossible : ${ref.url}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    return {
      data: buffer.toString('base64'),
      mimeType: res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg',
    }
  }

  throw new Error('Image sans chemin ni URL')
}

/** Cherche l'image générée dans la réponse (l'API a plusieurs formes possibles) */
function extractImage(json: unknown): LoadedImage | null {
  const obj = json as Record<string, unknown>

  const outputImage = obj?.output_image as Record<string, unknown> | undefined
  if (typeof outputImage?.data === 'string') {
    return { data: outputImage.data, mimeType: (outputImage.mime_type as string) ?? 'image/png' }
  }

  const candidates = obj?.candidates as Array<Record<string, unknown>> | undefined
  const parts = (candidates?.[0]?.content as Record<string, unknown> | undefined)?.parts as
    | Array<Record<string, unknown>>
    | undefined

  if (parts) {
    for (const part of parts) {
      const inline = (part.inlineData ?? part.inline_data) as Record<string, unknown> | undefined
      if (typeof inline?.data === 'string') {
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

  const fail = async (message: string, status: number, logDetail?: unknown) => {
    if (logDetail) console.error(message, logDetail)
    if (generationId) {
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: message })
        .eq('id', generationId)
    }
    return NextResponse.json({ error: message }, { status })
  }

  try {
    const body = await req.json()
    const { person, pieces, generationId: genId } = body as {
      person: ImageRef
      pieces: PieceRef[]
      generationId: string
    }
    generationId = genId

    if (!person || !Array.isArray(pieces) || pieces.length === 0 || !generationId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return fail('Configuration serveur incomplète', 500, 'GEMINI_API_KEY manquante')
    }

    await supabase
      .from('generations')
      .update({ status: 'processing' })
      .eq('id', generationId)
      .eq('user_id', user.id)

    // Charger toutes les images en parallèle
    const [personImage, ...garmentImages] = await Promise.all([
      loadImage(person, PERSON_BUCKET, supabase),
      ...pieces.map((p) => loadImage(p, GARMENT_BUCKET, supabase)),
    ])

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
      return fail('Erreur lors de la génération', 500, await geminiRes.text())
    }

    const image = extractImage(await geminiRes.json())
    if (!image) {
      return fail('Aucune image générée', 500)
    }

    // PNG → JPEG : environ 6x plus léger, sans différence visible sur une photo
    const jpeg = await sharp(Buffer.from(image.data, 'base64'))
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()

    const resultPath = `${user.id}/result_${Date.now()}.jpg`

    const { data: uploaded, error: uploadError } = await supabase.storage
      .from(RESULT_BUCKET)
      .upload(resultPath, jpeg, { contentType: 'image/jpeg', upsert: true })

    if (uploadError || !uploaded) {
      return fail('Erreur de sauvegarde', 500, uploadError)
    }

    const { data: urlData } = supabase.storage.from(RESULT_BUCKET).getPublicUrl(uploaded.path)
    const resultUrl = urlData.publicUrl

    await supabase
      .from('generations')
      .update({ status: 'completed', result_image_url: resultUrl })
      .eq('id', generationId)

    // 1 crédit par génération, quel que soit le nombre de pièces
    await supabase.rpc('deduct_credit', { user_id_input: user.id })

    // Les photos sources ne servent plus : on libère le stockage tout de suite
    const personPaths = person.path ? [person.path] : []
    const garmentPaths = pieces.map((p) => p.path).filter((p): p is string => Boolean(p))

    await Promise.all([
      personPaths.length ? supabase.storage.from(PERSON_BUCKET).remove(personPaths) : null,
      garmentPaths.length ? supabase.storage.from(GARMENT_BUCKET).remove(garmentPaths) : null,
    ]).catch((err) => console.error('Purge des sources échouée (non bloquant) :', err))

    return NextResponse.json({ resultUrl, generationId })

  } catch (error) {
    return fail('Erreur interne', 500, error)
  }
}
