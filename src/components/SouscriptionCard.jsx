import React, { useEffect, useState } from "react";
import Badge from "@mui/material/Badge";
import { useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Tooltip from "@mui/material/Tooltip";

import {
  Clapperboard,
  Apple,
  Music2,
  Check,
  ChevronDown,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";

const defaultSubscription = {
  id: "",
  dateCreation: "",
  dateExpiration: "",
  statut: "",
  client: {
    nomPrenoms: "",
    numero: "",
    email: "",
  },
  abonnement: {
    nom: "",
    image: "",
    description: "",
  },
  modalite: {
    mois: 0,
    prix: 0,
  },
};

export default function SouscriptionCard({ subscription }) {
  const location = useLocation();

  // Formatter la date avec vérification

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Non definie";
    }

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Déterminer la couleur du badge selon le statut
  const getStatusPaiementColor = (statut) => {
    switch (statut) {
      case "SUCCES":
        return "bg-green-500";
      case "ECHEC":
        return "bg-red-500";
      case "EN_ATTENTE_DE_PAIEMENT":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (etatSouscription) => {
    switch (etatSouscription) {
      case "ACTIF":
        return "bg-green-500";
      case "EXPIRE":
        return "bg-red-500";
      case "INACTIF":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusPaiement = (statut) => {
    switch (statut) {
      case "SUCCES":
        return "Payé";
      case "ECHEC":
        return "Echec";
      case "EN_ATTENTE_DE_PAIEMENT":
        return "En attente";
      default:
        return "bg-gray-500";
    }
  };

  const iconMap = {
    Music2: <Music2 className="h-10 w-10" />,
    Clapperboard: <Clapperboard className="h-10 w-10" />,
  };

  return (
    <Card className="w-full max-w-md bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="space-y-4">
        <div className="pb-2">
          <div className="flex items-start justify-between">
            <div className=" flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-400">
                {subscription?.abonnement?.image ? (
                  <img
                    src={subscription?.abonnement?.image}
                    alt={subscription?.abonnement?.nom || "Abonnement"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    {iconMap[subscription?.abonnement?.icon]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {subscription?.abonnement?.nom || "Sans nom"}
                </h3>

                <Badge
                  className={`${getStatusColor(
                    subscription?.etatSouscription
                  )} text-white px-4 rounded-full`}
                >
                  {subscription?.etatSouscription || "Non défini"}
                </Badge>
              </div>
            </div>
            <Tooltip title="Details">
              <MoreHorizIcon
                onClick={() => {
                  document
                    .getElementById(
                      `modal-details-souscription-${subscription?.id}`
                    )
                    .showModal();
                }}
                tabIndex={0}
                role="button"
                className="cursor-pointer bg-slate-50 rounded-lg"
              />
            </Tooltip>
          </div>
        </div>

        {/* Dialog pour details */}
        <dialog
          id={`modal-details-souscription-${subscription?.id}`}
          className="modal "
        >
          <div className="modal-box ">
            <div className="modal-action">
              <h1 className="mr-auto text-2xl font-bold font-mtn mb-8">
                Details souscription
              </h1>
              <form method="dialog">
                <button
                  id={`fermer-modal-details-souscription-${subscription?.id}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold"
                >
                  ✕
                </button>
              </form>
            </div>
            <div className="p-5 border rounded-md ">
              <div className="">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      Date de creation
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.dateCreation
                        ? new Date(subscription?.dateCreation).toLocaleString()
                        : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      Date paiement
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.datePaiement
                        ? new Date(subscription?.datePaiement).toLocaleString()
                        : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">
                      Mode paiement
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.modePaiement}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      SubscriptionId
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.subscriptionId
                        ? subscription?.subscriptionId
                        : "--"}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      ProductName
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.productName
                        ? subscription?.productName
                        : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      CustomerId
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.customerId
                        ? subscription?.customerId
                        : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold text-gray-900">
                      CardLastFour
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.cardLastFour
                        ? subscription?.cardLastFour
                        : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">
                      ProductId
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.productId ? subscription?.productId : "--"}
                    </dd>
                  </div>

                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">
                      Reference  paiement
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">
                      {subscription?.reference ? subscription?.reference : "--"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* <AjouterModifierAbonnement abonnement={item} /> */}
          </div>
        </dialog>

        {/* Description de l'abonnement */}
        {/* <p className="text-gray-600 text-sm">
          {abonnement?.description || 'Aucune description disponible'}
        </p> */}

        {/* Détails de la modalité */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Durée</span>
            <span className="font-semibold">
              {subscription?.duree || 0} mois
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Prix</span>
            <span className="font-semibold">
              {(subscription?.montant || 0).toLocaleString()} FCFA
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Appareil</span>
            <span className="font-semibold">
              {(subscription?.typeAppareil || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Statut paiement </span>
            <span className="font-semibold">
              <Badge
                className={`${getStatusPaiementColor(
                  subscription?.statutPaiement
                )} text-white px-4 rounded-full`}
              >
                {`${
                  getStatusPaiement(subscription?.statutPaiement) ||
                  "Non défini"
                }`}
              </Badge>
            </span>
          </div>
        </div>

        {/* Informations du client */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <User size={16} />
            <span>
              {" "}
              Client : {subscription?.user?.nom || "..............."}{" "}
              {subscription?.user?.prenoms || "..............."}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone size={16} />
            <span>
              {" "}
              Numero : {subscription?.user?.numero || "..............."}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail size={16} />
            <span className="text-sm">
              Email : {subscription?.user?.email || "..............."}
            </span>
          </div>
        </div>

        {/* Dates importantes */}
        <div className="border-t pt-4 flex justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Créé le: {formatDate(subscription?.dateCreation)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Expire le: {formatDate(subscription?.dateExpiration)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
