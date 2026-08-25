import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader, Smartphone, X, Shield, User, Lock, Sparkles, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { abonnementsAPI, codesPromoAPI, souscriptionsAPI, precommandesAPI } from '../lib/api'
import { ServiceLogo } from './HomeNouvelle'
import { OPERATOR_BADGES, normalizeOffer } from '@/Utils/Utils'
import { useCurrency } from '../context/CurrencyContext'

export default function DetailOffre() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const [offre, setOffre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedForfaitId, setSelectedForfaitId] = useState(null)
  const [typeAbonnement, setTypeAbonnement] = useState('PARTAGE') // 'PARTAGE' | 'PRIVE'
  const [nomProfilSouhaite, setNomProfilSouhaite] = useState('')
  const [codePinSouhaite, setCodePinSouhaite] = useState('')

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

  // Precommande state
  const [showPrecommandeModal, setShowPrecommandeModal] = useState(false)
  const [precommandeNom, setPrecommandeNom] = useState('')
  const [precommandeWhatsapp, setPrecommandeWhatsapp] = useState('')
  const [precommandeSubmitting, setPrecommandeSubmitting] = useState(false)

  useEffect(() => {
    const fetchClientData = async () => {
      const dataClient = localStorage.getItem('infoUser') || localStorage.getItem('client_user')
      if (dataClient) {
        try {
          const data = JSON.parse(dataClient)
          setClientData(data)
          setEmail(data.email || '')
          setNumeroClient(data.numeroWhatsapp || data.telephone || '')
          setPrecommandeNom(data.pseudo || `${data.prenoms || ''} ${data.nom || ''}`.trim() || '')
          setPrecommandeWhatsapp(data.numeroWhatsapp || data.telephone || '')
        } catch (error) {
          console.error('Erreur récupération client:', error)
        }
      }
    }
    fetchClientData()
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
    if (!offre || !offre.forfaits) return null
    return offre.forfaits.find((forfait) => String(forfait.id) === String(selectedForfaitId)) || offre.forfaits[0]
  }, [offre, selectedForfaitId])

  const calculatedUnitPrice = useMemo(() => {
    if (!selectedForfait) return Number(offre?.prix || 0)
    if (typeAbonnement === 'PRIVE') {
      return Number(selectedForfait.prixPrive || selectedForfait.prixPartage || offre?.prix || 0)
    }
    return Number(selectedForfait.prixPartage || selectedForfait.prixPrive || offre?.prix || 0)
  }, [selectedForfait, typeAbonnement, offre])

  const hasDirectPromo = Boolean(offre?.promotionDirecte)
  const basePrice = hasDirectPromo ? Number(offre.promotionDirecte.prixReduit) : calculatedUnitPrice
  const originalPrice = calculatedUnitPrice
  const discount = Number(promo?.remiseXof || 0)
  const total = Math.max(0, basePrice - discount)

  const isOutOfStock = (offre?.stock ?? offre?.quantiteDisponible ?? 0) <= 0

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
        abonnementId: offre.id,
      })
      const remiseValeur = Number(data?.remise || 0)
      const remiseXof = data?.typeRemise === 'POURCENTAGE' ? (basePrice * remiseValeur) / 100 : remiseValeur
      setPromo({ codePromo: data?.codePromo?.code || code, remiseXof, promotionId: data?.codePromo?.promotionId })
      toast.success('Code promo appliqué avec succès !')
    } catch (error) {
      setPromo(null)
      toast.error(error?.response?.data?.message || 'Code promo invalide')
    }
  }

  const handlePrecommandeSubmit = async (e) => {
    e.preventDefault()
    if (!precommandeWhatsapp.trim()) {
      toast.error('Le numéro WhatsApp est obligatoire pour être alerté')
      return
    }

    setPrecommandeSubmitting(true)
    try {
      await precommandesAPI.create({
        offreId: offre.id,
        forfaitId: selectedForfait?.id,
        clientId: clientData?.id,
        nomClient: precommandeNom.trim() || 'Client',
        numeroWhatsapp: precommandeWhatsapp.trim().replace(/\s/g, ''),
        emailClient: email.trim() || undefined,
        duree: selectedForfait?.duree || offre?.duree || 1,
        typeAbonnement,
        notes: nomProfilSouhaite ? `Profil demandé: ${nomProfilSouhaite}` : undefined,
      })
      toast.success('Précommande enregistrée ! Vous serez notifié dès réapprovisionnement 🎉')
      setShowPrecommandeModal(false)
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la précommande')
    } finally {
      setPrecommandeSubmitting(false)
    }
  }

  const submitPayment = async (event) => {
    event.preventDefault()
    if (!offre || !selectedForfait) return
    if (!numeroClient.trim()) {
      toast.error('Veuillez renseigner votre numéro de paiement Mobile Money')
      return
    }
    if (selectedOperator === 'orange' && !otp.trim()) {
      toast.error('Veuillez saisir le code OTP Orange')
      return
    }

    const operator = OPERATOR_BADGES.find((item) => item.id === selectedOperator)
    setSubmitting(true)
    try {
      const response = await souscriptionsAPI.initierPaiement({
        abonnementId: offre.id,
        forfaitId: selectedForfait.id,
        montant: total,
        email: email.trim() || undefined,
        numeroClient: numeroClient.replace(/\s/g, ''),
        operateur: operator?.operateur || selectedOperator,
        otp: selectedOperator === 'orange' ? otp.trim() : undefined,
        codePromo: promo?.codePromo,
        description: `${offre.nom} - ${selectedForfait.duree || offre.duree} mois (${typeAbonnement === 'PRIVE' ? 'Privé' : 'Partagé'})`,
        modePaiement: operator?.operateur || selectedOperator,
        pseudo: clientData?.username || clientData?.pseudo || '',
        telephone: clientData?.telephone || clientData?.numeroWhatsapp || numeroClient.replace(/\s/g, ''),
        typeAbonnement,
        nomProfilSouhaite: nomProfilSouhaite.trim() || undefined,
        codePinSouhaite: codePinSouhaite.trim() || undefined,
      })

      const data = response.data

      localStorage.setItem(
        'pendingPayment',
        JSON.stringify({
          reference: data?.reference,
          montant: total,
          provider: selectedOperator,
          offreId: offre.id,
          offreNom: offre.nom,
          forfaitId: selectedForfait.id,
          email,
          numeroClient: numeroClient.replace(/\s/g, ''),
          codePromo: promo?.codePromo,
        }),
      )

      // Extraction de l'URL de redirection Wave
      const redirectUrl =
        data?.redirectUrl ||
        data?.billmapResponse?.wave_launch_url ||
        data?.billmapResponse?.url ||
        data?.billmapResponse?.redirectUrl ||
        data?.billmapResponse?.data?.wave_launch_url ||
        null

      setSuccess(true)
      setTimeout(() => {
        if (selectedOperator === 'wave' && redirectUrl) {
          window.location.href = redirectUrl
          return
        }
        navigate('/confirmation', {
          state: {
            offre,
            montant: total,
            reference: data?.reference,
            paymentMethod: selectedOperator,
          },
        })
      }, 1000)
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
        <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-sm">
          <p className="font-bold text-foreground">Offre introuvable</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto mb-4 max-w-xl">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux offres
        </button>
      </div>

      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header Carte Offre */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Souscription Express</span>
            <h1 className="text-xl font-black text-foreground">{offre.nom}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Sélectionnez votre forfait et finalisez votre paiement sécurisé.</p>
          </div>
          <button onClick={() => navigate('/')} className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Paiement en cours...</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Validation de la transaction. Redirection en cours vers la confirmation...
            </p>
          </div>
        ) : (
          <form onSubmit={submitPayment} className="space-y-5 p-5">
            {/* Résumé Produit */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-muted/40 p-3.5">
              <ServiceLogo name={offre.service || offre.nom} image={offre.image} size="md" className="rounded-2xl shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-foreground text-sm">{offre.nom}</p>
                <p className="text-xs text-muted-foreground font-semibold">
                  {selectedForfait?.duree || offre.duree} {selectedForfait?.periode || 'mois'} · {offre.partenaire}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-primary text-base">{formatPrice(total)}</p>
                {(hasDirectPromo || promo) && (
                  <p className="text-[10px] text-muted-foreground line-through font-bold">{formatPrice(originalPrice)}</p>
                )}
              </div>
            </div>

            {/* Sélecteur de Forfait / Durée (Point 4 : Offre Unique Multi-Durées) */}
            {offre.forfaits && offre.forfaits.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-black text-foreground block uppercase tracking-wider">
                  1. Choisissez la Durée du Forfait
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {offre.forfaits.map((forfait) => {
                    const isSelected = String(forfait.id) === String(selectedForfaitId)
                    return (
                      <button
                        key={forfait.id}
                        type="button"
                        onClick={() => setSelectedForfaitId(forfait.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-black ring-2 ring-primary/20 shadow-xs'
                            : 'border-border bg-card text-muted-foreground font-bold hover:border-slate-400 hover:text-foreground'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 mb-1" />
                        <span className="text-xs leading-none">{forfait.plan || `${forfait.duree} ${forfait.periode || 'Mois'}`}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Type d'Abonnement : Partagé vs Privé (Point 7) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-foreground block uppercase tracking-wider">
                2. Type d'Abonnement
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTypeAbonnement('PARTAGE')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    typeAbonnement === 'PARTAGE'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-black'
                      : 'border-border bg-card text-muted-foreground font-bold hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold">Profil Partagé</p>
                    <span className="text-[11px] font-black text-primary">
                      {formatPrice(selectedForfait?.prixPartage || offre.prix)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Livraison instantanée automatique</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeAbonnement('PRIVE')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    typeAbonnement === 'PRIVE'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-black'
                      : 'border-border bg-card text-muted-foreground font-bold hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Profil Privé
                    </p>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      {formatPrice(selectedForfait?.prixPrive || offre.prix)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Profil & PIN sur-mesure</p>
                </button>
              </div>

              {/* Champs de personnalisation pour profil privé (optionnel) */}
              {typeAbonnement === 'PRIVE' && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in">
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    👑 Personnalisation de votre Profil Privé :
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground block">Nom du profil souhaité</label>
                      <div className="relative">
                        <User className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="ex: Alex VIP"
                          value={nomProfilSouhaite}
                          onChange={(e) => setNomProfilSouhaite(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 bg-card border border-border rounded-xl text-xs font-medium outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground block">Code PIN souhaité (4 chiffres)</label>
                      <div className="relative">
                        <Lock className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="ex: 4920"
                          value={codePinSouhaite}
                          onChange={(e) => setCodePinSouhaite(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 bg-card border border-border rounded-xl text-xs font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Choix de l'opérateur de paiement */}
            <div className="space-y-2">
              <label className="text-xs font-black text-foreground block uppercase tracking-wider">
                3. Moyen de Paiement Mobile Money
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {OPERATOR_BADGES.map((operator) => {
                  const isSelected = selectedOperator === operator.id
                  return (
                    <button
                      key={operator.id}
                      type="button"
                      onClick={() => setSelectedOperator(operator.id)}
                      className={`flex h-13 items-center gap-3 rounded-2xl border p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border p-0.5 bg-white">
                        <img src={operator.logoUrl} alt={operator.label} className="h-full w-full object-contain rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-foreground truncate">{operator.label}</p>
                      </div>
                      <span
                        className={`h-3 w-3 rounded-full border ${
                          isSelected ? 'bg-primary border-primary' : 'bg-transparent border-slate-300'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Numéro de paiement */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-foreground block">
                Numéro de Paiement ({selectedOperator.toUpperCase()})
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  value={numeroClient}
                  onChange={(event) => setNumeroClient(event.target.value)}
                  placeholder="07 00 00 00 00"
                  className="h-11 w-full rounded-2xl border border-input bg-card pl-10 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {selectedOperator === 'orange' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground block">Code OTP Orange Money (#144*82#)</label>
                <input
                  required
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Composez #144*82# pour obtenir votre code"
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Code Promo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPromo}
                  onChange={(e) => setHasPromo(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary accent-primary"
                />
                <span className="text-xs font-bold text-foreground">J'ai un code de promotion</span>
              </label>

              {hasPromo && (
                <div className="flex gap-2 animate-in fade-in">
                  <input
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="ex: REDUC20"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-xs font-bold outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="h-10 rounded-xl bg-muted px-4 text-xs font-black text-foreground hover:bg-muted/80 transition"
                  >
                    Appliquer
                  </button>
                </div>
              )}
            </div>

            {/* Bouton de Paiement ou Précommande */}
            {isOutOfStock ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Stock actuellement épuisé sur cette durée.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrecommandeModal(true)}
                  className="h-12 w-full rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg hover:bg-amber-400 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Précommander & Être alerté par WhatsApp
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-2xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/25 hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? 'Traitement du paiement...' : `Payer ${formatPrice(total)}`}
              </button>
            )}
          </form>
        )}
      </div>

      {/* Modal Précommande */}
      {showPrecommandeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setShowPrecommandeModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">Précommande - {offre.nom}</h3>
              <p className="text-xs text-muted-foreground">
                Soyez servi en priorité dès que les nouveaux comptes sont disponibles !
              </p>
            </div>

            <form onSubmit={handlePrecommandeSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">Votre Nom / Pseudo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean VIP"
                  value={precommandeNom}
                  onChange={(e) => setPrecommandeNom(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">
                  Numéro WhatsApp pour notification <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="ex: 0700000000"
                  value={precommandeWhatsapp}
                  onChange={(e) => setPrecommandeWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={precommandeSubmitting}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 transition mt-2 cursor-pointer disabled:opacity-50"
              >
                {precommandeSubmitting ? 'Enregistrement...' : 'Confirmer ma Précommande'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
