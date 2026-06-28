import { useEffect, useMemo, useState } from 'react'
import { Filter, Clock, CheckCircle, Receipt, ChevronLeft, ChevronRight} from 'lucide-react'
import toast from 'react-hot-toast'
import { partenairesAPI, souscriptionsAPI } from '../../lib/api'
import { Button, Card, DataTable, LoadingState, PageHeader, Select, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function CommandesAdminPage() {
  const [activeTab, setActiveTab] = useState('tout')
  const [partenaireId, setPartenaireId] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d'éléments par page

  useEffect(() => {
    const loadPartenaires = async () => {
      try {
        const { data } = await partenairesAPI.getAll()
        setPartenaires(Array.isArray(data) ? data : [])
      } catch {
        setPartenaires([])
      }
    }
    loadPartenaires()
  }, [])

  useEffect(() => {
    const loadCommandes = async () => {
      setLoading(true)
      try {
        const params = {}
        if (partenaireId) params.partenaire = Number(partenaireId)
        if (activeTab === 'attente') params.isLivred = false
        if (activeTab === 'livrees') params.isLivred = true

        const { data } = await souscriptionsAPI.getAll(params)
        setCommandes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Erreur chargement commandes admin:', error)
        toast.error('Impossible de charger les commandes')
        setCommandes([])
      } finally {
        setLoading(false)
      }
    }

    loadCommandes()
  }, [activeTab, partenaireId])

  const stats = useMemo(() => {
    const attente = commandes.filter((c) => c.statutPaiement === 'SUCCES' && !c.isLivred).length
    const livrees = commandes.filter((c) => c.isLivred).length
    return { attente, livrees, total: commandes.length }
  }, [commandes])



// ... (vos états, hooks, fonctions existantes)

// LOGIQUE DE PAGINATION : Calculs des index
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// Découpage du tableau des commandes pour la page actuelle
const currentCommandes = commandes.slice(indexOfFirstItem, indexOfLastItem);
// Calcul du nombre total de pages
const totalPages = Math.ceil(commandes.length / itemsPerPage);

// Fonction pour changer de page en toute sécurité
const paginate = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }
};

return (
  <div className="space-y-6 max-w-7xl mx-auto">
    {/* En-tête de la page */}
    <PageHeader
      title="Commandes"
      description="Vue globale des commandes, paiements et livraisons."
      action={
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select 
            value={partenaireId} 
            onChange={(e) => {
              setPartenaireId(e.target.value);
              setCurrentPage(1); // Réinitialise à la page 1 lors d'un filtrage
            }}
            className="rounded-xl border-input bg-card text-xs w-56 font-semibold text-slate-700"
          >
            <option value="">Tous les partenaires</option>
            {partenaires.map((p) => (
              <option key={p.id} value={p.id}>{p.nomBoutique || p.nom}</option>
            ))}
          </Select>
        </div>
      }
    />

    {/* Sélecteur d'onglets (Filtres d'état) */}
    <Card className="p-1.5 shadow-sm border border-border bg-card max-w-fit rounded-xl">
      <div className="flex flex-wrap gap-1">
        {[
          { id: 'attente', label: `À livrer (${stats.attente})`, icon: Clock },
          { id: 'livrees', label: `Livrées (${stats.livrees})`, icon: CheckCircle },
          { id: 'tout', label: `Tout voir (${stats.total})`, icon: Receipt }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button 
              key={tab.id} 
              variant={isActive ? 'primary' : 'ghost'} 
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1); // Réinitialise à la page 1 lors du changement d'onglet
              }}
              className={`rounded-lg font-bold text-xs gap-2 py-2 px-3.5 ${
                isActive ? 'shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </Card>

    {/* Section Données / Tableau */}
    <Card className="p-1 border border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
      {loading ? (
        <LoadingState label="Chargement des commandes..." />
      ) : (
        <>
          {/* Notez qu'on passe 'currentCommandes' et non plus 'commandes' */}
          <DataTable
            data={currentCommandes}
            emptyLabel="Aucune commande trouvée"
            columns={[
              { 
                key: 'reference', 
                label: 'Référence', 
                render: (c) => (
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                    {c.reference || '-'}
                  </span>
                ) 
              },
              { 
                key: 'client', 
                label: 'Client', 
                render: (c) => (
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">{`${c?.client?.nom || ''} ${c?.client?.prenoms || ''}`.trim() || '-'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{c?.client?.email || c?.emailClient || '-'}</div>
                  </div>
                ) 
              },
              { key: 'partenaire', label: 'Partenaire', render: (c) => <span className="text-sm font-medium text-slate-600">{c?.abonnement?.partenaire?.nomBoutique || c?.abonnement?.partenaire?.nom || '-'}</span> },
              { key: 'offre', label: 'Offre', render: (c) => <span className="text-sm font-bold text-slate-900">{c?.abonnement?.nom || '-'}</span> },
              { key: 'montant', label: 'Montant', render: (c) => <span className="font-extrabold text-sm text-slate-950">{formatFCFA(c?.montant || 0)}</span> },
              { key: 'paiement', label: 'Paiement', render: (c) => <StatusBadge status={c?.statutPaiement} /> },
              { key: 'livraison', label: 'Livraison', render: (c) => <StatusBadge status={c.isLivred ? 'LIVRE' : 'EN_ATTENTE'} /> },
              { key: 'date', label: 'Date', render: (c) => <span className="text-xs text-slate-500 font-medium">{c?.dateCreation ? new Date(c.dateCreation).toLocaleString('fr-FR') : '-'}</span> }
            ]}
          />

          {/* CONTROLE DE PAGINATION (Ajouté en bas du tableau) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 p-4 mt-auto">
              {/* Infos textuelles */}
              <p className="text-xs font-semibold text-slate-500">
                Affichage de <span className="text-slate-900">{indexOfFirstItem + 1}</span> à{' '}
                <span className="text-slate-900">{Math.min(indexOfLastItem, commandes.length)}</span> sur{' '}
                <span className="text-slate-900">{commandes.length}</span> commandes
              </p>

              {/* Boutons flèches & numéros */}
              <div className="flex items-center gap-1.5">
                {/* Bouton Précédent */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Numéros de page dynamiques */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  const isPageActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => paginate(pageNum)}
                      className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg text-xs font-bold px-2 border transition-all ${
                        isPageActive
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                          : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Bouton Suivant */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  </div>
);

}
