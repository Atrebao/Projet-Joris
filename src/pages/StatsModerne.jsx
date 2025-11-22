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
  ArrowDown
} from "lucide-react";

export default function StatsModerne() {
  const [periode, setPeriode] = useState("mois");
  const [stats, setStats] = useState({
    revenuTotal: 12450000,
    revenueEvolution: 23,
    totalPartenaires: 45,
    partenairesEvolution: 12,
    totalOffres: 287,
    offresEvolution: 8,
    totalClients: 1842,
    clientsEvolution: 15,
  });

  // Données pour le graphique des revenus mensuels
  const revenusParMois = [
    { mois: "Jan", revenu: 850000 },
    { mois: "Fév", revenu: 920000 },
    { mois: "Mar", revenu: 1100000 },
    { mois: "Avr", revenu: 980000 },
    { mois: "Mai", revenu: 1250000 },
    { mois: "Juin", revenu: 1180000 },
    { mois: "Juil", revenu: 1350000 },
    { mois: "Août", revenu: 1420000 },
    { mois: "Sep", revenu: 1280000 },
    { mois: "Oct", revenu: 1450000 },
    { mois: "Nov", revenu: 1520000 },
    { mois: "Déc", revenu: 1680000 },
  ];

  // Transactions récentes
  const transactionsRecentes = [
    { id: 1, client: "Kouassi Jean", offre: "Netflix Premium", montant: 7000, date: "2025-11-19", statut: "SUCCES" },
    { id: 2, client: "Diabate Marie", offre: "Spotify Family", montant: 5000, date: "2025-11-19", statut: "SUCCES" },
    { id: 3, client: "Toure Ibrahim", offre: "PlayStation Plus", montant: 8000, date: "2025-11-18", statut: "SUCCES" },
    { id: 4, client: "Kone Aminata", offre: "Apple Music", montant: 4500, date: "2025-11-18", statut: "EN_ATTENTE" },
    { id: 5, client: "Bamba Sekou", offre: "Disney+ Annual", montant: 12000, date: "2025-11-17", statut: "SUCCES" },
  ];

  // Catégories top
  const categoriesTop = [
    { nom: "Films & Séries", ventes: 127, pourcentage: 44 },
    { nom: "Musique", ventes: 89, pourcentage: 31 },
    { nom: "Gaming", ventes: 52, pourcentage: 18 },
    { nom: "Sport", ventes: 19, pourcentage: 7 },
  ];

  const maxRevenu = Math.max(...revenusParMois.map(r => r.revenu));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              Statistiques Globales
            </h1>
            <p className="text-gray-600">Vue d'ensemble de la performance de la plateforme</p>
          </div>

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
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
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-10 w-10 text-green-100" />
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                <ArrowUp className="h-4 w-4" />
                {stats.revenueEvolution}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {(stats.revenuTotal / 1000000).toFixed(2)}M F
            </div>
            <div className="text-green-100 text-sm">Revenu Total</div>
          </div>

          {/* Total Partenaires */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 text-blue-100" />
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                <ArrowUp className="h-4 w-4" />
                {stats.partenairesEvolution}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalPartenaires}</div>
            <div className="text-blue-100 text-sm">Partenaires Actifs</div>
          </div>

          {/* Total Offres */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-10 w-10 text-purple-100" />
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                <ArrowUp className="h-4 w-4" />
                {stats.offresEvolution}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOffres}</div>
            <div className="text-purple-100 text-sm">Offres Disponibles</div>
          </div>

          {/* Total Clients */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="h-10 w-10 text-orange-100" />
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                <ArrowUp className="h-4 w-4" />
                {stats.clientsEvolution}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalClients.toLocaleString()}</div>
            <div className="text-orange-100 text-sm">Clients Actifs</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique Revenus Mensuels */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
                Évolution du Revenu (12 mois)
              </h2>
              <span className="text-sm text-gray-500">En FCFA</span>
            </div>

            <div className="space-y-2">
              {revenusParMois.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-gray-600">{item.mois}</div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-10 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full flex items-center justify-end pr-3 text-white text-xs font-semibold transition-all"
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
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-purple-600" />
              Top Catégories
            </h2>

            <div className="space-y-4">
              {categoriesTop.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{cat.nom}</span>
                    <span className="text-gray-600">{cat.ventes} ventes</span>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
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
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
              Transactions Récentes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Offre</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {transactionsRecentes.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                          {transaction.client.charAt(0)}
                        </div>
                        <span className="font-semibold">{transaction.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{transaction.offre}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">{transaction.montant.toLocaleString()} F</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.statut === 'SUCCES' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
