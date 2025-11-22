import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader } from 'lucide-react'

export default function EditerOffrePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: 'FILMS_SERIES',
    prix: '',
    duree: '1',
    stock: '',
    imageUrl: ''
  })

  useEffect(() => {
    // Simuler le chargement de l'offre
    setTimeout(() => {
      // Données mockées
      setFormData({
        nom: 'Netflix Premium',
        description: 'Abonnement Netflix Premium avec 4 écrans simultanés et qualité 4K Ultra HD',
        categorie: 'FILMS_SERIES',
        prix: '7000',
        duree: '1',
        stock: '15',
        imageUrl: 'https://picsum.photos/400/300'
      })
      setLoading(false)
    }, 500)
  }, [id])

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Appel API pour mettre à jour l'offre
    alert('Offre mise à jour : ' + formData.nom)
    navigate('/partenaire')
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
          <Loader className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
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
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  name="prix"
                  required
                  value={formData.prix}
                  onChange={handleChange}
                  placeholder="7000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
              />
              {formData.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={formData.imageUrl} 
                    alt="Aperçu" 
                    className="w-48 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                Enregistrer les modifications
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
