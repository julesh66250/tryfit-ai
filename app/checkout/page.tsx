'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Crown } from 'lucide-react'

const plans = {
  starter: {
    name: 'Starter',
    price: '12,99€',
    period: '/mois',
    credits: 50,
    billed: null,
  },
  pro: {
    name: 'Pro',
    price: '19,99€',
    period: '/mois',
    credits: 100,
    billed: null,
  },
  'starter-yearly': {
    name: 'Starter Annuel',
    price: '11,04€',
    period: '/mois',
    credits: 50,
    billed: 'Facturé 132,48€/an · -15%',
  },
  'pro-yearly': {
    name: 'Pro Annuel',
    price: '16,99€',
    period: '/mois',
    credits: 100,
    billed: 'Facturé 203,88€/an · -15%',
  },
}

type PlanKey = keyof typeof plans

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') as PlanKey | null
  const plan = planKey && plans[planKey] ? plans[planKey] : null

  if (!plan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500">Plan introuvable. <Link href="/" className="text-brand-500">Retour à l&apos;accueil</Link></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TryFit AI" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-xl text-zinc-900">TryFit AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Finaliser votre abonnement</h1>
          <p className="text-zinc-500 mt-1">Plan {plan.name} — {plan.price}{plan.period}</p>
        </div>

        {/* Récap plan */}
        <div className="card p-5 mb-6 border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">Plan {plan.name}</p>
                <p className="text-zinc-500 text-sm">{plan.credits} crédits/mois</p>
                {plan.billed && <p className="text-brand-500 text-xs font-medium mt-0.5">{plan.billed}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-zinc-900 text-xl">{plan.price}</p>
              <p className="text-zinc-400 text-xs">{plan.period}</p>
            </div>
          </div>
        </div>

        {/* Paiement bientôt disponible */}
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="font-bold text-zinc-900 mb-2">Paiement en cours de configuration</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Le système de paiement sera disponible très prochainement.
            En attendant, vous pouvez utiliser votre essayage gratuit.
          </p>
          <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center">
            Accéder à mon compte
          </Link>
          <Link href="/" className="text-zinc-400 text-sm mt-4 block hover:text-zinc-600">
            Retour à l&apos;accueil
          </Link>
        </div>

        <p className="text-center text-zinc-400 text-xs mt-6">
          <Lock className="w-3 h-3 inline mr-1" />
          Paiement sécurisé · Annulation à tout moment · TVA incluse
        </p>

      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
