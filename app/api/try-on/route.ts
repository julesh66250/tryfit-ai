import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Vérifier que l'utilisateur est connecté
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier les crédits
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

  try {
    const body = await req.json()
    const { personImageUrl, garmentImageUrl, garmentType, generationId } = body

    if (!personImageUrl || !garmentImageUrl || !garmentType || !generationId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Mettre à jour le statut de la génération
    await supabase
      .from('generations')
      .update({ status: 'processing' })
      .eq('id', generationId)
      .eq('user_id', user.id)

    // Appel à l'API FASHN.ai
    const fashnResponse = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
      },
      body: JSON.stringify({
        model_image: personImageUrl,
        garment_image: garmentImageUrl,
        // FASHN ne connaît que tops/bottoms/one-pieces — le reste passe en 'auto'
        category: ['tops', 'bottoms', 'one-pieces'].includes(garmentType) ? garmentType : 'auto',
        mode: profile.is_premium ? 'quality' : 'balanced',
      }),
    })

    if (!fashnResponse.ok) {
      const err = await fashnResponse.text()
      console.error('Erreur FASHN:', err)

      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Erreur de génération' })
        .eq('id', generationId)

      return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
    }

    const fashnData = await fashnResponse.json()
    const predictionId = fashnData.id

    // Polling pour récupérer le résultat (FASHN est asynchrone)
    let resultUrl: string | null = null
    let attempts = 0
    const maxAttempts = 30 // 30 * 2s = 60s max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusRes = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
      })

      const statusData = await statusRes.json()

      if (statusData.status === 'completed') {
        resultUrl = statusData.output?.[0] ?? null
        break
      }

      if (statusData.status === 'failed') {
        await supabase
          .from('generations')
          .update({ status: 'failed', error_message: 'Génération échouée' })
          .eq('id', generationId)

        return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
      }

      attempts++
    }

    if (!resultUrl) {
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Timeout' })
        .eq('id', generationId)

      return NextResponse.json({ error: 'Temps écoulé' }, { status: 504 })
    }

    // Sauvegarder le résultat + déduire 1 crédit
    await supabase
      .from('generations')
      .update({ status: 'completed', result_image_url: resultUrl })
      .eq('id', generationId)

    await supabase.rpc('deduct_credit', { user_id_input: user.id })

    return NextResponse.json({ resultUrl, generationId })

  } catch (error) {
    console.error('Erreur API try-on:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
