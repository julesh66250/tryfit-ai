'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Download, Clock } from 'lucide-react'
import type { Generation } from '@/types'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function HistoryPage() {
  const supabase = createClient()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setGenerations(data ?? [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('generations').delete().eq('id', id)
    if (error) { toast.error('Erreur lors de la suppression'); return }
    setGenerations((prev) => prev.filter((g) => g.id !== id))
    toast.success('Supprimé')
  }

  const handleDownload = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `tryfit-${Date.now()}.jpg`
    a.click()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const garmentLabel: Record<string, string> = {
    tops: 'Haut',
    bottoms: 'Bas',
    'one-pieces': 'Robe / Combi',
    shoes: 'Chaussures',
    hats: 'Couvre-chef',
    jewelry: 'Accessoires',
    outfit: 'Outfit complet',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Toaster position="top-center" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Historique</h1>
        <p className="text-zinc-500 mt-1">{generations.length} essayage{generations.length > 1 ? 's' : ''}</p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-zinc-100" />
          ))}
        </div>
      )}

      {!loading && generations.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-brand-500" />
          </div>
          <p className="text-zinc-900 font-bold text-lg">Aucun essayage pour l&apos;instant</p>
          <p className="text-zinc-400 text-sm mb-6 mt-1">Vos looks générés apparaîtront ici</p>
          <Link href="/try-on" className="btn-primary inline-flex">Faire mon premier essayage</Link>
        </div>
      )}

      {!loading && generations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {generations.map((gen) => (
            <div key={gen.id} className="card overflow-hidden group relative">
              {/* Image */}
              {gen.result_image_url && gen.status === 'completed' ? (
                <div className="aspect-[3/4] relative">
                  <Image
                    src={gen.result_image_url}
                    alt="Essayage"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-zinc-100 flex items-center justify-center">
                  {gen.status === 'processing' || gen.status === 'pending' ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-zinc-400 text-xs">En cours...</p>
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-sm">Échec</p>
                  )}
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{garmentLabel[gen.garment_type] ?? gen.garment_type}</p>
                  <p className="text-zinc-300 text-xs">{formatDate(gen.created_at)}</p>
                  {gen.result_image_url && (
                    <button
                      onClick={() => handleDownload(gen.result_image_url!)}
                      className="mt-2 flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
                    >
                      <Download className="w-3 h-3" /> Télécharger
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
