'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Home, Clock, User, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/try-on', label: 'Essayer', icon: Sparkles },
  { href: '/history', label: 'Historique', icon: Clock },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/premium', label: 'Premium', icon: Crown },
]

export default function AppNav({ userId }: { userId: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex-col p-4 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">TryFit AI</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {href === '/premium' && (
                <span className="ml-auto bg-brand-500/20 text-brand-400 text-xs px-2 py-0.5 rounded-full">✨</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-40 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all',
                pathname === href ? 'text-brand-400' : 'text-zinc-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
