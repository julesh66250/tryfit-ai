import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Crown, Zap } from 'lucide-react'
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

  return (
    <div className="p-6 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Profil</h1>

      {/* Avatar + infos */}
      <div className="card p-6 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-2xl font-bold text-white">
          {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-bold text-zinc-900 text-lg">{profile?.full_name ?? 'Utilisateur'}</p>
          <p className="text-zinc-500 text-sm">{user.email}</p>
          <p className="text-zinc-400 text-xs mt-1">
            Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-zinc-900">{profile?.credits ?? 0}</p>
          <p className="text-zinc-500 text-sm mt-1">Crédits restants</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-zinc-900">{totalGenerations ?? 0}</p>
          <p className="text-zinc-500 text-sm mt-1">Essayages réalisés</p>
        </div>
      </div>

      {/* Plan */}
      <div className={`card p-5 mb-6 ${profile?.is_premium ? 'border-brand-500/30 bg-brand-500/5' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.is_premium ? (
              <Crown className="w-5 h-5 text-brand-500" />
            ) : (
              <Zap className="w-5 h-5 text-zinc-400" />
            )}
            <div>
              <p className="font-semibold text-zinc-900">{profile?.is_premium ? 'Premium' : 'Gratuit'}</p>
              {profile?.is_premium && profile.premium_expires_at && (
                <p className="text-zinc-400 text-xs">
                  Expire le {new Date(profile.premium_expires_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          {!profile?.is_premium && (
            <Link href="/premium" className="btn-primary text-sm py-2 px-4">
              Passer Premium
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <LogoutButton />

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm">
          <Trash2 className="w-4 h-4" />
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
