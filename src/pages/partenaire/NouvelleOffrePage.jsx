import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ImagePlus, Loader2 } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, forfaitsAPI, API_URL } from '../../lib/api'
import toast from 'react-hot-toast'

export default function NouvelleOffrePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loadingForfaits, setLoadingForfaits] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])
  const [selectedForfaitIds, setSelectedForfaitIds] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    duree: '1',
    stock: '0',
    imageUrl: ''
  })

  useEffect(() => {
    if (!partenaireId) navigate('/backoffice/login')
  }, [partenaireId, navigate])

  useEffect(() => {
    const loadForfaits = async () => {
      try {
        setLoadingForfaits(true)
        const { data } = await forfaitsAPI.getAll(formData.categorie)
        setForfaitsDisponibles(Array.isArray(data) ? data : [])
      } catch {
        setForfaitsDisponibles([])
      } finally {
        setLoadingForfaits(false)
      }
    }
    loadForfaits()
  }, [formData.categorie])


  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|gif|webp)/i.test(file.type)) {
      toast.error('Format image non supportÃ© (jpg, png, gif, webp)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const toggleForfait = (id) => {
    setSelectedForfaitIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partenaireId) return
    if (!imageFile && !formData.imageUrl?.trim()) {
      toast.error('Ajoutez une photo de lâ€™offre ou une URL dâ€™image')
      return
    }
    if (selectedForfaitIds.length === 0) {
      toast.error('Selectionnez au moins un forfait')
      return
    }
    setLoading(true)
    try {
      let imageService = formData.imageUrl?.trim()
      if (imageFile) {
        setUploadingImage(true)
        const { data: up } = await offresAPI.uploadImage(imageFile)
        imageService = `${API_URL}${up.url}`
        setUploadingImage(false)
      }
      if (!imageService) {
        imageService = 'https://via.placeholder.com/400x250?text=Offre'
      } else if (!imageService.startsWith('http')) {
        imageService = `${API_URL}${imageService.startsWith('/') ? '' : '/'}${imageService}`
      }

      const selectedForfaits = forfaitsDisponibles.filter((f) => selectedForfaitIds.includes(f.id))
      const dureeOffre = selectedForfaits.length > 0
        ? Math.min(...selectedForfaits.map((f) => Number(f.duree || 1)))
        : parseInt(formData.duree) || 1
      const prixBase = selectedForfaits.length > 0
        ? Math.min(...selectedForfaits.map((f) => Number(f.prix || 0)))
        : 0
      await offresAPI.create({
        partenaireId,
        nomService: formData.nom,
        description: formData.description || undefined,
        imageService,
        prixOriginal: prixBase,
        prixVente: prixBase,
        duree: dureeOffre,
        typeCompte: 'Standard',
        quantiteDisponible: parseInt(formData.stock) || 0,
        forfaitIds: selectedForfaitIds,
      })
      toast.success('Offre crÃ©Ã©e avec succÃ¨s')
      navigate('/partenaire/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la crÃ©ation')
    } finally {
      setUploadingImage(false)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

return (
  <div className="space-y-6">
    <div className="mx-auto max-w-6xl">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      {/* En-tête du formulaire */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Créer une nouvelle offre</h1>
        <p className="text-slate-500 text-sm mt-1">Remplissez les informations essentielles de votre offre de marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* COLONNE GAUCHE : Informations principales (Prend 2/3 de l'espace) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
            
            {/* Nom de l'offre */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nom de l&apos;offre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Netflix Premium 1 mois"
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Décrivez précisément ce que contient votre offre (nombre d'écrans, qualité, validité...)"
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Section Forfaits liés */}
            <div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Forfaits liés <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">Le prix client est défini automatiquement par les forfaits liés.</p>
              </div>
              
              <div className="max-h-60 space-y-2 overflow-auto rounded-lg border border-border bg-slate-50/50 p-4">
                {loadingForfaits ? (
                  <div className="text-sm text-slate-500 flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Chargement des forfaits...
                  </div>
                ) : forfaitsDisponibles.length === 0 ? (
                  <div className="text-sm text-slate-500 py-2">Aucun forfait disponible pour cette catégorie.</div>
                ) : (
                  forfaitsDisponibles.map((f) => (
                    <label 
                      key={f.id} 
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition ${
                        selectedForfaitIds.includes(f.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                          checked={selectedForfaitIds.includes(f.id)}
                          onChange={() => toggleForfait(f.id)}
                        />
                        <span className="text-sm font-semibold text-slate-900">{f.plan}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                        {Number(f.prix || 0).toLocaleString()} FCFA <span className="text-xs font-normal text-slate-500">/ {f.duree} {f.periode || 'MOIS'}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* COLONNE DROITE : Média & Stockage (Prend 1/3 de l'espace, collante au défilement) */}
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            
            {/* Stock disponible */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Stock disponible <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Photo de l'offre */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Photo de l&apos;offre <span className="text-destructive">*</span>
              </label>
              
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 transition-colors hover:border-primary/50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="offre-image-input"
                />
                <label
                  htmlFor="offre-image-input"
                  className="flex flex-col items-center justify-center cursor-pointer gap-2 py-4"
                >
                  {imagePreview ? (
                    <div className="relative group w-full">
                      <img src={imagePreview} alt="Aperçu" className="max-h-40 w-full rounded-lg object-cover shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Changer d&apos;image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
                        <ImagePlus className="h-6 w-6 text-slate-500" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 text-center">Cliquez pour téléverser</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP jusqu&apos;à 5 Mo</span>
                    </>
                  )}
                </label>
                {imageFile && !imagePreview && (
                  <p className="text-center text-xs font-medium text-slate-600 mt-2 truncate">{imageFile.name}</p>
                )}
              </div>

              {/* URL Alternative */}
              <div className="mt-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Ou coller le lien d&apos;une image existante
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://exemple.com"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Bouton d'action principal */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-bold text-primary-foreground transition hover:bg-primary/90 shadow-sm disabled:opacity-50"
              >
                {loading || uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {loading || uploadingImage ? "Enregistrement..." : "Enregistrer l'offre"}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  </div>
);

}


