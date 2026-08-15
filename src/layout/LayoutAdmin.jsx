import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  MessageSquare,
  Package,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Store,
  ChevronRight,
} from 'lucide-react'
import { resetStorage } from '../Utils/Utils'

export default function LayoutAdmin() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { to: '/backoffice', label: 'Vue Globale', icon: LayoutDashboard, exact: true },
    { to: '/backoffice/partenaires', label: 'Partenaires & Boutiques', icon: Store },
    { to: '/backoffice/reversements', label: 'Versements & Trésorerie', icon: Wallet },
    { to: '/backoffice/whatsapp', label: 'Bot WhatsApp & Alertes', icon: MessageSquare },
    { to: '/backoffice/offres', label: 'Catalogue des Offres', icon: Package },
    { to: '/backoffice/commandes', label: 'Commandes & Livraisons', icon: ShoppingCart },
    { to: '/backoffice/clients', label: 'Clients Enregistrés', icon: Users },
    { to: '/backoffice/stats', label: 'Analyses & Statistiques', icon: BarChart3 },
  ]

  const handleLogout = () => {
    resetStorage()
    navigate('/backoffice/login')
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0b0f19] text-slate-300 border-r border-slate-800/60 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/60 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm font-black">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">Richesses</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">Console de Gestion</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-800/90 text-white border border-slate-700 shadow-2xs'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="border-t border-slate-800/60 p-3 bg-[#080c14]">
        <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
              SA
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-slate-200">Super Admin</p>
              <p className="truncate text-[10px] text-slate-400">Plateforme</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-15 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Administration</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-800 capitalize">
                {location.pathname.replace('/backoffice', '').replace('/', '') || 'Tableau de bord'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>Boutique Client</span>
            </a>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700">
                A
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden md:inline-block">
                Administrateur
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
