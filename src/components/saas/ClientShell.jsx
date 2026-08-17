import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, User, FileText, Menu, X, Globe, LogOut, Check } from 'lucide-react'
import Footer from '../Footer'
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext'
import ClientAuthModal from '../ClientAuthModal'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const navItems = [
  { to: '/', label: 'Accueil', icon: Home, exact: true },
  { to: '/mes-abonnements', label: 'Mes abonnements', icon: User },
  { to: '/conditions', label: 'Conditions', icon: FileText },
]

export default function ClientShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [currencyDropdown, setCurrencyDropdown] = useState(false)

  const { currency, setCurrency } = useCurrency()

  const [clientUser, setClientUser] = useState(() => {
    try {
      const stored = localStorage.getItem('client_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('client_user')
        setClientUser(stored ? JSON.parse(stored) : null)
      } catch {
        setClientUser(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_user')
    setClientUser(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-base font-black text-white shadow-md">
              R
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-black tracking-tight leading-none">RICHESSES</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400 mt-0.5">Marketplace</p>
            </div>
          </NavLink>

          {/* Navigation desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition',
                    isActive ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Actions : Sélecteur de Devise + Auth Client */}
          <div className="flex items-center gap-2.5">
            {/* Sélecteur de Devise */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdown(!currencyDropdown)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-extrabold hover:bg-muted/50 transition cursor-pointer"
                title="Changer de devise"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>{currency}</span>
              </button>

              {currencyDropdown && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in"
                  onClick={() => setCurrencyDropdown(false)}
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl text-left transition ${
                        currency === c.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <span>{c.name}</span>
                      {currency === c.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Authentification Client */}
            {clientUser ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/mes-abonnements"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-extrabold hover:bg-primary/20 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{clientUser.pseudo || clientUser.nom || 'Mon Compte'}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setAuthModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition md:hidden"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 py-4 md:hidden space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition',
                    isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted',
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}

            {!clientUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setAuthMode('login')
                  setAuthModalOpen(true)
                }}
                className="w-full mt-2 py-2.5 bg-primary text-white rounded-xl text-xs font-bold text-center"
              >
                Espace Client (Connexion / Inscription)
              </button>
            )}
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal Auth Client */}
      <ClientAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={(client) => setClientUser(client)}
      />
    </div>
  )
}
