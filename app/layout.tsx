import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TryFit AI — Essayage virtuel de vêtements',
  description: 'Essayez des vêtements virtuellement grâce à l\'intelligence artificielle. Voyez comment un vêtement vous va avant de l\'acheter.',
  keywords: ['essayage virtuel', 'vêtements', 'IA', 'mode', 'shopping'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
