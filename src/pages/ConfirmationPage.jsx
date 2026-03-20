import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, FileText } from 'lucide-react'

export default function ConfirmationPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const { offre, montant, reference } = location.state || {}

    if (!offre) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Aucune donnée de commande</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Message */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
                        <CheckCircle className="h-12 w-12 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Paiement confirmé ! 🎉
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        Votre commande a été traitée avec succès
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                        <h2 className="font-bold text-xl mb-4 text-gray-900">Détails de la commande</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service</span>
                                <span className="font-semibold text-gray-900">{offre.nom}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Montant payé</span>
                                <span className="font-semibold text-gray-900">{montant?.toLocaleString()} F CFA</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Référence</span>
                                <span className="font-mono text-sm text-gray-900">{reference}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Date</span>
                                <span className="font-semibold text-gray-900">
                                    {new Date().toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Prochaines étapes
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                <span>Vous recevrez vos identifiants par email dans les 5 minutes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                <span>Vérifiez votre boîte de réception et les spams</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                <span>Conservez cette référence pour tout support : {reference}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Home className="h-5 w-5" />
                            Retour à l'accueil
                        </button>
                    </div>
                </div>

                {/* Support */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>Besoin d'aide ? Contactez notre support :</p>
                    <p className="font-semibold text-gray-900 mt-1">support@richessestreaming.com</p>
                </div>
            </div>
        </div>
    )
}
