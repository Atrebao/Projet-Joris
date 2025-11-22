/* eslint-disable no-unused-vars */
import React from "react";
import { createHashRouter } from "react-router-dom";
import { HOMECLIENT } from "../Utils/Utils";
import { HOMEADMIN } from "../Utils/Utils";
import LayoutClient from "../layout/LayoutClient";
import LayoutAdmin from "../layout/LayoutAdmin";
import LayoutPartenaire from "../layout/LayoutPartenaire";
import Home from "../pages/Home";
import HomeNouvelle from "../pages/HomeNouvelle";
import Catalogue from "../pages/Catalogue";
import DetailOffre from "../pages/DetailOffre";
import Abonnement from "../pages/AbonnementDetails";
import Conditions from "../pages/Conditions";
import Login from "../pages/Login";
import LoginModerne from "../pages/LoginModerne";
import StatsModerne from "../pages/StatsModerne";
import HomeAdmin from "../pages/HomeAdmin";
import Abonnements from "../pages/Abonnements";
import Utilisateurs from "../pages/Utilisateurs";
import Stats from "../pages/Stats";
import Identifiants from "../pages/Identifiants";
import Souscription from "../pages/Souscription";
import Clients from "../pages/Clients";
import Paiements from "../pages/Paiements";
import Register from "../pages/Registrer";
import NotFound from "../pages/NotFound";

import PaymentPage from "../pages/PaymentPage";
import PaiementNouveau from "../pages/PaiementNouveau";
import PricingPage from "../pages/PricingPage";
import Forfaits from "../pages/Forfaits";

// Nouvelles pages modernes
import DashboardAdminNouveau from "../pages/admin/DashboardAdminNouveau";
import PartenairesPage from "../pages/admin/PartenairesPage";
import OffresPage from "../pages/admin/OffresPage";
import ClientsAdminPage from "../pages/admin/ClientsAdminPage";
import RegisterPartenaire from "../pages/RegisterPartenaire";
import DashboardPartenaireNouveau from "../pages/partenaire/DashboardPartenaireNouveau";
import NouvelleOffrePage from "../pages/partenaire/NouvelleOffrePage";
import EditerOffrePage from "../pages/partenaire/EditerOffrePage";
import ClientsPage from "../pages/partenaire/ClientsPage";
import StatsPage from "../pages/partenaire/StatsPage";
import EnConstruction from "../pages/EnConstruction";

export const AppRoute = createHashRouter([
  // Routes pour les utilisateurs
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        index: true, // Définit la route par défaut
        element: <HomeNouvelle />,
      },
      {
        path: "home-ancienne",
        element: <Home />,
      },
      {
        path: "catalogue",
        element: <Catalogue />,
      },
      {
        path: "offre/:id",
        element: <DetailOffre />,
      },
      {
        path: "abonnement/:id",
        element: <Abonnement />,
      },
      {
        path: "conditions",
        element: <Conditions />,
      },

      {
        path: "paiement",
        element: <PaiementNouveau />,
      },
      {
        path: "paiement-ancienne",
        element: <PaymentPage />,
      },
      {
        path: "pricing/:id",
        element: <PricingPage />,
      },
    ],
  },

  // Routes pour l'administration
  {
    path: `${HOMEADMIN}`,
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: <DashboardAdminNouveau />,
      },
      {
        path: "dashboard",
        element: <DashboardAdminNouveau />,
      },
      {
        path: "partenaires",
        element: <PartenairesPage />,
      },
      {
        path: "offres",
        element: <OffresPage />,
      },
      {
        path: "stats",
        element: <StatsModerne />,
      },
      {
        path: "stats-ancienne",
        element: <Stats />,
      },
      {
        path: "abonnements",
        element: <Abonnements />,
      },
      {
        path: "souscriptions",
        element: <Souscription />,
      },
      {
        path: "clients",
        element: <ClientsAdminPage />,
      },
      {
        path: "clients-ancienne",
        element: <Clients />,
      },
      {
        path: "paiements",
        element: <Paiements />,
      },
      {
        path: "utilisateurs",
        element: <Utilisateurs />,
      },
      {
        path: "identifiants",
        element: <Identifiants />,
      },
      {
        path: "forfaits",
        element: <Forfaits />,
      },
    ],
  },

  // Routes admin (alias de /backoffice)
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: <DashboardAdminNouveau />,
      },
      {
        path: "dashboard",
        element: <DashboardAdminNouveau />,
      },
      {
        path: "partenaires",
        element: <PartenairesPage />,
      },
      {
        path: "offres",
        element: <OffresPage />,
      },
      {
        path: "stats",
        element: <StatsModerne />,
      },
      {
        path: "stats-ancienne",
        element: <Stats />,
      },
      {
        path: "clients",
        element: <ClientsAdminPage />,
      },
      {
        path: "abonnements",
        element: <Abonnements />,
      },
    ],
  },

  // Routes pour les partenaires
  {
    path: "/partenaire",
    element: <LayoutPartenaire />,
    children: [
      {
        index: true,
        element: <DashboardPartenaireNouveau />,
      },
      {
        path: "dashboard",
        element: <DashboardPartenaireNouveau />,
      },
      {
        path: "offres/nouvelle",
        element: <NouvelleOffrePage />,
      },
      {
        path: "offres/editer/:id",
        element: <EditerOffrePage />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "stats",
        element: <StatsPage />,
      },
    ],
  },

  // Authentification
  {
    path: `${HOMEADMIN}/login`,
    element: <LoginModerne />,
  },
  {
    path: `${HOMEADMIN}/login-ancienne`,
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/register-partenaire",
    element: <RegisterPartenaire />,
  },

  // Route pour les pages inexistantes
  {
    path: "*",
    element: <NotFound />, // Page 404
  },
]);
