import React, { useState, useEffect } from "react";
import { getSouscriptions } from "../services/SouscriptionService";
import Pagination from "@mui/material/Pagination";
import SouscriptionCard from "../components/SouscriptionCard";
export default function Souscription() {
  const [data, setData] = useState([]);
  const [souscriptions, setSouscriptions] = useState([]);
  const [inputs, setInputs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchSouscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await getSouscriptions();
        if (response?.data) {
          setSouscriptions(response.data);
          setData(response.data);
        }
      } catch (err) {
        console.error(err.response?.data || err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSouscriptions();
  }, []);

  const filteredData = (inputValue) => {
    const filter = souscriptions.filter((x) =>
      x.name.toLowerCase().startsWith((inputValue || "").toLowerCase())
    );
    setData(filter);
    setCurrentPage(1); // Réinitialiser à la première page après un filtre
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputs(value);
    filteredData(value);
  };

  // Calcul des items affichés pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-11/12 h-full mx-auto pt-20">
      <h1 className="text-4xl font-bold">Souscriptions</h1>

      {/* Barre de recherche */}
      <div className="w-full mt-10 flex items-center justify-between">
        <input
          placeholder="Rechercher"
          className="input input-bordered w-full max-w-xs"
          value={inputs}
          type="text"
          onChange={handleInputChange} // Gestion du changement d'input
        />
      </div>

      {/* Liste des souscriptions */}
      <div className="w-full mt-5">
        <div className= "container mx-auto px-4 py-5  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton p-4 space-y-4 flex flex-col h-48"
                ></div>
              ))
            : currentData.map((item, index) => (
               <SouscriptionCard key={index} subscription ={item}/> 
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
