/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import Pagination from "@mui/material/Pagination";
import { Clock, Tag, MoreHorizontal, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import FormsModalite from "../components/FormsModalite";
import { Card, CardContent } from "@mui/material";

import { getAll, deleteOne } from "../services/service";
import { BASE_URLS, categoriesForfait } from "../Utils/Utils";
import {
  RECHERCHER_LISTES_FORFAIT,
  RECHERCHER_LISTES_MODALITE,
  SUPPRIMER_MODALITE,
} from "../Utils/constant";
import { useStoreModalite } from "../store/modalite";


export default function Forfaits() {
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [itemUpdate, setItemUpdate] = useState(null);
  const [inputs, setInputs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const modalites = useStoreModalite();
  const loading = modalites.loading;

  const listesForfaits = [
    {
      plan: "Premium",
      prix: 49.99,
      description: "Accès illimité à tous nos services",
      duree: 12,
      enabled: true,
      dateCreation: new Date(),
      categorie: "Prive"
    },
    {
      plan: "Premium",
      prix: 49.99,
      description: "Accès illimité à tous nos services",
      duree: 12,
      enabled: true,
      dateCreation: new Date(),
      categorie: "Prive"
    },
    {
      plan: "Premium",
      prix: 49.99,
      description: "Accès illimité à tous nos services",
      duree: 12,
      enabled: true,
      dateCreation: new Date(),
     categorie: "Prive"
    }
  ]
  /*
  const getAllData = ()=>{
    setIsLoading(true);
    setTimeout(() =>{
      getAll(`${BASE_URLS}${RECHERCHER_LISTES_FORFAIT}`)
      .then((res) => {
        if (res.data) {
          setData(res.data);
          setIsLoading(false)
        }
      })
      .catch((err) =>
        console.error("Erreur lors de la récupération des données:", err)
      )
      .finally(() => setIsLoading(false));
    },1500)
  }
*/
  useEffect(() => {
    modalites.modalite();
   
  }, []);
  const filteredData = (inputValue) => {
    const filter = modalites.typeAbonnements.filter((x) =>
      x.nom.toLowerCase().startsWith((inputValue || "").toLowerCase())
    );
    setData(filter);
    setCurrentPage(1); // Réinitialise à la première page après un filtre
  };

  const handleCloseModal = () => {
    document.getElementById("addModalite").close();
    document.getElementById("updateModalite").close();
  };

  const handleDeleteModalite = (item) => {
    deleteOne(SUPPRIMER_MODALITE, item.id)
      .then((res) => {
        if (res.data) {
          document.getElementById("deleteModalite").close();
          toast.success("Element supprimé avec succès");
          modalites.modalite();
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la soumission:", error);
        toast.error("Erreur lors de la soumission:", error);
      });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = Array.isArray(modalites.data)
    ? modalites.data.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const totalPages = Math.ceil(modalites.data.length / itemsPerPage);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
   <div className="w-11/12 h-full mx-auto pt-14">
  <h1 className="text-4xl font-extrabold text-gray-800">Forfaits</h1>

  {/* Barre de recherche et bouton d'ajout */}
  <div className="w-full mt-10 flex flex-wrap items-center sm:justify-between gap-4">
    <div className="flex items-center gap-x-2 w-full max-w-xs">
      <select className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-blue-400 transition-all">
        <option disabled selected>Catégorie</option>
        {categoriesForfait.map((item, index) => (
          <option key={index} value={item.value}>
            {item.designation}
          </option>
        ))}
      </select>

      <button
        className="w-14 h-11 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-gray-900 transition-all"
        onClick={() => filteredData(inputs)}
      >
        {!searchLoading ? <SearchIcon /> : <TailSpin height="25" width="25" color="#fff" />}
      </button>
    </div>

    <button
      className="p-3 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all"
      onClick={() => document.getElementById("addModalite").showModal()}
    >
      Ajouter un forfait
    </button>
  </div>

  {/* Liste des forfaits */}
  <div className="w-full h-full mt-10">
    <div className="grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-20 rounded-lg"></div>
          ))
        : currentData.map((forfait, index) => (
            <Card
              key={index}
              className={`w-full max-w-md p-4 transition-all duration-300 ${
                forfait?.enabled ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="relative">
                <div className="dropdown dropdown-end absolute right-2 top-2">
                  <div
                    tabIndex={0}
                    role="button"
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300"
                  >
                    <MoreHorizontal size={20} />
                  </div>
                  <ul className="dropdown-content mt-1 z-[1] menu p-2 border shadow bg-white rounded-lg w-44">
                    <button
                      className="hover:bg-gray-100 text-gray-600 font-semibold h-9 w-full flex items-center px-3"
                      onClick={() => {
                        document.getElementById("updateModalite").showModal();
                        setItemUpdate(forfait);
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => document.getElementById("deleteModalite").showModal()}
                      className="hover:bg-red-600 hover:text-white text-gray-600 font-semibold h-9 w-full flex items-center px-3"
                    >
                      Supprimer
                    </button>
                  </ul>
                </div>

                <h2 className="text-xl font-bold text-gray-800">{forfait?.plan}</h2>
                <div className="text-2xl font-bold text-blue-600">
                  {forfait?.prix.toLocaleString("fr-FR")} €
                </div>
              </div>

              <CardContent className="space-y-4">
                <p className="text-gray-600">{forfait?.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Durée: {forfait?.duree} mois</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>Catégorie: {forfait?.categorie}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  </div>

  {/* Modals */}
  <dialog id="updateModalite" className="modal">
    <div className="modal-box max-w-2xl">
      <div className="modal-action">
        <h1 className="mr-auto text-2xl font-bold">Modification</h1>
        <form method="dialog">
          <button className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600">
            ✕
          </button>
        </form>
      </div>
      <FormsModalite item={itemUpdate} handleCloseModal={handleCloseModal} />
    </div>
  </dialog>

  <dialog id="addModalite" className="modal">
    <div className="modal-box max-w-2xl">
      <div className="modal-action">
        <h1 className="mr-auto text-2xl font-bold">Ajouter</h1>
        <form method="dialog">
          <button className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600">
            ✕
          </button>
        </form>
      </div>
      <FormsModalite handleCloseModal={handleCloseModal} />
    </div>
  </dialog>

  <dialog id="deleteModalite" className="modal">
    <div className="modal-box max-w-md rounded-lg">
      <h3 className="font-extrabold text-xl text-red-600">Attention</h3>
      <p className="pt-2 text-gray-800 font-medium">
        Voulez-vous vraiment effectuer cette action ?
      </p>
      <div className="modal-action flex justify-end gap-4">
        <form method="dialog">
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold">
            Annuler
          </button>
        </form>
        <button
          onClick={() => handleDeleteModalite(itemUpdate)}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-all"
        >
          Supprimer
        </button>
      </div>
    </div>
  </dialog>
</div>

  );
}
