import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Crown, Zap, Clock, Shirt } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { count: totalGenerations } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'completed')

  const { data: recentGenerations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(4)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi'

  return (
    <div className="relative">
      {/* Halo orange en haut */}
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(249,115,22,0.08), transparent)' }}
      />

      <div className="relative p-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900">Bonjour, {firstName} 👋</h1>
          <p className="text-zinc-500 mt-1">Prêt à essayer de nouveaux looks ?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <div className="text-2xl mb-1">🪙</div>
            <p className="text-2xl font-extrabold text-zinc-900">{profile?.credits ?? 0}</p>
            <p className="text-zinc-500 text-xs mt-0.5">crédit{(profile?.credits ?? 0) > 1 ? 's' : ''} restant{(profile?.credits ?? 0) > 1 ? 's' : ''}</p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex justify-center mb-1"><Shirt className="w-7 h-7 text-brand-500 mt-0.5" /></div>
            <p className="text-2xl font-extrabold text-zinc-900">{totalGenerations ?? 0}</p>
            <p className="text-zinc-500 text-xs mt-0.5">essayage{(totalGenerations ?? 0) > 1 ? 's' : ''}</p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex justify-center mb-1">
              {profile?.is_premium
                ? <Crown className="w-7 h-7 text-brand-500 mt-0.5" />
                : <Zap className="w-7 h-7 text-zinc-400 mt-0.5" />}
            </div>
            <p className="text-2xl font-extrabold text-zinc-900">{profile?.is_premium ? 'Premium' : 'Gratuit'}</p>
            <p className="text-zinc-500 text-xs mt-0.5">votre plan</p>
          </div>
        </div>

        {/* CTA principal — gradient orange */}
        <Link
          href="/try-on"
          className="block relative overflow-hidden rounded-2xl mb-6 group shadow-lg shadow-brand-500/20"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 60%, #fdba74 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative p-6 sm:p-8 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">Créer un nouveau look</h2>
              <p className="text-white/80 text-sm mb-5">Une pièce ou un outfit complet — tout se génère en un clic</p>
              <span className="inline-flex items-center gap-2 bg-white text-brand-500 font-bold text-sm px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all">
                C&apos;est parti <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tryfit-logo.png" alt="TryFit AI" className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl shadow-lg border-2 border-white/30 flex-shrink-0 group-hover:rotate-6 transition-transform" />
          </div>
        </Link>

        {/* Upsell si non premium */}
        {!profile?.is_premium && (
          <Link href="/premium" className="card p-4 mb-8 flex items-center justify-between gap-3 hover:border-brand-500/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Passez Premium</p>
                <p className="text-zinc-500 text-xs">Jusqu&apos;à 100 crédits par mois, qualité supérieure</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        )}

        {/* Essayages récents */}
        {recentGenerations && recentGenerations.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-zinc-900">Vos derniers looks</h2>
              <Link href="/history" className="text-brand-500 text-sm hover:text-brand-600 font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recentGenerations.map((gen) => (
                <div key={gen.id} className="card overflow-hidden aspect-[3/4] relative group">
                  {gen.result_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gen.result_image_url}
                      alt="Essayage"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium capitalize">{gen.garment_type === 'outfit' ? 'Outfit complet' : gen.garment_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-sm">Aucun essayage pour l&apos;instant</p>
              <p className="text-zinc-500 text-xs mt-0.5">Votre premier look n&apos;est qu&apos;à un clic — vous avez {profile?.credits ?? 0} crédit{(profile?.credits ?? 0) > 1 ? 's' : ''} pour commencer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
