export const metadata = { title: 'Politique de confidentialité — TryFit AI' }

export default function ConfidentialitePage() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-extrabold text-zinc-900">Politique de confidentialité</h1>
      <p className="text-zinc-400 text-sm">Dernière mise à jour : juillet 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">1. Données collectées</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Nous collectons : votre email et prénom (création de compte), les photos que vous importez
          (personne et vêtements), les images générées, et votre historique d&apos;essayages.
          Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">2. Utilisation des données</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Vos photos sont utilisées uniquement pour générer vos essayages virtuels.
          Elles sont transmises de manière sécurisée à notre partenaire technique de génération
          d&apos;images (FASHN AI) le temps du traitement. Vos photos ne sont jamais utilisées
          pour entraîner des modèles d&apos;IA, jamais vendues et jamais partagées à des fins publicitaires.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">3. Conservation</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Vos photos et générations sont conservées tant que votre compte est actif, afin d&apos;alimenter
          votre historique. Vous pouvez supprimer chaque essayage individuellement, ou supprimer votre
          compte entièrement — toutes vos données sont alors effacées définitivement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">4. Vos droits (RGPD)</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          de suppression et de portabilité de vos données. Pour l&apos;exercer, contactez-nous
          à l&apos;adresse ci-dessous — nous répondons sous 30 jours.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">5. Cookies</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          TryFit AI utilise uniquement des cookies techniques indispensables au fonctionnement
          du service (session de connexion). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">6. Contact</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Pour toute question relative à vos données : <a href="mailto:contact@tryfit.ai" className="text-brand-500 hover:text-brand-600">contact@tryfit.ai</a>
        </p>
      </section>
    </article>
  )
}
