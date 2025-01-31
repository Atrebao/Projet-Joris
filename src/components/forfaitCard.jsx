import React from "react";
import { Card, CardContent } from "@mui/material";
import Badge from "@mui/material/Badge";
import CardHeader from '@mui/material/CardHeader';
import { CalendarDays, Clock, Tag, MoreHorizontal } from "lucide-react";

const ForfaitCard = ({ forfait }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      className={`w-full max-w-md transition-all duration-300 ${
        forfait?.enabled ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="p-2">
        <div className="relative flex items-center justify-between">
          <div className="dropdown dropdown-end absolute right-2 top-2">
            <div
              tabIndex={0}
              role="button"
              className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-100"
            >
              <MoreHorizontal size={20} />
            </div>
            <ul
              tabIndex={0}
              className="mt-1 dropdown-content z-[1] menu p-2 border shadow bg-base-100 rounded-lg w-44"
            >
              <button
                className="bg-white hover:bg-gray-100 text-gray-600 font-semibold h-9 w-full flex items-center justify-start rounded-lg px-3"
                onClick={() => {
                  document.getElementById("updateModalite").showModal();
                }}
              >
                Modifier
              </button>
              <button
                onClick={() => {
                  document.getElementById("deleteModalite").showModal();
                }}
                className="bg-white hover:bg-red-600 text-black hover:text-white font-semibold h-9 w-full flex items-center justify-start rounded-lg px-3"
              >
                Supprimer
              </button>
            </ul>
          </div>
          <h2 className="text-xl font-bold">{forfait?.plan}</h2>
        
        </div>
        <div className="text-2xl font-bold text-primary">
          {forfait?.prix.toLocaleString("fr-FR")} €
        </div>
      </div>

      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          {forfait?.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4" />
            <span>Durée: {forfait?.duree} mois</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Tag className="h-4 w-4" />
            <span>Catégorie: {forfait?.categorie}</span>
          </div>

        </div>
      </CardContent>

      
    </Card>
  );
};

export default ForfaitCard;
