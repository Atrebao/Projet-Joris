import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Key, Calendar, AlertCircle, Loader, RefreshCw, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MesAbonnements() {
    const navigate = useNavigate()
    const [abonnements, setAbonnements] = useState([])
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [showPasswords, setShowPasswords] = useState({})

    useEffect(() => {
        // Récupérer l'email depuis localStorage
        const savedEmail = localStorage.getItem('customerEmail')

        if (!savedEmail) {
            // Demander l'email si pas connecté
            const userEmail = prompt('Veuillez entrer votre email pour voir vos abonnements:')
            if (userEmail) {
                localStorage.setItem('customerEmail', userEmail)
                setEmail(userEmail)
                fetchAbonnements(userEmail)
            } else {
                navigate('/')
            }
        } else {
            setEmail(savedEmail)
            fetchAbonnements(savedEmail)
        }
    }, [navigate])

    const fetchAbonnements = async (userEmail) => {
        try {
            setLoading(true)

            // Simuler des données pour le moment
            // TODO: Remplacer par un vrai appel API
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockAbonnements = [
                {
                    id: 1,
                    reference: 'REF-' + Date.now(),
                    offre: {
                        nom: 'Netflix Premium',
                        description: '4 écrans simultanés, Ultra HD'
                    },
                    identifiants: {
                        login: 'netflix_' + userEmail.split('@')[0],
                        password: 'Pass' + Math.random().toString(36).slice(-8)
                    },
                    dateDebut: new Date(),
                    dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
                    statut: 'ACTIF',
                    montant: 5000
                }
            ]

            setAbonnements(mockAbonnements)

        } catch (error) {
            console.error('Erreur:', error)
            toast.error('Erreur lors du chargement des abonnements')
        } finally {
            setLoading(false)
        }
    }

    // Vérifier les expirations proches
    useEffect(() => {
        if (abonnements.length > 0) {
            abonnements.forEach(abo => {
                const joursRestants = Math.ceil((new Date(abo.dateFin) - new Date()) / (1000 * 60 * 60 * 24))
                if (joursRestants > 0 && joursRestants <= 3) {
                    toast((t) => (
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                            <div>
                                <p className="font-bold">Attention !</p>
                                <p className="text-sm">Votre abonnement {abo.offre.nom} expire dans {joursRestants} jours.</p>
                            </div>
                        </div>
                    ), { duration: 5000 })
                }
            })
        }
    }, [abonnements])

    const togglePasswordVisibility = (id) => {
        setShowPasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleRenouveler = (abonnement) => {
        navigate('/catalogue')
        toast.success('Redirection vers le catalogue')
    }

    const handleDeconnexion = () => {
        localStorage.removeItem('customerEmail')
        navigate('/')
        toast.success('Déconnexion réussie')
    }

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copié !`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement de vos abonnements...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* En-tête */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Abonnements</h1>
                        <p className="text-gray-600 mt-1">Connecté en tant que: {email}</p>
                    </div>
                    <button
                        onClick={handleDeconnexion}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Déconnexion
                    </button>
                </div>

                {/* Liste des abonnements */}
                {abonnements.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Aucun abonnement
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Vous n'avez pas encore d'abonnement actif
                        </p>
                        <button
                            onClick={() => navigate('/catalogue')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Découvrir nos offres
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {abonnements.map((abo) => {
                            const isExpire = new Date(abo.dateFin) < new Date()
                            const joursRestants = Math.ceil((new Date(abo.dateFin) - new Date()) / (1000 * 60 * 60 * 24))

                            return (
                                <div
                                    key={abo.id}
                                    className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                >
                                    {/* En-tête de l'abonnement */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                                {abo.offre.nom.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{abo.offre.nom}</h3>
                                                <p className="text-sm text-gray-600">{abo.offre.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {isExpire ? (
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                            Expiré
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                            ✓ Actif
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        Réf: {abo.reference}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identifiants */}
                                    <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Key className="h-5 w-5 text-indigo-600" />
                                            <h4 className="font-bold text-indigo-900">Vos identifiants</h4>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Login */}
                                            <div>
                                                <label className="block text-xs font-semibold text-indigo-700 mb-1">
                                                    Identifiant / Email
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={abo.identifiants.login}
                                                        readOnly
                                                        className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-lg font-mono text-sm"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(abo.identifiants.login, 'Identifiant')}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                                    >
                                                        Copier
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-xs font-semibold text-indigo-700 mb-1">
                                                    Mot de passe
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type={showPasswords[abo.id] ? 'text' : 'password'}
                                                            value={abo.identifiants.password}
                                                            readOnly
                                                            className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg font-mono text-sm pr-12"
                                                        />
                                                        <button
                                                            onClick={() => togglePasswordVisibility(abo.id)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {showPasswords[abo.id] ? (
                                                                <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(abo.identifiants.password, 'Mot de passe')}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                                    >
                                                        Copier
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations */}
                                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <div className="text-xs text-gray-600">Date de fin</div>
                                                <div className="font-semibold">
                                                    {new Date(abo.dateFin).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <div className="text-xs text-gray-600">Temps restant</div>
                                                <div className="font-semibold">
                                                    {isExpire ? 'Expiré' : `${joursRestants} jour${joursRestants > 1 ? 's' : ''}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alerte expiration proche */}
                                    {!isExpire && joursRestants <= 3 && (
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4 animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-orange-900">
                                                        Expire bientôt !
                                                    </p>
                                                    <p className="text-xs text-orange-800 mt-1">
                                                        Il ne vous reste que {joursRestants} jours. Pensez à renouveler.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRenouveler(abo)}
                                                    className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg font-bold"
                                                >
                                                    Renouveler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {isExpire && (
                                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-yellow-900">
                                                        Cet abonnement a expiré
                                                    </p>
                                                    <p className="text-xs text-yellow-800 mt-1">
                                                        Renouvelez pour continuer à profiter de ce service
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        {isExpire && (
                                            <button
                                                onClick={() => handleRenouveler(abo)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                                            >
                                                <RefreshCw className="h-5 w-5" />
                                                Renouveler
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Bouton ajouter */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/catalogue')}
                        className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold"
                    >
                        + Ajouter un abonnement
                    </button>
                </div>
            </div>
        </div>
    )
}
