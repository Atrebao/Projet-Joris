import { Outlet } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
  MessageSquare,
} from 'lucide-react'
import { DashboardShell, SaasTopBar } from '../components/saas/SaasPrimitives'

export default function LayoutAdmin() {
  const nav = [
    { to: '/backoffice', label: 'Vue globale', icon: LayoutDashboard, exact: true },
    { to: '/backoffice/partenaires', label: 'Partenaires', icon: Users },
    { to: '/backoffice/reversements', label: 'Versements', icon: Wallet },
    { to: '/backoffice/whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { to: '/backoffice/offres', label: 'Offres', icon: Package },
    { to: '/backoffice/commandes', label: 'Commandes', icon: ShoppingCart },
    { to: '/backoffice/clients', label: 'Clients', icon: Users },
    { to: '/backoffice/stats', label: 'Statistiques', icon: BarChart3 },
    // { to: '/backoffice/abonnements', label: 'Abonnements', icon: ClipboardList },
    { to: '/backoffice/souscriptions', label: 'Souscriptions', icon: Activity },
    { to: '/backoffice/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/backoffice/identifiants', label: 'Identifiants', icon: KeyRound }
  ]

  return (
    <>
      {/* <SaasTopBar active="admin" /> */}
      <DashboardShell
        brand="Richesses Streaming"
        brandIcon={ShieldCheck}
        role="Super-Administrateur"
        nav={nav}
        user={{ name: 'Admin Système', initials: 'AS' }}
      >
        <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6">
          <Outlet />
        </div>
      </DashboardShell>
    </>
  )
}
