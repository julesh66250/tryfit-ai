'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Home, Clock, User, Crown, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/try-on', label: 'Essayer', icon: Sparkles },
  { href: '/discover', label: 'Découvrir', icon: Compass },
  { href: '/history', label: 'Historique', icon: Clock },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/premium', label: 'Premium', icon: Crown },
]

export default function AppNav({ userId }: { userId: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 flex-col p-4 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tryfit-logo.png" alt="TryFit AI" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-zinc-900">TryFit AI</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {href === '/premium' && (
                <span className="ml-auto bg-brand-500/10 text-brand-500 text-xs px-2 py-0.5 rounded-full">✨</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all',
                pathname === href ? 'text-brand-500' : 'text-zinc-400'
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
