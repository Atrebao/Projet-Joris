import { useEffect, useState } from 'react'
import { Filter, Clock, CheckCircle, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { partenairesAPI, souscriptionsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import { Button, Card, DataTable, LoadingState, PageHeader, Select, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function CommandesAdminPage() {
  const [activeTab, setActiveTab] = useState('tout')
  const [partenaireId, setPartenaireId] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [stats, setStats] = useState({ total: 0, attente: 0, livrees: 0 })

  useEffect(() => {
    const loadPartenaires = async () => {
      try {
        const { data } = await partenairesAPI.getAll()
        setPartenaires(Array.isArray(data) ? data : (data?.data || []))
      } catch {
        setPartenaires([])
      }
    }
    loadPartenaires()
  }, [])

  const loadCommandes = async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }
      if (partenaireId) params.partenaire = Number(partenaireId)
      if (activeTab === 'attente') params.activeFilter = 'A_LIVRER'
      if (activeTab === 'livrees') params.activeFilter = 'LIVREES'

      const res = await souscriptionsAPI.getAll(params)
      const data = res?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setCommandes(data.data || [])
        setTotalPages(data.totalPages || 1)
        if (data.stats) {
          setStats({
            total: data.stats.total || 0,
            attente: data.stats.aLivrer || 0,
            livrees: data.stats.livrees || 0,
          })
        }
      } else {
        setCommandes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur chargement commandes admin:', error)
      if (!isBackground) toast.error('Impossible de charger les commandes')
      setCommandes([])
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    loadCommandes()
  }, [activeTab, partenaireId, currentPage])

  useEffect(() => {
    const unsubOrder = onSocketEvent('nouvelle_commande', () => {
      loadCommandes(true)
    })
    const unsubDelivery = onSocketEvent('commande_livree', () => {
      loadCommandes(true)
    })
    const unsubStats = onSocketEvent('stats_updated', () => {
      loadCommandes(true)
    })

    return () => {
      unsubOrder()
      unsubDelivery()
      unsubStats()
    }
  }, [activeTab, partenaireId, currentPage])

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <PageHeader
        title="Commandes"
        description="Vue globale des commandes, paiements et livraisons."
        action={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select 
              value={partenaireId} 
              onChange={(e) => {
                setPartenaireId(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-xl border-input bg-card text-xs w-56 font-semibold text-slate-700"
            >
              <option value="">Tous les partenaires</option>
              {partenaires.map((p) => (
                <option key={p.id} value={p.id}>{p.nomBoutique || p.nom}</option>
              ))}
            </Select>
          </div>
        }
      />

      {/* Sélecteur d'onglets (Filtres d'état) */}
      <Card className="p-1.5 shadow-sm border border-border bg-card max-w-fit rounded-xl">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'attente', label: `À livrer (${stats.attente})`, icon: Clock },
            { id: 'livrees', label: `Livrées (${stats.livrees})`, icon: CheckCircle },
            { id: 'tout', label: `Tout voir (${stats.total})`, icon: Receipt }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Button 
                key={tab.id} 
                variant={isActive ? 'primary' : 'ghost'} 
                onClick={() => {
                  setActiveTab(tab.id)
                  setCurrentPage(1)
                }}
                className={`rounded-lg font-bold text-xs gap-2 py-2 px-3.5 ${
                  isActive ? 'shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </Card>

      {/* Section Données / Tableau */}
      <Card className="p-1 border border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
        {loading && commandes.length === 0 ? (
          <LoadingState label="Chargement des commandes..." />
        ) : (
          <>
            <DataTable
              data={commandes}
              emptyLabel="Aucune commande trouvée"
              columns={[
                { 
                  key: 'reference', 
                  label: 'Référence', 
                  render: (c) => (
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                      {c.reference || '-'}
                    </span>
                  ) 
                },
                {
                  key: 'offre',
                  label: 'Offre / Service',
                  render: (c) => {
                    const nomService = c.offrePartenaire?.titreOffre || c.offrePartenaire?.nomService || c.abonnement?.nom || 'Abonnement'
                    return (
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{nomService}</p>
                        <p className="text-xs text-slate-400">{c.duree || 1} {c.periode || 'Mois'}</p>
                      </div>
                    )
                  },
                },
                {
                  key: 'partenaire',
                  label: 'Partenaire',
                  render: (c) => {
                    const p = c.offrePartenaire?.partenaire || c.abonnement?.partenaire
                    const nom = p ? `${p.prenoms || ''} ${p.nom || ''}`.trim() || p.nomBoutique : '-'
                    return (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 text-sm">{nom}</span>
                        {p?.email && <span className="text-[11px] text-slate-400">{p.email}</span>}
                      </div>
                    )
                  },
                },
                {
                  key: 'client',
                  label: 'Client (Bénéficiaire)',
                  render: (c) => {
                    const client = c.client || c.user
                    const nom = client ? `${client.prenoms || ''} ${client.nom || ''}`.trim() : 'Client'
                    const contact = c.emailClient || client?.email || client?.telephone || '-'
                    return (
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{nom}</p>
                        <p className="text-xs text-slate-400">{contact}</p>
                      </div>
                    )
                  },
                },
                { 
                  key: 'montant', 
                  label: 'Montant', 
                  render: (c) => (
                    <span className="font-extrabold text-slate-800 text-sm">
                      {formatFCFA(c.montantTotal ?? c.montant)}
                    </span>
                  ) 
                },
                { 
                  key: 'paiement', 
                  label: 'Paiement', 
                  render: (c) => <StatusBadge status={c.statutPaiement} /> 
                },
                {
                  key: 'livraison',
                  label: 'Livraison',
                  render: (c) => {
                    if (c.isLivred || c.etatSouscription === 'ACTIF' || c.etatSouscription === 'LIVRE') {
                      return <StatusBadge status="LIVRE" />
                    } else if (c.statutPaiement === 'ECHEC') {
                      return <StatusBadge status="ECHEC" />
                    } else {
                      return <StatusBadge status="EN_ATTENTE" />
                    }
                  },
                },
                {
                  key: 'date',
                  label: 'Date',
                  render: (c) => (
                    <span className="text-xs text-slate-500">
                      {c.dateCreation ? new Date(c.dateCreation).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </span>
                  ),
                },
              ]}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">
                  Page <span className="font-bold text-slate-700">{currentPage}</span> sur <span className="font-bold text-slate-700">{totalPages}</span>
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
