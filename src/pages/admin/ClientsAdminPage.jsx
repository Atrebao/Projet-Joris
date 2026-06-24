import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Mail, Phone, Search, UserCheck, Users, UserX, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersAPI } from '../../lib/api'
import ModalDetail from '../../components/ModalDetail'
import {
  Button,
  Card,
  DataTable,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  ServiceLogo,
  StatusBadge,
  formatFCFA
} from '../../components/saas/SaasPrimitives'

export default function ClientsAdminPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [detailClient, setDetailClient] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        const { data } = await usersAPI.getClients({ search: recherche })
        setClients((data || []).map((user) => ({
          id: user.id,
          nom: user.nom ? `${user.prenoms || ''} ${user.nom}`.trim() : user.username,
          email: user.email,
          telephone: user.numero || user.telephone || '-',
          dateInscription: user.dateCreation,
          nbAchats: user.nbAchats || 0,
          totalDepense: user.totalDepense || 0,
          statut: user.enabled !== false ? 'ACTIF' : 'INACTIF'
        })))
      } catch (error) {
        console.error('Erreur chargement clients:', error)
        toast.error('Impossible de charger les clients')
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [recherche])

  const clientsFiltres = useMemo(
    () =>
      clients.filter((client) => {
        const query = recherche.toLowerCase()
        const matchRecherche = `${client.nom || ''} ${client.email || ''}`.toLowerCase().includes(query)
        const matchStatut = filtreStatut === 'TOUS' || client.statut === filtreStatut
        return matchRecherche && matchStatut
      }),
    [clients, filtreStatut, recherche]
  )

  const stats = useMemo(
    () => ({
      total: clients.length,
      actifs: clients.filter((client) => client.statut === 'ACTIF').length,
      inactifs: clients.filter((client) => client.statut === 'INACTIF').length,
      achats: clients.reduce((sum, client) => sum + Number(client.nbAchats || 0), 0),
      revenu: clients.reduce((sum, client) => sum + Number(client.totalDepense || 0), 0)
    }),
    [clients]
  )

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

  if (loading) return <LoadingState label="Chargement des clients..." />

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clients.length} client(s) enregistrés sur la plateforme.`}
        action={
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total clients" value={String(stats.total)} icon={Users} />
        <KpiCard label="Clients actifs" value={String(stats.actifs)} icon={UserCheck} accent="chart3" />
        <KpiCard label="Inactifs" value={String(stats.inactifs)} icon={UserX} accent="chart4" />
        <KpiCard label="Achats" value={String(stats.achats)} icon={Wallet} accent="accent" />
        <KpiCard label="Revenu total" value={formatFCFA(stats.revenu)} icon={Wallet} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher par nom ou email..."
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
            />
          </label>
          <Select value={filtreStatut} onChange={(event) => setFiltreStatut(event.target.value)}>
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
          </Select>
        </div>
      </Card>

      <DataTable
        data={clientsFiltres}
        emptyLabel="Aucun client trouvé"
        columns={[
          {
            key: 'client',
            label: 'Client',
            render: (client) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={client.nom || client.email} size="sm" />
                <div>
                  <div className="font-medium text-foreground">{client.nom || '-'}</div>
                  <div className="text-xs text-muted-foreground">ID: {client.id}</div>
                </div>
              </div>
            )
          },
          {
            key: 'contact',
            label: 'Contact',
            render: (client) => (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.telephone || '-'}</span>
                </div>
              </div>
            )
          },
          {
            key: 'dateInscription',
            label: 'Inscription',
            render: (client) => client.dateInscription ? new Date(client.dateInscription).toLocaleDateString('fr-FR') : '-'
          },
          { key: 'nbAchats', label: 'Achats', render: (client) => <span className="font-medium">{client.nbAchats}</span> },
          { key: 'totalDepense', label: 'Dépensé', render: (client) => <span className="font-medium text-primary">{formatFCFA(client.totalDepense)}</span> },
          { key: 'statut', label: 'Statut', render: (client) => <StatusBadge status={client.statut} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (client) => (
              <Button size="icon" variant="ghost" onClick={() => handleVoirClient(client.id)} title="Voir le profil">
                <Eye className="h-4 w-4" />
              </Button>
            )
          }
        ]}
      />

      <ModalDetail
        open={!!detailClient || detailLoading}
        onClose={() => { setDetailClient(null); setDetailLoading(false) }}
        title="Détails du client"
        loading={detailLoading}
      >
        {detailClient && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <ServiceLogo name={[detailClient.prenoms, detailClient.nom].filter(Boolean).join(' ') || detailClient.username} />
              <div>
                <p className="font-semibold">{[detailClient.prenoms, detailClient.nom].filter(Boolean).join(' ') || detailClient.username}</p>
                <p className="text-sm text-muted-foreground">{detailClient.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Email', detailClient.email],
                ['Téléphone', detailClient.numero || detailClient.telephone || '-'],
                ["Nom d'utilisateur", detailClient.username || '-'],
                ['Rôle', detailClient.role || 'CLIENT'],
                ['Statut', detailClient.enabled !== false ? 'Actif' : 'Inactif'],
                ['Date inscription', detailClient.dateCreation ? new Date(detailClient.dateCreation).toLocaleDateString('fr-FR') : '-'],
                ['ID', detailClient.id]
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">{label}</label>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalDetail>
    </>
  )
}
