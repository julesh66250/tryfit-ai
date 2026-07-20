'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { GarmentCategory } from '@/lib/utils'

type DiscoverItem = {
  name: string
  category: GarmentCategory
  categoryLabel: string
  image: string
}

const DISCOVER_ITEMS: DiscoverItem[] = [
  { name: 'T-shirt blanc essentiel', category: 'tops', categoryLabel: 'Haut', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
  { name: 'Chemise blanche classique', category: 'tops', categoryLabel: 'Haut', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80' },
  { name: 'Veste en cuir', category: 'tops', categoryLabel: 'Haut', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  { name: 'Jean brut', category: 'bottoms', categoryLabel: 'Bas', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { name: 'T-shirts colorés', category: 'tops', categoryLabel: 'Haut', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80' },
  { name: 'Baskets blanches', category: 'shoes', categoryLabel: 'Chaussures', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' },
  { name: 'Lunettes de soleil', category: 'jewelry', categoryLabel: 'Accessoire', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80' },
  { name: 'Montre élégante', category: 'jewelry', categoryLabel: 'Accessoire', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80' },
  { name: 'Sac à main cuir', category: 'jewelry', categoryLabel: 'Accessoire', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
]

export default function DiscoverPage() {
  return (
    <div className="relative">
      {/* Halo orange en haut */}
      <div
        className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(249,115,22,0.08), transparent)' }}
      />

      <div className="relative p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Découvrir</h1>
          <p className="text-zinc-500 mt-1">Des pièces sélectionnées pour vous — essayez-les en un clic</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DISCOVER_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={`/try-on?garment=${encodeURIComponent(item.image)}&category=${item.category}`}
              className="card overflow-hidden group"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-brand-500 font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" /> Essayer
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-zinc-900 text-sm truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-zinc-400">{item.categoryLabel}</span>
                  <span className="text-xs font-semibold text-brand-500">1 crédit</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-zinc-400 text-sm mt-8">
          Cliquez sur une pièce — elle sera prête à essayer avec votre photo.
        </p>
      </div>
    </div>
  )
}
