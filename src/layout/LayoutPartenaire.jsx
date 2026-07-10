import React, { useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { getPartenaire, getPartenaireId } from '../Utils/Utils'
import { Boxes, LayoutDashboard, Package, Receipt, Store, Tag, Users, Percent, BarChart3, KeyRound } from 'lucide-react'
import { DashboardShell, SaasTopBar } from '../components/saas/SaasPrimitives'

export default function LayoutPartenaire() {
  const navigate = useNavigate()
  const partenaire = getPartenaire()
  const partenaireId = partenaire?.id
  const boutiqueName = partenaire?.nomBoutique || 'Partenaire'
  const partenaireNom = partenaire?.nom || 'Partenaire'
  const partenairePrenom = partenaire?.prenoms || 'Partenaire'

  const nav = [
    { to: '/partenaire', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { to: '/partenaire/commandes', label: 'Suivi des ventes', icon: Receipt },
    // { to: '/partenaire/offres', label: 'Mes offres', icon: Package },
    { to: '/partenaire/offres/nouvelle', label: 'Nouvelle offre', icon: Package },
    { to: '/partenaire/forfaits', label: 'Forfaits', icon: Tag },
    { to: '/partenaire/identifiants', label: 'Stocks & Identifiants', icon: Boxes },
    { to: '/partenaire/clients', label: 'Clients', icon: Users },
    { to: '/partenaire/promotions', label: 'Promotions', icon: Percent },
    { to: '/partenaire/stats', label: 'Statistiques', icon: BarChart3 },
    {to: '/partenaire/modifier-password', label: 'Modifier mot de passe', icon: KeyRound}
  ]

  

  useEffect(() => {
    if (!partenaireId && !localStorage.getItem('token')) {
      navigate('/backoffice/login')
    }
  }, [partenaireId, navigate])


  const getUserInitials = (nom, prenoms) => {
    if (!nom && !prenoms) return 'PT';
    const nomInitial = nom ? nom.charAt(0).toUpperCase() : '';
    const prenomsInitial = prenoms ? prenoms.charAt(0).toUpperCase() : '';
    return `${nomInitial}${prenomsInitial}`;
  }

  return (
    <>
      {/* <SaasTopBar active="partner" /> */}
      <DashboardShell
        brand={boutiqueName}
        brandIcon={Store}
        role="Espace Partenaire"
        nav={nav}
        user={{ name: partenaireNom + ' ' + partenairePrenom, initials: getUserInitials(partenaireNom, partenairePrenom) }}
      >
        <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6">
          <Outlet />
        </div>
      </DashboardShell>
    </>
  )
}
