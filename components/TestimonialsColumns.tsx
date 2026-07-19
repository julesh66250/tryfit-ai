'use client'

import { Star } from 'lucide-react'

type Testimonial = {
  name: string
  location: string
  text: string
  stars: number
  avatar: string
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm w-full flex-shrink-0">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
        ))}
      </div>
      <p className="text-zinc-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-2.5">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-9 h-9 rounded-full object-cover border-2 border-zinc-100 flex-shrink-0"
        />
        <div>
          <p className="text-zinc-900 text-sm font-semibold leading-tight">{t.name}</p>
          <p className="text-zinc-400 text-xs">{t.location} 🇫🇷</p>
        </div>
      </div>
    </div>
  )
}

function TestimonialsColumn({
  testimonials,
  duration = 30,
  reverse = false,
}: {
  testimonials: Testimonial[]
  duration?: number
  reverse?: boolean
}) {
  const doubled = [...testimonials, ...testimonials]

  return (
    <div className="flex flex-col gap-4 overflow-hidden" style={{ height: '480px' }}>
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `scroll-${reverse ? 'up' : 'down'} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  )
}

export default function TestimonialsColumns({ testimonials }: { testimonials: Testimonial[] }) {
  const third = Math.ceil(testimonials.length / 3)
  const col1 = testimonials.slice(0, third)
  const col2 = testimonials.slice(third, third * 2)
  const col3 = testimonials.slice(third * 2)

  return (
    <>
      <style>{`
        @keyframes scroll-down {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-up {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden">
        <TestimonialsColumn testimonials={col1} duration={28} />
        <TestimonialsColumn testimonials={col2} duration={22} reverse />
        <TestimonialsColumn testimonials={col3} duration={32} />
      </div>
    </>
  )
}
