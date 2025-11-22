import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Lock,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function PaiementNouveau() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Récupérer les données de l'offre depuis la navigation
  const { offre, quantity, montantTotal, email, telephone } = location.state || {}
  
  const [selectedMethod, setSelectedMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(telephone || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Si pas de données, rediriger
  useEffect(() => {
    if (!offre) {
      navigate('/catalogue')
    }
  }, [offre, navigate])

  const paymentMethods = [
    {
      id: 'orange',
      name: 'Orange Money',
      logo: '🟠',
      color: 'bg-orange-500',
      description: 'Paiement via Orange Money'
    },
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      logo: '🟡',
      color: 'bg-yellow-500',
      description: 'Paiement via MTN Mobile Money'
    },
    {
      id: 'moov',
      name: 'Moov Money',
      logo: '🔵',
      color: 'bg-blue-500',
      description: 'Paiement via Moov Money'
    },
    {
      id: 'wave',
      name: 'Wave',
      logo: '💜',
      color: 'bg-purple-500',
      description: 'Paiement via Wave'
    },
  ]

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!selectedMethod) {
      alert('Veuillez sélectionner un mode de paiement')
      return
    }

    if (!phoneNumber) {
      alert('Veuillez entrer votre numéro de téléphone')
      return
    }

    setIsProcessing(true)

    // Simulation d'un appel API CinetPay
    try {
      // TODO: Intégrer avec votre API CinetPay
      // const response = await axios.post('/api/paiement/initier', {
      //   offre_id: offre.id,
      //   montant: montantTotal,
      //   telephone: phoneNumber,
      //   email: email,
      //   methode: selectedMethod
      // })

      // Simulation délai
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simuler succès
      setPaymentSuccess(true)
      
      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate('/confirmation', {
          state: {
            offre: offre,
            montant: montantTotal,
            reference: 'PAY-' + Date.now()
          }
        })
      }, 3000)

    } catch (error) {
      console.error('Erreur paiement:', error)
      alert('Erreur lors du paiement. Veuillez réessayer.')
      setIsProcessing(false)
    }
  }

  if (!offre) {
    return null
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi ! 🎉
          </h2>
          <p className="text-gray-600 mb-8">
            Votre paiement a été traité avec succès. Vous allez recevoir vos identifiants par email dans quelques instants.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Redirection en cours...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <div className="max-w-5xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Lock className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Paiement sécurisé</h1>
            <p className="text-gray-600">Complétez votre achat en toute sécurité</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Formulaire paiement */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Sélection mode de paiement */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                    Mode de paiement
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{method.logo}</div>
                          <div className="flex-1">
                            <div className="font-semibold">{method.name}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                          {selectedMethod === method.id && (
                            <CheckCircle className="h-6 w-6 text-indigo-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-indigo-600" />
                    Numéro de téléphone
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro Mobile Money *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+225 XX XX XX XX XX"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Vous recevrez une notification pour valider le paiement
                    </p>
                  </div>
                </div>

                {/* Infos de sécurité */}
                <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Paiement 100% sécurisé
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Vos données sont cryptées</li>
                        <li>✓ Transaction sécurisée par CinetPay</li>
                        <li>✓ Identifiants envoyés immédiatement après paiement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bouton paiement */}
                <button
                  type="submit"
                  disabled={isProcessing || !selectedMethod}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    isProcessing || !selectedMethod
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement en cours...
                    </div>
                  ) : (
                    `Payer ${montantTotal?.toLocaleString() || '0'} F`
                  )}
                </button>
              </form>
            </div>

            {/* Colonne droite - Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>
                
                {/* Offre */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {offre?.nom?.split(' ')[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{offre?.nom}</h3>
                      <p className="text-sm text-gray-600">{offre?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Détails */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix unitaire</span>
                    <span className="font-semibold">{offre?.prixMensuel?.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantité</span>
                    <span className="font-semibold">x {quantity || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-semibold">{offre?.duree} mois</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total à payer</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {montantTotal?.toLocaleString()} F
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📧</span>
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📱</span>
                      <span>{telephone}</span>
                    </div>
                  </div>
                </div>

                {/* Info livraison */}
                <div className="mt-6 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">Livraison instantanée</p>
                      <p>Vos identifiants seront envoyés à votre email dans les 5 minutes suivant le paiement.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
