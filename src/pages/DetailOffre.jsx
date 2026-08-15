import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader, Smartphone, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { abonnementsAPI, codesPromoAPI, souscriptionsAPI } from '../lib/api'
import { ServiceLogo } from './HomeNouvelle'
import { OPERATOR_BADGES, normalizeOffer } from '@/Utils/Utils'

const formatFCFA = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export default function DetailOffre() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offre, setOffre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedForfaitId, setSelectedForfaitId] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState('orange')
  const [email, setEmail] = useState('')
  const [numeroClient, setNumeroClient] = useState('')
  const [otp, setOtp] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promo, setPromo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hasPromo, setHasPromo] = useState(false)
  const [clientData, setClientData] = useState(null)

  useEffect(() => {
    const fetchClientData = async () => {
      const dataClient = localStorage.getItem('infoUser')
      if (!dataClient) {
        navigate('/')
        return
      }

      try {
        const data = JSON.parse(dataClient)
        setClientData(data)
        setEmail(data.email || '')
      } catch (error) {
        console.error('Erreur lors de la récupération du client:', error)
        navigate('/')
      }
    }

    fetchClientData()
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await abonnementsAPI.getDetails(Number(id))
        const normalized = normalizeOffer(data)
        setOffre(normalized)
        setSelectedForfaitId(normalized.forfaits[0]?.id || null)
      } catch (error) {
        console.error(error)
        toast.error('Impossible de charger cette offre')
        setOffre(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const selectedForfait = useMemo(() => {
    if (!offre) return null
    return offre.forfaits.find((forfait) => String(forfait.id) === String(selectedForfaitId)) || offre.forfaits[0]
  }, [offre, selectedForfaitId])

  const hasDirectPromo = Boolean(offre?.promotionDirecte)
  const basePrice = hasDirectPromo ? Number(offre.promotionDirecte.prixReduit) : Number(offre?.prix || 0)
  const originalPrice = Number(offre?.prixOriginal || offre?.prix || 0)
  const discount = Number(promo?.remiseXof || 0)
  const total = Math.max(0, basePrice - discount)

  const applyPromo = async () => {
    const code = promoCode.trim()
    if (!code || !offre?.id) {
      setPromo(null)
      return
    }

    try {
      const { data } = await codesPromoAPI.valider({
        code,
        partenaireId: offre.partenaireId,
        abonnementId: offre.id
      })
      const remiseValeur = Number(data?.remise || 0)
      const remiseXof = data?.typeRemise === 'POURCENTAGE' ? (basePrice * remiseValeur) / 100 : remiseValeur
      setPromo({ codePromo: data?.codePromo?.code || code, remiseXof, promotionId: data?.codePromo?.promotionId })
      toast.success('Code promo appliqué')
    } catch (error) {
      setPromo(null)
      toast.error(error?.response?.data?.message || 'Code promo invalide')
    }
  }

  const submitPayment = async (event) => {
    event.preventDefault()
    if (!offre || !selectedForfait) return
    if (!email.trim() || !numeroClient.trim()) {
      toast.error('Veuillez renseigner vos informations client')
      return
    }
    if (selectedOperator === 'orange' && !otp.trim()) {
      toast.error('Veuillez saisir le code OTP Orange')
      return
    }

    const operator = OPERATOR_BADGES.find((item) => item.id === selectedOperator)
    setSubmitting(true)
    try {
      const { data } = await souscriptionsAPI.initierPaiement({
        abonnementId: offre.id,
        forfaitId: selectedForfait.id,
        montant: total,
        email,
        numeroClient: numeroClient.replace(/\s/g, ''),
        operateur: operator?.operateur || selectedOperator,
        otp: selectedOperator === 'orange' ? otp.trim() : undefined,
        codePromo: promo?.codePromo,
        description: `${offre.nom} - ${selectedForfait.duree || offre.duree} mois`,
        modePaiement: operator?.operateur || selectedOperator,
        pseudo: clientData?.username || clientData?.pseudo || '',
        telephone: clientData?.telephone || clientData?.phone || clientData?.numero || ''
      })

      localStorage.setItem('pendingPayment', JSON.stringify({
        reference: data?.reference,
        montant: total,
        provider: selectedOperator,
        offreId: offre.id,
        offreNom: offre.nom,
        forfaitId: selectedForfait.id,
        email,
        numeroClient: numeroClient.replace(/\s/g, ''),
        codePromo: promo?.codePromo
      }))

      setSuccess(true)
      setTimeout(() => {
        if (selectedOperator === 'wave' && data?.redirectUrl) {
          window.location.href = data.redirectUrl
          return
        }
        navigate('/confirmation', { 
          state: { 
            offre, 
            montant: total, 
            reference: data?.reference, 
            paymentMethod: selectedOperator 
          } 
        })
      }, 1200)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-semibold">Offre introuvable</p>
          <button onClick={() => navigate('/')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto mb-4 max-w-xl">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour au marketplace
        </button>
      </div>

      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <h1 className="text-lg font-semibold">Paiement Mobile Money</h1>
            <p className="mt-1 text-sm text-muted-foreground">Validez votre achat en quelques secondes.</p>
          </div>
          <button onClick={() => navigate('/')} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Demande envoyée</h2>
            <p className="mt-2 text-sm text-muted-foreground">Nous vérifions le paiement, puis vous serez redirigé.</p>
          </div>
        ) : (
          <form onSubmit={submitPayment} className="space-y-4 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
              <ServiceLogo offer={offre} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{offre.nom}</p>
                <p className="text-sm text-muted-foreground">{selectedForfait?.duree || offre.duree} {selectedForfait?.periode || 'mois'} · {offre.partenaire}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-primary text-base">{formatFCFA(total)}</p>
                {(hasDirectPromo || promo) && (
                  <p className="text-[11px] text-muted-foreground line-through font-semibold">
                    {formatFCFA(originalPrice)}
                  </p>
                )}
              </div>
            </div>

            {/* Caractéristiques & Description de l'offre */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs space-y-1">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Détails de l&apos;Abonnement
              </span>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line text-xs font-medium">
                {offre.description || `${offre.nom} - Forfait ${selectedForfait?.duree || offre.duree} mois. Identifiants livrés automatiquement dès confirmation du paiement.`}
              </div>
            </div>

            {offre.forfaits && offre.forfaits.length > 1 && (
              <div>
                <label className="mb-2 block text-sm font-medium">Forfait</label>
                <select 
                  value={selectedForfaitId || ''} 
                  onChange={(event) => setSelectedForfaitId(event.target.value)} 
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none"
                >
                  {offre.forfaits.map((forfait) => (
                    <option key={forfait.id} value={forfait.id}>
                      {forfait.plan || `${forfait.duree} ${forfait.periode || 'mois'}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Choisissez votre opérateur
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {OPERATOR_BADGES.map((operator) => {
                  const isSelected = selectedOperator === operator.id
                  
                  return (
                    <button
                      key={operator.id}
                      type="button"
                      onClick={() => setSelectedOperator(operator.id)}
                      className={`flex h-14 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 outline-none ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                          : 'border-border bg-card hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border p-0.5 shadow-sm bg-white ${operator.className || ''}`}>
                        <img 
                          src={operator.logoUrl} 
                          alt={operator.label} 
                          className="h-full w-full object-contain rounded" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {operator.label}
                        </p>
                      </div>

                      <span className={`h-3 w-3 rounded-full border transition-colors ${
                        isSelected ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'
                      }`} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <div className="relative">
                <input 
                  value={email} 
                  onChange={(event) => setEmail(event.target.value)} 
                  placeholder="exemple@email.com" 
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Numéro Mobile Money</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  value={numeroClient} 
                  onChange={(event) => setNumeroClient(event.target.value)} 
                  placeholder="07 00 00 00 00" 
                  className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none" 
                />
              </div>
            </div>

            {selectedOperator === 'orange' && (
              <div>
                <label className="mb-2 block text-sm font-medium">Code OTP Orange</label>
                <input 
                  value={otp} 
                  onChange={(event) => setOtp(event.target.value)} 
                  placeholder="Code OTP reçu par SMS" 
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none" 
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPromo}
                  onChange={(e) => setHasPromo(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-xs font-semibold text-slate-700">
                  J'ai un code promo
                </span>
              </label>

              {hasPromo && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="Entrez votre code (ex: STREAM20)"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={submitting} 
              className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? 'Traitement...' : `Payer ${formatFCFA(total)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
