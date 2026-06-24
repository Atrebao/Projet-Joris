import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader } from '../../components/saas/SaasPrimitives'
import { souscriptionsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function CommandesPartenairePage() {
  const navigate = useNavigate()
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCommandes = async () => {
      try {
        setLoading(true)
        const { data } = await souscriptionsAPI.getAll()
        setCommandes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Erreur chargement commandes partenaire :', error)
        toast.error('Impossible de charger les commandes')
        setCommandes([])
      } finally {
        setLoading(false)
      }
    }

    loadCommandes()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description="Suivez les commandes client et leur statut de paiement."
        action={
          <Button variant="secondary" onClick={() => navigate('/partenaire')}>Retour au tableau de bord</Button>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Chargement des commandes...
        </div>
      ) : commandes.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aucune commande pour le moment"
          description="Dès qu’une commande est passée, elle apparaîtra ici pour suivi et livraison."
          action={
            <Button onClick={() => navigate('/partenaire')}>Voir le tableau de bord</Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {commandes.map((commande) => (
            <Card key={commande.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="text-lg font-semibold text-foreground">{commande.reference || 'N/A'}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Statut : {commande.etatSouscription || commande.statutPaiement || 'Inconnu'}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:justify-between sm:items-center">
                <div>{commande.abonnement?.nom || 'Offre'}</div>
                <div className="flex items-center gap-2">
                  <span>{new Date(commande.dateCreation || commande.date).toLocaleDateString('fr-FR')}</span>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/partenaire/commandes')}>
                    Voir plus <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
