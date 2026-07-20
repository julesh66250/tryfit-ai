'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link as LinkIcon, Sparkles, X, Download, Share2, ChevronDown, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { cn, GARMENT_CATEGORIES } from '@/lib/utils'
import type { GarmentCategory } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type Step = 'upload' | 'generating' | 'result'

type Piece = {
  id: string
  file: File | null
  url: string
  preview: string
  category: GarmentCategory
}

const MAX_PIECES = 6

function TryOnContent() {
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [personImage, setPersonImage] = useState<File | null>(null)
  const [personPreview, setPersonPreview] = useState<string | null>(null)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [garmentUrl, setGarmentUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentPiece, setCurrentPiece] = useState(0)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const loadCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
      setCredits(data?.credits ?? 0)
    }
    loadCredits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDropPerson = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    setPersonImage(file)
    setPersonPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps: getPersonProps, getInputProps: getPersonInputProps, isDragActive: isPersonDrag } = useDropzone({
    onDrop: onDropPerson,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const onDropGarment = useCallback((files: File[]) => {
    setPieces((prev) => {
      const room = MAX_PIECES - prev.length
      if (room <= 0) {
        toast.error(`Maximum ${MAX_PIECES} pièces`)
        return prev
      }
      const newPieces = files.slice(0, room).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: '',
        preview: URL.createObjectURL(file),
        category: 'tops' as GarmentCategory,
      }))
      return [...prev, ...newPieces]
    })
  }, [])

  const { getRootProps: getGarmentProps, getInputProps: getGarmentInputProps, isDragActive: isGarmentDrag } = useDropzone({
    onDrop: onDropGarment,
    accept: { 'image/*': [] },
  })

  const addUrlPiece = () => {
    if (!garmentUrl) return
    if (pieces.length >= MAX_PIECES) {
      toast.error(`Maximum ${MAX_PIECES} pièces`)
      return
    }
    setPieces((prev) => [...prev, {
      id: `${Date.now()}-url`,
      file: null,
      url: garmentUrl,
      preview: garmentUrl,
      category: 'tops',
    }])
    setGarmentUrl('')
    setShowUrlInput(false)
  }

  const removePiece = (id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id))
  }

  const setPieceCategory = (id: string, category: GarmentCategory) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, category } : p)))
  }

  const notEnoughCredits = credits !== null && pieces.length > credits

  const handleGenerate = async () => {
    if (!personImage && !personPreview) {
      toast.error('Ajoutez votre photo')
      return
    }
    if (pieces.length === 0) {
      toast.error('Ajoutez au moins une pièce')
      return
    }
    if (notEnoughCredits) {
      toast.error('Crédits insuffisants')
      return
    }

    setStep('generating')
    setProgress(0)
    setCurrentPiece(0)

    const total = pieces.length

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Non connecté'); setStep('upload'); return }

      // Upload photo de la personne
      let personUrl = ''
      if (personImage) {
        const ext = personImage.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_person.${ext}`
        const { data, error } = await supabase.storage.from('person-images').upload(path, personImage)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('person-images').getPublicUrl(data.path)
        personUrl = urlData.publicUrl
      }

      // Upload des pièces
      const pieceUrls: { url: string; category: GarmentCategory }[] = []
      for (const piece of pieces) {
        if (piece.file) {
          const ext = piece.file.name.split('.').pop()
          const path = `${user.id}/${Date.now()}_garment_${Math.random().toString(36).slice(2, 5)}.${ext}`
          const { data, error } = await supabase.storage.from('garment-images').upload(path, piece.file)
          if (error) throw error
          const { data: urlData } = supabase.storage.from('garment-images').getPublicUrl(data.path)
          pieceUrls.push({ url: urlData.publicUrl, category: piece.category })
        } else {
          pieceUrls.push({ url: piece.url, category: piece.category })
        }
      }

      // Une seule entrée dans l'historique pour tout l'outfit
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          person_image_url: personUrl,
          garment_image_url: pieceUrls[0].url,
          garment_source_url: null,
          garment_type: total > 1 ? 'outfit' : pieceUrls[0].category,
          status: 'pending',
        })
        .select()
        .single()

      if (genError || !generation) throw genError

      // Génération pièce par pièce (chaque pièce = 1 crédit), tout en 1 clic
      let currentModel = personUrl

      for (let i = 0; i < total; i++) {
        setCurrentPiece(i)
        const base = (i / total) * 100
        const target = ((i + 1) / total) * 100 - 5

        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + Math.random() * (8 / total), target))
        }, 800)
        setProgress(Math.max(base, 2))

        const res = await fetch('/api/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personImageUrl: currentModel,
            garmentImageUrl: pieceUrls[i].url,
            garmentType: pieceUrls[i].category,
            generationId: generation.id,
          }),
        })

        clearInterval(progressInterval)

        if (!res.ok) {
          const err = await res.json()
          if (res.status === 402) {
            toast.error('Plus de crédits — passez Premium ou achetez un pack')
          } else if (i > 0) {
            toast.error(`La pièce ${i + 1} a échoué — les ${i} première${i > 1 ? 's' : ''} ont été appliquées`)
            setResultUrl(currentModel)
            setProgress(100)
            setCredits((c) => (c !== null ? c - i : c))
            setTimeout(() => setStep('result'), 500)
            return
          } else {
            toast.error(err.error ?? 'Erreur de génération')
          }
          setStep('upload')
          return
        }

        const { resultUrl: url } = await res.json()
        currentModel = url
        setProgress(((i + 1) / total) * 100)
      }

      setResultUrl(currentModel)
      setCredits((c) => (c !== null ? c - total : c))
      setProgress(100)
      setTimeout(() => setStep('result'), 500)

    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue')
      setStep('upload')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setPersonImage(null)
    setPersonPreview(null)
    setPieces([])
    setGarmentUrl('')
    setResultUrl(null)
    setProgress(0)
    setCurrentPiece(0)
  }

  const handleDownload = async () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `tryfit-${Date.now()}.jpg`
    a.click()
  }

  const handleShare = async () => {
    if (!resultUrl) return
    if (navigator.share) {
      await navigator.share({ title: 'Mon look TryFit AI', url: resultUrl })
    } else {
      await navigator.clipboard.writeText(resultUrl)
      toast.success('Lien copié !')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <Toaster position="top-center" />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Essayage virtuel</h1>
          <p className="text-zinc-500 mt-1">Une pièce ou un outfit complet, en un seul clic</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full px-3.5 py-1.5 shadow-sm flex-shrink-0">
            <span className="text-base leading-none">🪙</span>
            <span className="text-sm font-bold text-zinc-900">{credits}</span>
          </div>
        )}
      </div>

      {/* ÉTAPE 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6 animate-slide-up">
          {/* Photo de soi */}
          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs flex items-center justify-center font-bold">1</span>
              Votre photo
            </h2>

            {personPreview ? (
              <div className="relative">
                <Image src={personPreview} alt="Votre photo" width={400} height={500} className="w-full max-h-64 object-cover rounded-xl" />
                <button
                  onClick={() => { setPersonImage(null); setPersonPreview(null) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                {...getPersonProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                  isPersonDrag ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                )}
              >
                <input {...getPersonInputProps()} />
                <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-700 font-medium">Glissez votre photo ici</p>
                <p className="text-zinc-400 text-sm mt-1">ou cliquez pour choisir</p>
                <p className="text-zinc-300 text-xs mt-3">Conseil : photo entière, debout, fond simple</p>
              </div>
            )}
          </div>

          {/* Pièces */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs flex items-center justify-center font-bold">2</span>
                Vos pièces
              </h2>
              {pieces.length > 0 && (
                <span className="text-xs font-semibold bg-brand-500/10 text-brand-500 px-2.5 py-1 rounded-full">
                  {pieces.length} pièce{pieces.length > 1 ? 's' : ''} = {pieces.length} crédit{pieces.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Liste des pièces ajoutées */}
            {pieces.length > 0 && (
              <div className="space-y-3 mb-4">
                {pieces.map((piece, i) => (
                  <div key={piece.id} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={piece.preview} alt={`Pièce ${i + 1}`} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-zinc-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 mb-1">Pièce {i + 1}</p>
                      <select
                        value={piece.category}
                        onChange={(e) => setPieceCategory(piece.id, e.target.value as GarmentCategory)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 focus:outline-none focus:border-brand-500"
                      >
                        {GARMENT_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removePiece(piece.id)}
                      className="w-8 h-8 rounded-full bg-zinc-200 hover:bg-red-100 hover:text-red-500 text-zinc-500 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Zone d'ajout */}
            {pieces.length < MAX_PIECES && (
              <div className="space-y-3">
                <div
                  {...getGarmentProps()}
                  className={cn(
                    'border-2 border-dashed rounded-xl text-center cursor-pointer transition-all',
                    pieces.length === 0 ? 'p-8' : 'p-4',
                    isGarmentDrag ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                  )}
                >
                  <input {...getGarmentInputProps()} />
                  {pieces.length === 0 ? (
                    <>
                      <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-zinc-700 font-medium">Photos de vos vêtements</p>
                      <p className="text-zinc-400 text-sm mt-1">T-shirt, short, chaussures, bijoux, chapeau...</p>
                      <p className="text-zinc-300 text-xs mt-3">1 pièce = 1 crédit · Ajoutez-en autant que vous voulez</p>
                    </>
                  ) : (
                    <p className="text-zinc-500 text-sm font-medium flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Ajouter une autre pièce
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Coller un lien image
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showUrlInput && 'rotate-180')} />
                </button>

                {showUrlInput && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={garmentUrl}
                      onChange={(e) => setGarmentUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    {garmentUrl && (
                      <button onClick={addUrlPiece} className="btn-secondary text-sm py-2 px-4">
                        Ajouter
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avertissement crédits */}
          {notEnoughCredits && (
            <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-3">
              <p className="text-sm text-red-600">
                Il vous faut {pieces.length} crédit{pieces.length > 1 ? 's' : ''}, il vous en reste {credits}.
              </p>
              <Link href="/premium" className="btn-primary text-sm py-2 px-4 flex-shrink-0">Recharger</Link>
            </div>
          )}

          {/* Bouton générer */}
          <button
            onClick={handleGenerate}
            disabled={(!personImage && !personPreview) || pieces.length === 0 || notEnoughCredits}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            {pieces.length > 1
              ? `Générer mon look complet (${pieces.length} crédits)`
              : pieces.length === 1
                ? 'Essayer cette pièce (1 crédit)'
                : 'Essayer'}
          </button>
        </div>
      )}

      {/* ÉTAPE 2: Génération */}
      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full gradient-brand opacity-20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-brand-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">L&apos;IA travaille...</h2>
          <p className="text-zinc-500 text-sm mb-8">
            {pieces.length > 1
              ? `Pièce ${Math.min(currentPiece + 1, pieces.length)} sur ${pieces.length} — environ ${pieces.length * 30}s au total`
              : 'Génération en cours, environ 30 secondes'}
          </p>
          <div className="w-64 bg-zinc-100 rounded-full h-2">
            <div
              className="gradient-brand h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-zinc-400 text-xs mt-2">{Math.round(progress)}%</p>
        </div>
      )}

      {/* ÉTAPE 3: Résultat */}
      {step === 'result' && resultUrl && (
        <div className="animate-slide-up">
          <div className="card overflow-hidden mb-4">
            <Image src={resultUrl} alt="Résultat essayage" width={600} height={800} className="w-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={handleDownload} className="btn-secondary flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Télécharger
            </button>
            <button onClick={handleShare} className="btn-secondary flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Partager
            </button>
          </div>

          <button onClick={handleReset} className="btn-primary w-full flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Nouvel essayage
          </button>
        </div>
      )}
    </div>
  )
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TryOnContent />
    </Suspense>
  )
}
