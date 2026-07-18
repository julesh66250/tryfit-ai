import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/layout/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950">
      <AppNav userId={user.id} />
      <main className="pb-24 md:pb-8 md:pl-64 pt-0">
        {children}
      </main>
    </div>
  )
}
