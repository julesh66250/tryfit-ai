'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

const stats = [
  { value: '12 000+', label: 'Essayages générés' },
  { value: '4.8★', label: 'Note moyenne' },
  { value: '30s', label: 'Temps de génération' },
  { value: '100%', label: 'Données protégées' },
]

const logos = ['Vinted', 'Zara', 'H&M', 'Shein', 'ASOS', 'Zalando']

const examples = [
  {
    label: 'Veste tweed',
    desc: 'T-shirt basique → Veste tweed dorée',
    before: '/examples/exemple-1-avant.jpg',
    after: '/examples/exemple-1-apres.jpg',
    gender: 'Femme',
  },
  {
    label: 'Blazer casual',
    desc: 'T-shirt blanc → Blazer beige structuré',
    before: '/examples/exemple-2-avant.jpg',
    after: '/examples/exemple-2-apres.jpg',
    gender: 'Homme',
  },
  {
    label: 'Tenue streetwear',
    desc: 'Tenue noire → Cargo blanc + bucket hat',
    before: '/examples/exemple-3-avant.jpg',
    after: '/examples/exemple-3-apres.jpg',
    gender: 'Homme',
  },
]

const categories = [
  { emoji: '👕', label: 'T-shirts & Hauts', available: true },
  { emoji: '👖', label: 'Pantalons & Jupes', available: true },
  { emoji: '👗', label: 'Robes & Combinaisons', available: true },
  { emoji: '🧥', label: 'Vestes & Manteaux', available: true },
  { emoji: '👟', label: 'Chaussures', available: false },
  { emoji: '🧢', label: 'Casquettes & Bonnets', available: false },
  { emoji: '🎩', label: 'Chapeaux', available: false },
  { emoji: '💍', label: 'Bijoux & Accessoires', available: false },
]

const testimonials = [
  {
    name: 'Léa M.',
    handle: '@lea.mode',
    text: 'J\'ai essayé une robe Vinted sans même la commander. Je l\'ai vue sur moi en 20 secondes. Incroyable.',
    stars: 5,
    avatar: 'L',
  },
  {
    name: 'Camille R.',
    handle: '@camille.style',
    text: 'Je perds plus d\'argent à retourner des vêtements qui me vont pas. TryFit AI m\'a sauvé la mise.',
    stars: 5,
    avatar: 'C',
  },
  {
    name: 'Thomas D.',
    handle: '@tom.fits',
    text: 'Même en tant qu\'homme j\'adore. J\'ai testé 5 blazers différents avant d\'acheter le bon.',
    stars: 5,
    avatar: 'T',
  },
]

