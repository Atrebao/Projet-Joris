import { useEffect, useMemo, useState } from 'react'
import {  Search, Eye, CheckCircle, XCircle, Percent, Save, Loader2 } from 'lucide-react'
import { partenairesAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { Button, Card, DataTable, Input, LoadingState, PageHeader, Select, ServiceLogo, StatusBadge } from '../../components/saas/SaasPrimitives'

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [detailPartenaire, setDetailPartenaire] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

 const [commissionInput, setCommissionInput] = useState('');
 const [commissionActive, setCommissionActive] = useState(true);
 const [updatingCommission, setUpdatingCommission] = useState(false);

  useEffect(() => {
    loadPartenaires()
  }, [])

  useEffect(() => {
    if (detailPartenaire) {
      setCommissionInput(detailPartenaire.tauxCommission ?? 10);
      setCommissionActive(detailPartenaire.commissionActive !== false);
    }
  }, [detailPartenaire]);

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const { data } = await partenairesAPI.getAll()
      setPartenaires((data || []).map((p) => ({
        ...p,
        dateInscription: p.dateCreation,
        statut: !p.isValidated ? 'EN_ATTENTE' : p.isActive ? 'ACTIF' : 'SUSPENDU',
        nbOffres: p.offres?.length ?? 0,
        totalVentes: 0,
        revenu: 0,
        note: 0,
        tauxCommission: p.tauxCommission ?? 10,
        commissionActive: p.commissionActive !== false,
      })))
    } catch (error) {
      console.error('Erreur chargement partenaires:', error)
      toast.error('Impossible de charger les partenaires')
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id) => {
    try {
      await partenairesAPI.validate(id)
      toast.success('Partenaire validé')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleVoirPartenaire = async (id) => {
    setDetailPartenaire(null)
    setDetailLoading(true)
    try {
      const { data } = await partenairesAPI.getOne(id)
      setDetailPartenaire(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSuspendre = async (id) => {
    try {
      await partenairesAPI.toggleActive(id)
      toast.success('Statut du partenaire modifié')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la suspension')
    }
  }

  const partenairesFiltres = useMemo(
    () =>
      partenaires.filter((p) => {
        const matchStatut = filtreStatut === 'TOUS' || p.statut === filtreStatut
        const query = recherche.toLowerCase()
        const matchRecherche = `${p.nom || ''} ${p.nomBoutique || ''} ${p.email || ''}`.toLowerCase().includes(query)
        return matchStatut && matchRecherche
      }),
    [partenaires, filtreStatut, recherche]
  )

  if (loading) return <LoadingState label="Chargement des partenaires..." />

  const handleUpdateCommission = async (id, newCommission, active) => {
    try {
      await partenairesAPI.updateCommission(id, Number(newCommission), active);
      toast.success('Commission mise à jour avec succès');
      loadPartenaires(); // Recharge la liste des partenaires pour refléter le changement
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commission:', error);
      toast.error('Impossible de mettre à jour la commission');
    }
  }


return (
  <div className="space-y-6 max-w-7xl mx-auto">
    {/* En-tête de la page */}
    <PageHeader
      title="Partenaires"
      description={`${partenaires.length} partenaire(s) au total.`}
    />

    {/* Barre de recherche et filtrage épurée */}
    <Card className="p-4 shadow-sm border border-border bg-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            className="pl-9 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl" 
            placeholder="Rechercher par nom, boutique ou email..." 
            value={recherche} 
            onChange={(e) => setRecherche(e.target.value)} 
          />
        </label>
        <Select 
          value={filtreStatut} 
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="w-full sm:w-56 rounded-xl border-input bg-card text-sm"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="ACTIF">Actifs</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="SUSPENDU">Suspendus</option>
        </Select>
      </div>
    </Card>

    {/* Tableau des partenaires */}
    <Card className="p-1 border border-border bg-card shadow-sm overflow-hidden">
      <DataTable
        data={partenairesFiltres}
        emptyLabel="Aucun partenaire trouvé"
        columns={[
          {
            key: 'partenaire',
            label: 'Partenaire',
            render: (p) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={p.nomBoutique || p.nom} size="sm" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{p.nomBoutique || p.nom}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Inscrit le {p.dateInscription ? new Date(p.dateInscription).toLocaleDateString('fr-FR') : '-'}</div>
                </div>
              </div>
            )
          },
          { 
            key: 'contact', 
            label: 'Contact', 
            render: (p) => (
              <div className="text-sm">
                <div className="font-medium text-slate-800">{p.email}</div>
                <div className="text-xs text-slate-400 mt-0.5">{p.telephone || '-'}</div>
              </div>
            ) 
          },
          { key: 'ville', label: 'Ville', render: (p) => <span className="text-sm text-slate-600 font-medium">{p.ville || '-'}</span> },
          { key: 'offres', label: 'Offres', render: (p) => <span className="font-bold text-sm text-slate-900">{p.nbOffres}</span> },
          { key: 'ventes', label: 'Ventes', render: (p) => <span className="font-bold text-sm text-slate-900">{p.totalVentes}</span> },
          
          {/* NOUVELLE COLONNE : Affichage de la commission en liste */}
          ,{ 
            key: 'commission', 
            label: 'Commission', 
            render: (p) => (
              <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                {p.commissionActive === false ? 'Off' : `${p.tauxCommission ?? 10}%`}
              </span>
            ) 
          },
          
          { key: 'statut', label: 'Statut', render: (p) => <StatusBadge status={p.statut} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (p) => (
              <div className="flex justify-end gap-1">
                {p.statut === 'EN_ATTENTE' && (
                  <Button size="icon" variant="ghost" className="hover:bg-slate-100" onClick={() => handleValider(p.id)}>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="hover:bg-slate-100" onClick={() => {
                  handleVoirPartenaire(p.id);
                  setCommissionInput(p.tauxCommission ?? 10); // Initialise la valeur pour l'édition
                  setCommissionActive(p.commissionActive !== false);
                }}>
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                {p.statut === 'ACTIF' && (
                  <Button size="icon" variant="ghost" className="hover:bg-destructive/5" onClick={() => handleSuspendre(p.id)}>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )
          }
        ]}
      />
    </Card>

    {/* Modal de détails et d'édition de la commission */}
    <ModalDetail
      open={!!detailPartenaire || detailLoading}
      onClose={() => { setDetailPartenaire(null); setDetailLoading(false) }}
      title="Détails du partenaire"
      loading={detailLoading}
    >
      {detailPartenaire && (
        <div className="space-y-6">
          {/* Badge d'en-tête de la boutique */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm">
            <ServiceLogo name={detailPartenaire.nomBoutique || detailPartenaire.nom} />
            <div>
              <p className="font-extrabold text-slate-900 tracking-tight">{[detailPartenaire.prenoms, detailPartenaire.nom].filter(Boolean).join(' ')}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{detailPartenaire.nomBoutique || 'Boutique non renseignée'}</p>
            </div>
          </div>

          {/* MODULE RAJOUTÉ : Configuration de la commission du partenaire */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" /> Taux de commission plateforme
              </h4>
              <p className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">Définissez le pourcentage prélevé sur chaque vente de ce partenaire.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-card px-3 py-2 text-xs font-bold text-emerald-800">
                <input
                  type="checkbox"
                  checked={commissionActive}
                  onChange={(e) => setCommissionActive(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Active
              </label>
              <div className="relative flex-1 max-w-[160px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!commissionActive}
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 text-sm font-mono font-bold text-slate-900 border border-emerald-200 bg-card rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">%</span>
              </div>
              <Button 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs gap-1.5 h-auto px-4"
                disabled={updatingCommission}
                onClick={async () => {
                  setUpdatingCommission(true);
                  
                  await handleUpdateCommission(detailPartenaire.id, commissionInput, commissionActive);
                  await new Promise(r => setTimeout(r, 1000)); 
                  setUpdatingCommission(false);
                }}
              >
                {updatingCommission ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Mettre à jour
              </Button>
            </div>
          </div>

          {/* Grille d'informations secondaires */}
          <div className="grid gap-5 sm:grid-cols-2 pt-2">
            {[
              ['Email professionnel', detailPartenaire.email],
              ['Téléphone', detailPartenaire.telephone],
              ['Ville de résidence', detailPartenaire.ville],
              ['Pays', detailPartenaire.pays || '-'],
              ['Adresse complète', detailPartenaire.adresse || '-'],
              ['Nombre d’offres en stock', detailPartenaire.offres?.length ?? 0]
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
                <p className="font-semibold text-slate-900 text-sm bg-slate-50 border border-slate-100/50 px-3 py-2 rounded-xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalDetail>
  </div>
);

}
