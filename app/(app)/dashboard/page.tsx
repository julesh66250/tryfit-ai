import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Sparkles, ArrowRight, Crown, Zap } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: recentGenerations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(4)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi'

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Bonjour, {firstName} 👋</h1>
        <p className="text-zinc-500 mt-1">Prêt à essayer de nouveaux looks ?</p>
      </div>

      {/* Crédits */}
      <div className={`card p-5 mb-6 flex items-center justify-between ${profile?.is_premium ? 'border-brand-500/30 bg-brand-500/5' : ''}`}>
        <div className="flex items-center gap-3">
          {profile?.is_premium ? (
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-brand-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-zinc-500" />
            </div>
          )}
          <div>
            <p className="text-sm text-zinc-500">{profile?.is_premium ? 'Compte Premium' : 'Compte Gratuit'}</p>
            <p className="font-bold text-zinc-900">
              {profile?.credits ?? 0} crédit{(profile?.credits ?? 0) > 1 ? 's' : ''} restant{(profile?.credits ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {!profile?.is_premium && (
          <Link href="/premium" className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" /> Premium
          </Link>
        )}
      </div>

      {/* CTA principal */}
      <Link
        href="/try-on"
        className="block card p-8 mb-8 border-dashed border-2 border-zinc-300 hover:border-brand-500/50 transition-all group text-center"
      >
        <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Nouvel essayage</h2>
        <p className="text-zinc-500 text-sm mb-4">Importez votre photo et celle d&apos;un vêtement</p>
        <span className="btn-primary inline-flex items-center gap-2 text-sm">
          C&apos;est parti <ArrowRight className="w-4 h-4" />
        </span>
      </Link>

      {/* Essayages récents */}
      {recentGenerations && recentGenerations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900">Récents</h2>
            <Link href="/history" className="text-brand-500 text-sm hover:text-brand-600">
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
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium capitalize">{gen.garment_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
