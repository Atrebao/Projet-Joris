import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceLogo } from '@/components/ui/service-logo';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Eye, Edit, Trash2, Package, Search } from 'lucide-react';

export default function OffresPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Vos données réelles (À remplacer par votre appel API / Hook)
  const [mesOffres, setMesOffres] = useState([
    { id: 1, nom: 'Crunchyroll', image: '', categorie: 'FILMS_SERIES', duree: 1, prix: 1, stock: 50, ventes: 0, revenu: 0, actif: true },
    { id: 2, nom: 'SPOTIFY', image: '', categorie: null, duree: 1, prix: 1, stock: 6, ventes: 1, revenu: 2124.15, actif: true },
    { id: 3, nom: 'NETFLIX', image: '', categorie: null, duree: 1, prix: 1, stock: 5, ventes: 1, revenu: 1275, actif: true },
  ]);

  // 2. Utilitaires & Actions
  const formatFCFA = (val) => `${val.toLocaleString('fr-FR')} FCFA`;

  const handleToggleActif = (id) => {
    setMesOffres(prev =>
      prev.map(offre => (offre.id === id ? { ...offre, actif: !offre.actif } : offre))
    );
  };

  const handleSupprimerOffre = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette offre ?')) {
      setMesOffres(prev => prev.filter(offre => offre.id !== id));
    }
  };

  // Filtre de recherche basique
  const offresFiltrees = mesOffres.filter(offre =>
    offre.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des offres</h1>
          <p className="text-sm text-muted-foreground">
            Visualisez, modifiez et gérez les stocks de vos abonnements.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/partenaire/offres/nouvelle')} 
          className="w-full sm:w-auto bg-[#00A67E] hover:bg-[#008f6c] text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle offre
        </Button>
      </div>

      {/* Conteneur principal (Pleine Largeur) */}
      <Card className="p-6 border-muted shadow-sm">
        {/* Entête du tableau avec barre de recherche intégrée */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mes offres</h2>
            <p className="text-sm text-muted-foreground">{offresFiltrees.length} offre(s) au total</p>
          </div>
          
          {/* Barre de recherche (Optionnelle mais fortement recommandée pour la production) */}
          {mesOffres.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Condition : État vide vs Tableau */}
        {offresFiltrees.length === 0 ? (
          <EmptyState
            icon={Package}
            title={searchQuery ? "Aucun résultat trouvé" : "Vous n'avez pas encore d'offres"}
            description={searchQuery ? "Modifiez votre recherche pour trouver un service." : "Créez une première offre pour commencer à vendre."}
            action={
              !searchQuery && (
                <Button onClick={() => navigate('/partenaire/offres/nouvelle')}>
                  <Plus className="mr-2 h-4 w-4" /> Créer une offre
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            data={offresFiltrees}
            columns={[
              {
                key: 'offre',
                label: 'OFFRE',
                render: (offre) => (
                  <div className="flex items-center gap-3">
                    <ServiceLogo name={offre.nom} image={offre.image} size="sm" />
                    <div>
                      <div className="font-semibold text-foreground">{offre.nom}</div>
                      <div className="text-xs text-muted-foreground">
                        {offre.categorie || '-'} / {offre.duree} mois
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'prix',
                label: 'PRIX',
                render: (offre) => <span className="font-medium text-foreground">{formatFCFA(offre.prix)}</span>,
              },
              {
                key: 'stock',
                label: 'STOCK',
                render: (offre) => {
                  const isLow = offre.stock <= 5;
                  return (
                    <span className={`inline-flex items-center justify-center font-medium px-2.5 py-0.5 rounded-full text-xs ${
                      isLow ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-muted text-muted-foreground'
                    }`}>
                      {offre.stock}
                    </span>
                  );
                },
              },
              {
                key: 'ventes',
                label: 'VENTES',
                render: (offre) => <span className="font-medium text-foreground">{offre.ventes}</span>,
              },
              {
                key: 'revenu',
                label: 'REVENU',
                render: (offre) => <span className="font-medium text-foreground">{formatFCFA(offre.revenu)}</span>,
              },
              {
                key: 'statut',
                label: 'STATUT',
                render: (offre) => (
                  <button onClick={() => handleToggleActif(offre.id)} className="transition-opacity hover:opacity-80">
                    <StatusBadge status={offre.actif ? 'SUCCES' : 'INACTIF'} />
                  </button>
                ),
              },
              {
                key: 'actions',
                label: '',
                className: 'text-right',
                cellClassName: 'text-right',
                render: (offre) => (
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/partenaire/offres/voir/${offre.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleSupprimerOffre(offre.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
