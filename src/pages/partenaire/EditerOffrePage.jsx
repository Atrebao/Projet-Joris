import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES, OPERATOR_BADGES, SERVICES_MARKETPLACE, getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { API_URL, forfaitsAPI, offresAPI } from '../../lib/api'
import { Button, Card, Input, LoadingState, PageHeader, Select } from '../../components/saas/SaasPrimitives'

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
        const [offreRes, forfaitsRes] = await Promise.all([
          offresAPI.getOne(Number(id)),
          forfaitsAPI.getAll(partenaireId),
        ])

        const offre = offreRes.data || {}
        const forfaits = Array.isArray(forfaitsRes.data) ? forfaitsRes.data : []
        setForfaitsDisponibles(forfaits)

        const currentForfaitId =
          offre.forfaitOffres?.[0]?.forfait?.id ||
          offre.forfaits?.[0]?.id ||
          offre.forfaitId ||
          forfaits[0]?.id ||
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

  const toggleOperator = (opId) => {
    setSelectedOperators((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.forfaitId) {
      toast.error('Veuillez sélectionner un forfait')
      return
    }

    const prixNum = Number(formData.prix)
    if (!Number.isFinite(prixNum) || prixNum <= 0) {
      toast.error("Veuillez renseigner un prix de vente valide pour l'offre")
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
        description: formData.description?.trim() || undefined,
        imageService: imageService || undefined,
        prixOriginal: prixNum,
        prixVente: prixNum,
        duree: Number(forfait?.duree || 1),
        typeCompte: formData.titreOffre.trim(),
        quantiteDisponible: parseInt(formData.stock, 10) || 0,
        forfaitId: Number(formData.forfaitId),
      })

      toast.success('Offre mise à jour avec succès')
      navigate('/partenaire/offres')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour de l’offre')
    } finally {
      setUploadingImage(false)
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Chargement de l'offre..." />

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
        title={`Modifier l'offre #${id}`}
        description="Mettez à jour le service, le forfait lié, le prix et les informations de votre offre."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="space-y-5 p-6">
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

          <div>
            <label className="text-xs font-bold text-foreground">Titre de l'offre</label>
            <Input
              name="titreOffre"
              value={formData.titreOffre}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Forfait lié (Durée)</label>
                <button
                  type="button"
                  onClick={() => navigate('/partenaire/forfaits')}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Gérer forfaits
                </button>
              </div>

              <Select
                name="forfaitId"
                value={formData.forfaitId}
                onChange={handleChange}
                className="mt-1 w-full"
              >
                {forfaitsDisponibles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.plan} ({f.duree} {f.periode || 'MOIS'})
                  </option>
                ))}
              </Select>
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
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
            />
          </div>

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
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Visuel de l'offre</label>
              <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
                <input
                  id="offre-edit-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="offre-edit-image"
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
                      <span className="text-xs font-semibold text-primary">Changer l'image</span>
                    </>
                  )}
                </label>
              </div>
              <Input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Ou coller une URL"
                className="mt-3 text-xs"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting || uploadingImage}>
              {submitting || uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting || uploadingImage ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}
