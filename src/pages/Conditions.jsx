import { useState } from 'react'
import { ChevronDown, CreditCard, FileText, Lock, Mail, RefreshCw, Shield } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Introduction et acceptation',
    icon: FileText,
    content: "En utilisant AbonéPlus, vous acceptez les présentes conditions d'utilisation. La plateforme met en relation des clients avec des partenaires proposant des abonnements numériques."
  },
  {
    title: 'Services proposés',
    icon: Shield,
    content: "Vous pouvez consulter les offres, comparer les forfaits, payer en Mobile Money et retrouver vos identifiants dans l'espace client après livraison."
  },
  {
    title: 'Paiement et livraison',
    icon: CreditCard,
    content: 'Les paiements Mobile Money sont traités via les intégrations disponibles. Les identifiants sont livrés par le partenaire après validation du paiement.'
  },
  {
    title: 'Remboursements',
    icon: RefreshCw,
    content: "Une réclamation peut être ouverte si les identifiants fournis ne fonctionnent pas ou si l'offre livrée ne correspond pas à la description."
  },
  {
    title: 'Protection des données',
    icon: Lock,
    content: "Vos informations servent au traitement des commandes, au suivi client et à la livraison des identifiants. Elles ne sont pas revendues à des tiers."
  }
]

export default function Conditions() {
  const [open, setOpen] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Conditions d'utilisation</h1>
          <p className="mt-3 text-muted-foreground">Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Votre confiance est importante. Lisez ces règles pour comprendre le fonctionnement des achats, paiements et livraisons.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {SECTIONS.map((section, index) => (
            <div key={section.title} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <section.icon className="h-4 w-4" />
                  </span>
                  {section.title}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open === index ? 'rotate-180' : ''}`} />
              </button>
              {open === index && <p className="border-t border-border px-4 py-4 text-sm leading-6 text-muted-foreground">{section.content}</p>}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Support</p>
              <p className="text-sm text-muted-foreground">support@aboneplus.ci</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
