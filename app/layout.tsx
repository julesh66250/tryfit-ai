import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tryfit-ai-smoky.vercel.app'),
  title: 'TryFit AI — Essayage virtuel de vêtements',
  description: 'Essayez des vêtements virtuellement grâce à l\'intelligence artificielle. Voyez comment un vêtement vous va avant de l\'acheter. 1 essayage offert.',
  keywords: ['essayage virtuel', 'vêtements', 'IA', 'mode', 'shopping'],
  openGraph: {
    title: 'TryFit AI — Essayez les vêtements sans les porter',
    description: 'Importez votre photo et celle d\'un vêtement — l\'IA génère en 30 secondes une image réaliste de vous. 1 essayage offert, sans carte bancaire.',
    url: '/',
    siteName: 'TryFit AI',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/tryfit-logo.png', width: 512, height: 512, alt: 'TryFit AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'TryFit AI — Essayez les vêtements sans les porter',
    description: 'L\'IA génère en 30 secondes une image réaliste de vous avec le vêtement. 1 essayage offert.',
    images: ['/tryfit-logo.png'],
  },
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
