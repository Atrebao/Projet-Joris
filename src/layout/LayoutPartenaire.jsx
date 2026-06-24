import React, { useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { getPartenaireId } from '../Utils/Utils'
import { Boxes, LayoutDashboard, Package, Receipt, Store, Tag, Users, Percent, BarChart3 } from 'lucide-react'
import { DashboardShell } from '../components/saas/SaasPrimitives'

export default function LayoutPartenaire() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const nav = [
    { to: '/partenaire', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { to: '/partenaire/commandes', label: 'Suivi des ventes', icon: Receipt },
    { to: '/partenaire/offres/nouvelle', label: 'Nouvelle offre', icon: Package },
    { to: '/partenaire/forfaits', label: 'Forfaits', icon: Tag },
    { to: '/partenaire/identifiants', label: 'Stocks & Identifiants', icon: Boxes },
    { to: '/partenaire/clients', label: 'Clients', icon: Users },
    { to: '/partenaire/promotions', label: 'Promotions', icon: Percent },
    { to: '/partenaire/stats', label: 'Statistiques', icon: BarChart3 },
  ]

  useEffect(() => {
    if (!partenaireId && !localStorage.getItem('token')) {
      navigate('/backoffice/login')
    }
  }, [partenaireId, navigate])

  return (
    <DashboardShell
      brand="RICHESSES Partner"
      brandIcon={Store}
      role="Espace Partenaire"
      nav={nav}
      user={{ name: 'Partenaire', initials: 'PT' }}
    >
      <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6">
        <Outlet />
      </div>
    </DashboardShell>
  )
}
