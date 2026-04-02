/* eslint-disable no-unused-vars */
import React from "react";
import { createHashRouter } from "react-router-dom";
import { HOMECLIENT } from "../Utils/Utils";
import { HOMEADMIN } from "../Utils/Utils";
import LayoutClient from "../layout/LayoutClient";
import LayoutAdmin from "../layout/LayoutAdmin";
import LayoutPartenaire from "../layout/LayoutPartenaire";
import HomeNouvelle from "../pages/HomeNouvelle";
import Catalogue from "../pages/Catalogue";
import DetailOffre from "../pages/DetailOffre";
import Abonnement from "../pages/AbonnementDetails";
import Conditions from "../pages/Conditions";
import LoginModerne from "../pages/LoginModerne";
import StatsModerne from "../pages/StatsModerne";
import Abonnements from "../pages/Abonnements";
import Utilisateurs from "../pages/Utilisateurs";
import Identifiants from "../pages/Identifiants";
import Souscription from "../pages/Souscription";

import Register from "../pages/Registrer";
import NotFound from "../pages/NotFound";
import ConfirmationPage from "../pages/ConfirmationPage";
import MesAbonnements from "../pages/MesAbonnements";

import PaiementNouveau from "../pages/PaiementNouveau";



// Nouvelles pages modernes
import DashboardAdminNouveau from "../pages/admin/DashboardAdminNouveau";
import PartenairesPage from "../pages/admin/PartenairesPage";
import OffresPage from "../pages/admin/OffresPage";
import ClientsAdminPage from "../pages/admin/ClientsAdminPage";
import CommandesAdminPage from "../pages/admin/CommandesAdminPage";
import RegisterPartenaire from "../pages/RegisterPartenaire";
import DashboardPartenaireNouveau from "../pages/partenaire/DashboardPartenaireNouveau";
import NouvelleOffrePage from "../pages/partenaire/NouvelleOffrePage";
import EditerOffrePage from "../pages/partenaire/EditerOffrePage";
import ClientsPage from "../pages/partenaire/ClientsPage";
import StatsPage from "../pages/partenaire/StatsPage";
import PromotionsPage from "../pages/partenaire/PromotionsPage";
import CommandesPartenairePage from "../pages/partenaire/CommandesPartenairePage";
import ForfaitsPage from "../pages/partenaire/ForfaitsPage";
import EnConstruction from "../pages/EnConstruction";

export const AppRoute = createHashRouter([
  // Routes pour les utilisateurs
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        index: true,
        element: <HomeNouvelle />,
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
        path: "confirmation",
        element: <ConfirmationPage />,
      },
      {
        path: "payment/success",
        element: <ConfirmationPage />,
      },
      {
        path: "mes-abonnements",
        element: <MesAbonnements />,
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
        path: "commandes",
        element: <CommandesAdminPage />,
      },
      {
        path: "stats",
        element: <StatsModerne />,
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
        path: "utilisateurs",
        element: <Utilisateurs />,
      },
      {
        path: "identifiants",
        element: <Identifiants />,
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
        path: "commandes",
        element: <CommandesPartenairePage />,
      },
      {
        path: "offres/nouvelle",
        element: <NouvelleOffrePage />,
      },
      {
        path: "forfaits",
        element: <ForfaitsPage />,
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
        path: "promotions",
        element: <PromotionsPage />,
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
    element: <NotFound />,
  },
]);
