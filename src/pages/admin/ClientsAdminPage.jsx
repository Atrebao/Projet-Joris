import { useState, useEffect } from 'react'
import { Users, Search, Eye, Mail, Phone, Filter, Download, UserCheck, UserX, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersAPI } from '../../lib/api'
import ModalDetail from '../../components/ModalDetail'

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
        const formatted = (data || []).map((u) => ({
          id: u.id,
          nom: u.nom ? `${u.prenoms || ''} ${u.nom}`.trim() : u.username,
          email: u.email,
          telephone: u.numero || '-',
          ville: '-',
          dateInscription: u.dateCreation ? new Date(u.dateCreation).toISOString().split('T')[0] : '-',
          nbAchats: 0,
          totalDepense: 0,
          derniereActivite: '-',
          statut: u.enabled !== false ? 'ACTIF' : 'INACTIF'
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
    loadClients()
  }, [recherche])

  const clientsFiltres = clients.filter(c => {
    const matchRecherche = c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                          c.email.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'TOUS' || c.statut === filtreStatut
    return matchRecherche && matchStatut
  })

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

  const statsGlobales = {
    total: clients.length,
    actifs: clients.filter(c => c.statut === 'ACTIF').length,
    vip: clients.filter(c => c.statut === 'VIP').length,
    inactifs: clients.filter(c => c.statut === 'INACTIF').length,
    revenuTotal: clients.reduce((sum, c) => sum + c.totalDepense, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-slate-600" />
              Gestion des Clients
            </h1>
            <p className="text-gray-600">{clients.length} clients au total</p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all shadow-lg">
            <Download className="h-5 w-5" />
            Exporter CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 text-slate-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{statsGlobales.total}</div>
            <div className="text-slate-100 text-sm">Total Clients</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-10 w-10 text-green-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{statsGlobales.actifs}</div>
            <div className="text-green-100 text-sm">Clients Actifs</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold mb-1">{statsGlobales.vip}</div>
            <div className="text-yellow-100 text-sm">Clients VIP</div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <UserX className="h-10 w-10 text-gray-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{statsGlobales.inactifs}</div>
            <div className="text-gray-100 text-sm">Inactifs</div>
          </div>

          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-1">{(statsGlobales.revenuTotal / 1000).toFixed(0)}K</div>
            <div className="text-slate-100 text-sm">Revenu Total</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
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

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 font-semibold"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="ACTIF">Actifs</option>
                <option value="VIP">VIP</option>
                <option value="INACTIF">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-500 to-slate-500 text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Client</th>
                  <th className="text-left py-4 px-6 font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold">Ville</th>
                  <th className="text-left py-4 px-6 font-semibold">Inscription</th>
                  <th className="text-left py-4 px-6 font-semibold">Achats</th>
                  <th className="text-left py-4 px-6 font-semibold">Dépensé</th>
                  <th className="text-left py-4 px-6 font-semibold">Dernière Activité</th>
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
                          {(client.nom || '?').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                        <div>
                          <div className="font-semibold">{client.nom}</div>
                          <div className="text-xs text-gray-500">ID: {client.id}</div>
                        </div>
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
                      <span className="text-gray-700">{client.ville}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(client.dateInscription).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-600">{client.nbAchats}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">{client.totalDepense.toLocaleString()} F</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(client.derniereActivite).toLocaleDateString('fr-FR')}
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
                          onClick={() => handleVoirClient(client.id)}
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
          open={!!detailClient || detailLoading}
          onClose={() => { setDetailClient(null); setDetailLoading(false) }}
          title="Détails du client"
          loading={detailLoading}
        >
          {detailClient && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nom complet</label>
                  <p className="font-medium">{[detailClient.prenoms, detailClient.nom].filter(Boolean).join(' ') || detailClient.username}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="font-medium">{detailClient.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Téléphone</label>
                  <p className="font-medium">{detailClient.numero || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nom d'utilisateur</label>
                  <p className="font-medium">{detailClient.username}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rôle</label>
                  <p className="font-medium">{detailClient.role || 'CLIENT'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <p><span className={`px-2 py-1 rounded-full text-xs font-semibold ${detailClient.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{detailClient.enabled ? 'Actif' : 'Inactif'}</span></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date d'inscription</label>
                  <p className="font-medium">{detailClient.dateCreation ? new Date(detailClient.dateCreation).toLocaleDateString('fr-FR') : '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">ID</label>
                  <p className="font-medium">{detailClient.id}</p>
                </div>
              </div>
            </div>
          )}
        </ModalDetail>
      </div>
    </div>
  )
}
