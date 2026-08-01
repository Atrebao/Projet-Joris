import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { statsAPI, souscriptionsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function StatsModerne() {
  const [periode, setPeriode] = useState("mois");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenuTotal: 0,
    revenueEvolution: 0,
    totalPartenaires: 0,
    partenairesEvolution: 0,
    totalOffres: 0,
    offresEvolution: 0,
    totalClients: 0,
    clientsEvolution: 0,
  });
  const [revenusParMois, setRevenusParMois] = useState([]);
  const [transactionsRecentes, setTransactionsRecentes] = useState([]);
  const [categoriesTop, setCategoriesTop] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d'éléments par page

  useEffect(() => {
    loadStats();
  }, [periode]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: dashboardData } = await statsAPI.adminDashboard();
      const statsFormatted = {
        revenuTotal: dashboardData.revenusTotal ?? 0,
        revenueEvolution: dashboardData.evolutionRevenus || 0,
        totalPartenaires: dashboardData.totalPartenaires || 0,
        partenairesEvolution: 0,
        totalOffres: dashboardData.totalOffres || 0,
        offresEvolution: 0,
        totalClients: dashboardData.totalClients || 0,
        clientsEvolution: 0,
      };
      setStats(statsFormatted);

      try {
        const { data: grapheData } = await statsAPI.grapheCA({ periode: "annee" });
        setRevenusParMois(grapheData?.data?.map((v, i) => ({
          mois: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"][i] || `M${i + 1}`,
          revenu: v || 0
        })) || []);
      } catch (_) {
        setRevenusParMois([
          { mois: "Jan", revenu: 0 }, { mois: "Fév", revenu: 0 }, { mois: "Mar", revenu: 0 },
          { mois: "Avr", revenu: 0 }, { mois: "Mai", revenu: 0 }, { mois: "Juin", revenu: 0 },
          { mois: "Juil", revenu: 0 }, { mois: "Août", revenu: 0 }, { mois: "Sep", revenu: 0 },
          { mois: "Oct", revenu: 0 }, { mois: "Nov", revenu: 0 }, { mois: "Déc", revenu: 0 },
        ]);
      }

      try {
        const { data: souscriptionsData } = await souscriptionsAPI.getAll({});
        const recentes = (souscriptionsData || []).slice(0, 10).map(s => ({
          id: s.id,
          client: s.user ? `${s.user.nom || ''} ${s.user.prenoms || ''}`.trim() || 'Client' : 'Client',
          offre: s.abonnement?.nom || 'N/A',
          montant: s.montantTotal ?? s.montant ?? 0,
          date: s.dateCreation ? new Date(s.dateCreation).toISOString().split('T')[0] : '-',
          statut: s.statutPaiement || 'EN_ATTENTE'
        }));
        setTransactionsRecentes(recentes);
      } catch (_) {
        setTransactionsRecentes([]);
      }

      try {
        const { data: topOffres } = await statsAPI.topOffres(4);
        const mapped = (topOffres || []).map((o) => ({
          nom: o.nom || '-',
          ventes: Number(o.ventes || 0),
          pourcentage: 0,
        }));
        const totalVentes = mapped.reduce((acc, c) => acc + c.ventes, 0) || 1;
        setCategoriesTop(
          mapped.map((c) => ({
            ...c,
            pourcentage: Math.round((c.ventes / totalVentes) * 100),
          })),
        );
      } catch (_) {
        setCategoriesTop([]);
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      toast.error("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  // Données par défaut pour le graphique si vide
  const revenusAffichage = revenusParMois.length > 0 ? revenusParMois : [
    { mois: "Jan", revenu: 0 }, { mois: "Fév", revenu: 0 }, { mois: "Mar", revenu: 0 },
    { mois: "Avr", revenu: 0 }, { mois: "Mai", revenu: 0 }, { mois: "Juin", revenu: 0 },
    { mois: "Juil", revenu: 0 }, { mois: "Août", revenu: 0 }, { mois: "Sep", revenu: 0 },
    { mois: "Oct", revenu: 0 }, { mois: "Nov", revenu: 0 }, { mois: "Déc", revenu: 0 },
  ];

    // Données pour le graphique des revenus mensuels
    // Catégories top (données calculées ou mock)
    const categoriesTopAffichage = categoriesTop || [];

    const maxRevenu = Math.max(1, ...revenusAffichage.map(r => r.revenu));

    if (loading) {
      return (
        <div className="min-h-80 bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Chargement des statistiques...</p>
          </div>
        </div>
      );
    }


  const hasTransactions = transactionsRecentes && transactionsRecentes.length > 0;
  const totalPages = hasTransactions ? Math.ceil(transactionsRecentes.length / itemsPerPage) : 1;

  // Indexation et découpage du tableau d'origine
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = hasTransactions 
    ? transactionsRecentes.slice(indexOfFirstItem, indexOfLastItem) 
    : [];

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Statistiques Globales
            </h1>
            <p className="text-muted-foreground">Vue d'ensemble de la performance de la plateforme</p>
          </div>

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border border-input bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 font-semibold"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenu Total */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="h-5 w-5" /></span>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {stats.revenueEvolution}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-foreground">
              {(stats.revenuTotal / 1000000).toFixed(2)}M F
            </div>
            <div className="text-muted-foreground text-sm">Revenu Total</div>
          </div>

          {/* Total Partenaires */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3"><Users className="h-5 w-5" /></span>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {stats.partenairesEvolution}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-foreground">{stats.totalPartenaires}</div>
            <div className="text-muted-foreground text-sm">Partenaires Actifs</div>
          </div>

          {/* Total Offres */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Package className="h-5 w-5" /></span>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {stats.offresEvolution}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-foreground">{stats.totalOffres}</div>
            <div className="text-muted-foreground text-sm">Offres Disponibles</div>
          </div>

          {/* Total Clients */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4"><ShoppingCart className="h-5 w-5" /></span>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {stats.clientsEvolution}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-foreground">{stats.totalClients.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Clients Actifs</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique Revenus Mensuels */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Évolution du Revenu (12 mois)
              </h2>
              <span className="text-sm text-gray-500">En FCFA</span>
            </div>

            <div className="space-y-2">
              {revenusAffichage.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-gray-600">{item.mois}</div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-10 overflow-hidden">
                      <div
                        className="bg-primary h-full flex items-center justify-end pr-3 text-primary-foreground text-xs font-semibold transition-all"
                        style={{ width: `${(item.revenu / maxRevenu) * 100}%` }}
                      >
                        {item.revenu >= 1000000 && `${(item.revenu / 1000000).toFixed(1)}M`}
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold text-gray-700">
                    {(item.revenu / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Catégories */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-primary" />
              Top Catégories
            </h2>

            <div className="space-y-4">
              {categoriesTopAffichage.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{cat.nom}</span>
                    <span className="text-gray-600">{cat.ventes} ventes</span>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        index === 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-orange-500 to-amber-500'
                      }`}
                      style={{ width: `${cat.pourcentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{cat.pourcentage}% du total</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Récentes */}
  <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
    
    {/* En-tête du boîtier */}
    <div className="p-6 border-b border-border bg-muted/40">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        Transactions Récentes
      </h2>
    </div>

    {/* Corps du tableau */}
    <div className="overflow-x-auto flex-1">
      <table className="w-full">
        <thead className="bg-slate-50/50">
          <tr className="border-b border-border">
            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Client</th>
            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Offre</th>
            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Montant</th>
            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl border border-primary/5 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {transaction.client ? transaction.client.charAt(0).toUpperCase() : '-'}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{transaction.client}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium">{transaction.offre}</td>
                <td className="py-4 px-6">
                  <span className="font-extrabold text-sm text-slate-950">
                    {transaction.montant.toLocaleString()} FCFA
                  </span>
                </td>
                <td className="py-4 px-6 text-xs text-slate-400 font-semibold">
                  {transaction.date !== "-" ? new Date(transaction.date).toLocaleDateString('fr-FR') : "-"}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                    transaction.statut === 'SUCCES' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : transaction.statut === 'ECHEC'
                      ? 'bg-destructive/5 border-destructive/10 text-destructive'
                      : 'bg-amber-50 border-amber-100 text-amber-700'
                  }`}>
                    {transaction.statut}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            /* Ligne vide sécurisée */
            <tr>
              <td colSpan="5" className="py-12 text-center text-sm font-medium text-slate-400">
                Aucune transaction enregistrée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* CONTROLE DE PAGINATION EN PIED DE PAGE */}
    {hasTransactions && totalPages > 1 && (
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 p-4 mt-auto select-none">
        {/* Rappel des compteurs */}
        <p className="text-xs font-semibold text-slate-500">
          Affichage de <span className="text-slate-900">{indexOfFirstItem + 1}</span> à{' '}
          <span className="text-slate-900">{Math.min(indexOfLastItem, transactionsRecentes.length)}</span> sur{' '}
          <span className="text-slate-900">{transactionsRecentes.length}</span> transactions
        </p>

        {/* Boutons directionnels et pages */}
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

          {/* Numéros de pages */}
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

  </div>
      </div>
    </div>
  );
}


