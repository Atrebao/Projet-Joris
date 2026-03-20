import { useState, useEffect } from 'react'
import { Search, Filter, CheckCircle, Clock, AlertCircle, Send, Copy, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

import { souscriptionsAPI } from '../../lib/api'

export default function CommandesPartenairePage() {
    const [activeTab, setActiveTab] = useState('attente') // attente, livrees, tout
    const [commandes, setCommandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCommande, setSelectedCommande] = useState(null)

    // État pour le formulaire de livraison
    const [livraisonForm, setLivraisonForm] = useState({
        login: '',
        password: '',
        instructions: ''
    })

    useEffect(() => {
        loadCommandes()
    }, [])

    const loadCommandes = async () => {
        setLoading(true)
        try {
            // On récupère tout pour l'instant, idéalement on aurait des filtres API
            // Pour simplifier, on utilise getALivrer pour l'onglet 'attente' et on pourrait avoir un autre endpoint pour l'historique
            // Ici je vais appeler getALivrer et simuler l'historique vide ou appeler getAll si besoin

            // Note: getALivrer ne retourne que les non-livrés. Pour voir l'historique, il faudrait un autre endpoint.
            // Je vais utiliser getALivrer pour l'instant.
            const response = await souscriptionsAPI.getALivrer()

            const formattedCommandes = response.data.map(sub => ({
                id: sub.id,
                client: {
                    nom: sub.user ? `${sub.user.nom} ${sub.user.prenoms}` : 'Client inconnu',
                    email: sub.emailClient || (sub.user ? sub.user.email : ''),
                    tel: sub.user ? sub.user.numero : ''
                },
                offre: {
                    nom: sub.abonnement ? sub.abonnement.nom : 'Offre inconnue',
                    duree: `${sub.duree} ${sub.periode}`
                },
                date: new Date(sub.dateCreation),
                statut: sub.isLivred ? 'LIVRE' : 'EN_ATTENTE',
                montant: sub.montant,
                reference: sub.reference,
                identifiants: sub.isLivred ? { login: sub.login, password: sub.password } : null
            }))
            setCommandes(formattedCommandes)
        } catch (error) {
            console.error("Erreur chargement commandes", error)
            toast.error("Impossible de charger les commandes")
        } finally {
            setLoading(false)
        }
    }

    const handleLivrer = (commande) => {
        setSelectedCommande(commande)
        setLivraisonForm({ login: '', password: '', instructions: '' })
    }

    const submitLivraison = async (e) => {
        e.preventDefault()
        try {
            await souscriptionsAPI.livrer(selectedCommande.id, livraisonForm)
            toast.success('Identifiants envoyés au client !')
            loadCommandes() // Recharger la liste
            setSelectedCommande(null)
        } catch (error) {
            console.error("Erreur livraison", error)
            toast.error("Erreur lors de la livraison")
        }
    }

    const filteredCommandes = commandes.filter(c => {
        if (activeTab === 'attente') return c.statut === 'EN_ATTENTE'
        if (activeTab === 'livrees') return c.statut === 'LIVRE'
        return true
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
                        <p className="text-gray-600">Gérez et livrez vos commandes clients</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                            <Filter className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>
                </div>

                {/* Onglets */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('attente')}
                        className={`pb-4 px-4 font-medium transition-all ${activeTab === 'attente'
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        À livrer ({commandes.filter(c => c.statut === 'EN_ATTENTE').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('livrees')}
                        className={`pb-4 px-4 font-medium transition-all ${activeTab === 'livrees'
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Livrées
                    </button>
                    <button
                        onClick={() => setActiveTab('tout')}
                        className={`pb-4 px-4 font-medium transition-all ${activeTab === 'tout'
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Tout voir
                    </button>
                </div>

                {/* Liste des commandes */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Référence</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Client</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Offre</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Date</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Statut</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCommandes.map((cmd) => (
                                <tr key={cmd.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 font-mono text-sm text-gray-600">
                                        {cmd.reference}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900">{cmd.client.nom}</div>
                                        <div className="text-sm text-gray-500">{cmd.client.email}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-indigo-600">{cmd.offre.nom}</div>
                                        <div className="text-xs text-gray-500">{cmd.offre.duree}</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        {cmd.date.toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        {cmd.statut === 'EN_ATTENTE' ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                <Clock className="h-3 w-3" /> À livrer
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <CheckCircle className="h-3 w-3" /> Livré
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {cmd.statut === 'EN_ATTENTE' ? (
                                            <button
                                                onClick={() => handleLivrer(cmd)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm shadow-sm"
                                            >
                                                <Send className="h-4 w-4" /> Livrer
                                            </button>
                                        ) : (
                                            <button className="text-gray-400 hover:text-gray-600">
                                                Détails
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCommandes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <CheckCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Aucune commande</h3>
                            <p className="text-gray-500">Tout est à jour ici !</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Livraison */}
            {selectedCommande && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-purple-600 p-6 text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Livrer la commande
                            </h3>
                            <p className="text-purple-100 text-sm mt-1">
                                {selectedCommande.offre.nom} pour {selectedCommande.client.nom}
                            </p>
                        </div>

                        <form onSubmit={submitLivraison} className="p-6 space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p>Ces identifiants seront envoyés immédiatement par email au client et affichés dans son espace.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Identifiant / Email du compte
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={livraisonForm.login}
                                    onChange={e => setLivraisonForm({ ...livraisonForm, login: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="ex: client@netflix.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={livraisonForm.password}
                                    onChange={e => setLivraisonForm({ ...livraisonForm, password: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                                    placeholder="ex: Pass123!"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions supplémentaires (optionnel)
                                </label>
                                <textarea
                                    value={livraisonForm.instructions}
                                    onChange={e => setLivraisonForm({ ...livraisonForm, instructions: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    rows="3"
                                    placeholder="ex: Ne pas modifier le profil 1..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCommande(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg"
                                >
                                    Envoyer au client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
