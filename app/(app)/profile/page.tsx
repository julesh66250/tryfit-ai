import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Crown, Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/profile/LogoutButton'
import { Trash2 } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: totalGenerations } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const initials = (profile?.full_name ?? user.email ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative">
      {/* Halo orange en haut */}
      <div
        className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(249,115,22,0.08), transparent)' }}
      />

      <div className="relative p-6 max-w-lg mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Profil</h1>

        {/* Carte identité */}
        <div className="card p-6 mb-4 text-center">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-md">
              {initials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white ${profile?.is_premium ? 'bg-brand-500' : 'bg-zinc-200'}`}>
              {profile?.is_premium
                ? <Crown className="w-3.5 h-3.5 text-white" />
                : <Zap className="w-3.5 h-3.5 text-zinc-500" />}
            </div>
          </div>
          <p className="font-bold text-zinc-900 text-xl">{profile?.full_name ?? 'Utilisateur'}</p>
          <p className="text-zinc-500 text-sm mt-0.5">{user.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-500">
            Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-4 text-center">
            <div className="text-xl mb-0.5">🪙</div>
            <p className="text-3xl font-extrabold text-zinc-900">{profile?.credits ?? 0}</p>
            <p className="text-zinc-500 text-sm mt-1">Crédit{(profile?.credits ?? 0) > 1 ? 's' : ''} restant{(profile?.credits ?? 0) > 1 ? 's' : ''}</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xl mb-0.5">✨</div>
            <p className="text-3xl font-extrabold text-zinc-900">{totalGenerations ?? 0}</p>
            <p className="text-zinc-500 text-sm mt-1">Essayage{(totalGenerations ?? 0) > 1 ? 's' : ''} réalisé{(totalGenerations ?? 0) > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Plan */}
        <div className={`card p-5 mb-4 ${profile?.is_premium ? 'border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-orange-500/5' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${profile?.is_premium ? 'bg-brand-500/10' : 'bg-zinc-100'}`}>
                {profile?.is_premium
                  ? <Crown className="w-5 h-5 text-brand-500" />
                  : <Zap className="w-5 h-5 text-zinc-400" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900">Plan {profile?.is_premium ? 'Premium' : 'Gratuit'}</p>
                {profile?.is_premium && profile.premium_expires_at ? (
                  <p className="text-zinc-400 text-xs">
                    Expire le {new Date(profile.premium_expires_at).toLocaleDateString('fr-FR')}
                  </p>
                ) : (
                  <p className="text-zinc-400 text-xs">1 crédit offert pour essayer</p>
                )}
              </div>
            </div>
            {!profile?.is_premium && (
              <Link href="/premium" className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                Passer Premium
              </Link>
            )}
          </div>
        </div>

        {/* Lien crédits */}
        <Link href="/premium" className="card p-4 mb-6 flex items-center justify-between gap-3 hover:border-brand-500/40 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-xl">🪙</span>
            <p className="font-medium text-zinc-900 text-sm">Obtenir plus de crédits</p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Actions */}
        <div className="card divide-y divide-zinc-100 overflow-hidden">
          <LogoutButton />
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 transition-all text-sm">
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}
