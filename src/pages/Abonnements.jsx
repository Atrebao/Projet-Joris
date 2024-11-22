import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import { getAbonnements } from "../services/AbonnementService";
import AbonnementCard from "../components/AbonnementCard";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import AbonnementModal from "../components/AbonnementModal";
import AjouterModifierAbonnement from "../components/AjouterModifierAbonnement";
export default function Abonnements() {
  const [data, setData] = useState([]);
  const [abonnements, setAbonnements] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputs, setInputs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    try {
      getAbonnements()
        .then((response) => {
          if (response.data) {
            setIsLoading(false);
            setData(response.data);
            setAbonnements(response.data);
          }
        })
        .catch((err) => {
          console.log(err.response.data);
          //setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
      //setIsLoading(false);
    }
  }, []);

  const filteredData = (inputValue) => {
    const filter = abonnements.filter((x) =>
      x.name.toLowerCase().startsWith((inputValue || "").toLowerCase())
    );
    setData(filter);
    setCurrentPage(1); // Réinitialise à la première page après un filtre
  };

  // Calcul des Pokémon affichés pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Fonction pour gérer le changement de page avec Material-UI Pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-11/12 h-full mx-auto pt-24 ">
      <h1 className="text-4xl font-bold">Abonnements</h1>
      <div className="w-full mt-10 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <input
            type="text"
            placeholder="Rechercher"
            className="input input-bordered w-full max-w-xs"
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
          />
          <button
            className="w-14 h-11 bg-stone-800 text-white rounded-md flex items-center justify-center"
            onClick={() => filteredData(inputs)}
          >
            {!searchLoading ? (
              <SearchIcon />
            ) : (
              <TailSpin
                height="25"
                width="25"
                color="#fff"
                ariaLabel="Recherche en cours"
                visible={searchLoading}
              />
            )}
          </button>
        </div>
        <button
          className="p-3 rounded-lg shadow-sm bg-stone-700 hover:bg-stone-800 transition-all text-white"
          onClick={() =>
            document.getElementById("add-abonnement").showModal()
          }
        >
          Ajouter un abonnement
        </button>
      </div>

      <div className="w-full mt-10">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton p-4 space-y-4 flex flex-col h-48"
                ></div>
              ))
            : currentData.map((item, index) => (
                <AbonnementCard key={index} item={item} />
              ))}
        </div>
      </div>

      {/* Pagination avec Material-UI */}
      <div className="flex justify-center py-5">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          color="primary"
          shape="rounded"
        />
      </div>

      {/* Dialog pour ajouter un abonnement */}
      <dialog id="add-abonnement" className="modal">
        <div className="modal-box">
          <div className="modal-action">
            <h1 className="mr-auto text-2xl font-bold font-mtn mb-8">
              Enregistrer abonnement
            </h1>
            <form method="dialog">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold"
              >
                ✕
              </button>
            </form>
          </div>
          <AjouterModifierAbonnement  />
        </div>
      </dialog>
    </div>
  );
}
