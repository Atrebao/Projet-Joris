import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ImagePlus, Loader2 } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function NouvelleOffrePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: 'FILMS_SERIES',
    prixOriginal: '',
    prixVente: '',
    duree: '1',
    stock: '0',
    imageUrl: ''
  })

  useEffect(() => {
    if (!partenaireId) navigate('/backoffice/login')
  }, [partenaireId, navigate])

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|gif|webp)/i.test(file.type)) {
      toast.error('Format image non supporté (jpg, png, gif, webp)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partenaireId) return
    if (!imageFile && !formData.imageUrl?.trim()) {
      toast.error('Ajoutez une photo de l’offre ou une URL d’image')
      return
    }
    setLoading(true)
    try {
      let imageService = formData.imageUrl?.trim()
      if (imageFile) {
        setUploadingImage(true)
        const { data: up } = await offresAPI.uploadImage(imageFile)
        imageService = `${API_BASE}${up.url}`
        setUploadingImage(false)
      }
      if (!imageService) {
        imageService = 'https://via.placeholder.com/400x250?text=Offre'
      } else if (!imageService.startsWith('http')) {
        imageService = `${API_BASE}${imageService.startsWith('/') ? '' : '/'}${imageService}`
      }

      const prixOrig = parseFloat(formData.prixOriginal) || 0
      const prixV = parseFloat(formData.prixVente) || 0
      await offresAPI.create({
        partenaireId,
        nomService: formData.nom,
        categorie: formData.categorie,
        description: formData.description || undefined,
        imageService,
        prixOriginal: prixOrig,
        prixVente: prixV,
        duree: parseInt(formData.duree) || 1,
        typeCompte: 'Standard',
        quantiteDisponible: parseInt(formData.stock) || 0
      })
      toast.success('Offre créée avec succès')
      navigate('/partenaire/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la création')
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-2">Créer une nouvelle offre</h1>
          <p className="text-gray-600 mb-8">Remplissez les informations de votre offre</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de l'offre *
              </label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Netflix Premium 1 mois"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Décrivez votre offre..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  required
                  value={formData.categorie}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                >
                  <option value="FILMS_SERIES">Films & Séries</option>
                  <option value="MUSIQUE">Musique</option>
                  <option value="GAMING">Gaming</option>
                  <option value="EBOOKS">Ebooks</option>
                  <option value="SPORT">Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Durée (mois) *
                </label>
                <select
                  name="duree"
                  required
                  value={formData.duree}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                >
                  <option value="1">1 mois</option>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix coûtant (FCFA) *
                </label>
                <input
                  type="number"
                  name="prixOriginal"
                  required
                  value={formData.prixOriginal}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix de vente (FCFA) *
                </label>
                <input
                  type="number"
                  name="prixVente"
                  required
                  value={formData.prixVente}
                  onChange={handleChange}
                  placeholder="7000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo de l&apos;offre *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="offre-image-input"
                />
                <label
                  htmlFor="offre-image-input"
                  className="flex flex-col items-center justify-center cursor-pointer gap-2"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="max-h-48 rounded-lg shadow-md object-contain" />
                  ) : (
                    <>
                      <ImagePlus className="h-12 w-12 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Cliquez pour choisir une image (max 5 Mo)</span>
                    </>
                  )}
                </label>
                {imageFile && (
                  <p className="text-center text-xs text-gray-500 mt-2">{imageFile.name}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Ou collez une URL (optionnel si vous avez déjà une image en ligne)</p>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://... (optionnel)"
                className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading || uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {uploadingImage ? "Envoi de l'image..." : loading ? 'Création...' : "Créer l'offre"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
