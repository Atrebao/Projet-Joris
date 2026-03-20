import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Filter, X, Star, MapPin, Clock } from 'lucide-react'
import { abonnementsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import ForfaitCard from '@/components/forfaitCard'

export default function Catalogue() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategorie, setSelectedCategorie] = useState(searchParams.get('categorie') || '')
  const [selectedDuree, setSelectedDuree] = useState('')
  const [selectedPrix, setSelectedPrix] = useState('')

  // Catégories
  const categories = [
    { value: '', label: 'Toutes' },
    { value: 'FILMS_SERIES', label: '🎬 Films & Séries' },
    { value: 'MUSIQUE', label: '🎵 Musique' },
    { value: 'GAMING', label: '🎮 Gaming' },
    { value: 'EBOOKS', label: '📚 Ebooks' },
    { value: 'SPORT', label: '⚽ Sport' },
  ]

  // Durées
  const durees = [
    { value: '', label: 'Toutes durées' },
    { value: '1', label: '1 mois' },
    { value: '3', label: '3 mois' },
    { value: '6', label: '6 mois' },
    { value: '12', label: '1 an' },
  ]

  // Prix
  const prix = [
    { value: '', label: 'Tous les prix' },
    { value: '0-5000', label: 'Moins de 5,000 F' },
    { value: '5000-10000', label: '5,000 - 10,000 F' },
    { value: '10000-20000', label: '10,000 - 20,000 F' },
    { value: '20000+', label: 'Plus de 20,000 F' },
  ]

  // Charger les offres depuis l'API
  useEffect(() => {
    const loadOffres = async () => {
      setLoading(true)

      try {
        const { data } = await abonnementsAPI.getAll()

        // Mapper les données backend vers le format frontend
        const offresFormatted = data.map(offre => ({
          id: offre.id,
          nom: offre.nom,
          categorie: offre.categorie,
          description: offre.description || `Profitez de ${offre.nom}`,
          image: offre.image || `https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(offre.nom)}`,
          icon: offre.icon,
          forfaits: offre.forfaits || [],
          // Utiliser le premier forfait pour affichage simplifié
          prixMensuel: offre.forfaits?.[0]?.prix || 0,
          duree: offre.forfaits?.[0]?.duree || 1,
          // Infos partenaire (si disponible)
          partenaire: offre.partenaire || { nom: 'RICHESSES', ville: 'Abidjan' },
          rating: 4.5,
          avis: Math.floor(Math.random() * 500) + 100,
        }))

        setOffres(offresFormatted)
      } catch (error) {
        console.error('Erreur chargement catalogue:', error)
        toast.error('Impossible de charger le catalogue')
        setOffres([])
      } finally {
        setLoading(false)
      }
    }

    loadOffres()
  }, [])

  // Filtrer les offres
  const offresFiltrees = offres.filter(offre => {
    // Filtre recherche
    if (searchQuery && !offre.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filtre catégorie
    if (selectedCategorie && offre.categorie !== selectedCategorie) {
      return false
    }

    // Filtre durée
    if (selectedDuree && offre.duree.toString() !== selectedDuree) {
      return false
    }

    // Filtre prix
    if (selectedPrix) {
      const [min, max] = selectedPrix.split('-')
      if (max === '+') {
        if (offre.prixMensuel < parseInt(min)) return false
      } else {
        if (offre.prixMensuel < parseInt(min) || offre.prixMensuel > parseInt(max)) {
          return false
        }
      }
    }

    return true
  })

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategorie('')
    setSelectedDuree('')
    setSelectedPrix('')
  }

  const handleOffreClick = (offreId) => {
    navigate(`/offre/${offreId}`)
  }

  // Fonction pour formater le prix
const formatPrix = (prix) => {
  if (!prix) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA'
}

// Obtenir le prix minimum d'une offre
const getPrixMin = (forfaits) => {
  if (!forfaits || forfaits.length === 0) return 0
  return Math.min(...forfaits.map(f => f.prix || 0))
}

// Obtenir la durée minimum
const getDureeMin = (forfaits) => {
  if (!forfaits || forfaits.length === 0) return 1
  return Math.min(...forfaits.map(f => f.duree || 999))
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catalogue des offres</h1>
          <p className="text-gray-600">
            {offresFiltrees.length} offre{offresFiltrees.length > 1 ? 's' : ''} disponible{offresFiltrees.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold">Filtres</h2>
            </div>
            {(selectedCategorie || selectedDuree || selectedPrix) && (
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée
              </label>
              <select
                value={selectedDuree}
                onChange={(e) => setSelectedDuree(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {durees.map(duree => (
                  <option key={duree.value} value={duree.value}>{duree.label}</option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix
              </label>
              <select
                value={selectedPrix}
                onChange={(e) => setSelectedPrix(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {prix.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des offres */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement des offres...</p>
          </div>
        ) : offresFiltrees.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {offresFiltrees.map(offre => (
    <div
      key={offre.id}
      onClick={() => handleOffreClick(offre.id)}
      className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
        <img
          src={offre.image}
          alt={offre.nom}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* NOM DU SERVICE EN GROS AU CENTRE */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <h3 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight text-center px-4">
            {offre.nom.split(' ').slice(0, 2).join(' ')}
          </h3>
        </div>
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold border">
          {categories.find(c => c.value === offre.categorie)?.label || offre.categorie}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 rounded-full">
          <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
          <span className="text-xs font-bold text-yellow-900">{offre.rating}</span>
        </div>
        {offre.stock < 10 && offre.stock > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Plus que {offre.stock} en stock !
          </div>
        )}
        {offre.stock === 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full">
            Rupture de stock
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-bold mb-2 line-clamp-1">{offre.nom}</h4>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {offre.description}
        </p>

        {/* Infos partenaire */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 pb-3 border-b">
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span className="truncate">{offre.partenaire?.nom || 'RICHESSES'}</span>
          </div>
          {offre.partenaire?.ville && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{offre.partenaire.ville}</span>
              </div>
            </>
          )}
        </div>


        {/* Affichage des forfaits */}
        {offre.forfaits && offre.forfaits.length > 0 && (
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {offre.forfaits.slice(0, 3).map(forfait => (
                <div
                  key={forfait.id}
                  className="flex-1 min-w-[80px] bg-gray-50 rounded-lg p-2 text-center border border-gray-200"
                >
                  <div className="text-xs text-gray-500">{forfait.duree} mois</div>
                  <div className="text-sm font-bold text-indigo-600">
                    {formatPrix(forfait.prix)}
                  </div>
                  {forfait.plan && (
                    <div className="text-xs text-gray-500 truncate">{forfait.plan}</div>
                  )}
                </div>
              ))}
            </div>
            
            {offre.forfaits.length > 3 && (
              <div className="text-center text-xs text-gray-500 mb-3">
                +{offre.forfaits.length - 3} autres formules
              </div>
            )}
          </div>
        )}

        {/* Bouton voir détails */}
        <button 
          className="w-full mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleOffreClick(offre.id);
          }}
        >
          Voir les détails
        </button>
      </div>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
  )
}

