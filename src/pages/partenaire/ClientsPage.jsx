import { useEffect, useMemo, useState } from 'react'
import { Eye, Mail, Phone, Search, Users, UserCheck, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { usersAPI } from '../../lib/api'
import { Badge, Button, Card, DataTable, EmptyState, Input, KpiCard, LoadingState, PageHeader, initials, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailClient, setDetailClient] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    try {
      const { data } = await usersAPI.getClients()
      const formatted = (data || []).map((c) => ({
        id: c.id,
        nom: c.nomPrenoms || `${c.nom || ''} ${c.prenoms || ''}`.trim() || 'Client',
        email: c.email || '-',
        telephone: c.numero || c.telephone || '-',
        nbAchats: c.nbAchats || 0,
        totalDepense: Number(c.totalDepense || 0),
        derniereCommande: c.dateCreation ? new Date(c.dateCreation).toISOString().split('T')[0] : '',
        statut: c.enabled !== false ? 'ACTIF' : 'INACTIF',
      }))
      setClients(formatted)
    } catch (error) {
      console.error('Erreur chargement clients:', error)
      toast.error('Impossible de charger les clients')
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const clientsFiltres = useMemo(() => {
    const value = recherche.trim().toLowerCase()
    if (!value) return clients
    return clients.filter((c) => c.nom.toLowerCase().includes(value) || c.email.toLowerCase().includes(value))
  }, [clients, recherche])

  const stats = useMemo(() => ({
    total: clients.length,
    actifs: clients.filter((c) => c.statut === 'ACTIF').length,
    revenu: clients.reduce((sum, c) => sum + c.totalDepense, 0),
  }), [clients])

  if (loading) return <LoadingState label="Chargement des clients..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Contacts et historique synthetique des acheteurs."
        action={<Button variant="secondary" onClick={loadClients}>Actualiser</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Clients total" value={String(stats.total)} icon={Users} />
        <KpiCard label="Clients actifs" value={String(stats.actifs)} icon={UserCheck} accent="chart3" />
        <KpiCard label="Revenu rattache" value={formatFCFA(stats.revenu)} icon={Wallet} accent="accent" />
      </div>

      <Card className="p-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="pl-9"
          />
        </div>
      </Card>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Aucun client" description="Les clients apparaitront apres les premieres commandes." />
      ) : (
        <DataTable
          data={clientsFiltres}
          emptyLabel="Aucun client trouve"
          columns={[
            {
              key: 'client',
              label: 'Client',
              render: (client) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(client.nom)}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{client.nom}</p>
                    <p className="text-xs text-muted-foreground">ID #{client.id}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'contact',
              label: 'Contact',
              render: (client) => (
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {client.email}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> {client.telephone}</p>
                </div>
              ),
            },
            { key: 'achats', label: 'Achats', render: (client) => <span className="font-semibold">{client.nbAchats}</span> },
            { key: 'depense', label: 'Total depense', render: (client) => <span className="font-semibold">{formatFCFA(client.totalDepense)}</span> },
            { key: 'date', label: 'Derniere commande', render: (client) => client.derniereCommande ? new Date(client.derniereCommande).toLocaleDateString('fr-FR') : '-' },
            { key: 'statut', label: 'Statut', render: (client) => <Badge tone={client.statut === 'ACTIF' ? 'success' : 'muted'}>{client.statut}</Badge> },
            {
              key: 'actions',
              label: '',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (client) => <Button size="icon" variant="ghost" onClick={() => setDetailClient(client)}><Eye className="h-4 w-4" /></Button>,
            },
          ]}
        />
      )}

      <ModalDetail open={!!detailClient} onClose={() => setDetailClient(null)} title="Details du client" loading={false}>
        {detailClient && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Nom', detailClient.nom],
              ['Email', detailClient.email],
              ['Telephone', detailClient.telephone],
              ["Nombre d'achats", detailClient.nbAchats],
              ['Total depense', formatFCFA(detailClient.totalDepense)],
              ['Derniere commande', detailClient.derniereCommande || '-'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Statut</p>
              <Badge tone={detailClient.statut === 'ACTIF' ? 'success' : 'muted'}>{detailClient.statut}</Badge>
            </div>
          </div>
        )}
      </ModalDetail>
    </div>
  )
}
