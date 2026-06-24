import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, User, FileText, Menu, X, Search } from 'lucide-react'
import Footer from '../Footer'
import { Button } from './SaasPrimitives'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const navItems = [
  { to: '/', label: 'Accueil', icon: Home, exact: true },
  { to: '/catalogue', label: 'Catalogue', icon: ShoppingBag },
  { to: '/mes-abonnements', label: 'Mes abonnements', icon: User },
  { to: '/conditions', label: 'Conditions', icon: FileText },
]

export default function ClientShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white shadow-md">
              R
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-black tracking-tight">RICHESSES</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">Marketplace</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-foreground hover:bg-slate-800 hover:text-white',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-slate-900 px-4 text-sm font-semibold text-foreground transition hover:border-slate-700 hover:bg-slate-800">
              <Search className="h-4 w-4" /> Rechercher
            </button>
            <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => window.location.assign('/register')}>
              Créer un compte
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-slate-900 text-foreground transition hover:border-slate-700 hover:bg-slate-800 md:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 py-4 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                      isActive ? 'bg-slate-900 text-white' : 'text-foreground hover:bg-slate-800',
                    )
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <Button variant="secondary" className="w-full" onClick={() => window.location.assign('/register')}>
                Créer un compte
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>
      <Footer />
    </div>
  )
}
