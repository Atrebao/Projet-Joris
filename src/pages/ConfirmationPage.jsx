import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, FileText, Loader2,Clock } from 'lucide-react'
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
  <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-sm text-center">
        
        {/* Pastille centrale épurée */}
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-sm border ${
          isLoading 
            ? 'bg-primary/10 border-primary/20' 
            : paymentStatus === 'SUCCES' 
            ? 'bg-emerald-50 border-emerald-200/60' 
            : paymentStatus === 'ECHEC' 
            ? 'bg-destructive/10 border-destructive/20' 
            : 'bg-amber-50 border-amber-200/60'
        }`}>
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : paymentStatus === 'SUCCES' ? (
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          ) : paymentStatus === 'ECHEC' ? (
            <XCircle className="h-10 w-10 text-destructive" /> // Pensez à importer XCircle ou réutilisez votre icône
          ) : (
            <Clock className="h-10 w-10 text-amber-600" /> // Pensez à importer Clock ou réutilisez votre icône
          )}
        </div>

        {/* Titre dynamique conservé à l'identique */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          {isLoading
            ? 'Confirmation en cours...'
            : paymentStatus === 'SUCCES'
              ? 'Paiement confirmé'
              : paymentStatus === 'ECHEC'
                ? 'Paiement échoué'
                : 'Paiement en cours de traitement'}
        </h1>

        {error && (
          <p className="text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-2.5 max-w-md mx-auto mb-6">
            {error}
          </p>
        )}

        {/* Bloc Statut Actuel */}
        <div className={`rounded-xl p-4 mb-5 text-left border ${
          paymentStatus === 'SUCCES' 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
            : paymentStatus === 'ECHEC' 
            ? 'bg-destructive/5 border-destructive/10 text-destructive' 
            : 'bg-amber-50/50 border-amber-100 text-amber-800'
        }`}>
          <p className="text-sm font-medium">
            <strong className="font-bold">Statut actuel:</strong> {paymentStatus ? paymentStatus.replace(/_/g, ' ') : ''}
          </p>
        </div>

        {/* Bloc Détails de la commande */}
        <div className="border border-border rounded-xl bg-card p-5 text-left mb-5 shadow-sm">
          <h2 className="font-extrabold text-xs tracking-wider text-slate-400 uppercase mb-4">
            Détails de la commande
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-medium">Service</span>
              <span className="font-bold text-slate-900">{offre?.nom || 'Abonnement'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-medium">Montant payé</span>
              <span className="font-extrabold text-slate-950">{(montant || 0).toLocaleString()} F CFA</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-medium">Référence</span>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">{reference || '-'}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500 font-medium">Date</span>
              <span className="font-semibold text-slate-900">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Bloc Prochaines étapes */}
        <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 text-left mb-8">
          <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            Prochaines étapes
          </h3>
          <ul className="space-y-2 text-xs text-blue-800 font-medium list-disc list-inside">
            <li>Vos identifiants seront envoyés par email.</li>
            <li>Conservez votre référence pour le support.</li>
          </ul>
        </div>

        {/* Bouton Retour à l'accueil */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-sm hover:bg-primary/90 active:scale-[0.99]"
        >
          <Home className="h-4 w-4" />
          Retour à l&apos;accueil
        </button>
        
      </div>
    </div>
  </div>
);

}
