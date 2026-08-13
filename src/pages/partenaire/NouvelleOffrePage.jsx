import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Plus, Save, Sparkles, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES, OPERATOR_BADGES, SERVICES_MARKETPLACE, getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { API_URL, forfaitsAPI, offresAPI } from '../../lib/api'
import { Button, Card, Input, PageHeader, Select } from '../../components/saas/SaasPrimitives'

export default function NouvelleOffrePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loadingForfaits, setLoadingForfaits] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])
  const [selectedOperators, setSelectedOperators] = useState(['orange', 'mtn', 'moov', 'wave'])

  const [formData, setFormData] = useState({
    categorie: 'streaming',
    service: 'netflix',
    titreOffre: '',
    forfaitId: '',
    prix: '',
    description: '',
    stock: '10',
    imageUrl: '',
  })

  useEffect(() => {
    if (!partenaireId) navigate('/backoffice/login')
  }, [partenaireId, navigate])

  useEffect(() => {
    const loadForfaits = async () => {
      try {
        setLoadingForfaits(true)
        const { data } = await forfaitsAPI.getAll(partenaireId)
        const items = Array.isArray(data) ? data : []
        setForfaitsDisponibles(items)
        if (!formData.forfaitId && items[0]?.id) {
          setFormData((state) => ({ ...state, forfaitId: String(items[0].id) }))
        }
      } catch {
        setForfaitsDisponibles([])
      } finally {
        setLoadingForfaits(false)
      }
    }
    loadForfaits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const selectedServiceMeta = getServiceMeta(formData.service)

  const handleServiceChange = (e) => {
    const serviceVal = e.target.value
    const meta = getServiceMeta(serviceVal)
    setFormData((prev) => ({
      ...prev,
      service: serviceVal,
      categorie: meta.category || prev.categorie,
      titreOffre: prev.titreOffre || `${meta.label} Abonnement`,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|gif|webp)/i.test(file.type)) {
      toast.error('Format image non supporté (PNG, JPG, WebP acceptés)')
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

  const toggleOperator = (opId) => {
    setSelectedOperators((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partenaireId) return

    if (!formData.forfaitId) {
      toast.error('Veuillez sélectionner un forfait pour définir la durée.')
      return
    }

    const prixNum = Number(formData.prix)
    if (!Number.isFinite(prixNum) || prixNum <= 0) {
      toast.error("Veuillez renseigner un prix de vente valide en FCFA pour l'offre.")
      return
    }

    if (!formData.titreOffre.trim()) {
      toast.error("Veuillez renseigner le titre de l'offre.")
      return
    }

    setLoading(true)
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

      await offresAPI.create({
        partenaireId,
        categorie: formData.categorie,
        service: formData.service,
        nomService: serviceMeta.label || formData.service,
        titreOffre: formData.titreOffre.trim(),
        description: formData.description?.trim() || `${serviceMeta.label} - ${forfait?.plan || 'Standard'}`,
        imageService: imageService || '',
        prixOriginal: prixNum,
        prixVente: prixNum,
        duree: Number(forfait?.duree || 1),
        typeCompte: formData.titreOffre.trim(),
        quantiteDisponible: parseInt(formData.stock, 10) || 0,
        forfaitId: Number(formData.forfaitId),
      })

      toast.success("Offre créée et mise en ligne avec succès !")
      navigate('/partenaire/offres')
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de la création de l'offre")
    } finally {
      setUploadingImage(false)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <PageHeader
        title="Créer une nouvelle offre"
        description="Associez un service à un forfait (modèle de durée) et définissez son prix de vente en FCFA."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="space-y-5 p-6">
          {/* Service & Catégorie */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">Service Digital / Marque</label>
              <Select
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                className="mt-1 w-full"
              >
                {SERVICES_MARKETPLACE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.category})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Catégorie Marketplace</label>
              <Select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="mt-1 w-full"
              >
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Titre de l'offre */}
          <div>
            <label className="text-xs font-bold text-foreground">Titre de l'offre</label>
            <Input
              name="titreOffre"
              value={formData.titreOffre}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Ex: Netflix Écran Solo 4K Ultra HD, Spotify Premium 1 Mois..."
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Le titre affiché aux clients sur la Marketplace.
            </p>
          </div>

          {/* Forfait & Prix de l'offre */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Forfait lié (Durée)</label>
                <button
                  type="button"
                  onClick={() => navigate('/partenaire/forfaits')}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  + Nouveau forfait
                </button>
              </div>

              {forfaitsDisponibles.length === 0 ? (
                <div className="mt-1 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                  Aucun forfait trouvé. Veuillez d'abord créer un forfait dans "Forfaits".
                </div>
              ) : (
                <Select
                  name="forfaitId"
                  value={formData.forfaitId}
                  onChange={handleChange}
                  className="mt-1 w-full"
                  disabled={loadingForfaits}
                >
                  {forfaitsDisponibles.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.plan} ({f.duree} {f.periode || 'MOIS'})
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Prix de l'offre (FCFA)</label>
              <Input
                type="number"
                min="1"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Ex: 3500"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Prix unitaire payé par le client en Mobile Money.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-foreground">Description & Conditions d'accès</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
              placeholder="Profil dédié, qualité Ultra HD, livraison instantanée par e-mail, instructions de connexion..."
            />
          </div>

          {/* Modes de paiement acceptés */}
          <div>
            <label className="text-xs font-bold text-foreground">Modes de paiement acceptés</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {OPERATOR_BADGES.map((op) => {
                const isSelected = selectedOperators.includes(op.id)
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => toggleOperator(op.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${op.badgeClass.split(' ')[0]}`} />
                    {op.label}
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Panneau Latéral : Stock & Image */}
        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <div>
              <label className="text-xs font-bold text-foreground">Stock disponible</label>
              <Input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Nombre de comptes/codes disponibles"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gérez vos identifiants dans la section "Stock & Identifiants".
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Visuel de l'offre</label>
              <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
                <input
                  id="offre-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="offre-image-input"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 py-4"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-h-40 w-full rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                        style={{ backgroundColor: selectedServiceMeta.color }}
                      >
                        {selectedServiceMeta.initials}
                      </div>
                      <span className="text-xs font-semibold text-primary">Téléverser une image personnalisée</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG ou WebP (max 5 Mo)</span>
                    </>
                  )}
                </label>
              </div>
              <Input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Ou coller une URL d'image"
                className="mt-3 text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || uploadingImage || forfaitsDisponibles.length === 0}
            >
              {loading || uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading || uploadingImage ? 'Publication en cours...' : "Publier l'offre"}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}
