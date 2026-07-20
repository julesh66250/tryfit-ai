'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TestimonialsColumns from '@/components/TestimonialsColumns'

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
    image: '/examples/exemple-1.png',
    gender: 'Femme',
  },
  {
    label: 'Blazer casual',
    desc: 'T-shirt blanc → Blazer beige structuré',
    image: '/examples/exemple-2.png',
    gender: 'Homme',
  },
  {
    label: 'Tenue streetwear',
    desc: 'Tenue noire → Cargo blanc + bucket hat',
    image: '/examples/exemple-3.png',
    gender: 'Homme',
  },
]

const testimonials = [
  { name: 'Sarah', location: 'Paris', text: 'J\'avais un doute sur une veste Vinted à 60€. Je l\'ai essayée en 30 secondes et j\'ai commandé direct. Aucun regret.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Inès', location: 'Lyon', text: 'Je fais du shopping en ligne depuis des années et je retournais toujours la moitié. Depuis que j\'utilise ça, zéro retour.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Mathieu', location: 'Bordeaux', text: 'Franchement je pensais que ce serait nul mais le résultat est bluffant. J\'ai testé 4 manteaux avant d\'en choisir un.', stars: 5, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Jade', location: 'Marseille', text: 'J\'achète beaucoup sur Shein et j\'avais toujours peur que ça rende pas bien sur moi. Maintenant je sais avant d\'acheter.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { name: 'Lucas', location: 'Nantes', text: 'Super pratique pour comparer plusieurs looks rapidement. Je l\'utilise avant chaque achat maintenant.', stars: 5, avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { name: 'Emma', location: 'Lille', text: 'L\'IA est vraiment précise. La robe que j\'ai essayée virtuellement ressemble exactement à ce que j\'ai reçu.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/90.jpg' },
  { name: 'Chloé', location: 'Toulouse', text: 'J\'ai testé une robe de soirée avant de la louer. La qualité du rendu m\'a bluffée, on voyait même les reflets du tissu.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { name: 'Raphaël', location: 'Strasbourg', text: 'Je fais souvent des achats impulsifs que je regrette. Depuis TryFit AI j\'achète moins mais mieux.', stars: 5, avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { name: 'Léonie', location: 'Rennes', text: 'Parfait pour tester les tenues de mariage ou d\'événement sans débourser avant d\'être sûre.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { name: 'Antoine', location: 'Nice', text: 'J\'utilise ça pour mes achats sur ASOS. Fini les retours à la chaîne, j\'économise du temps et de l\'argent.', stars: 5, avatar: 'https://randomuser.me/api/portraits/men/60.jpg' },
  { name: 'Zoé', location: 'Montpellier', text: 'Incroyable la précision. La veste que j\'avais essayée virtuellement était exactement comme en vrai une fois reçue.', stars: 5, avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { name: 'Théo', location: 'Lyon', text: 'Je recommande à tous mes potes. On s\'amuse à tester des styles fous et du coup on achète vraiment ce qu\'on aime.', stars: 5, avatar: 'https://randomuser.me/api/portraits/men/18.jpg' },
]

const faqs = [
  {
    q: 'Est-ce que les résultats sont réalistes ?',
    a: 'Oui, notre IA est spécialisée en mode et textile. Elle adapte le vêtement à votre morphologie, à la luminosité et à la pose de votre photo.',
  },
  {
    q: 'Quels types de vêtements puis-je essayer ?',
    a: 'Tous les types : hauts, pantalons, jupes, robes, vestes, manteaux, chaussures, chapeaux, casquettes et bijoux.',
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
    a: '1 crédit est offert à l\'inscription pour tester. Chaque crédit correspond à 1 vêtement ou accessoire essayé. Pour un outfit complet, chaque pièce utilise 1 crédit — tout se génère en un seul clic.',
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
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'pro'>('starter')
  const [pricingVisible, setPricingVisible] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setPricingVisible(entry.isIntersecting) },
      { threshold: 0.1 }
    )
    if (pricingRef.current) observer.observe(pricingRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen text-zinc-900 relative" style={{ background: 'linear-gradient(180deg, #fff5f0 0%, #ffffff 25%, #ffffff 75%, #fff5f0 100%)' }}>
      {/* Blob global haut-droite */}
      <div className="fixed -top-32 -right-32 w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-3xl pointer-events-none" style={{ zIndex: 0 }} />
      {/* Blob global bas-gauche */}
      <div className="fixed -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl pointer-events-none" style={{ zIndex: 0 }} />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tryfit-logo.png" alt="TryFit AI" className="w-8 h-8 rounded-lg" />
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
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-zinc-200 rounded-full px-4 py-1.5 text-sm text-zinc-500 mb-8 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Essayage virtuel par IA · Résultat en 30 secondes
          </div>

          {/* Titre */}
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-[1.08] tracking-tight text-zinc-950">
            Essayez les vêtements<br />
            <span className="text-brand-500">sans les porter</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl text-zinc-600 max-w-xl mx-auto mb-10 leading-relaxed">
            Importez votre photo et celle d&apos;un vêtement — l&apos;IA génère en 30 secondes
            une image réaliste de vous avec ce vêtement.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-3.5 px-7">
              Essayer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 text-base py-3.5 px-7 rounded-xl border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-all font-medium">
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="text-zinc-400 text-sm">1 essayage offert · Sans carte bancaire</p>
        </div>

        {/* Photos — éventail interactif */}
        <div className="max-w-4xl mx-auto mt-16 flex justify-center items-end pb-10">
          {examples.map((ex, i) => {
            const isHovered = hoveredPhoto === i
            const rotations = [-8, 0, 8]
            const zIndexes = [10, 20, 10]
            return (
              <div
                key={i}
                className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  width: '288px',
                  aspectRatio: '4/3',
                  marginRight: i === 0 ? '-64px' : 0,
                  marginLeft: i === 2 ? '-64px' : 0,
                  transform: `rotate(${isHovered ? 0 : rotations[i]}deg)${isHovered ? ' translateY(-20px) scale(1.06)' : ''}`,
                  zIndex: isHovered ? 40 : zIndexes[i],
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, z-index 0s',
                  boxShadow: isHovered
                    ? '0 30px 60px rgba(0,0,0,0.22)'
                    : '0 8px 24px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={() => setHoveredPhoto(i)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                <Image src={ex.image} alt={ex.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    Avant → Après
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-center text-zinc-400 text-sm mt-2">✦ Résultats générés par IA en moins de 30 secondes</p>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-zinc-100/60">
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
          <p className="text-zinc-400 text-xs mb-6 uppercase tracking-widest font-medium">Compatible avec vos boutiques préférées</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <span key={logo} className="text-xl font-bold text-zinc-300 hover:text-zinc-500 transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Comment ça marche ?</h2>
          <p className="text-zinc-500 text-center mb-14">3 étapes, moins de 30 secondes</p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { step: '1', title: 'Ajoutez votre photo', desc: 'Importez une photo entière de vous, debout, en tenue simple.', emoji: '🤳' },
              { step: '2', title: 'Ajoutez un ou plusieurs vêtements', desc: 'T-shirt, short, chaussures, bijoux, chapeau... Ajoutez autant de pièces que vous voulez. Chaque pièce utilise 1 crédit.', emoji: '👕' },
              { step: '3', title: 'Voyez le résultat', desc: "L'IA génère en quelques secondes une image réaliste de vous avec toutes vos pièces.", emoji: '✨' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="card p-6 text-center h-full">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-zinc-900">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Explication crédits */}
          <div className="card p-5 bg-brand-500/5 border-brand-500/20 flex items-center gap-4 mt-2">
            <div className="text-3xl flex-shrink-0">🪙</div>
            <div className="text-left">
              <p className="font-bold text-zinc-900 mb-1">1 crédit = 1 vêtement ou accessoire</p>
              <p className="text-zinc-500 text-sm">Chaque vêtement ou accessoire essayé coûte 1 crédit. Composez un outfit complet et tout se génère en un seul clic.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section className="py-20 px-6" ref={pricingRef}>
        <div className="max-w-5xl mx-auto text-center">
          <div style={{ opacity: pricingVisible ? 1 : 0, transform: pricingVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 1.2s ease, transform 1.2s ease' }}>
            <h2 className="text-3xl font-bold mb-4 text-zinc-900">Tarifs simples</h2>
            <p className="text-zinc-500 mb-8">Commencez gratuitement, passez au plan qui vous convient</p>

            {/* Toggle mensuel / annuel */}
            <div className="inline-flex items-center bg-white border border-zinc-200 rounded-full p-1 mb-12">
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
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${billing === 'yearly' ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-500'}`}>-15%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Gratuit */}
            <div onClick={() => setSelectedPlan('free')} className={`card p-8 text-left flex flex-col cursor-pointer transition-all duration-300 ${selectedPlan === 'free' ? 'border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-orange-500/5 shadow-lg' : ''}`} style={{ opacity: pricingVisible ? 1 : 0, transform: pricingVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 1.2s ease 0.5s, transform 1.2s ease 0.5s' }}>
              <h3 className="font-bold text-xl mb-1 text-zinc-900">Gratuit</h3>
              <div className="text-4xl font-extrabold mb-1 text-zinc-900">0€</div>
              <div className="text-zinc-400 text-sm mb-6">pour toujours</div>
              <ul className="space-y-3 text-sm text-zinc-600 flex-1">
                {['1 crédit offert (1 pièce)', 'Téléchargement du résultat', 'Historique des essayages'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/register" className={`w-full mt-8 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedPlan === 'free' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>Commencer</Link>
            </div>

            {/* Starter */}
            <div onClick={() => setSelectedPlan('starter')} className={`relative card p-8 text-left flex flex-col cursor-pointer transition-all duration-300 ${selectedPlan === 'starter' ? 'border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-orange-500/5 shadow-lg' : ''}`} style={{ opacity: pricingVisible ? 1 : 0, transform: pricingVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 1.2s ease 0.9s, transform 1.2s ease 0.9s' }}>
              <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</div>
              <h3 className="font-bold text-xl mb-1 text-zinc-900">Starter</h3>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl font-extrabold text-zinc-900">
                  {billing === 'monthly' ? '12,99€' : '11,04€'}
                </span>
                {billing === 'yearly' && <span className="text-xl text-zinc-300 line-through font-medium">12,99€</span>}
              </div>
              <div className="text-zinc-400 text-sm mb-6">
                {billing === 'monthly' ? 'par mois' : 'par mois · facturé 132,48€/an'}
              </div>
              <ul className="space-y-3 text-sm text-zinc-600 flex-1">
                {['50 crédits par mois', 'Outfits complets en 1 clic', 'Générations prioritaires', "Meilleure qualité d'image", 'Historique illimité'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <Link href={`/checkout?plan=starter${billing === 'yearly' ? '-yearly' : ''}`} className={`w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedPlan === 'starter' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                Commencer {selectedPlan === 'starter' && <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>

            {/* Pro */}
            <div onClick={() => setSelectedPlan('pro')} className={`card p-8 text-left flex flex-col cursor-pointer transition-all duration-300 ${selectedPlan === 'pro' ? 'border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-orange-500/5 shadow-lg' : ''}`} style={{ opacity: pricingVisible ? 1 : 0, transform: pricingVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 1.2s ease 1.3s, transform 1.2s ease 1.3s' }}>
              <h3 className="font-bold text-xl mb-1 text-zinc-900">Pro</h3>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl font-extrabold text-zinc-900">
                  {billing === 'monthly' ? '19,99€' : '16,99€'}
                </span>
                <span className="text-xl text-zinc-300 line-through font-medium">{billing === 'monthly' ? '25,98€' : '19,99€'}</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">
                {billing === 'monthly' ? 'par mois' : 'par mois · facturé 203,88€/an'}
              </div>
              <ul className="space-y-3 text-sm text-zinc-600 flex-1">
                {['100 crédits par mois', 'Outfits complets en 1 clic', 'Générations prioritaires', "Meilleure qualité d'image", 'Historique illimité', 'Support prioritaire'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <Link href={`/checkout?plan=pro${billing === 'yearly' ? '-yearly' : ''}`} className={`w-full mt-8 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedPlan === 'pro' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}>
                Commencer
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-zinc-900">Ils adorent TryFit AI</h2>
          <p className="text-zinc-500 text-center mb-14">Plus de 12 000 utilisateurs nous font confiance</p>
          <TestimonialsColumns testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
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
          <p className="text-zinc-500 mb-8">1 essayage offert. Aucune carte bancaire.</p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base py-4 px-8 shadow-lg shadow-brand-500/25">
            Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6 text-center text-zinc-400 text-sm">
        <p>© 2025 TryFit AI · Tous droits réservés · <Link href="/login" className="hover:text-zinc-600">Connexion</Link></p>
      </footer>
    </div>
  )
}
