export const metadata = { title: 'Conditions d\'utilisation — TryFit AI' }

export default function CguPage() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-extrabold text-zinc-900">Conditions générales d&apos;utilisation</h1>
      <p className="text-zinc-400 text-sm">Dernière mise à jour : juillet 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">1. Objet</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          TryFit AI est un service d&apos;essayage virtuel de vêtements par intelligence artificielle.
          L&apos;utilisateur importe une photo de lui-même et des photos de vêtements ou accessoires ;
          le service génère une image réaliste de l&apos;utilisateur portant ces pièces.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">2. Compte et crédits</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          La création d&apos;un compte est gratuite et donne droit à 1 crédit offert.
          1 crédit permet d&apos;essayer 1 vêtement ou accessoire. Des crédits supplémentaires
          sont disponibles via les abonnements Starter et Pro, facturés mensuellement ou annuellement.
          Les crédits mensuels non utilisés ne sont pas reportés au mois suivant.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">3. Abonnements et résiliation</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Les abonnements sont sans engagement et peuvent être résiliés à tout moment depuis le profil.
          La résiliation prend effet à la fin de la période en cours. Conformément à l&apos;article
          L221-28 du Code de la consommation, l&apos;utilisateur renonce à son droit de rétractation
          dès la première utilisation du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">4. Utilisation acceptable</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          L&apos;utilisateur s&apos;engage à n&apos;importer que des photos de lui-même ou de personnes
          ayant donné leur consentement explicite. Il est strictement interdit d&apos;utiliser le service
          pour créer des images de tiers sans leur accord, des contenus trompeurs, illégaux ou portant
          atteinte à la dignité des personnes. Tout manquement entraîne la suppression immédiate du compte.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">5. Limitation de responsabilité</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Les images générées sont des simulations par IA fournies à titre indicatif : le rendu réel
          d&apos;un vêtement peut différer. TryFit AI ne saurait être tenu responsable des décisions
          d&apos;achat prises sur la base des images générées, ni des interruptions temporaires du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">6. Contact</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Pour toute question relative aux présentes conditions : <a href="mailto:contact@tryfit.ai" className="text-brand-500 hover:text-brand-600">contact@tryfit.ai</a>
        </p>
      </section>
    </article>
  )
}
