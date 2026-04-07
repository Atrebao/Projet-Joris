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
import orangeMoney from '../assets/images/orange-money.png'
import mtnMobileMoney from '../assets/images/mtn-mobile-money.jpg'
import moovMobileMoney from '../assets/images/moov-mobile-money.png'
import waveMobileMoney from '../assets/images/wave-mobile-money.jpg'
import { souscriptionsAPI, codesPromoAPI } from '../lib/api'

export default function PaiementNouveau() {
  const location = useLocation()
  const navigate = useNavigate()

  // Récupérer les données de l'offre depuis la navigation
  const {
    offre,
    quantity,
    montantTotal,
    nom,
    prenoms,
    pseudo,
    email,
    telephone,
  } = location.state || {}

  const baseMontantTotal = Number(montantTotal || 0)

  const [selectedMethod, setSelectedMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(telephone || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orangeOtp, setOrangeOtp] = useState('')

  const [montantApayer, setMontantApayer] = useState(baseMontantTotal)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoAppliquee, setPromoAppliquee] = useState(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  // Si pas de données, rediriger
  useEffect(() => {
    if (!offre) {
      navigate('/catalogue')
    }
  }, [offre, navigate])

  const paymentMethods = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      logo: mtnMobileMoney,
      icon: null,
      color: 'bg-yellow-500',
      description: 'Paiement via BillMap',
      requiresPhone: true,
      operateur: 'MTN',
    },
    {
      id: 'moov',
      name: 'Moov Money',
      logo: moovMobileMoney,
      icon: null,
      color: 'bg-blue-500',
      description: 'Paiement via BillMap',
      requiresPhone: true,
      operateur: 'MOOV',
    },
    {
      id: 'orange',
      name: 'Orange Money',
      logo: orangeMoney,
      icon: null,
      color: 'bg-orange-500',
      description: 'Paiement via BillMap',
      requiresPhone: true,
      operateur: 'ORANGE',
    },
    {
      id: 'wave',
      name: 'Wave',
      logo: waveMobileMoney,
      icon: null,
      color: 'bg-slate-500',
      description: 'Paiement via BillMap',
      requiresPhone: true,
      operateur: 'WAVE',
    },
  ]

  const appliquerCodePromo = async () => {
    const code = promoCodeInput?.trim()
    if (!code) {
      setPromoAppliquee(null)
      setMontantApayer(baseMontantTotal)
      return
    }
    if (!offre?.id) return

    try {
      setIsApplyingPromo(true)
      const partenaireId = offre?.partenaire?.id

      const { data } = await codesPromoAPI.valider({
        code,
        partenaireId,
        abonnementId: offre.id,
      })

      const remiseValeur = Number(data?.remise || 0)
      const typeRemise = data?.typeRemise

      let remiseXof = 0
      let totalApres = baseMontantTotal

      if (typeRemise === 'POURCENTAGE') {
        remiseXof = (baseMontantTotal * remiseValeur) / 100
        totalApres = baseMontantTotal - remiseXof
      } else if (typeRemise === 'MONTANT_FIXE') {
        remiseXof = remiseValeur
        totalApres = baseMontantTotal - remiseXof
      }

      totalApres = Math.max(0, Number(totalApres))

      setPromoAppliquee({
        codePromo: data?.codePromo?.code || code,
        remiseXof,
        typeRemise,
        remiseValeur,
      })
      setMontantApayer(totalApres)
    } catch (err) {
      alert(err?.response?.data?.message || 'Code promo invalide')
      setPromoAppliquee(null)
      setMontantApayer(baseMontantTotal)
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!selectedMethod) {
      alert('Veuillez sélectionner un mode de paiement')
      return
    }

    const methodConfig = paymentMethods.find((m) => m.id === selectedMethod)
    const needsPhone = methodConfig?.requiresPhone !== false
    if (needsPhone && !phoneNumber?.trim()) {
      alert('Veuillez entrer votre numéro de téléphone')
      return
    }

    const description = `${offre?.nom || 'Abonnement'} - ${offre?.duree || 1} mois`

    setIsProcessing(true)

    try {
      const numero = phoneNumber.replace(/\s/g, '')

      if (selectedMethod === 'orange' && !orangeOtp.trim()) {
        alert('Veuillez saisir le code OTP Orange')
        setIsProcessing(false)
        return
      }

      const forfait = offre?.selectedForfait || offre?.forfaits?.[0]
      if (!offre?.id || !forfait?.id) {
        alert("Offre ou forfait introuvable")
        setIsProcessing(false)
        return
      }

      const { data } = await souscriptionsAPI.initierPaiement({
        abonnementId: offre.id,
        forfaitId: forfait.id,
        montant: montantApayer,
        nom,
        prenoms: prenoms || pseudo || undefined,
        email,
        telephone: numero,
        operateur: methodConfig.operateur,
        otp: selectedMethod === 'orange' ? orangeOtp.trim() : undefined,
        codePromo: promoAppliquee?.codePromo,
        description,
        modePaiement: methodConfig.operateur,
       
      })

      const reference = data?.reference
      const redirectUrl = data?.redirectUrl

      localStorage.setItem(
        'pendingPayment',
        JSON.stringify({
          reference,
          montant: montantApayer,
          provider: selectedMethod,
          offreId: offre.id,
          offreNom: offre?.nom,
          forfaitId: forfait.id,
          nom,
          prenoms: prenoms || pseudo || '',
          email,
          telephone: numero,
          codePromo: promoAppliquee?.codePromo,
        }),
      )

      if (email) localStorage.setItem('customerEmail', email)
      setPaymentSuccess(true)
      setTimeout(() => {
        if (selectedMethod === 'wave' && redirectUrl) {
          window.location.href = redirectUrl
          return
        }
        navigate('/confirmation', {
          state: {
            offre,
            montant: montantApayer,
            reference,
            paymentMethod: selectedMethod,
            billmapResponse: data?.billmapResponse,
          },
        })
      }, 2000)
    } catch (error) {
      console.error(`Erreur BillMap ${selectedMethod}:`, error)
      alert(error?.response?.data?.message || `Erreur lors du paiement ${selectedMethod}. Veuillez réessayer.`)
      setIsProcessing(false)
    }
  }

  if (!offre) {
    return null
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Demande de paiement envoyee
          </h2>
          <p className="text-gray-600 mb-8">
            Nous verifions maintenant le statut de votre paiement. Vous serez redirige vers la page de confirmation.
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Lock className="h-8 w-8 text-slate-700" />
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
                    <CreditCard className="h-6 w-6 text-slate-700" />
                    Mode de paiement
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${selectedMethod === method.id
                            ? 'border-slate-600 bg-slate-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                            {method.logo ? (
                              <img src={method.logo} alt={method.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : method.icon === 'CreditCard' ? (
                              <CreditCard className="w-6 h-6 text-slate-700" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{method.name}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                          {selectedMethod === method.id && (
                            <CheckCircle className="h-6 w-6 text-slate-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de téléphone - requis pour tous les modes BillMap */}
                <div className={`bg-white rounded-2xl border-2 border-gray-200 p-6 ${selectedMethod ? '' : 'opacity-75'}`}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-slate-700" />
                    Numéro de téléphone
                    {selectedMethod && (
                      <span className="text-sm font-normal text-red-500">* requis</span>
                    )}
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro Mobile Money
                    </label>
                    <input
                      type="tel"
                      required={selectedMethod ? true : false}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+225 XX XX XX XX XX"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600 text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Vous recevrez une notification pour valider le paiement
                    </p>
                  </div>
                </div>

                {selectedMethod === 'orange' && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Code OTP Orange</h2>
                    <input
                      type="text"
                      value={orangeOtp}
                      onChange={(e) => setOrangeOtp(e.target.value)}
                      placeholder="Saisissez le code OTP"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600 text-lg"
                    />
                  </div>
                )}

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
                          <li>✓ Transaction sécurisée via BillMap</li>
                        <li>✓ Identifiants envoyés immédiatement après paiement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bouton paiement */}
                <button
                  type="submit"
                  disabled={isProcessing || !selectedMethod}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${isProcessing || !selectedMethod
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-800 transition-colors'
                    }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement en cours...
                    </div>
                  ) : (
                    `Payer ${montantApayer?.toLocaleString() || '0'} F`
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
                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
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
                    <span className="text-2xl font-bold text-slate-800">
                      {montantApayer?.toLocaleString()} F
                    </span>
                  </div>
                </div>

                {/* Promotion */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code promo (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Ex: SAVE20"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={appliquerCodePromo}
                      disabled={isApplyingPromo || !promoCodeInput?.trim()}
                      className="px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                      {isApplyingPromo ? '...' : 'Appliquer'}
                    </button>
                  </div>
                  {promoAppliquee && (
                    <p className="text-xs text-green-700 mt-2">
                      Remise appliquée : -{promoAppliquee.remiseXof?.toLocaleString()} FCFA
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm space-y-2">
                    {(nom || prenoms || pseudo) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>👤</span>
                        <span className="truncate">{[nom, prenoms || pseudo].filter(Boolean).join(' ')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📧</span>
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📱</span>
                      <span>{phoneNumber || telephone}</span>
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
