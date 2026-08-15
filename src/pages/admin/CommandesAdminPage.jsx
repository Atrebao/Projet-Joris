import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Filter,
  Clock,
  CheckCircle2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  DollarSign,
  Store,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { partenairesAPI, souscriptionsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

const OPERATOR_PILLS = {
  WAVE: 'bg-sky-400 text-slate-950 font-black',
  ORANGE: 'bg-orange-500 text-white font-black',
  MTN: 'bg-yellow-400 text-slate-950 font-black',
  MOOV: 'bg-blue-600 text-white font-black',
}

export default function CommandesAdminPage() {
  const [activeTab, setActiveTab] = useState('tout')
  const [partenaireId, setPartenaireId] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 12
  const [stats, setStats] = useState({ total: 0, attente: 0, livrees: 0 })

  useEffect(() => {
    const loadPartenaires = async () => {
      try {
        const { data } = await partenairesAPI.getAll()
        setPartenaires(Array.isArray(data) ? data : data?.data || [])
      } catch {
        setPartenaires([])
      }
    }
    loadPartenaires()
  }, [])

  const loadCommandes = useCallback(
    async (isBackground = false) => {
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
          setTotal(data.total || 0)
          if (data.stats) {
            setStats({
              total: data.stats.total || 0,
              attente: data.stats.aLivrer || 0,
              livrees: data.stats.livrees || 0,
            })
          }
        } else {
          const list = Array.isArray(data) ? data : []
          setCommandes(list)
          setTotal(list.length)
        }
      } catch (error) {
        console.error('Erreur chargement commandes admin:', error)
        if (!isBackground) toast.error('Impossible de charger les commandes')
        setCommandes([])
      } finally {
        if (!isBackground) setLoading(false)
      }
    },
    [activeTab, partenaireId, currentPage]
  )

  useEffect(() => {
    loadCommandes()
  }, [loadCommandes])

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
  }, [loadCommandes])

  const normalizeOp = (op = '') => {
    const u = String(op).toUpperCase()
    if (u.includes('WAVE')) return 'WAVE'
    if (u.includes('ORANGE')) return 'ORANGE'
    if (u.includes('MTN')) return 'MTN'
    if (u.includes('MOOV')) return 'MOOV'
    return 'WAVE'
  }

  if (loading && commandes.length === 0) {
    return <LoadingState label="Chargement du flux des commandes..." />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Journal des Commandes & Livraisons"
        description="Suivez en temps réel les achats de streaming, le statut des livraisons d'identifiants et les règlements Mobile Money."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Total Commandes Encaissées"
          value={`${stats.total} commande(s)`}
          subtext="Souscriptions payées"
          icon={ShoppingCart}
        />
        <KpiCard
          title="En Attente de Livraison"
          value={`${stats.attente} commande(s)`}
          subtext="Identifiants non encore transmis"
          icon={Clock}
        />
        <KpiCard
          title="Livrées avec Succès"
          value={`${stats.livrees} commande(s)`}
          subtext="Identifiants transmis au client"
          icon={CheckCircle2}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-border shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Onglets Filtres */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border">
            {[
              { id: 'tout', label: `Toutes (${stats.total})`, icon: Receipt },
              { id: 'attente', label: `À livrer (${stats.attente})`, icon: Clock },
              { id: 'livrees', label: `Livrées (${stats.livrees})`, icon: CheckCircle2 },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-card text-foreground font-black shadow-xs border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Filtre Partenaire */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <select
              value={partenaireId}
              onChange={(e) => {
                setPartenaireId(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold outline-none shadow-2xs w-full md:w-64"
            >
              <option value="">Tous les partenaires</option>
              {partenaires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nomBoutique || p.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tableau des Commandes */}
      <Card className="p-0 border border-border shadow-2xs overflow-hidden">
        {commandes.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Aucune commande ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-5 py-3.5">Réf & Date</th>
                  <th className="px-4 py-3.5">Service / Offre</th>
                  <th className="px-4 py-3.5">Partenaire Marchand</th>
                  <th className="px-4 py-3.5">Client Bénéficiaire</th>
                  <th className="px-4 py-3.5">Opérateur</th>
                  <th className="px-4 py-3.5">Montant</th>
                  <th className="px-5 py-3.5 text-right">Statut Livraison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {commandes.map((c) => {
                  const nomService =
                    c.offrePartenaire?.titreOffre ||
                    c.offrePartenaire?.nomService ||
                    c.abonnement?.nom ||
                    'Abonnement'
                  const p = c.offrePartenaire?.partenaire || c.abonnement?.partenaire
                  const client = c.client || c.user
                  const opKey = normalizeOp(c.operateur || c.modePaiement)

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-foreground block">
                          {c.reference || `#${c.id}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.dateCreation || c.createdAt).toLocaleDateString('fr-FR')} {new Date(c.dateCreation || c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-extrabold text-foreground text-xs">{nomService}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {c.duree || 1} {c.periode ? c.periode.toLowerCase() : 'mois'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-foreground">
                          {p?.nomBoutique || p?.nom || 'DigiStore'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{p?.telephone || '-'}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-foreground">
                          {client ? `${client.nom || ''} ${client.prenoms || ''}`.trim() : 'Client'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {c.telephoneClient || client?.telephone || c.emailClient || '-'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${OPERATOR_PILLS[opKey] || 'bg-slate-200 text-slate-800'}`}>
                          {opKey}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-black text-foreground font-mono text-xs">
                        {formatFCFA(c.montantTotal || c.montant || 0)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <StatusBadge status={c.statutLivraison || (c.estLivre ? 'LIVRE' : 'A_LIVRER')} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Page {currentPage} sur {totalPages} ({total} commandes au total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="text-xs font-bold rounded-xl"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
