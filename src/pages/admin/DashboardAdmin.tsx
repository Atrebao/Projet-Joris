import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { statsAPI, partenairesAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Users,
  Store,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function DashboardAdmin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPartenaires: 0,
    partenairesEnAttente: 0,
    totalClients: 0,
    totalSouscriptions: 0,
    chiffreAffairesTotal: 0,
    chiffreAffairesMois: 0,
  })
  const [partenairesEnAttente, setPartenairesEnAttente] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsResponse, partenairesResponse] = await Promise.all([
        statsAPI.global(),
        partenairesAPI.getAll(),
      ])
      
      setStats(statsResponse.data)
      
      // Filtrer partenaires en attente de validation
      const enAttente = partenairesResponse.data.filter(
        (p) => !p.isValidated
      )
      setPartenairesEnAttente(enAttente)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidatePartenaire = async (id: number) => {
    try {
      await partenairesAPI.validate(id)
      loadData() // Recharger les données
    } catch (error) {
      console.error('Erreur validation partenaire:', error)
    }
  }

  const statsCards = [
    {
      title: 'Partenaires actifs',
      value: stats.totalPartenaires,
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/admin/partenaires'),
    },
    {
      title: 'Clients totaux',
      value: stats.totalClients,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => navigate('/admin/clients'),
    },
    {
      title: 'CA Total',
      value: formatPrice(stats.chiffreAffairesTotal),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Souscriptions',
      value: stats.totalSouscriptions,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => navigate('/admin/souscriptions'),
    },
  ]

  if (loading) {
    return <LoadingSpinner text="Chargement du tableau de bord..." />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`overflow-hidden ${stat.action ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
              onClick={stat.action}
            >
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
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span>+15% vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Partenaires en attente de validation */}
      {partenairesEnAttente.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <CardTitle>
                  Partenaires en attente de validation ({partenairesEnAttente.length})
                </CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/partenaires')}
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partenairesEnAttente.slice(0, 5).map((partenaire) => (
                <div
                  key={partenaire.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4"
                >
                  <div className="flex items-center gap-4">
                    {partenaire.logo ? (
                      <img
                        src={partenaire.logo}
                        alt={partenaire.nomBoutique}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{partenaire.nomBoutique}</p>
                      <p className="text-sm text-muted-foreground">
                        {partenaire.nom} {partenaire.prenoms} • {partenaire.ville}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {formatDate(partenaire.dateCreation)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600">
                      En attente
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleValidatePartenaire(partenaire.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Valider
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Graphique à implémenter
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Graphique à implémenter
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/admin/partenaires')}
            >
              <Store className="mb-2 h-5 w-5" />
              Gérer les partenaires
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/admin/clients')}
            >
              <Users className="mb-2 h-5 w-5" />
              Gérer les clients
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/admin/souscriptions')}
            >
              <ShoppingCart className="mb-2 h-5 w-5" />
              Voir les souscriptions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
