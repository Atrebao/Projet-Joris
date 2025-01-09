import React from "react";
import { createHashRouter } from "react-router-dom";
import { HOMECLIENT } from "../Utils/Utils";
import { HOMEADMIN } from "../Utils/Utils";
import LayoutClient from "../layout/LayoutClient";
import LayoutAdmin from "../layout/LayoutAdmin";
import Home from "../pages/Home";
import Abonnement from "../pages/AbonnementDetails";
import Conditions from "../pages/Conditions";
import Login from "../pages/Login";
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
import TypeAbonnements from "../pages/TypeAbonnements";
import PaymentPage from "../pages/PaymentPage";

export const AppRoute = createHashRouter([
  // Routes pour les utilisateurs
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        index: true, // Définit la route par défaut
        element: <Home />,
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
        element: <PaymentPage />,
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
        element: <Stats />,
      },
      {
        path: "stats",
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
        path: "typeabonnements",
        element: <TypeAbonnements />,
      },
    ],
  },

  // Authentification
  {
    path: `${HOMEADMIN}/login`,
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Route pour les pages inexistantes
  {
    path: "*",
    element: <NotFound />, // Page 404
  },
]);
