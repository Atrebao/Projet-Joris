import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { partenairesAPI, offresAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function DashboardPartenaire() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    totalVentes: 0,
    totalClients: 0,
    totalOffres: 0,
  })
  const [offres, setOffres] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsResponse, offresResponse] = await Promise.all([
        partenairesAPI.getStats(user.id),
        offresAPI.getByPartenaire(user.id),
      ])
      
      setStats(statsResponse.data)
      setOffres(offresResponse.data.slice(0, 5)) // 5 dernières offres
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Chiffre d'affaires",
      value: formatPrice(stats.chiffreAffaires),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12%',
    },
    {
      title: 'Ventes totales',
      value: stats.totalVentes,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+8%',
    },
    {
      title: 'Clients actifs',
      value: stats.totalClients,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%',
    },
    {
      title: 'Offres actives',
      value: stats.totalOffres,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '→',
    },
  ]

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue {user?.prenoms} ! Voici un aperçu de votre activité.
          </p>
        </div>
        <Button onClick={() => navigate('/partenaire/offres/nouveau')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{stat.trend}</span>
                  <span className="ml-1">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Graphique CA (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du chiffre d'affaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              Graphique à implémenter avec recharts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dernières offres */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vos dernières offres</CardTitle>
          <Button variant="outline" onClick={() => navigate('/partenaire/offres')}>
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          {offres.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Vous n'avez pas encore créé d'offres
            </div>
          ) : (
            <div className="space-y-4">
              {offres.map((offre) => (
                <div
                  key={offre.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={offre.imageService}
                      alt={offre.nomService}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{offre.nomService}</p>
                      <p className="text-sm text-muted-foreground">
                        {offre.typeCompte} • {offre.duree} mois
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(offre.prixVente)}</p>
                    <p className="text-xs text-green-600">
                      +{formatPrice(offre.margePartenaire)} marge
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
