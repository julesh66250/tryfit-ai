'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, Shield, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">TryFit AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            Connexion
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        {/* Glow background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm text-brand-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Propulsé par l&apos;IA
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Essayez les vêtements
            <br />
            <span className="gradient-brand-text">sans les porter</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Importez votre photo et celle d&apos;un vêtement — notre IA génère en secondes
            une image réaliste pour voir si le style vous convient.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-4 px-8">
              Essayer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary flex items-center justify-center gap-2 text-base py-4 px-8">
              J&apos;ai déjà un compte
            </Link>
          </div>

          <p className="text-zinc-500 text-sm mt-4">3 essayages offerts · Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-zinc-400 text-center mb-14">3 étapes, moins de 30 secondes</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Ajoutez votre photo',
                desc: 'Importez une photo entière de vous, debout, en tenue simple.',
                emoji: '🤳',
              },
              {
                step: '2',
                title: 'Choisissez un vêtement',
                desc: 'Importez une photo depuis Vinted, Zara, Instagram ou votre galerie.',
                emoji: '👕',
              },
              {
                step: '3',
                title: 'Voyez le résultat',
                desc: "L'IA génère une image réaliste de vous avec ce vêtement en quelques secondes.",
                emoji: '✨',
              },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Tout ce dont vous avez besoin</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-5 h-5" />, title: 'Ultra rapide', desc: 'Résultat en moins de 30 secondes.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Vos données protégées', desc: 'Vos photos ne sont jamais partagées.' },
              { icon: <Star className="w-5 h-5" />, title: 'Qualité réaliste', desc: 'IA spécialisée en mode et textile.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-zinc-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Tarifs simples</h2>
          <p className="text-zinc-400 mb-14">Commencez gratuitement, passez premium quand vous voulez</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Gratuit */}
            <div className="card p-8 text-left">
              <h3 className="font-bold text-xl mb-1">Gratuit</h3>
              <div className="text-4xl font-extrabold mb-6">0€</div>
              <ul className="space-y-3 text-sm text-zinc-300">
                {['3 essayages offerts', 'Téléchargement du résultat', 'Historique des essayages'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full mt-8 flex items-center justify-center">
                Commencer
              </Link>
            </div>

            {/* Premium */}
            <div className="relative card p-8 text-left border-brand-500/50 bg-gradient-to-br from-brand-500/10 to-orange-500/10">
              <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAIRE
              </div>
              <h3 className="font-bold text-xl mb-1">Premium</h3>
              <div className="text-4xl font-extrabold mb-1">9,99€</div>
              <div className="text-zinc-400 text-sm mb-6">par mois · ou 79,99€/an</div>
              <ul className="space-y-3 text-sm text-zinc-300">
                {[
                  '100 essayages par mois',
                  'Générations prioritaires',
                  'Meilleure qualité d\'image',
                  'Sans publicité',
                  'Historique illimité',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full mt-8 flex items-center justify-center gap-2">
                Commencer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">
            Prêt à essayer ?
          </h2>
          <p className="text-zinc-400 mb-8">3 essayages offerts. Aucune carte bancaire.</p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base py-4 px-8">
            Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center text-zinc-500 text-sm">
        <p>© 2025 TryFit AI · Tous droits réservés</p>
      </footer>
    </div>
  )
}
