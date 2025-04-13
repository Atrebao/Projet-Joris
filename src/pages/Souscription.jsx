import React, { useState, useEffect } from "react";
import { getSouscriptions } from "../services/SouscriptionService";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import Pagination from "@mui/material/Pagination";
import SouscriptionCard from "../components/SouscriptionCard";
import { useSouscriptionStore } from "../store/souscription";
import {
  etatSouscriptionsListe,
  getUserProfil,
  HOMEADMIN,
  statutPaiementsListe,
} from "../Utils/Utils";
export default function Souscription() {
  const [data, setData] = useState([]);
  //const [souscriptions, setSouscriptions] = useState([]);
  const [inputs, setInputs] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const souscriptionStore = useSouscriptionStore();
  const isLoading = souscriptionStore.loading;
  const [searchLoading, setSearchLoading] = useState(false);
  const [statut, setStatut] = useState("");
  const [etat, setEtat] = useState("");

  useEffect(() => {
    if (!getUserProfil()) {
      navigate(`${HOMEADMIN}/login`);
    }
  }, []);

  useEffect(() => {
    souscriptionStore.getAllData("", "", "");
  }, []);

  /*
  useEffect(() => {
    const fetchSouscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await getSouscriptions();
        if (response?.data) {
          setTimeout(() => {
            setIsLoading(false);
            setSouscriptions(response.data);
            setData(response.data); 
          }, 900);
        }
      } catch (err) {
        console.error(err.response?.data || err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSouscriptions();
  }, []);
  */

  // const filteredData = (inputValue) => {
  //   console.log(inputValue);
  //   const filter = souscriptionStore.souscriptions.filter((x) =>
  //     x.name.toLowerCase().startsWith((inputValue || "").toLowerCase())
  //   );
  //   setData(filter);
  //   setCurrentPage(1); // Réinitialiser à la première page après un filtre
  // };

  const filteredData = () => {
    souscriptionStore.getAllData(statut, etat, inputs);
    const filter = souscriptionStore.souscriptions;
    setData(filter);
    setCurrentPage(1); // Réinitialiser à la première page après un filtre
  };

  // Calcul des items affichés pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = souscriptionStore.data.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(souscriptionStore?.data.length / itemsPerPage);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "statut") {
      setStatut(value);
    } else {
      setEtat(value);
    }
  };

  return (
    <div className="w-11/12 h-full mx-auto pt-14">
      <h1 className="text-4xl font-bold">Souscriptions</h1>

      {/* Barre de recherche */}
      <div className="w-full mt-10 flex flex-wrap  items-center sm:justify-between space-y-4 ">
        <div className="flex items-center gap-x-2">
          <input
            type="text"
            placeholder="Rechercher"
            className="input input-bordered w-full max-w-xs"
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
          />

          <div className="w-full ">
            <select
              name="statut"
              className="select select-bordered w-full max-w-xs"
              onChange={handleChange}
            >
              <option disabled selected>
                Statut
              </option>
              {statutPaiementsListe.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full ">
            <select
              className="select select-bordered w-full max-w-xs"
              name="etat"
              onChange={handleChange}
            >
              <option disabled selected>
                Etat
              </option>
              {etatSouscriptionsListe.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
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
        </div>
      </div>

      {/* Liste des souscriptions */}
      <div className="w-full mt-5">
        <div className="container mx-auto px-4 py-5  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton p-4 space-y-4 flex flex-col h-48"
                ></div>
              ))
            : currentData.map((item, index) => (
                <SouscriptionCard key={index} subscription={item} />
              ))}
        </div>
      </div>

      {/* Pagination */}
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
    </div>
  );
}
