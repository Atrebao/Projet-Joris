import React, { useEffect } from "react";
import Badge from "@mui/material/Badge";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

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
  const {
    dateCreation,
    dateExpiration,
    statut,
    client = {},
    abonnement = {},
    modalite = {},
  } = subscription || {};

  useEffect(() => {
    console.log(subscription);
  });

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
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
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
        <div className="pb-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                {abonnement?.image ? (
                  <img
                    src={abonnement?.image}
                    alt={abonnement?.nom || "Abonnement"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    {iconMap[abonnement?.icon]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {abonnement?.nom || "Sans nom"}
                </h3>
                <Badge className={`${getStatusColor(statut)} text-white px-4 rounded-full`}>
                  {statut || "Status non défini"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description de l'abonnement */}
        {/* <p className="text-gray-600 text-sm">
          {abonnement?.description || 'Aucune description disponible'}
        </p> */}

        {/* Détails de la modalité */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Durée</span>
            <span className="font-semibold">{modalite?.mois || 0} mois</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Prix</span>
            <span className="font-semibold">
              {(modalite?.prix || 0).toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* Informations du client */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <User size={16} />
            <span>{client?.nomPrenoms || "Client inconnu"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone size={16} />
            <span>{client?.numero || "Numéro non défini"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail size={16} />
            <span className="text-sm">
              {client?.email || "Email non défini"}
            </span>
          </div>
        </div>

        {/* Dates importantes */}
        <div className="border-t pt-4 flex justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Créé le: {formatDate(dateCreation)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Expire le: {formatDate(dateExpiration)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
