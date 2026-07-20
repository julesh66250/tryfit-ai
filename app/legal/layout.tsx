import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tryfit-logo.png" alt="TryFit AI" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-zinc-900">TryFit AI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t border-zinc-100 py-6 px-6 text-center text-zinc-400 text-sm">
        © 2026 TryFit AI · Tous droits réservés
      </footer>
    </div>
  )
}
