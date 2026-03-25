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
    prixOriginal: '',
    prixVente: '',
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
          prixOriginal: String(data.prixOriginal ?? ''),
          prixVente: String(data.prixVente ?? ''),
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
      toast.error('Format image non supporté')
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
      await offresAPI.update(Number(id), {
        nomService: formData.nom,
        description: formData.description || undefined,
        categorie: formData.categorie,
        imageService,
        prixOriginal: parseFloat(formData.prixOriginal) || 0,
        prixVente: parseFloat(formData.prixVente) || 0,
        duree: parseInt(formData.duree) || 1,
        quantiteDisponible: parseInt(formData.stock) || 0,
        forfaitIds: selectedForfaitIds,
      })
      toast.success('Offre mise à jour')
      navigate('/partenaire/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-slate-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'offre...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Modifier l'offre</h1>
            <p className="text-gray-600">Offre ID: #{id}</p>
          </div>

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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
                >
                  <option value="1">1 mois</option>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forfaits lies *
              </label>
              <div className="border-2 border-gray-200 rounded-lg p-4 max-h-56 overflow-auto space-y-2">
                {loadingForfaits ? (
                  <div className="text-sm text-gray-500">Chargement des forfaits...</div>
                ) : forfaitsDisponibles.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun forfait disponible pour cette categorie.</div>
                ) : (
                  forfaitsDisponibles.map((f) => (
                    <label key={f.id} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedForfaitIds.includes(f.id)}
                          onChange={() => toggleForfait(f.id)}
                        />
                        <span className="text-sm font-medium">{f.plan}</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {Number(f.prix || 0).toLocaleString()} FCFA / {f.duree} {f.periode || 'MOIS'}
                      </span>
                    </label>
                  ))
                )}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo de l&apos;offre
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 mb-3">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="edit-offre-img" />
                <label htmlFor="edit-offre-img" className="flex flex-col items-center cursor-pointer gap-2">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="max-h-40 rounded-lg" />
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="max-h-40 rounded-lg object-contain" />
                  ) : (
                    <>
                      <ImagePlus className="h-10 w-10 text-slate-400" />
                      <span className="text-sm text-slate-600">Remplacer l&apos;image</span>
                    </>
                  )}
                </label>
              </div>
              <label className="block text-xs text-gray-500 mb-1">Ou URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {submitting ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