const faqs = [
  {
    q: 'Est-ce que les résultats sont réalistes ?',
    a: 'Oui, notre IA est spécialisée en mode et textile. Elle adapte le vêtement à votre morphologie, à la luminosité et à la pose de votre photo.',
  },
  {
    q: 'Quels types de vêtements puis-je essayer ?',
    a: 'Actuellement : hauts, pantalons, jupes, robes, vestes et manteaux. Les chaussures, chapeaux et bijoux arrivent très bientôt.',
  },
  {
    q: 'Mes photos sont-elles stockées ?',
    a: 'Vos photos sont traitées de façon sécurisée et ne sont jamais partagées. Vous pouvez supprimer vos données à tout moment depuis votre profil.',
  },
  {
    q: 'Comment obtenir de meilleurs résultats ?',
    a: 'Utilisez une photo de vous debout, en pied, avec une tenue simple et un fond neutre. La qualité de la photo d\'entrée impacte directement le résultat.',
  },
  {
    q: 'C\'est gratuit ?',
    a: 'Oui, 3 essayages sont offerts à l\'inscription. Ensuite vous pouvez acheter des crédits ou passer Premium pour 100 essayages/mois.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="font-medium text-zinc-900">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-zinc-500 text-sm leading-relaxed border-t border-zinc-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-zinc-900">TryFit AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors">
            Connexion
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-orange-400/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/8 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-500 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Propulsé par l&apos;IA
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-zinc-900">
            Essayez les vêtements
            <br />
            <span className="gradient-brand-text">sans les porter</span>
          </h1>

          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10">
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

          <p className="text-zinc-400 text-sm mt-4">3 essayages offerts · Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-brand-500 mb-1">{s.value}</div>
              <div className="text-zinc-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Logo bar */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-400 text-sm mb-6 uppercase tracking-widest">Compatible avec vos boutiques préférées</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <span key={logo} className="text-xl font-bold text-zinc-300 hover:text-zinc-500 transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Avant/Après */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Voyez la différence</h2>
          <p className="text-zinc-500 text-center mb-14">Résultats générés par notre IA en moins de 30 secondes</p>

          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((ex, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="grid grid-cols-2 h-72 relative">
                  <div className="relative bg-zinc-100 overflow-hidden">
                    <div className="w-full h-full relative">
                      <Image
                        src={ex.before}
                        alt={`Avant - ${ex.label}`}
                        fill
                        className="object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-20">👤</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
                      Avant
                    </div>
                  </div>
                  <div className="relative bg-zinc-100 overflow-hidden border-l border-zinc-200">
                    <div className="w-full h-full relative">
                      <Image
                        src={ex.after}
                        alt={`Après - ${ex.label}`}
                        fill
                        className="object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-20">✨</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-brand-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
                      Après
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center z-20 shadow">
                    <span className="text-zinc-400 text-xs font-bold">↔</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{ex.label}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{ex.desc}</p>
                    </div>
                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">{ex.gender}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-zinc-900">Essayez tout ce que vous voulez</h2>
          <p className="text-zinc-500 mb-12">Hauts, bas, robes, accessoires — TryFit AI couvre tous les styles</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className={`card p-4 text-center relative ${!cat.available ? 'opacity-50' : 'hover:border-brand-500/40 hover:shadow-md transition-all'}`}
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-sm font-medium text-zinc-700">{cat.label}</p>
                {!cat.available && (
                  <div className="absolute top-2 right-2 bg-zinc-100 text-zinc-400 text-xs px-1.5 py-0.5 rounded-full">
                    Bientôt
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Comment ça marche ?</h2>
          <p className="text-zinc-500 text-center mb-14">3 étapes, moins de 30 secondes</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Ajoutez votre photo', desc: 'Importez une photo entière de vous, debout, en tenue simple.', emoji: '🤳' },
              { step: '2', title: 'Choisissez un vêtement', desc: 'Importez une photo depuis Vinted, Zara, Instagram ou votre galerie.', emoji: '👕' },
              { step: '3', title: 'Voyez le résultat', desc: "L'IA génère une image réaliste de vous avec ce vêtement en quelques secondes.", emoji: '✨' },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500/10 text-brand-500 text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14 text-zinc-900">Tout ce dont vous avez besoin</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-5 h-5" />, title: 'Ultra rapide', desc: 'Résultat en moins de 30 secondes.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Vos données protégées', desc: 'Vos photos ne sont jamais partagées.' },
              { icon: <Star className="w-5 h-5" />, title: 'Qualité réaliste', desc: 'IA spécialisée en mode et textile.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1 text-zinc-900">{f.title}</h3>
                <p className="text-zinc-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Ils adorent TryFit AI</h2>
          <p className="text-zinc-500 text-center mb-14">Plus de 12 000 utilisateurs nous font confiance</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-500 text-brand-500" />
                  ))}
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-500 font-bold text-sm flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-zinc-900 text-sm font-medium">{t.name}</p>
                    <p className="text-zinc-400 text-xs">{t.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-zinc-900">Tarifs simples</h2>
          <p className="text-zinc-500 mb-14">Commencez gratuitement, passez premium quand vous voulez</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-8 text-left">
              <h3 className="font-bold text-xl mb-1 text-zinc-900">Gratuit</h3>
              <div className="text-4xl font-extrabold mb-6 text-zinc-900">0€</div>
              <ul className="space-y-3 text-sm text-zinc-600">
                {['3 essayages offerts', 'Téléchargement du résultat', 'Historique des essayages'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full mt-8 flex items-center justify-center">
                Commencer
              </Link>
            </div>
            <div className="relative card p-8 text-left border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-orange-500/5">
              <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAIRE
              </div>
              <h3 className="font-bold text-xl mb-1 text-zinc-900">Premium</h3>
              <div className="text-4xl font-extrabold mb-1 text-zinc-900">9,99€</div>
              <div className="text-zinc-400 text-sm mb-6">par mois · ou 79,99€/an</div>
              <ul className="space-y-3 text-sm text-zinc-600">
                {['100 essayages par mois', 'Générations prioritaires', 'Meilleure qualité d\'image', 'Sans publicité', 'Historique illimité'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-500">✓</span> {f}
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

      {/* FAQ */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Questions fréquentes</h2>
          <p className="text-zinc-500 text-center mb-14">Tout ce que vous voulez savoir</p>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 text-zinc-900">Prêt à essayer ?</h2>
          <p className="text-zinc-500 mb-8">3 essayages offerts. Aucune carte bancaire.</p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base py-4 px-8">
            Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-zinc-400 text-sm">
        <p>© 2025 TryFit AI · Tous droits réservés · <Link href="/login" className="hover:text-zinc-600">Connexion</Link></p>
      </footer>
    </div>
  )
}
