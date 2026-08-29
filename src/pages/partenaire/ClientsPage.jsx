import { useEffect, useState } from 'react'
import { Eye, Mail, Phone, Search, Users, UserCheck, Wallet, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { usersAPI } from '../../lib/api'
import { getPartenaireId } from '../../Utils/Utils'
import { Badge, Button, Card, DataTable, EmptyState, Input, KpiCard, LoadingState, PageHeader, initials, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function ClientsPage() {
  const partenaireId = getPartenaireId()
  const [clients, setClients] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailClient, setDetailClient] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, actifs: 0, revenu: 0 })

  const loadClients = async () => {
    setLoading(true)
    try {
      let clientItems = []
      let totalPagesCount = 1
      let calculatedStats = { total: 0, actifs: 0, revenu: 0 }

      try {
        const res = await usersAPI.getClientsWithSouscriptions({
          search: recherche.trim() || undefined,
          page,
          limit: 10,
          partenaireId: partenaireId ? Number(partenaireId) : undefined,
        })
        const data = res?.data
        const rawList = Array.isArray(data) ? data : (data?.data || [])

        if (rawList.length > 0) {
          clientItems = rawList.map((c) => ({
            id: c.id,
            nom: c.nomPrenoms || [c.prenoms, c.nom].filter(Boolean).join(' ').trim() || c.pseudo || 'Client',
            pseudo: c.pseudo || '-',
            email: c.email || '-',
            telephone: c.numeroWhatsapp || c.telephone || c.numero || '-',
            nbAchats: c.nbAchats ?? c.totalSouscriptions ?? (c.souscriptions ? c.souscriptions.length : 1),
            totalDepense: c.totalDepense ?? (c.souscriptions ? c.souscriptions.reduce((sum, s) => sum + Number(s.montant || 0), 0) : 0),
            derniereCommande: c.derniereCommande || (c.dateCreation ? new Date(c.dateCreation).toISOString().split('T')[0] : ''),
            statut: c.statut || (c.enabled !== false && c.isActive !== false ? 'ACTIF' : 'INACTIF'),
          }))
          totalPagesCount = data?.totalPages || 1
          if (data?.stats) {
            calculatedStats = data.stats
          } else {
            calculatedStats = {
              total: data?.total || rawList.length,
              actifs: rawList.filter((c) => c.isActive !== false).length,
              revenu: clientItems.reduce((acc, c) => acc + (c.totalDepense || 0), 0),
            }
          }
        }
      } catch (err) {
        console.warn('API getClientsWithSouscriptions fallback:', err)
      }

      // Si la liste est vide mais qu'on a des souscriptions pour ce partenaire, agréger les clients depuis les souscriptions
      if (clientItems.length === 0 && partenaireId) {
        try {
          const subsRes = await souscriptionsAPI.getAllSouscriptions({ partenaireId })
          const subs = Array.isArray(subsRes?.data) ? subsRes.data : (subsRes?.data?.data || [])
          const clientMap = new Map()

          subs.forEach((s) => {
            const clientObj = s.client
            const phone = clientObj?.numeroWhatsapp || clientObj?.telephone || s.numeroClient || s.telephone || '-'
            const email = clientObj?.email || s.emailClient || '-'
            const key = clientObj?.id ? `id_${clientObj.id}` : `contact_${phone}_${email}`

            if (!clientMap.has(key)) {
              const name = clientObj?.nomPrenoms || [clientObj?.prenoms, clientObj?.nom].filter(Boolean).join(' ').trim() || clientObj?.pseudo || s.pseudo || 'Client'
              clientMap.set(key, {
                id: clientObj?.id || key,
                nom: name,
                pseudo: clientObj?.pseudo || '-',
                email,
                telephone: phone,
                nbAchats: 0,
                totalDepense: 0,
                derniereCommande: s.dateCreation ? new Date(s.dateCreation).toISOString().split('T')[0] : '',
                statut: 'ACTIF',
              })
            }

            const existing = clientMap.get(key)
            existing.nbAchats += 1
            existing.totalDepense += Number(s.montant || s.montantTotal || 0)
          })

          clientItems = Array.from(clientMap.values())
          calculatedStats = {
            total: clientItems.length,
            actifs: clientItems.length,
            revenu: clientItems.reduce((sum, c) => sum + c.totalDepense, 0),
          }
        } catch {}
      }

      setClients(clientItems)
      setTotalPages(totalPagesCount)
      setStats(calculatedStats)
    } catch (error) {
      console.error('Erreur chargement clients:', error)
      toast.error('Impossible de charger les clients')
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
  }, [recherche, page, partenaireId])

  if (loading && clients.length === 0) return <LoadingState label="Chargement des clients..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Contacts et historique synthétique des acheteurs."
        action={<Button variant="secondary" onClick={loadClients}>Actualiser</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Clients total" value={String(stats.total)} icon={Users} />
        <KpiCard label="Clients actifs" value={String(stats.actifs)} icon={UserCheck} accent="chart3" />
        <KpiCard label="Revenu rattaché" value={formatFCFA(stats.revenu)} icon={Wallet} accent="accent" />
      </div>

      <Card className="p-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value)
              setPage(1)
            }}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="pl-9"
          />
        </div>
      </Card>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Aucun client" description="Les clients apparaîtront après les premières commandes." />
      ) : (
        <>
          <DataTable
            data={clients}
            emptyLabel="Aucun client trouvé"
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
              { key: 'depense', label: 'Total dépensé', render: (client) => <span className="font-semibold">{formatFCFA(client.totalDepense)}</span> },
              { key: 'date', label: 'Dernière commande', render: (client) => client.derniereCommande ? new Date(client.derniereCommande).toLocaleDateString('fr-FR') : '-' },
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{page}</span> sur <span className="font-bold text-slate-700">{totalPages}</span>
              </span>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-2 text-xs border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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

      <ModalDetail open={!!detailClient} onClose={() => setDetailClient(null)} title="Détails du client" loading={false}>
        {detailClient && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Nom', detailClient.nom],
              ['Email', detailClient.email],
              ['Téléphone', detailClient.telephone],
              ["Nombre d'achats", detailClient.nbAchats],
              ['Total dépensé', formatFCFA(detailClient.totalDepense)],
              ['Dernière commande', detailClient.derniereCommande || '-'],
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
