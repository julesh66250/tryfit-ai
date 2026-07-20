'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') // 'starter' | 'pro' | null
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      const msg = error.message
      const messageFr = msg.includes('already registered')
        ? 'Un compte existe déjà avec cet email'
        : msg.includes('Password should be')
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : msg.toLowerCase().includes('invalid') && msg.toLowerCase().includes('email')
            ? 'Adresse email invalide'
            : msg.toLowerCase().includes('rate limit') || msg.includes('Too many')
              ? 'Trop de tentatives — réessayez dans quelques minutes'
              : 'Une erreur est survenue, réessayez'
      toast.error(messageFr)
      setLoading(false)
      return
    }

    toast.success('Compte créé ! Redirection...')
    setTimeout(() => {
      if (plan === 'starter' || plan === 'pro') {
        router.push(`/checkout?plan=${plan}`)
      } else {
        router.push('/dashboard')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TryFit AI" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-xl text-zinc-900">TryFit AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Créer votre compte</h1>
          <p className="text-zinc-500 mt-1">
            {plan === 'starter' ? 'Plan Starter · 12,99€/mois après inscription' :
             plan === 'pro' ? 'Plan Pro · 19,99€/mois après inscription' :
             '1 essayage offert · Sans carte bancaire'}
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre prénom"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-12 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Création...' : 'Créer mon compte gratuit'}
            </button>
          </form>

          <p className="text-center text-zinc-400 text-xs mt-6">
            En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
          </p>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
