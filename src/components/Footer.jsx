import { NavLink } from 'react-router-dom'
import { BadgeCheck, Facebook, Instagram, Mail, Store, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      {/* <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black leading-5">
                Aboné<span className="text-primary">Plus</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marketplace</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Une marketplace pour acheter, suivre et gérer vos abonnements numériques avec des moyens de paiement locaux.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" />
            Paiements et offres vérifiés
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Navigation</h3>
          <div className="mt-4 grid gap-3 text-sm font-medium text-muted-foreground">
            <NavLink to="/" className="hover:text-foreground">Accueil</NavLink>
            <NavLink to="/catalogue" className="hover:text-foreground">Catalogue</NavLink>
            <NavLink to="/mes-abonnements" className="hover:text-foreground">Mes abonnements</NavLink>
            <NavLink to="/conditions" className="hover:text-foreground">Conditions générales</NavLink>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Contact</h3>
          <a href="mailto:contact@richesses.app" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Mail className="h-4 w-4" />
            contact@richesses.app
          </a>
          <div className="mt-5 flex gap-2">
            {[Twitter, Facebook, Instagram].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Réseau social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div> */}

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-4 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Copyright © {new Date().getFullYear()} AbonéPlus. Tous droits réservés.</p>
          <p>Powered by BDAT</p>
        </div>
      </div>
    </footer>
  )
}
