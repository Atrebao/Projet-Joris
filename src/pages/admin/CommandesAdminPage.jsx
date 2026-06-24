import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, Filter, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { partenairesAPI, souscriptionsAPI } from '../../lib/api'
import { Button, Card, DataTable, LoadingState, PageHeader, Select, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function CommandesAdminPage() {
  const [activeTab, setActiveTab] = useState('tout')
  const [partenaireId, setPartenaireId] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPartenaires = async () => {
      try {
        const { data } = await partenairesAPI.getAll()
        setPartenaires(Array.isArray(data) ? data : [])
      } catch {
        setPartenaires([])
      }
    }
    loadPartenaires()
  }, [])

  useEffect(() => {
    const loadCommandes = async () => {
      setLoading(true)
      try {
        const params = {}
        if (partenaireId) params.partenaire = Number(partenaireId)
        if (activeTab === 'attente') params.isLivred = false
        if (activeTab === 'livrees') params.isLivred = true

        const { data } = await souscriptionsAPI.getAll(params)
        setCommandes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Erreur chargement commandes admin:', error)
        toast.error('Impossible de charger les commandes')
        setCommandes([])
      } finally {
        setLoading(false)
      }
    }

    loadCommandes()
  }, [activeTab, partenaireId])

  const stats = useMemo(() => {
    const attente = commandes.filter((c) => c.statutPaiement === 'SUCCES' && !c.isLivred).length
    const livrees = commandes.filter((c) => c.isLivred).length
    return { attente, livrees, total: commandes.length }
  }, [commandes])

  return (
    <>
      <PageHeader
        title="Commandes"
        description="Vue globale des commandes, paiements et livraisons."
        action={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={partenaireId} onChange={(e) => setPartenaireId(e.target.value)}>
              <option value="">Tous les partenaires</option>
              {partenaires.map((p) => <option key={p.id} value={p.id}>{p.nomBoutique || p.nom}</option>)}
            </Select>
          </div>
        }
      />

      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'attente', label: `À livrer (${stats.attente})`, icon: Clock },
            { id: 'livrees', label: `Livrées (${stats.livrees})`, icon: CheckCircle },
            { id: 'tout', label: `Tout voir (${stats.total})`, icon: Receipt }
          ].map((tab) => (
            <Button key={tab.id} variant={activeTab === tab.id ? 'primary' : 'ghost'} onClick={() => setActiveTab(tab.id)}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Chargement des commandes..." />
      ) : (
        <DataTable
          data={commandes}
          emptyLabel="Aucune commande trouvée"
          columns={[
            { key: 'reference', label: 'Référence', render: (c) => <span className="font-mono text-xs">{c.reference || '-'}</span> },
            { key: 'client', label: 'Client', render: (c) => <div><div className="font-medium">{`${c?.client?.nom || ''} ${c?.client?.prenoms || ''}`.trim() || '-'}</div><div className="text-xs text-muted-foreground">{c?.client?.email || c?.emailClient || '-'}</div></div> },
            { key: 'partenaire', label: 'Partenaire', render: (c) => c?.abonnement?.partenaire?.nomBoutique || c?.abonnement?.partenaire?.nom || '-' },
            { key: 'offre', label: 'Offre', render: (c) => c?.abonnement?.nom || '-' },
            { key: 'montant', label: 'Montant', render: (c) => <span className="font-medium">{formatFCFA(c?.montant || 0)}</span> },
            { key: 'paiement', label: 'Paiement', render: (c) => <StatusBadge status={c?.statutPaiement} /> },
            { key: 'livraison', label: 'Livraison', render: (c) => <StatusBadge status={c.isLivred ? 'LIVRE' : 'EN_ATTENTE'} /> },
            { key: 'date', label: 'Date', render: (c) => c?.dateCreation ? new Date(c.dateCreation).toLocaleString('fr-FR') : '-' }
          ]}
        />
      )}
    </>
  )
}
