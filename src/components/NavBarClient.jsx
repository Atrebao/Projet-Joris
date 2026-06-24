import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Moon, ShieldCheck, Store, Users } from 'lucide-react'

export default function NavBarClient() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMarketplace = location.pathname === '/' || location.pathname.startsWith('/catalogue') || location.pathname.startsWith('/offre')
  const isAccount = location.pathname.startsWith('/mes-abonnements')

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </span>
          <span className="text-sm font-black tracking-tight text-foreground">
            Aboné<span className="text-primary">Plus</span>
          </span>
          <span className="ml-2 rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            DÉMO
          </span>
        </NavLink>

        <nav className="hidden rounded-2xl border border-border bg-background p-1 shadow-sm md:flex">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex h-8 items-center gap-2 rounded-xl bg-card px-4 text-sm font-semibold text-foreground shadow-sm"
          >
            <Users className="h-4 w-4" />
            Vue Client
          </button>
          <button
            type="button"
            onClick={() => navigate('/partenaire')}
            className="inline-flex h-8 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <Store className="h-4 w-4" />
            Vue Partenaire
          </button>
          <button
            type="button"
            onClick={() => navigate('/backoffice')}
            className="inline-flex h-8 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            Vue Admin
          </button>
        </nav>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition hover:bg-muted" aria-label="Thème">
          <Moon className="h-4 w-4" />
        </button>
      </div>

      <div className="border-t border-border/70 bg-card/70">
        <div className="mx-auto flex max-w-[1400px] items-center gap-1 px-4">
          <NavLink
            to="/"
            className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              isMarketplace ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/mes-abonnements"
            className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              isAccount ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Espace Client
          </NavLink>
        </div>
      </div>
    </header>
  )
}
