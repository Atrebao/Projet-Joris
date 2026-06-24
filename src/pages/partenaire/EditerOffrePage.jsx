import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader, ImagePlus } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, forfaitsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function EditerOffrePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingForfaits, setLoadingForfaits] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])
  const [selectedForfaitIds, setSelectedForfaitIds] = useState([])
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: 'FILMS_SERIES',
    duree: '1',
    stock: '0',
    imageUrl: ''
  })

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    const loadOffre = async () => {
      try {
        const { data } = await offresAPI.getOne(Number(id))
        setFormData({
          nom: data.nomService || '',
          description: data.description || '',
          categorie: data.categorie || 'FILMS_SERIES',
          duree: String(data.duree ?? '1'),
          stock: String(data.quantiteDisponible ?? '0'),
          imageUrl: data.imageService || ''
        })
        const currentForfaitIds = (data.forfaitOffres || [])
          .map((fo) => fo?.forfait?.id)
          .filter(Boolean)
        setSelectedForfaitIds(currentForfaitIds)
      } catch (error) {
        toast.error('Offre introuvable')
        navigate('/partenaire/dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadOffre()
  }, [id, partenaireId, navigate])

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
      toast.error('Format image non supportÃ©')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const toggleForfait = (idValue) => {
    setSelectedForfaitIds((prev) =>
      prev.includes(idValue) ? prev.filter((x) => x !== idValue) : [...prev, idValue],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedForfaitIds.length === 0) {
      toast.error('Selectionnez au moins un forfait')
      return
    }
    setSubmitting(true)
    try {
      let imageService = formData.imageUrl?.trim() || 'https://via.placeholder.com/400x250'
      if (imageFile) {
        const { data: up } = await offresAPI.uploadImage(imageFile)
        imageService = `${API_BASE}${up.url}`
      }
      const selectedForfaits = forfaitsDisponibles.filter((f) => selectedForfaitIds.includes(f.id))
      const dureeOffre = selectedForfaits.length > 0
        ? Math.min(...selectedForfaits.map((f) => Number(f.duree || 1)))
        : parseInt(formData.duree) || 1
      const prixBase = selectedForfaits.length > 0
        ? Math.min(...selectedForfaits.map((f) => Number(f.prix || 0)))
        : 0

      await offresAPI.update(Number(id), {
        nomService: formData.nom,
        description: formData.description || undefined,
        categorie: formData.categorie,
        imageService,
        prixOriginal: prixBase,
        prixVente: prixBase,
        duree: dureeOffre,
        quantiteDisponible: parseInt(formData.stock) || 0,
        forfaitIds: selectedForfaitIds,
      })
      toast.success('Offre mise Ã  jour')
      navigate('/partenaire/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise Ã  jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">Chargement de l'offre...</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modifier l&apos;offre</h1>
        <p className="text-slate-500 text-sm mt-1">Offre ID: <code className="bg-slate-100 font-mono text-xs px-1.5 py-0.5 rounded text-slate-700">#{id}</code></p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* COLONNE GAUCHE : Informations principales (2/3) */}
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
                rows="5"
                placeholder="Décrivez votre offre..."
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Catégorie & Durée */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Catégorie <span className="text-destructive">*</span>
                </label>
                <select
                  name="categorie"
                  required
                  value={formData.categorie}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="FILMS_SERIES">Films & Séries</option>
                  <option value="MUSIQUE">Musique</option>
                  <option value="GAMING">Gaming</option>
                  <option value="EBOOKS">Ebooks</option>
                  <option value="SPORT">Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Durée (mois) <span className="text-destructive">*</span>
                </label>
                <select
                  name="duree"
                  required
                  value={formData.duree}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="1">1 mois</option>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                </select>
              </div>
            </div>

            {/* Section Forfaits liés */}
            <div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Forfaits liés <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">Le prix client est défini automatiquement par les forfaits liés.</p>
              </div>
              
              <div className="max-h-56 space-y-2 overflow-auto rounded-lg border border-border bg-slate-50/50 p-4">
                {loadingForfaits ? (
                  <div className="text-sm text-slate-500 flex items-center gap-2 py-2">
                    <Loader className="h-4 w-4 animate-spin text-primary" /> Chargement des forfaits...
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

        {/* COLONNE DROITE : Paramètres & Médias (1/3) */}
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
                Photo de l&apos;offre
              </label>
              
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 transition-colors hover:border-primary/50">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="edit-offre-img" />
                <label htmlFor="edit-offre-img" className="flex flex-col items-center justify-center cursor-pointer gap-2 py-4">
                  {imagePreview ? (
                    <div className="relative group w-full">
                      <img src={imagePreview} alt="Aperçu" className="max-h-40 w-full rounded-lg object-contain shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Remplacer la nouvelle image</span>
                      </div>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="relative group w-full">
                      <img src={formData.imageUrl} alt="Actuelle" className="max-h-40 w-full rounded-lg object-contain shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Changer l&apos;image actuelle</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
                        <ImagePlus className="h-6 w-6 text-slate-500" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Ajouter une image</span>
                    </>
                  )}
                </label>
              </div>
              
              {/* URL alternative */}
              <div className="mt-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Ou modifier par URL</label>
                <input
                                    type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Statut / Informations supplémentaires */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Statut de l&apos;offre
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`h-2.5 w-2.5 rounded-full ${formData.statut === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-sm font-medium text-slate-700">
                  {formData.statut === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
                <button
                  type="button"
                  onClick={() => {/* Logique toggle statut */}}
                  className="ml-auto text-xs text-primary font-semibold hover:underline"
                >
                  Changer
                </button>
              </div>
            </div>

            {/* Date de création / modification */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Créé le</span>
                <span className="font-mono">{new Date(formData.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Dernière modification</span>
                <span className="font-mono">{new Date(formData.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

          </div>

          {/* Bloc des actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-lg border border-border bg-card px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              Annuler
            </button>

            {/* Bouton de suppression (optionnel) */}
            <button
              type="button"
              onClick={() => {/* Logique suppression */}}
              className="w-full rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-3 font-semibold text-destructive transition hover:bg-destructive/10 hover:border-destructive/30 text-sm"
            >
              Supprimer l&apos;offre
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
);

}
