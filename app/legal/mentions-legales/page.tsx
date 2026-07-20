export const metadata = { title: 'Mentions légales — TryFit AI' }

export default function MentionsLegalesPage() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-extrabold text-zinc-900">Mentions légales</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">Éditeur du site</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Le site TryFit AI est édité par : Jules Huguet<br />
          Statut : particulier / auto-entrepreneur (en cours d&apos;immatriculation)<br />
          Email : contact@tryfit.ai
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">Hébergement</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Le site est hébergé par Vercel Inc.<br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          vercel.com
        </p>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Les données sont stockées par Supabase Inc.<br />
          supabase.com
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">Propriété intellectuelle</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          L&apos;ensemble des éléments du site (logo, textes, design, code) est la propriété exclusive de TryFit AI.
          Toute reproduction sans autorisation écrite préalable est interdite.
          Les images générées par l&apos;utilisateur à partir de ses propres photos lui appartiennent.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">Contact</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Pour toute question : <a href="mailto:contact@tryfit.ai" className="text-brand-500 hover:text-brand-600">contact@tryfit.ai</a>
        </p>
      </section>
    </article>
  )
}
