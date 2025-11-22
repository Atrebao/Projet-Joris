import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Star } from 'lucide-react'
import { formatPrice, CATEGORIES } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface OffreCardProps {
  offre: {
    id: number
    nomService: string
    imageService: string
    categorie: string
    prixVente: number
    duree: number
    typeCompte: string
    partenaire: {
      nomBoutique: string
      ville: string
      logo?: string
    }
  }
}

export function OffreCard({ offre }: OffreCardProps) {
  const navigate = useNavigate()
  const categorie = CATEGORIES.find((c) => c.value === offre.categorie)
  const prixMensuel = offre.prixVente / offre.duree

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
      {/* Image avec overlay gradient */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={offre.imageService}
          alt={offre.nomService}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badge catégorie */}
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
          {categorie?.icon} {categorie?.label}
        </Badge>

        {/* Badge populaire (optionnel) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <Star className="h-3 w-3 fill-current" />
          Populaire
        </div>

        {/* Nom du service */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {offre.nomService}
          </h3>
        </div>
      </div>

      {/* Contenu */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {offre.partenaire.logo ? (
              <img
                src={offre.partenaire.logo}
                alt={offre.partenaire.nomBoutique}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{offre.partenaire.nomBoutique}</p>
              <p className="text-xs text-muted-foreground">{offre.partenaire.ville}</p>
            </div>
          </div>
          <Badge variant="secondary">{offre.typeCompte}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{offre.duree} mois d'abonnement</span>
        </div>
      </CardContent>

      {/* Footer avec prix */}
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(offre.prixVente)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatPrice(prixMensuel)}/mois
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate(`/offre/${offre.id}`)}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Souscrire
        </Button>
      </CardFooter>
    </Card>
  )
}
