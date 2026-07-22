'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Crown, Zap, Check, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PremiumPage() {
  const supabase = createClient()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter')
  const [isPremium, setIsPremium] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveSlide(index)
    setSelectedPlan(index === 0 ? 'starter' : 'pro')
  }
  const scrollTo = (i: number) => {
    if (!carouselRef.current) return
    carouselRef.current.scrollTo({ left: i * carouselRef.current.offsetWidth, behavior: 'smooth' })
    setActiveSlide(i)
    setSelectedPlan(i === 0 ? 'starter' : 'pro')
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
      setIsPremium(data?.is_premium ?? false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand mb-4">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Passez Premium</h1>
        <p className="text-zinc-500">Plus de crédits, meilleure qualité, zéro limite</p>
      </div>

      {/* Toggle Mensuel / Annuel */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-white border border-zinc-200 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-brand-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-brand-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Annuel
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${billing === 'yearly' ? 'bg-white/20 text-white' : 'bg-brand-500/10 text-brand-500'}`}>-15%</span>
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 gap-4 mb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onScroll={handleScroll}
      >
        {/* Starter */}
        <div className="w-full flex-shrink-0 snap-start md:contents">
        <div
          onClick={() => setSelectedPlan('starter')}
          className={`card p-6 relative flex flex-col cursor-pointer transition-all duration-300 ${selectedPlan === 'starter' ? 'border-brand-500/40 bg-gradient-to-b from-brand-500/5 to-orange-500/5 shadow-lg' : ''}`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            LE PLUS POPULAIRE
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-zinc-900 text-lg">Starter</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-extrabold text-zinc-900">{billing === 'monthly' ? '12,99€' : '11,04€'}</span>
              {billing === 'yearly' && <span className="text-lg text-zinc-300 line-through font-medium mb-0.5">12,99€</span>}
              <span className="text-zinc-400 text-sm mb-1">/mois</span>
            </div>
            <p className="text-zinc-500 text-xs mt-1">
              {billing === 'monthly' ? '50 crédits par mois' : '50 crédits par mois · facturé 132,48€/an'}
            </p>
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {['50 crédits/mois', 'Outfits complets en 1 clic', 'Qualité supérieure', 'Générations prioritaires', 'Historique illimité'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/checkout?plan=starter${billing === 'yearly' ? '-yearly' : ''}`}
            className={`w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedPlan === 'starter' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
          >
            Choisir ce plan
          </Link>
        </div>
        </div>

        {/* Pro */}
        <div className="w-full flex-shrink-0 snap-start md:contents">
        <div
          onClick={() => setSelectedPlan('pro')}
          className={`card p-6 relative flex flex-col cursor-pointer transition-all duration-300 ${selectedPlan === 'pro' ? 'border-brand-500/40 bg-gradient-to-b from-brand-500/5 to-orange-500/5 shadow-lg' : ''}`}
        >
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900 text-lg">Pro</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-extrabold text-zinc-900">{billing === 'monthly' ? '19,99€' : '16,99€'}</span>
              <span className="text-lg text-zinc-300 line-through font-medium mb-0.5">{billing === 'monthly' ? '25,98€' : '19,99€'}</span>
              <span className="text-zinc-400 text-sm mb-1">/mois</span>
            </div>
            <p className="text-zinc-500 text-xs mt-1">
              {billing === 'monthly' ? '100 crédits par mois' : '100 crédits par mois · facturé 203,88€/an'}
            </p>
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {['100 crédits/mois', 'Outfits complets en 1 clic', 'Qualité supérieure', 'Générations prioritaires', 'Historique illimité', 'Support prioritaire'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/checkout?plan=pro${billing === 'yearly' ? '-yearly' : ''}`}
            className={`w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedPlan === 'pro' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
          >
            Choisir ce plan
          </Link>
        </div>
        </div>
      </div>

      {/* Dots mobile */}
      <div className="md:hidden flex justify-center gap-2 mb-8 -mt-4">
        {[0, 1].map((i) => (
          <button key={i} onClick={() => scrollTo(i)} className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-brand-500 w-6' : 'bg-zinc-300 w-2'}`} />
        ))}
      </div>

      {/* Rappel crédit */}
      <div className="card p-4 mb-8 bg-brand-500/5 border-brand-500/20 flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">🪙</span>
        <p className="text-sm text-zinc-600">
          <span className="font-bold text-zinc-900">1 crédit = 1 vêtement ou accessoire.</span>{' '}
          Un outfit complet se génère en un seul clic, chaque pièce utilise 1 crédit.
        </p>
      </div>

      {/* Pack crédits — réservé aux abonnés */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-zinc-900">Pack de crédits supplémentaires</h2>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-zinc-900">10 crédits</p>
            <p className="text-brand-500 font-semibold text-lg">3,99€</p>
            {!isPremium && (
              <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Réservé aux abonnés Starter et Pro
              </p>
            )}
          </div>
          <button
            disabled={!isPremium}
            className={`text-sm py-2.5 px-6 rounded-xl font-semibold transition-all flex-shrink-0 ${isPremium
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Acheter
          </button>
        </div>
      </div>

      <p className="text-center text-zinc-400 text-xs mt-6">
        Paiement sécurisé · Annulation à tout moment · TVA incluse
      </p>
    </div>
  )
}
