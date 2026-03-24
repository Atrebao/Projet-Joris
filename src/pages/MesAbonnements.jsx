import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Key, Calendar, AlertCircle, Loader, RefreshCw, Eye, EyeOff, Mail, ArrowRight, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { souscriptionsAPI } from '../lib/api'

export default function MesAbonnements() {
    const navigate = useNavigate()
    const [abonnements, setAbonnements] = useState([])
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [showPasswords, setShowPasswords] = useState({})
    const [showEmailGate, setShowEmailGate] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [emailSubmitting, setEmailSubmitting] = useState(false)

    useEffect(() => {
        const savedEmail = localStorage.getItem('customerEmail')
        if (!savedEmail) {
            setShowEmailGate(true)
            setLoading(false)
        } else {
            setEmail(savedEmail)
            fetchAbonnements(savedEmail)
        }
    }, [navigate])

    const handleEmailGateSubmit = async (e) => {
        e.preventDefault()
        const trimmed = emailInput.trim()
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error('Veuillez entrer une adresse email valide')
            return
        }
        setEmailSubmitting(true)
        try {
            localStorage.setItem('customerEmail', trimmed)
            setEmail(trimmed)
            setShowEmailGate(false)
            await fetchAbonnements(trimmed)
        } finally {
            setEmailSubmitting(false)
        }
    }

    const handleSkipEmailGate = () => {
        navigate('/')
    }

    const fetchAbonnements = async (userEmail) => {
        try {
            setLoading(true)
            const { data } = await souscriptionsAPI.getByEmail(userEmail)

            const formatted = (data || []).map((sub) => ({
                id: sub.id,
                reference: sub.reference || 'N/A',
                offre: {
                    nom: sub.abonnement?.nom || 'Abonnement',
                    description: sub.abonnement?.description || ''
                },
                identifiants: sub.isLivred
                    ? { login: sub.login, password: sub.password }
                    : null,
                dateDebut: sub.dateCreation,
                dateFin: sub.dateExpiration || sub.dateCreation,
                statut: sub.etatSouscription || sub.statutPaiement || 'EN_ATTENTE',
                montant: sub.montant || 0,
                isLivred: sub.isLivred
            }))

            setAbonnements(formatted)
        } catch (error) {
            console.error('Erreur:', error)
            toast.error('Erreur lors du chargement des abonnements')
            setAbonnements([])
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

    if (showEmailGate) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-800 text-white px-8 py-10 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold">Mes abonnements</h1>
                        <p className="text-slate-300 text-sm mt-2">Accès sécurisé à vos commandes</p>
                    </div>
                    <form onSubmit={handleEmailGateSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="mes-abo-email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Adresse email utilisée lors de l&apos;achat
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    id="mes-abo-email"
                                    type="email"
                                    autoComplete="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="vous@exemple.com"
                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-600 transition-colors"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Nous affichons uniquement les abonnements liés à cette adresse. Vos données ne sont pas partagées.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={emailSubmitting}
                            className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {emailSubmitting ? (
                                <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Accéder à mes abonnements
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkipEmailGate}
                            className="w-full py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                            Retour à l&apos;accueil
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-slate-600 animate-spin mx-auto mb-4" />
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
                            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
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
                                    <div className="bg-slate-50 rounded-xl p-6 mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Key className="h-5 w-5 text-slate-600" />
                                            <h4 className="font-bold text-slate-900">Vos identifiants</h4>
                                        </div>

                                        {abo.identifiants ? (
                                        <div className="space-y-3">
                                            {/* Login */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Identifiant / Email
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={abo.identifiants.login || ''}
                                                        readOnly
                                                        className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(abo.identifiants.login, 'Identifiant')}
                                                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
                                                    >
                                                        Copier
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Mot de passe
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type={showPasswords[abo.id] ? 'text' : 'password'}
                                                            value={abo.identifiants.password || ''}
                                                            readOnly
                                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm pr-12"
                                                        />
                                                        <button
                                                            onClick={() => togglePasswordVisibility(abo.id)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
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
                                                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
                                                    >
                                                        Copier
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        ) : (
                                            <p className="text-amber-700 bg-amber-50 rounded-lg p-4 text-sm">
                                                Identifiants en cours de préparation. Vous les recevrez par email dès que votre commande sera traitée.
                                            </p>
                                        )}
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
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold"
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
                        className="px-6 py-3 bg-white border-2 border-slate-600 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold"
                    >
                        + Ajouter un abonnement
                    </button>
                </div>
            </div>
        </div>
    )
}
