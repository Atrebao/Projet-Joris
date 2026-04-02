import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { partenairesAPI, souscriptionsAPI } from '../../lib/api'

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
            <p className="text-gray-600">Vue globale des commandes, avec filtre partenaire</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={partenaireId}
              onChange={(e) => setPartenaireId(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Tous les partenaires</option>
              {partenaires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('attente')}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === 'attente' ? 'text-slate-700 border-b-2 border-slate-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            A livrer ({stats.attente})
          </button>
          <button
            onClick={() => setActiveTab('livrees')}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === 'livrees' ? 'text-slate-700 border-b-2 border-slate-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Livrees ({stats.livrees})
          </button>
          <button
            onClick={() => setActiveTab('tout')}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === 'tout' ? 'text-slate-700 border-b-2 border-slate-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tout voir ({stats.total})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Reference</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Client</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Partenaire</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Offre</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Paiement</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Livraison</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading &&
                commandes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-gray-700">{c.reference}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{`${c?.client?.nom || ''} ${c?.client?.prenoms || ''}`.trim() || '-'}</div>
                      <div className="text-xs text-gray-500">{c?.client?.email || c?.emailClient || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{c?.abonnement?.partenaire?.nom || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{c?.abonnement?.nom || '-'}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">{c?.statutPaiement || '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {c.isLivred ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" /> Livree
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          <Clock className="h-3 w-3" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {c?.dateCreation ? new Date(c.dateCreation).toLocaleString('fr-FR') : '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && commandes.length === 0 && (
            <div className="text-center py-12 text-gray-500">Aucune commande trouvee</div>
          )}
          {loading && <div className="text-center py-12 text-gray-500">Chargement...</div>}
        </div>
      </div>
    </div>
  )
}
