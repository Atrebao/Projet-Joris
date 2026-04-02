import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, FileText, Loader2 } from 'lucide-react'
import { souscriptionsAPI } from '../lib/api'

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('EN_ATTENTE_DE_PAIEMENT')
  const [pending] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pendingPayment') || 'null')
    } catch {
      return null
    }
  })

  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const provider = search.get('provider') || pending?.provider || ''

  const stateOffre = location.state?.offre || null
  const stateMontant = location.state?.montant
  const stateReference = location.state?.reference

  const queryMontant = Number(search.get('montant') || pending?.montant || 0)
  const montant = stateMontant ?? queryMontant
  const reference = stateReference || search.get('reference') || pending?.reference || ''

  const offre = stateOffre || {
    id: Number(search.get('offreId') || pending?.offreId || 0) || null,
    nom: pending?.offreNom || 'Abonnement',
  }

  useEffect(() => {
    const finalize = async () => {
      try {
        setIsLoading(true)
        setError('')

        const email = search.get('email') || pending?.email || ''
        const telephone = search.get('telephone') || pending?.telephone || ''
        const offreId = Number(search.get('offreId') || pending?.offreId || 0)
        const forfaitId = Number(search.get('forfaitId') || pending?.forfaitId || 0)
        const codePromo = search.get('codePromo') || pending?.codePromo || undefined
        const fallbackReference = search.get('reference') || pending?.reference || ''
        const montantFromQuery = Number(search.get('montant') || pending?.montant || 0)

        const finalReference = fallbackReference
        const finalMontant = montantFromQuery
        const modePaiement = search.get('paymentMethod') || 'MOBILE_MONEY'

        // Avec BillMap, la souscription est créée côté frontend avant le paiement
        // Ici on vérifie juste les données et on n'a rien de plus à faire
        // Le webhook BillMap mettra à jour le statut du paiement en background

        localStorage.removeItem('pendingPayment')
        localStorage.removeItem('customerEmail')
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Erreur de confirmation du paiement')
      } finally {
        setIsLoading(false)
      }
    }

    finalize()
  }, [search, pending])

  useEffect(() => {
    if (!reference) return
    let stop = false
    let attempts = 0
    const maxAttempts = 60 // 5 minutes (60 x 5s)
    let timer

    const poll = async () => {
      try {
        const { data } = await souscriptionsAPI.getByReference(reference)
        const statut = data?.statutPaiement || 'EN_ATTENTE_DE_PAIEMENT'
        if (!stop) {
          setPaymentStatus(statut)
          if (statut === 'SUCCES' || statut === 'ECHEC') {
            clearInterval(timer)
          }
        }
      } catch {
        if (!stop) setPaymentStatus('EN_ATTENTE_DE_PAIEMENT')
      }

      attempts += 1
      if (attempts >= maxAttempts && !stop) {
        clearInterval(timer)
        setError('Verification depassee (5 minutes). Rechargez la page pour verifier le statut final.')
      }
    }

    poll()
    timer = setInterval(poll, 5000)
    return () => {
      stop = true
      clearInterval(timer)
    }
  }, [reference])

  if (!offre?.id && !reference && !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Aucune donnee de commande</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Retour a l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6">
            {isLoading ? <Loader2 className="h-12 w-12 text-white animate-spin" /> : <CheckCircle className="h-12 w-12 text-white" />}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {isLoading
              ? 'Confirmation en cours...'
              : paymentStatus === 'SUCCES'
                ? 'Paiement confirme'
                : paymentStatus === 'ECHEC'
                  ? 'Paiement echoue'
                  : 'Paiement en cours de traitement'}
          </h1>

          {error && <p className="text-red-600 mb-6">{error}</p>}

          <div className="bg-green-50 rounded-2xl p-6 mb-6 text-left border border-green-200">
            <p className="text-green-800 text-sm">
              <strong>Statut actuel:</strong> {paymentStatus.replace(/_/g, ' ')} <br />
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <h2 className="font-bold text-xl mb-4 text-gray-900">Details de la commande</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold text-gray-900">{offre?.nom || 'Abonnement'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant paye</span>
                <span className="font-semibold text-gray-900">{(montant || 0).toLocaleString()} F CFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono text-sm text-gray-900">{reference || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prochaines etapes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>Vos identifiants seront envoyes par email.</li>
              <li>Conservez votre reference pour le support.</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all shadow-lg"
          >
            <Home className="h-5 w-5" />
            Retour a l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
