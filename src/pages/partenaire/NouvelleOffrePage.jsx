import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  DollarSign,
  Percent,
  Wallet,
  ShieldCheck,
  Info,
  Layers,
  HelpCircle,
  Tv,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES, SERVICES_MARKETPLACE, getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { forfaitsAPI, offresAPI, partenairesAPI } from '../../lib/api'
import { Button, Card, Input, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function NouvelleOffrePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(false)
  const [loadingForfaits, setLoadingForfaits] = useState(false)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])

  // Commission partenaire
  const [partenaireData, setPartenaireData] = useState(null)
  const [modeTarification, setModeTarification] = useState('INCLURE_COMMISSION') // 'INCLURE_COMMISSION' | 'AJOUTER_COMMISSION'

  const [formData, setFormData] = useState({
    categorie: 'streaming',
    service: 'netflix',
    titreOffre: 'Netflix Premium Ultra HD 4K',
    forfaitId: '',
    prix: '',
    description: '',
    stock: '10',
  })

  useEffect(() => {
    if (!partenaireId) navigate('/backoffice/login')
  }, [partenaireId, navigate])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingForfaits(true)
        const [forfaitsRes, partRes] = await Promise.allSettled([
          forfaitsAPI.getAll(partenaireId),
          partenairesAPI.getOne(partenaireId),
        ])

        if (forfaitsRes.status === 'fulfilled') {
          const items = Array.isArray(forfaitsRes.value.data) ? forfaitsRes.value.data : []
          setForfaitsDisponibles(items)
          if (!formData.forfaitId && items[0]?.id) {
            setFormData((state) => ({ ...state, forfaitId: String(items[0].id) }))
          }
        }

        if (partRes.status === 'fulfilled') {
          setPartenaireData(partRes.value.data)
        }
      } catch {
        setForfaitsDisponibles([])
      } finally {
        setLoadingForfaits(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const selectedServiceMeta = getServiceMeta(formData.service)
  const tauxCommission = partenaireData?.commissionActive !== false ? Number(partenaireData?.tauxCommission || 10) : 0
  const isCommissionActive = partenaireData?.commissionActive !== false && tauxCommission > 0

  // Calcul du prix et de la commission en direct (uniquement si commission active)
  const pricingSimulation = useMemo(() => {
    const inputAmount = Number(formData.prix) || 0
    if (inputAmount <= 0) {
      return { prixClient: 0, commissionMontant: 0, gainNet: 0 }
    }

    if (!isCommissionActive) {
      return { prixClient: inputAmount, commissionMontant: 0, gainNet: inputAmount }
    }

    if (modeTarification === 'AJOUTER_COMMISSION') {
      const prixClient = Math.round(inputAmount * (1 + tauxCommission / 100))
      const commissionMontant = prixClient - inputAmount
      return {
        prixClient,
        commissionMontant,
        gainNet: inputAmount,
      }
    } else {
      const commissionMontant = Math.round((inputAmount * tauxCommission) / 100)
      const gainNet = Math.max(0, inputAmount - commissionMontant)
      return {
        prixClient: inputAmount,
        commissionMontant,
        gainNet,
      }
    }
  }, [formData.prix, modeTarification, isCommissionActive, tauxCommission])

  const handleServiceChange = (e) => {
    const serviceVal = e.target.value
    const meta = getServiceMeta(serviceVal)
    setFormData((prev) => ({
      ...prev,
      service: serviceVal,
      categorie: meta.category || prev.categorie,
      titreOffre: `${meta.label} Abonnement`,
    }))
  }

  const handleChange = (e) => {
    setFormData((state) => ({ ...state, [e.target.name]: e.target.value }))
  }

  const handleAddTemplateBullet = (text) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description.trim()}\n• ${text}` : `• ${text}`,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partenaireId) return

    if (!formData.forfaitId) {
      toast.error('Veuillez sélectionner un forfait pour définir la durée.')
      return
    }

    const inputNum = Number(formData.prix)
    if (!Number.isFinite(inputNum) || inputNum <= 0) {
      toast.error("Veuillez renseigner un prix valide en FCFA pour l'offre.")
      return
    }

    if (!formData.titreOffre.trim()) {
      toast.error("Veuillez renseigner le titre de l'offre.")
      return
    }

    setLoading(true)
    try {
      const forfait = forfaitsDisponibles.find((f) => String(f.id) === String(formData.forfaitId))
      const serviceMeta = getServiceMeta(formData.service)

      await offresAPI.create({
        partenaireId: Number(partenaireId),
        categorie: formData.categorie,
        service: formData.service,
        nomService: serviceMeta.label || formData.service,
        titreOffre: formData.titreOffre.trim(),
        description: formData.description?.trim() || `${serviceMeta.label} - ${forfait?.nom || forfait?.plan || 'Standard'}`,
        imageService: '',
        prixBase: inputNum,
        modeTarification: isCommissionActive ? modeTarification : 'INCLURE_COMMISSION',
        prixOriginal: isCommissionActive ? (pricingSimulation.prixClient || inputNum) : inputNum,
        prixVente: isCommissionActive ? (pricingSimulation.prixClient || inputNum) : inputNum,
        margePartenaire: isCommissionActive ? (pricingSimulation.gainNet || inputNum) : inputNum,
        duree: Number(forfait?.duree || 1),
        typeCompte: formData.titreOffre.trim(),
        quantiteDisponible: parseInt(formData.stock, 10) || 0,
        forfaitId: Number(formData.forfaitId),
      })

      toast.success('Offre créée et mise en ligne avec succès !')
      navigate('/partenaire/offres')
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Erreur lors de la création de l'offre")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Créer une Nouvelle Offre"
        description="Configurez votre abonnement, ajustez la tarification et publiez-le sur la marketplace."
        action={
          <Button variant="outline" onClick={() => navigate('/partenaire/offres')} className="gap-2 text-xs font-semibold rounded-lg">
            <ArrowLeft className="h-4 w-4" /> Retour aux offres
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales & Choix du Service Marketplace */}
        <Card className="p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Plateforme & Service de Streaming
            </h2>
            <span className="text-[11px] text-slate-500">Logo et marque officiels automatiques</span>
          </div>

          {/* Aperçu du badge de marque officiel (Style SaaS Marketplace) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs shrink-0"
              style={{ backgroundColor: selectedServiceMeta.color || '#0ea5e9' }}
            >
              {selectedServiceMeta.initials || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{selectedServiceMeta.label}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {selectedServiceMeta.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Le logo de la marque sera automatiquement appliqué sur la marketplace avec une netteté optimale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Plateforme / Service *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {SERVICES_MARKETPLACE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Catégorie *
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {CATEGORIES.filter((c) => c.value !== '').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Titre de l&apos;offre *
              </label>
              <Input
                name="titreOffre"
                required
                placeholder="Ex: Netflix Premium Ultra HD 4K (1 Écran)"
                value={formData.titreOffre}
                onChange={handleChange}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Forfait & Durée associé *
              </label>
              {loadingForfaits ? (
                <div className="h-10 flex items-center text-xs text-slate-400">Chargement des forfaits...</div>
              ) : forfaitsDisponibles.length === 0 ? (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  Aucun forfait créé. Veuillez d&apos;abord ajouter un forfait dans le menu « Mes Forfaits ».
                </div>
              ) : (
                <select
                  name="forfaitId"
                  value={formData.forfaitId}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none shadow-2xs"
                >
                  {forfaitsDisponibles.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom || f.plan} ({f.duree} {f.periode ? f.periode.toLowerCase() : 'mois'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </Card>

        {/* Tarification & Calculateur de Commission (Uniquement si commission active) */}
        <Card className="p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {isCommissionActive ? '2. Tarification & Commission Plateforme' : '2. Tarification de l\'offre'}
            </h2>
            {isCommissionActive && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Taux Commission : {tauxCommission}%
              </span>
            )}
          </div>

          {/* Sélecteur de Mode de Tarification (Uniquement si commission active) */}
          {isCommissionActive && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Comment souhaitez-vous appliquer la commission plateforme ?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModeTarification('INCLURE_COMMISSION')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${modeTarification === 'INCLURE_COMMISSION'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">
                      Inclure la commission dans mon prix
                    </span>
                    <input
                      type="radio"
                      checked={modeTarification === 'INCLURE_COMMISSION'}
                      onChange={() => setModeTarification('INCLURE_COMMISSION')}
                      className="accent-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Le prix que vous saisissez est le <strong>prix final payé par le client</strong>. La commission de {tauxCommission}% sera déduite de ce montant.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModeTarification('AJOUTER_COMMISSION')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${modeTarification === 'AJOUTER_COMMISSION'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">
                      Ajouter la commission au prix client
                    </span>
                    <input
                      type="radio"
                      checked={modeTarification === 'AJOUTER_COMMISSION'}
                      onChange={() => setModeTarification('AJOUTER_COMMISSION')}
                      className="accent-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Le prix que vous saisissez est <strong>votre revenu net souhaité</strong>. La commission est ajoutée et supportée par le client.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Champ de Saisie Prix & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                {isCommissionActive && modeTarification === 'AJOUTER_COMMISSION'
                  ? 'Votre Revenu Net souhaité par vente (FCFA) *'
                  : 'Prix de vente de l\'offre (FCFA) *'}
              </label>
              <Input
                name="prix"
                type="number"
                min="5"
                required
                placeholder="Ex: 5000"
                value={formData.prix}
                onChange={handleChange}
                className="text-base font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Stock initial d&apos;identifiants (optionnel)
              </label>
              <Input
                name="stock"
                type="number"
                min="0"
                placeholder="Ex: 10"
                value={formData.stock}
                onChange={handleChange}
                className="text-xs"
              />
            </div>
          </div>

          {/* Simulateur Financier Transparent (Uniquement si commission active) */}
          {isCommissionActive && Number(formData.prix) > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2.5 text-xs mt-2 border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-300 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Simulation Financière en Temps Réel
                </span>
                <span className="text-[11px] text-slate-400">Par souscription vendue</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Prix Payé par le Client
                  </span>
                  <span className="text-sm font-black text-white font-mono mt-0.5 block">
                    {formatFCFA(pricingSimulation.prixClient)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Commission Plateforme ({tauxCommission}%)
                  </span>
                  <span className="text-sm font-black text-indigo-400 font-mono mt-0.5 block">
                    - {formatFCFA(pricingSimulation.commissionMontant)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                    Votre Gain Net
                  </span>
                  <span className="text-sm font-black text-emerald-300 font-mono mt-0.5 block">
                    {formatFCFA(pricingSimulation.gainNet)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Description & Avantages de l'offre */}
        <Card className="p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Description & Caractéristiques de l&apos;offre
            </h2>
            <span className="text-[11px] text-slate-500">Mise en forme soignée pour le client</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-600 font-semibold block">
              Ajouter rapidement des caractéristiques types :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '1 Écran Privé avec code PIN',
                'Qualité Ultra HD 4K',
                'Compte renouvelable chaque mois',
                'Livraison instantanée',
                'Garantie totale sur toute la durée',
                'Compatible TV, Téléphone, PC',
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => handleAddTemplateBullet(template)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  + {template}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              name="description"
              rows={4}
              placeholder="Décrivez les fonctionnalités de votre offre :&#10;• 1 Écran Privé&#10;• Ultra HD 4K&#10;• Garantie 30 jours"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none leading-relaxed"
            />
          </div>

          {/* Aperçu du rendu de la description */}
          {formData.description && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Aperçu de l&apos;affichage client :
              </span>
              <div className="whitespace-pre-line text-slate-800 text-xs leading-relaxed font-medium">
                {formData.description}
              </div>
            </div>
          )}
        </Card>

        {/* Bouton de Soumission */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/partenaire/offres')}
            className="text-xs font-semibold rounded-lg"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-6 h-10 gap-2 shadow-2xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Création en cours...' : 'Publier mon offre'}
          </Button>
        </div>
      </form>
    </div>
  )
}
