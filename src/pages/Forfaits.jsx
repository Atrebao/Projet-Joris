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
  RECHERCHER_LISTES_MODALITE,
  SUPPRIMER_MODALITE,
} from "../Utils/constant";
import { useStoreModalite } from "../store/modalite";


export default function Forfaits() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [typeAbonnements, setTypeAbonnements] = useState([]);
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
      categorie: "Professionnel"
    },
    {
      plan: "Premium",
      prix: 49.99,
      description: "Accès illimité à tous nos services",
      duree: 12,
      enabled: true,
      dateCreation: new Date(),
      categorie: "Professionnel"
    },
    {
      plan: "Premium",
      prix: 49.99,
      description: "Accès illimité à tous nos services",
      duree: 12,
      enabled: true,
      dateCreation: new Date(),
      categorie: "Professionnel"
    }
  ]
  // const getAllData = ()=>{
  //   setIsLoading(true);
  //   setTimeout(() =>{
  //     getAll(`${BASE_URLS}${RECHERCHER_LISTES_MODALITE}`)
  //     .then((res) => {
  //       if (res.data) {
  //         setData(res.data);
  //         setTypeAbonnements(res.data);
  //         setIsLoading(false)
  //       }
  //     })
  //     .catch((err) =>
  //       console.error("Erreur lors de la récupération des données:", err)
  //     )
  //     .finally(() => setIsLoading(false));
  //   },1500)
  // }

  useEffect(() => {
    modalites.modalite();
    /*
    setData(modalites.data);
    setTypeAbonnements(modalites.data);
    */
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
      <h1 className="text-4xl font-bold">Fofaits</h1>
      <div className="w-full mt-10 flex flex-wrap items-center sm:justify-between space-y-4">
        <div className="w-full max-w-xs flex items-center  gap-x-2  ">
          {/* <input
            type="text"
            placeholder="Rechercher"
            className="input input-bordered w-full max-w-xs"
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
          /> */}

          <div className="w-full  ">  
            <select className="select select-bordered w-full max-w-xs">
              <option disabled selected>
                Categorie
              </option>
              {categoriesForfait.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.designation}
                </option>
              ))}
            </select>
          </div>

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
              />
            )}
          </button>
        </div>
        <button
          className="p-3 rounded-lg shadow-sm bg-stone-700 hover:bg-stone-800 transition-all text-white"
          onClick={() => {
            document.getElementById("addModalite").showModal();
          }}
        >
          Ajouter un forfait
        </button>
      </div>

      <div className="w-full h-full mt-10">
        <div className="container mx-auto h-full grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 my-8">
          {isLoading
            ? Array.from({ length: 6 }).map((item, index) => (
                <div
                  key={index}
                  className="skeleton p-4 space-y-4 flex flex-col h-16"
                ></div>
                
              ))
            : listesForfaits.map((forfait, index) => (
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
                          setItemUpdate(forfait);
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
              ))}
        </div>

        <dialog id="updateModalite" className="modal">
          <div className="modal-box">
            <div className="modal-action">
              <h1 className="mr-auto text-2xl font-bold text-center">
                Modification
              </h1>
              <form method="dialog">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold">
                  {" "}
                  ✕
                </button>
              </form>
            </div>
            <FormsModalite
              item={itemUpdate}
              handleCloseModal={handleCloseModal}
            />
          </div>
        </dialog>

        <dialog id="addModalite" className="modal">
          <div className="modal-box">
            <div className="modal-action">
              <h1 className="mr-auto text-2xl font-bold">Ajouter</h1>
              <form method="dialog">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold">
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
            <p className="pt-2 text-black font-medium">
              Voulez-vous vraiment effectuer cette action ?
            </p>
            <div className="modal-action">
              {" "}
              <form
                method="dialog"
                className="w-full flex items-center justify-end gap-x-4"
              >
                <button className="bg-gray-100 text-gray-600 w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold">
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleDeleteModalite(itemUpdate);
                  }}
                  className="bg-red-600 text-white w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
