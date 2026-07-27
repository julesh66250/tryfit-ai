import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

// La génération d'image peut prendre 20-40s
export const maxDuration = 60

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'

// Plan Pro : modèle le plus avancé de Google, sortie 2K (~13 centimes)
// Gratuit et Starter : modèle rapide, sortie 1K (~7 centimes)
const MODEL_PRO = 'gemini-3-pro-image'
const MODEL_STANDARD = 'gemini-3.1-flash-image'

const PERSON_BUCKET = 'person-images'
const GARMENT_BUCKET = 'garment-images'
const RESULT_BUCKET = 'result-images'

/** Une image envoyée par le client : soit un fichier stocké, soit un lien externe */
type ImageRef = { path?: string; url?: string }
type PieceRef = ImageRef & { category: string; hood?: 'auto' | 'down' | 'up' }

const HOOD_INSTRUCTIONS: Record<string, string> = {
  down: " — CE VÊTEMENT A UNE CAPUCHE : elle doit rester BAISSÉE dans le dos, à plat sur les épaules, jamais sur la tête",
  up: " — CE VÊTEMENT A UNE CAPUCHE : elle doit être RELEVÉE sur la tête, bien centrée et enfilée, avec ses éventuels détails (lunettes, logo) visibles de face sur le front",
}

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

/**
 * Cherche l'image générée n'importe où dans la réponse.
 * L'API renvoie le base64 sous des formes variables (output_image, inlineData,
 * inline_data, imageBytes...) : plutôt que de deviner, on parcourt tout l'objet
 * et on retient la première longue chaîne base64 trouvée.
 */
function extractImage(json: unknown): LoadedImage | null {
  const IMAGE_KEYS = ['data', 'imageBytes', 'image_bytes', 'b64_json', 'bytesBase64Encoded']
  const MIME_KEYS = ['mimeType', 'mime_type', 'contentType', 'content_type']
  const seen = new Set<unknown>()

  const walk = (node: unknown): LoadedImage | null => {
    if (!node || typeof node !== 'object' || seen.has(node)) return null
    seen.add(node)

    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item)
        if (found) return found
      }
      return null
    }

    const obj = node as Record<string, unknown>

    for (const key of IMAGE_KEYS) {
      const value = obj[key]
      // Une image fait forcément plusieurs milliers de caractères en base64
      if (typeof value === 'string' && value.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(value.slice(0, 200))) {
        const mime = MIME_KEYS.map((k) => obj[k]).find((v) => typeof v === 'string')
        return { data: value.replace(/\s/g, ''), mimeType: (mime as string) ?? 'image/png' }
      }
    }

    for (const value of Object.values(obj)) {
      const found = walk(value)
      if (found) return found
    }

    return null
  }

  return walk(json)
}

/** Remplace les longues chaînes par leur taille, pour des logs lisibles */
function describeShape(node: unknown, depth = 0): unknown {
  if (depth > 6) return '…'
  if (typeof node === 'string') {
    return node.length > 120 ? `<chaîne de ${node.length} caractères>` : node
  }
  if (Array.isArray(node)) return node.map((n) => describeShape(n, depth + 1))
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node as Record<string, unknown>).map(([k, v]) => [k, describeShape(v, depth + 1)])
    )
  }
  return node
}

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits, is_premium, plan')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 400 })
  }

  if (profile.credits <= 0) {
    return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })
  }

  // Le plan Pro donne droit au modèle le plus avancé et à la sortie 2K
  const isProPlan = profile.is_premium && profile.plan === 'pro'

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
      .map((p, i) => {
        const label = CATEGORY_LABELS[p.category] ?? 'vêtement'
        const hood = p.hood && p.hood !== 'auto' ? HOOD_INSTRUCTIONS[p.hood] ?? '' : ''
        return `- Image ${i + 2} : ${label}${hood}`
      })
      .join('\n')

    // Le client a explicitement choisi comment porter la capuche : sa consigne prime
    const hoodChoice = pieces.find((p) => p.hood === 'up' || p.hood === 'down')?.hood

    const prompt = `Tu es un moteur d'essayage virtuel photoréaliste.

L'image 1 est la photo d'une personne. Les images suivantes sont des vêtements ou accessoires :
${garmentList}

Génère une seule photo montrant EXACTEMENT la même personne que sur l'image 1, portant TOUS les vêtements et accessoires des images suivantes en même temps.

Règles strictes :
- Le visage, la coiffure, la carnation, la morphologie et la pose de la personne doivent rester rigoureusement identiques à l'image 1.
- L'arrière-plan, le cadrage et l'éclairage de l'image 1 doivent être conservés.
- Chaque vêtement doit garder sa couleur, sa texture, son motif et sa coupe exacts tels qu'ils apparaissent sur son image de référence.
- Reproduis fidèlement la COUPE de chaque pièce : sa longueur, sa largeur, l'ampleur des manches, la position de l'ourlet, le tombé du tissu. N'allonge pas un vêtement, ne l'élargis pas, ne le rends ni plus ample ni plus ajusté que sur l'image de référence. Un sweat qui s'arrête à la taille doit s'arrêter à la taille.
- Reproduis tous les détails de fabrication visibles : poches, coutures, fermetures, bords-côtes, cordons, étiquettes. N'en invente aucun et n'en supprime aucun.
- Les vêtements doivent tomber naturellement sur le corps, avec des plis et des ombres réalistes.
- Remplace les vêtements d'origine de la personne par ceux fournis, sans rien ajouter d'autre.
- Le résultat doit ressembler à une vraie photographie, pas à un montage ni à une illustration.

Port des vêtements :
${
  hoodChoice === 'up'
    ? "- CAPUCHE : le client demande explicitement qu'elle soit RELEVÉE sur la tête. Enfile-la franchement, bien centrée, avec ses détails éventuels visibles de face. Cette consigne prime sur toute autre considération."
    : hoodChoice === 'down'
      ? "- CAPUCHE : le client demande explicitement qu'elle soit BAISSÉE dans le dos. Ne la mets pas sur la tête, quels que soient ses détails."
      : "- Capuche : laisse-la baissée dans le dos, à plat sur les épaules."
}
- Ne laisse jamais une capuche flotter à mi-hauteur ni un élément de capuche traîner sur l'épaule : soit elle est franchement enfilée sur la tête, soit elle repose à plat dans le dos.
- Manches déroulées à leur longueur normale, rien de retroussé.
- Les vestes et sweats à fermeture éclair sont portés fermés jusqu'à mi-poitrine, sauf si l'image de référence montre clairement le contraire.
- Si l'image de référence montre le vêtement à plat, sur cintre ou posé, ignore cette mise en scène : porte-le comme on le porterait dans la rue.`

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
        model: isProPlan ? MODEL_PRO : MODEL_STANDARD,
        input,
        response_format: {
          type: 'image',
          aspect_ratio: '3:4',
          image_size: isProPlan ? '2K' : '1K',
        },
      }),
    })

    if (!geminiRes.ok) {
      return fail('Erreur lors de la génération', 500, await geminiRes.text())
    }

    const geminiJson = await geminiRes.json()
    const image = extractImage(geminiJson)

    if (!image) {
      // Structure seule, sans le contenu : sinon le terminal est noyé sous le base64
      console.error(
        '=== Réponse Gemini sans image ===\n' +
        JSON.stringify(describeShape(geminiJson), null, 2).slice(0, 2000) +
        '\n================================='
      )
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
