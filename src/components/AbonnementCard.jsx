import React, { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import AbonnementModal from "./AbonnementModal";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AjouterModifierAbonnement from "./AjouterModifierAbonnement";

export default function AbonnementCard({ item, onDelete }) {
  const location = useLocation();

  const handleDelete = () => {
    console.log("Suppression de l'abonnement :", item.nom);
    onDelete && onDelete(item.id);
  };

  const showModalEdit = () => {
    document.getElementById("edit-abonnement").showModal();
  };


  const showModalConfirmDelete = ()=>{
    document.getElementById("supprimer-abonnement").showModal();
    
  }



  const isHomePageClient = location.pathname === "/";

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4 flex flex-col h-full justify-between">
      {/* Header avec image */}
      {!isHomePageClient && (
        <div className="dropdown">
          <MoreHorizIcon
            tabIndex={0}
            role="button"
            className="cursor-pointer bg-slate-50 rounded-lg"
          />

          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li onClick={showModalEdit}>
              <a className="text-lg font-bold cursor-pointer">Modifier</a>
            </li>
            <li>
              <a
                onClick={showModalConfirmDelete}
                className="text-lg font-bold hover:bg-red-500 hover:text-white cursor-pointer"
              >
                Supprimer
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Modal pour modification */}
      <dialog id="edit-abonnement" className="modal">
        <div className="modal-box">
          <div className="modal-action">
            <h1 className="mr-auto text-2xl font-bold font-mtn mb-8">
              Modifier abonnement{" "}
            </h1>
            <form method="dialog">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-600 font-semibold">
                ✕
              </button>
            </form>
          </div>
          <AjouterModifierAbonnement abonnement={item} />
        </div>
      </dialog>

      {/* Image du service */}
      <div className="bg-slate-100 rounded-xl">
        <div className="p-3">
          <img
            className="w-full h-[120px] object-cover rounded-xl"
            src={item.image}
            alt={item.nom}
          />
        </div>
      </div>

      {/* Nom du service */}
      <h2 className="text-2xl md:text-3xl font-bold text-orange-400">
        {item.nom}
      </h2>

      {/* Prix et détails */}
      <div className="grid grid-cols-2 gap-4 flex-grow">
        {item.modalite.map((modal, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-medium">{modal.mois} mois</div>
            <div className="text-xl font-bold">{modal.prix} FCFA</div>
          </div>
        ))}
      </div>

      {/* Bouton Acheter */}
      {isHomePageClient && (
        <NavLink to={`/abonnement/${item.id}`} className="mt-4">
          <button className="w-full bg-orange-400 text-white py-3 rounded-xl text-lg font-semibold hover:bg-orange-500 transition-colors">
            Acheter
          </button>
        </NavLink>
      )}

      <dialog id="supprimer-abonnement" className="modal">
        <div className="modal-box max-w-md rounded-lg">
          <h3 className="font-extrabold text-xl text-red-600 ">Attention</h3>
          <p className="pt-2 text-black font-medium">
            Voulez vous vraiment effectuer cette action ?
          </p>
          <div className="modal-action">
            <form
              method="dialog"
              className="w-full flex items-center justify-end gap-x-4"
            >
              <button className="bg-gray-100 text-gray-600 w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold">
                Annuler
              </button>
              <button
              onClick={handleDelete}
              className="bg-red-600 text-white w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold">
                Supprimer
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
