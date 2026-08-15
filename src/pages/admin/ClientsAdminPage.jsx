import { useEffect, useState, useMemo } from 'react'
import {
  Download,
  Eye,
  Mail,
  Phone,
  Search,
  UserCheck,
  Users,
  UserX,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersAPI } from '../../lib/api'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

export default function ClientsAdminPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0, totalAchats: 0, revenuTotal: 0 })
  const [detailClient, setDetailClient] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadClients = async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getClients({
        search: recherche.trim() || undefined,
        statut: filtreStatut !== 'TOUS' ? filtreStatut : undefined,
        page,
        limit: 12,
      })
      const data = res?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const rawList = data.data || []
        setClients(
          rawList.map((user) => ({
            id: user.id,
            nom: user.nom ? `${user.prenoms || ''} ${user.nom}`.trim() : user.username || 'Client',
            pseudo: user.pseudo || user.username || '-',
            email: user.email || 'Non renseigné',
            telephone: user.numero || user.telephone || '-',
            dateInscription: user.dateCreation || user.createdAt,
            nbAchats: user.nbAchats || 0,
            totalDepense: Number(user.totalDepense || 0),
            statut: user.enabled !== false ? 'ACTIF' : 'INACTIF',
          }))
        )
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || rawList.length)
        if (data.stats) setStats(data.stats)
      } else {
        const rawList = Array.isArray(data) ? data : []
        setClients(
          rawList.map((user) => ({
            id: user.id,
            nom: user.nom ? `${user.prenoms || ''} ${user.nom}`.trim() : user.username || 'Client',
            pseudo: user.pseudo || user.username || '-',
            email: user.email || 'Non renseigné',
            telephone: user.numero || user.telephone || '-',
            dateInscription: user.dateCreation || user.createdAt,
            nbAchats: user.nbAchats || 0,
            totalDepense: Number(user.totalDepense || 0),
            statut: user.enabled !== false ? 'ACTIF' : 'INACTIF',
          }))
        )
        setTotal(rawList.length)
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
      toast.error('Impossible de charger la liste des clients')
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients()
    }, 200)
    return () => clearTimeout(timer)
  }, [recherche, filtreStatut, page])

  const handleVoirClient = async (id) => {
    setDetailClient(null)
    setDetailLoading(true)
    try {
      const { data } = await usersAPI.getClient(id)
      setDetailClient(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const clientStats = useMemo(() => {
    const totalCount = total || clients.length
    const actifs = clients.filter((c) => c.statut === 'ACTIF').length
    const totalDepenses = clients.reduce((acc, c) => acc + c.totalDepense, 0)
    const totalAchats = clients.reduce((acc, c) => acc + c.nbAchats, 0)

    return { totalCount, actifs, totalDepenses, totalAchats }
  }, [clients, total])

  if (loading && clients.length === 0) {
    return <LoadingState label="Chargement du répertoire client..." />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Répertoire des Clients"
        description="Consultez les utilisateurs enregistrés, l'historique de leurs abonnements et leur volume d'achats."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Clients"
          value={clientStats.totalCount}
          subtext="Comptes enregistrés"
          icon={Users}
        />
        <KpiCard
          title="Clients Actifs"
          value={clientStats.actifs}
          subtext="Utilisateurs réguliers"
          icon={UserCheck}
        />
        <KpiCard
          title="Souscriptions Achetées"
          value={`${clientStats.totalAchats} achat(s)`}
          subtext="Total commandes passées"
          icon={ShoppingCart}
        />
        <KpiCard
          title="Volume d'Achats Client"
          value={formatFCFA(clientStats.totalDepenses)}
          subtext="Dépenses cumulées"
          icon={Wallet}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-border shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, pseudo, email, téléphone..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filtreStatut}
              onChange={(e) => {
                setFiltreStatut(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold outline-none shadow-2xs"
            >
              <option value="TOUS">Tous les clients</option>
              <option value="ACTIF">Clients Actifs</option>
              <option value="INACTIF">Inactifs</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tableau des Clients */}
      <Card className="p-0 border border-border shadow-2xs overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Aucun client ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-5 py-3.5">Client & Pseudo</th>
                  <th className="px-4 py-3.5">Téléphone</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Inscrit le</th>
                  <th className="px-4 py-3.5">Total Achats</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                          {client.nom ? client.nom.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-xs">{client.nom}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">@{client.pseudo}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                      {client.telephone}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {client.email}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {client.dateInscription
                        ? new Date(client.dateInscription).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-black text-foreground font-mono">
                        {formatFCFA(client.totalDepense)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {client.nbAchats} commande(s)
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                          client.statut === 'ACTIF'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border border-slate-300 text-slate-600'
                        }`}
                      >
                        {client.statut}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoirClient(client.id)}
                        className="text-xs font-bold rounded-xl h-8 px-2.5"
                        title="Consulter la fiche client"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Page {page} sur {totalPages} ({total} clients au total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-bold rounded-xl"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Détail Client */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setDetailClient(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center">
                {detailClient.nom ? detailClient.nom.charAt(0) : 'C'}
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-lg">
                  {detailClient.nom ? `${detailClient.nom} ${detailClient.prenoms || ''}` : detailClient.username}
                </h3>
                <p className="text-xs text-muted-foreground">Fiche Client Détaillée</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Pseudo :</span>
                <span className="font-bold text-foreground">@{detailClient.pseudo || detailClient.username || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Numéro :</span>
                <span className="font-mono font-bold text-foreground">{detailClient.numero || detailClient.telephone || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Email :</span>
                <span className="font-bold text-foreground">{detailClient.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Statut du compte :</span>
                <span className="font-bold text-emerald-600">{detailClient.enabled !== false ? 'ACTIF' : 'INACTIF'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailClient(null)}
                className="text-xs font-bold rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
