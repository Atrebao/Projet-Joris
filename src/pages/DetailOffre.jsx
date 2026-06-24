import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader, Smartphone, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { abonnementsAPI, codesPromoAPI, souscriptionsAPI } from '../lib/api'
import { ServiceLogo } from './HomeNouvelle'
import { OPERATOR_BADGES } from '@/Utils/Utils'



const formatFCFA = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export default function DetailOffre() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offre, setOffre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedForfaitId, setSelectedForfaitId] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState('orange')
  const [nom, setNom] = useState('')
  const [prenoms, setPrenoms] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [otp, setOtp] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promo, setPromo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const user = safeParse(localStorage.getItem('infoUser')) || safeParse(localStorage.getItem('user'))
    if (user) {
      setNom(user.nom || user.lastName || '')
      setPrenoms(user.prenoms || user.firstName || '')
      setEmail(user.email || '')
      setTelephone(user.telephone || user.phone || user.numero || '')
    }
  }, [])

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

  const amount = Number(selectedForfait?.prix || offre?.prix || 0)
  const discount = Number(promo?.remiseXof || 0)
  const total = Math.max(0, amount - discount)

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
      const remiseXof = data?.typeRemise === 'POURCENTAGE' ? (amount * remiseValeur) / 100 : remiseValeur
      setPromo({ codePromo: data?.codePromo?.code || code, remiseXof })
      toast.success('Code promo appliqué')
    } catch (error) {
      setPromo(null)
      toast.error(error?.response?.data?.message || 'Code promo invalide')
    }
  }

  const submitPayment = async (event) => {
    event.preventDefault()
    if (!offre || !selectedForfait) return
    if (!nom.trim() || !email.trim() || !telephone.trim()) {
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
        nom,
        prenoms,
        email,
        telephone: telephone.replace(/\s/g, ''),
        operateur: operator.operateur,
        otp: selectedOperator === 'orange' ? otp.trim() : undefined,
        codePromo: promo?.codePromo,
        description: `${offre.nom} - ${selectedForfait.duree || offre.duree} mois`,
        modePaiement: operator.operateur
      })

      localStorage.setItem('customerEmail', email)
      localStorage.setItem('pendingPayment', JSON.stringify({
        reference: data?.reference,
        montant: total,
        provider: selectedOperator,
        offreId: offre.id,
        offreNom: offre.nom,
        forfaitId: selectedForfait.id,
        nom,
        prenoms,
        email,
        telephone: telephone.replace(/\s/g, ''),
        codePromo: promo?.codePromo
      }))

      setSuccess(true)
      setTimeout(() => {
        if (selectedOperator === 'wave' && data?.redirectUrl) {
          window.location.href = data.redirectUrl
          return
        }
        navigate('/confirmation', { state: { offre, montant: total, reference: data?.reference, paymentMethod: selectedOperator } })
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
                <p className="text-sm text-muted-foreground">{selectedForfait?.duree || offre.duree} mois · {offre.partenaire}</p>
              </div>
              <p className="font-bold text-primary">{formatFCFA(total)}</p>
            </div>

            {offre.forfaits.length > 1 && (
              <div>
                <label className="mb-2 block text-sm font-medium">Forfait</label>
                <select value={selectedForfaitId || ''} onChange={(event) => setSelectedForfaitId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none">
                  {offre.forfaits.map((forfait) => (
                    <option key={forfait.id} value={forfait.id}>{forfait.plan || `${forfait.duree} mois`} - {formatFCFA(forfait.prix)}</option>
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
                const isSelected = selectedOperator === operator.id;
                
                return (
                  <button
                    key={operator.id} // La clé est uniquement sur l'élément racine de la boucle
                    type="button"
                    onClick={() => setSelectedOperator(operator.id)}
                    className={`flex h-14 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 outline-none ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                        : 'border-border bg-card hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Logo officiel de l'opérateur intégré directement dans le bouton cliquable */}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border p-0.5 shadow-sm bg-white ${operator.className}`}>
                      <img 
                        src={operator.logoUrl} 
                        alt={operator.label} 
                        className="h-full w-full object-contain rounded" 
                      />
                    </div>

                    {/* Contenu textuel */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {operator.label}
                      </p>
                     
                    </div>

                    {/* Pastille de sélection dynamique */}
                    <span className={`h-3 w-3 rounded-full border transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>


            <div className="grid gap-2 sm:grid-cols-2">
              <input value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Nom" className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none" />
              <input value={prenoms} onChange={(event) => setPrenoms(event.target.value)} placeholder="Prénoms" className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none" />
            </div>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email de livraison" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none" />

            <div>
              <label className="mb-2 block text-sm font-medium">Numéro Mobile Money</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="07 00 00 00 00" className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none" />
              </div>
            </div>

            {selectedOperator === 'orange' && (
              <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Code OTP Orange" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none" />
            )}

            <div className="flex gap-2">
              <input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Code promo" className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none" />
              <button type="button" onClick={applyPromo} className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted">Appliquer</button>
            </div>

            <button disabled={submitting} className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
              {submitting ? 'Traitement...' : `Payer ${formatFCFA(total)}`}
            </button>

            <p className="text-center text-xs text-muted-foreground">Démo: aucun paiement réel n'est effectué.</p>
          </form>
        )}
      </div>
    </div>
  )
}

function normalizeOffer(data = {}) {
  const forfaits = Array.isArray(data.forfaits) && data.forfaits.length > 0
    ? data.forfaits
    : [{ id: data.id, plan: 'Standard', prix: data.prixMensuel || 0, duree: data.duree || 1 }]

  return {
    id: data.id,
    nom: data.nom || data.nomService || 'Offre',
    description: data.description || '',
    image: data.image || data.imageService || '',
    prix: Number(forfaits[0]?.prix || 0),
    duree: Number(forfaits[0]?.duree || 1),
    stock: Number(data.stock ?? data.quantiteDisponible ?? 0),
    partenaire: data.partenaire?.nomBoutique || data.partenaire?.nom || 'DigiStore CI',
    partenaireId: data.partenaire?.id,
    forfaits
  }
}

function safeParse(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
