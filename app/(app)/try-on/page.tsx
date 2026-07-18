'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link as LinkIcon, Sparkles, X, Download, Share2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { cn, GARMENT_CATEGORIES } from '@/lib/utils'
import type { GarmentCategory } from '@/lib/utils'
import Image from 'next/image'

type Step = 'upload' | 'generating' | 'result'

export default function TryOnPage() {
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [personImage, setPersonImage] = useState<File | null>(null)
  const [personPreview, setPersonPreview] = useState<string | null>(null)
  const [garmentImage, setGarmentImage] = useState<File | null>(null)
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null)
  const [garmentUrl, setGarmentUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>('tops')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

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
    const file = files[0]
    if (!file) return
    setGarmentImage(file)
    setGarmentPreview(URL.createObjectURL(file))
    setGarmentUrl('')
  }, [])

  const { getRootProps: getGarmentProps, getInputProps: getGarmentInputProps, isDragActive: isGarmentDrag } = useDropzone({
    onDrop: onDropGarment,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const handleGenerate = async () => {
    if (!personImage && !personPreview) {
      toast.error('Ajoutez votre photo')
      return
    }
    if (!garmentImage && !garmentUrl) {
      toast.error('Ajoutez une photo de vêtement')
      return
    }

    setStep('generating')
    setProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Non connecté'); return }

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 8, 90))
      }, 800)

      let personUrl = ''
      if (personImage) {
        const ext = personImage.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_person.${ext}`
        const { data, error } = await supabase.storage
          .from('person-images')
          .upload(path, personImage)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('person-images').getPublicUrl(data.path)
        personUrl = urlData.publicUrl
      }

      let garmentStorageUrl = garmentUrl
      if (garmentImage) {
        const ext = garmentImage.name.split('.').pop()
        const path = `${user.id}/${Date.now()}_garment.${ext}`
        const { data, error } = await supabase.storage
          .from('garment-images')
          .upload(path, garmentImage)
        if (error) throw error
        const { data: urlData } = supabase.storage.from('garment-images').getPublicUrl(data.path)
        garmentStorageUrl = urlData.publicUrl
      }

      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          person_image_url: personUrl,
          garment_image_url: garmentStorageUrl,
          garment_source_url: garmentUrl || null,
          garment_type: garmentCategory,
          status: 'pending',
        })
        .select()
        .single()

      if (genError || !generation) throw genError

      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImageUrl: personUrl,
          garmentImageUrl: garmentStorageUrl,
          garmentType: garmentCategory,
          generationId: generation.id,
        }),
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const err = await res.json()
        if (res.status === 402) {
          toast.error('Plus de crédits — passez Premium ou achetez un pack')
        } else {
          toast.error(err.error ?? 'Erreur de génération')
        }
        setStep('upload')
        return
      }

      const { resultUrl: url } = await res.json()
      setProgress(100)
      setResultUrl(url)
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
    setGarmentImage(null)
    setGarmentPreview(null)
    setGarmentUrl('')
    setResultUrl(null)
    setProgress(0)
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
      await navigator.share({ title: 'Mon essayage TryFit AI', url: resultUrl })
    } else {
      await navigator.clipboard.writeText(resultUrl)
      toast.success('Lien copié !')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <Toaster position="top-center" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Essayage virtuel</h1>
        <p className="text-zinc-500 mt-1">Importez vos photos et laissez l&apos;IA faire le reste</p>
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

          {/* Photo du vêtement */}
          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs flex items-center justify-center font-bold">2</span>
              Photo du vêtement
            </h2>

            {garmentPreview ? (
              <div className="relative">
                <Image src={garmentPreview} alt="Vêtement" width={400} height={400} className="w-full max-h-64 object-cover rounded-xl" />
                <button
                  onClick={() => { setGarmentImage(null); setGarmentPreview(null) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  {...getGarmentProps()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                    isGarmentDrag ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                  )}
                >
                  <input {...getGarmentInputProps()} />
                  <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-zinc-700 font-medium">Photo du vêtement</p>
                  <p className="text-zinc-400 text-sm mt-1">depuis votre galerie, Vinted, Instagram...</p>
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
                      <button
                        onClick={() => setGarmentPreview(garmentUrl)}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        OK
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Catégorie */}
          <div className="card p-5">
            <h2 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs flex items-center justify-center font-bold">3</span>
              Type de vêtement
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {GARMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.available) {
                      setGarmentCategory(cat.id as GarmentCategory)
                    } else {
                      toast('Bientôt disponible 🚀', { icon: '⏳' })
                    }
                  }}
                  className={cn(
                    'p-3 rounded-xl text-sm font-medium transition-all text-center relative',
                    garmentCategory === cat.id
                      ? 'bg-brand-500 text-white'
                      : cat.available
                        ? 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:border-brand-500/40 hover:bg-brand-500/5'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-zinc-100'
                  )}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  {cat.label}
                  {!cat.available && (
                    <span className="absolute top-1.5 right-1.5 text-xs bg-zinc-200 text-zinc-500 px-1 rounded-full leading-4">Soon</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton générer */}
          <button
            onClick={handleGenerate}
            disabled={(!personImage && !personPreview) || (!garmentImage && !garmentPreview && !garmentUrl)}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Essayer ce vêtement
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
          <p className="text-zinc-500 text-sm mb-8">Génération en cours, environ 30 secondes</p>
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
