import { Crown, Zap, Check } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    id: 'pack10',
    name: 'Pack 10',
    price: '4,99€',
    desc: '10 crédits à utiliser quand vous voulez',
    credits: 10,
    features: ['10 essayages', 'Sans expiration', 'Qualité standard'],
    highlighted: false,
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: '9,99€',
    period: '/mois',
    desc: 'Le meilleur pour les amateurs de mode',
    credits: 100,
    features: ['100 essayages/mois', 'Qualité supérieure', 'Générations prioritaires', 'Sans publicité', 'Historique illimité'],
    highlighted: true,
  },
  {
    id: 'premium_yearly',
    name: 'Premium Annuel',
    price: '79,99€',
    period: '/an',
    desc: 'Économisez 40€ par rapport au mensuel',
    credits: 1200,
    features: ['100 essayages/mois', 'Qualité supérieure', 'Générations prioritaires', 'Sans publicité', 'Historique illimité', '2 mois offerts'],
    highlighted: false,
  },
]

export default function PremiumPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand mb-4">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Passez Premium</h1>
        <p className="text-zinc-400">Plus d'essayages, meilleure qualité, zéro limite</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 relative flex flex-col ${plan.highlighted
              ? 'border-brand-500/60 bg-gradient-to-b from-brand-500/10 to-orange-500/5'
              : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                LE PLUS POPULAIRE
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-bold text-white text-lg">{plan.name}</h3>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                {plan.period && <span className="text-zinc-400 text-sm mb-1">{plan.period}</span>}
              </div>
              <p className="text-zinc-500 text-xs mt-1">{plan.desc}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button className={plan.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}>
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>

      {/* Pack crédits */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-5 h-5 text-brand-400" />
          <h2 className="font-semibold text-white">Pack de crédits supplémentaires</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="font-bold text-white">10 crédits</p>
            <p className="text-brand-400 font-semibold">4,99€</p>
            <button className="btn-secondary w-full mt-3 text-sm py-2">Acheter</button>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="font-bold text-white">50 crédits</p>
            <p className="text-brand-400 font-semibold">14,99€</p>
            <button className="btn-primary w-full mt-3 text-sm py-2">Acheter</button>
          </div>
        </div>
      </div>

      <p className="text-center text-zinc-600 text-xs mt-6">
        Paiement sécurisé · Annulation à tout moment · TVA incluse
      </p>
    </div>
  )
}
