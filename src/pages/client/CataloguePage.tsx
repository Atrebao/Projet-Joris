import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OffreCard } from '@/components/client/OffreCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { offresAPI } from '@/lib/api'
import { CATEGORIES, DUREES } from '@/lib/utils'
import { Search, Filter, X, PackageOpen } from 'lucide-react'

export function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [offres, setOffres] = useState([])
  const [filteredOffres, setFilteredOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategorie, setSelectedCategorie] = useState(
    searchParams.get('categorie') || 'all'
  )
  const [selectedDuree, setSelectedDuree] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    loadOffres()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [offres, searchQuery, selectedCategorie, selectedDuree, priceRange])

  const loadOffres = async () => {
    try {
      const response = await offresAPI.getAll()
      setOffres(response.data)
    } catch (error) {
      console.error('Erreur chargement offres:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...offres]

    // Recherche par texte
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (offre) =>
          offre.nomService.toLowerCase().includes(query) ||
          offre.partenaire?.nomBoutique.toLowerCase().includes(query)
      )
    }

    // Filtre catégorie
    if (selectedCategorie !== 'all') {
      filtered = filtered.filter((offre) => offre.categorie === selectedCategorie)
    }

    // Filtre durée
    if (selectedDuree !== 'all') {
      filtered = filtered.filter((offre) => offre.duree === parseInt(selectedDuree))
    }

    // Filtre prix
    if (priceRange.min) {
      filtered = filtered.filter((offre) => offre.prixVente >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter((offre) => offre.prixVente <= parseFloat(priceRange.max))
    }

    setFilteredOffres(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategorie('all')
    setSelectedDuree('all')
    setPriceRange({ min: '', max: '' })
    setSearchParams({})
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategorie !== 'all' ||
    selectedDuree !== 'all' ||
    priceRange.min ||
    priceRange.max

  if (loading) {
    return <LoadingSpinner text="Chargement du catalogue..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catalogue complet</h1>
          <p className="text-muted-foreground">
            {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} disponible
            {filteredOffres.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Filtres</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Netflix, Spotify..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Catégorie */}
            <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Durée */}
            <Select value={selectedDuree} onValueChange={setSelectedDuree}>
              <SelectTrigger>
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les durées</SelectItem>
                {DUREES.map((duree) => (
                  <SelectItem key={duree} value={duree.toString()}>
                    {duree} mois
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Prix */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
              />
            </div>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategorie !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {CATEGORIES.find((c) => c.value === selectedCategorie)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedCategorie('all')}
                  />
                </Badge>
              )}
              {selectedDuree !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedDuree} mois
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedDuree('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Grille d'offres */}
        {filteredOffres.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="Aucune offre trouvée"
            description="Essayez de modifier vos filtres pour voir plus de résultats"
            actionLabel="Réinitialiser les filtres"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOffres.map((offre) => (
              <OffreCard key={offre.id} offre={offre} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
