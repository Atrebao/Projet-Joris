import { useState, useEffect } from 'react'
import { Users, Search, Eye, Mail, Phone } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'

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
      const formatted = (data || []).map(c => ({
        id: c.id,
        nom: c.nomPrenoms || `${c.nom || ''} ${c.prenoms || ''}`.trim() || 'Client',
        email: c.email || '-',
        telephone: c.numero || c.telephone || '-',
        nbAchats: 0,
        totalDepense: 0,
        derniereCommande: c.dateCreation ? new Date(c.dateCreation).toISOString().split('T')[0] : '-',
        statut: c.enabled !== false ? 'ACTIF' : 'INACTIF'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    )
  }

  const clientsFiltres = clients.filter(c => 
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.email.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-slate-600" />
            Mes Clients
          </h1>
          <p className="text-gray-600">{clients.length} clients au total</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{clients.length}</div>
            <div className="text-blue-100 text-sm">Total Clients</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.filter(c => c.statut === 'ACTIF').length}
            </div>
            <div className="text-green-100 text-sm">Clients Actifs</div>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.filter(c => c.statut === 'VIP').length}
            </div>
            <div className="text-slate-100 text-sm">Clients VIP</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.reduce((sum, c) => sum + c.totalDepense, 0).toLocaleString()}F
            </div>
            <div className="text-orange-100 text-sm">Revenu Total</div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Tableau des clients */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-500 to-slate-500 text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Client</th>
                  <th className="text-left py-4 px-6 font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold">Achats</th>
                  <th className="text-left py-4 px-6 font-semibold">Total Dépensé</th>
                  <th className="text-left py-4 px-6 font-semibold">Dernière Commande</th>
                  <th className="text-left py-4 px-6 font-semibold">Statut</th>
                  <th className="text-center py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientsFiltres.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-slate-50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-400 rounded-full flex items-center justify-center text-white font-bold">
                          {client.nom.charAt(0)}
                        </div>
                        <div className="font-semibold">{client.nom}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{client.telephone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-600">{client.nbAchats}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">{client.totalDepense.toLocaleString()} F</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(client.derniereCommande).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        client.statut === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                        client.statut === 'ACTIF' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {client.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailClient(client)}
                          className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                          title="Voir le profil"
                        >
                          <Eye className="h-5 w-5 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientsFiltres.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun client trouvé</p>
            </div>
          )}
        </div>

        <ModalDetail
          open={!!detailClient}
          onClose={() => setDetailClient(null)}
          title="Détails du client"
          loading={false}
        >
          {detailClient && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nom</label>
                  <p className="font-medium">{detailClient.nom}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="font-medium">{detailClient.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Téléphone</label>
                  <p className="font-medium">{detailClient.telephone}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nombre d'achats</label>
                  <p className="font-medium">{detailClient.nbAchats}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Total dépensé</label>
                  <p className="font-medium text-green-600">{detailClient.totalDepense?.toLocaleString()} F</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Dernière commande</label>
                  <p className="font-medium">{detailClient.derniereCommande}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <p><span className={`px-2 py-1 rounded-full text-xs font-semibold ${detailClient.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{detailClient.statut}</span></p>
                </div>
              </div>
            </div>
          )}
        </ModalDetail>
      </div>
    </div>
  )
}
