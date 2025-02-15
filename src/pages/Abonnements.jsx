/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import { getAbonnements } from "../services/AbonnementService";
import AbonnementCard from "../components/AbonnementCard";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";

import AjouterModifierAbonnement from "../components/AjouterModifierAbonnement";
import { useAbonnementStore } from "../store/abonnement";
import { getUserProfil, HOMEADMIN } from "../Utils/Utils";
export default function Abonnements() {
  const [data, setData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputs, setInputs] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const abonnementSotre = useAbonnementStore();
  const isLoading = abonnementSotre.loading;

  useEffect(() => {
    if (!getUserProfil()) {
      navigate(`${HOMEADMIN}/login`);
    }
  }, []);

  useEffect(() => {
    abonnementSotre.getAllData();
  }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   try {
  //    setTimeout(()=>{
  //     getAbonnements()
  //     .then((response) => {
  //       if (response.data) {
  //         setIsLoading(false);
  //         setData(response.data);
  //         setAbonnements(response.data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err.response.data);
  //       //setIsLoading(false);
  //     });
  //    }, 900)
  //   } catch (err) {
  //     console.log(err);
  //     //setIsLoading(false);
  //   }
  // }, []);

  const filteredData = (inputValue) => {
    const filter = abonnementSotre.abonnements.filter((x) =>
      x.nom.toLowerCase().startsWith((inputValue || "").toLowerCase())
    );
    setData(filter);
    setCurrentPage(1); // Réinitialise à la première page après un filtre
  };

  // Calcul des Pokémon affichés pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = abonnementSotre.data.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(abonnementSotre.data.length / itemsPerPage);

  // Fonction pour gérer le changement de page avec Material-UI Pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const showModalEdit = (item) => {
    document.getElementById("edit-abonnement").showModal();
    setCardNaturel(item);
  };

  const showModalAdd = () => {
    document.getElementById("add-abonnement").showModal();
  };

  const closeModal = (idName) => {};

  return (
    <div className="w-11/12 h-full mx-auto pt-16">
    {/* Titre principal */}
    <h1 className="text-5xl font-extrabold text-gray-900  mb-10">
       Abonnements
    </h1>
  
    {/* Barre de recherche & Bouton d'ajout */}
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Champ de recherche */}
      <div className=" w-full sm:w-auto flex items-center">
        <input
          type="text"
          placeholder=" 🔍Rechercher un abonnement..."
          className="w-full sm:w-96 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
          value={inputs}
          onChange={(e) => setInputs(e.target.value)}
        />
        <button
          className=" bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition-all"
          onClick={() => filteredData(inputs)}
        >
          {!searchLoading ? (
            <SearchIcon className="w-5 h-5" />
          ) : (
            <TailSpin height="20" width="20" color="#fff" />
          )}
        </button>
      </div>
  
      {/* Bouton d'ajout */}
      <button
        className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-md transition-all"
        onClick={showModalAdd}
      >
        ➕ Ajouter un abonnement
      </button>
    </div>
  
    {/* Liste des abonnements */}
    <div className="w-full mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-10">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-lg h-48 animate-pulse"
              ></div>
            ))
          : currentData.map((item, index) => (
              <AbonnementCard key={index} item={item} />
            ))}
      </div>
    </div>
  
    {/* Pagination */}
    <div className="flex justify-center py-8">
      {abonnementSotre.data.length > 0 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          color="primary"
          shape="rounded"
        />
      )}
    </div>
  
    {/* Modal d'ajout d'abonnement */}
    <dialog id="add-abonnement" className="modal">
      <div className="modal-box">
        <div className="modal-action">
          <h2 className="mr-auto text-3xl font-bold text-gray-900 mb-6">
            📝 Enregistrer un abonnement
          </h2>
          <form method="dialog">
            <button
              id="fermer-modal-ajout-abonnement"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all"
            >
              ✕
            </button>
          </form>
        </div>
        <AjouterModifierAbonnement />
      </div>
    </dialog>
  </div>
  
  );
}
