import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
  DollarSign,
  Percent,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES, OPERATOR_BADGES, SERVICES_MARKETPLACE, getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { API_URL, forfaitsAPI, offresAPI, partenairesAPI } from '../../lib/api'
import { Button, Card, Input, LoadingState, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function EditerOffrePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])
  const [selectedOperators, setSelectedOperators] = useState(['orange', 'mtn', 'moov', 'wave'])

  // Commission partenaire
  const [partenaireData, setPartenaireData] = useState(null)
  const [modeTarification, setModeTarification] = useState('INCLURE_COMMISSION')

  const [formData, setFormData] = useState({
    categorie: 'streaming',
    service: 'netflix',
    titreOffre: '',
    forfaitId: '',
    prix: '',
    description: '',
    stock: '0',
    imageUrl: '',
  })

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }

    const load = async () => {
      try {
        const [offreRes, forfaitsRes, partRes] = await Promise.allSettled([
          offresAPI.getOne(Number(id)),
          forfaitsAPI.getAll(partenaireId),
          partenairesAPI.getOne(partenaireId),
        ])

        if (forfaitsRes.status === 'fulfilled') {
          const forfaits = Array.isArray(forfaitsRes.value.data) ? forfaitsRes.value.data : []
          setForfaitsDisponibles(forfaits)
        }

        if (partRes.status === 'fulfilled') {
          setPartenaireData(partRes.value.data)
        }

        if (offreRes.status === 'fulfilled') {
          const offre = offreRes.value.data || {}
          const currentForfaitId =
            offre.forfaitOffres?.[0]?.forfait?.id ||
            offre.forfaits?.[0]?.id ||
            offre.forfaitId ||
            ''

          const rawService = offre.service || offre.nomService || 'netflix'
          const meta = getServiceMeta(rawService)

          setFormData({
            categorie: offre.categorie || meta.category || 'streaming',
            service: meta.value || rawService,
            titreOffre: offre.titreOffre || offre.typeCompte || offre.nom || `${meta.label} Abonnement`,
            forfaitId: String(currentForfaitId),
            prix: String(offre.prixVente ?? offre.prixOriginal ?? offre.prix ?? ''),
            description: offre.description || '',
            stock: String(offre.quantiteDisponible ?? offre.stock ?? '0'),
            imageUrl: offre.imageService || offre.image || '',
          })

          if (offre.imageService || offre.image) {
            setImagePreview(offre.imageService || offre.image)
          }
        }
      } catch {
        toast.error('Offre introuvable')
        navigate('/partenaire/offres')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, partenaireId, navigate])

  const selectedServiceMeta = getServiceMeta(formData.service)
  const tauxCommission = partenaireData?.commissionActive !== false ? Number(partenaireData?.tauxCommission || 10) : 0
  const isCommissionActive = partenaireData?.commissionActive !== false && tauxCommission > 0

  // Calcul du prix et de la commission en direct
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
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|gif|webp)/i.test(file.type)) {
      toast.error('Format image non supporté')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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

    const inputNum = Number(formData.prix)
    if (!Number.isFinite(inputNum) || inputNum <= 0) {
      toast.error("Veuillez renseigner un prix valide en FCFA pour l'offre.")
      return
    }

    if (!formData.titreOffre.trim()) {
      toast.error("Veuillez renseigner le titre de l'offre.")
      return
    }

    setSubmitting(true)
    try {
      let imageService = formData.imageUrl?.trim() || ''
      if (imageFile) {
        setUploadingImage(true)
        const { data: up } = await offresAPI.uploadImage(imageFile)
        imageService = `${API_URL}${up.url}`
        setUploadingImage(false)
      }

      if (imageService && !imageService.startsWith('http')) {
        imageService = `${API_URL}${imageService.startsWith('/') ? '' : '/'}${imageService}`
      }

      const forfait = forfaitsDisponibles.find((f) => String(f.id) === String(formData.forfaitId))
      const serviceMeta = getServiceMeta(formData.service)

      await offresAPI.update(Number(id), {
        categorie: formData.categorie,
        service: formData.service,
        nomService: serviceMeta.label || formData.service,
        titreOffre: formData.titreOffre.trim(),
        description: formData.description?.trim() || `${serviceMeta.label} - ${forfait?.plan || 'Standard'}`,
        imageService: imageService || undefined,
        prixBase: inputNum,
        modeTarification,
        prixOriginal: pricingSimulation.prixClient || inputNum,
        prixVente: pricingSimulation.prixClient || inputNum,
        margePartenaire: pricingSimulation.gainNet || inputNum,
        duree: Number(forfait?.duree || 1),
        typeCompte: formData.titreOffre.trim(),
        quantiteDisponible: parseInt(formData.stock, 10) || 0,
        forfaitId: formData.forfaitId ? Number(formData.forfaitId) : undefined,
      })

      toast.success('Offre mise à jour avec succès !')
      navigate('/partenaire/offres')
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour de l'offre")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Chargement de l'offre..." />

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Modifier l'Offre de Streaming"
        description="Ajustez les informations, la tarification et la description de votre offre."
        action={
          <Button variant="outline" onClick={() => navigate('/partenaire/offres')} className="gap-2 text-xs font-semibold rounded-lg">
            <ArrowLeft className="h-4 w-4" /> Retour aux offres
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <Card className="p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
            1. Informations du Service
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Catégorie *
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Plateforme / Service *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none"
              >
                {SERVICES_MARKETPLACE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.category})
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
                placeholder="Ex: Netflix Premium Ultra HD 4K"
                value={formData.titreOffre}
                onChange={handleChange}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Forfait & Durée associé
              </label>
              <select
                name="forfaitId"
                value={formData.forfaitId}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none"
              >
                {forfaitsDisponibles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom || f.plan} ({f.duree} {f.periode ? f.periode.toLowerCase() : 'mois'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Tarification & Calculateur de Commission Transparente */}
        <Card className="p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Tarification & Commission Plateforme
            </h2>
            {isCommissionActive && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Taux Commission : {tauxCommission}%
              </span>
            )}
          </div>

          {/* Sélecteur de Mode de Tarification */}
          {isCommissionActive ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Comment souhaitez-vous appliquer la commission plateforme ?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModeTarification('INCLURE_COMMISSION')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    modeTarification === 'INCLURE_COMMISSION'
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
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    modeTarification === 'AJOUTER_COMMISSION'
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
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Aucune commission plateforme active sur votre compte (0%). Vous recevez 100% du prix de vente.</span>
            </div>
          )}

          {/* Champ de Saisie Prix & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                {modeTarification === 'AJOUTER_COMMISSION'
                  ? 'Votre Revenu Net souhaité par vente (FCFA) *'
                  : 'Prix de Vente Public affiché au client (FCFA) *'}
              </label>
              <Input
                name="prix"
                type="number"
                min="100"
                required
                placeholder="Ex: 5000"
                value={formData.prix}
                onChange={handleChange}
                className="text-base font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Stock d&apos;identifiants restants
              </label>
              <Input
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="text-xs"
              />
            </div>
          </div>

          {/* Simulateur Financier Transparent */}
          {Number(formData.prix) > 0 && (
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
                'Livraison WhatsApp instantanée',
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
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none leading-relaxed"
            />
          </div>

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
            disabled={submitting}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-6 h-10 gap-2 shadow-2xs"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
