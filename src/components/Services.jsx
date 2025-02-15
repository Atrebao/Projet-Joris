import React, { useEffect, useState } from "react";
import netflix from "../assets/images/netflix.jpg";
import { DATA } from "../data/data";
import { categories } from "../data/data";
import services from "../assets/images/services.png";
import Service from "./Service";
import { NavLink } from "react-router-dom";
import { getAbonnements } from "../services/AbonnementService";
import AbonnementCard from "./AbonnementCard";
import { useAbonnementStore } from "../store/abonnement";
export default function Services() {
 
  const abonnementSotre = useAbonnementStore();
  const isLoading = abonnementSotre.loading;

  useEffect(() => {
    
    abonnementSotre.getAllData();
  }, []);

  const filterType = (cateogorie) => {
    const service = abonnementSotre.abonnements.filter((x) => x.categorie === cateogorie);
    setData(service);
  };


  return (
<div className="w-full mx-auto my-20">
  {/* Section Services */}
  <h1 className="text-4xl  md:text-5xl font-extrabold text-blue-500 text-center mt-20">
    🌟 Nos Services
  </h1>
  <div className="w-11/12 lg:w-4/5 mx-auto mt-16">
    <img className="w-full rounded-xl " src={services} alt="Services" />
  </div>

  {/* Section Abonnements */}
  <div className="max-w-7xl mx-auto px-6 mt-24">
    <h1 className="text-4xl  md:text-5xl font-extrabold text-orange-500 text-center mb-12">
      🔥 Nos Abonnements
    </h1>

    {/* Grid des abonnements */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-10">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg h-48 animate-pulse"
            ></div>
          ))
        : abonnementSotre.data.map((item, index) => (
            <AbonnementCard key={index} item={item} />
          ))}
    </div>
  </div>
</div>
  );
}

const Card = ({ item }) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-lg p-6 space-y-4">
      {/* Header avec le logo Apple et badge Populaire */}
      <div className="bg-slate-100 relative mb-8 rounded-xl">
        {/* Logo Apple multicolore */}
        <div className=" p-3 relative ">
          <img
            className="bg-cover rounded-xl max-h-[160px]"
            src={item.image}
            alt=""
          />
        </div>

        {/* Badge Populaire */}
        {/* <div className="absolute right-0 top-0 bg-gray-100 rounded-full px-3 py-1">
          <span className="text-sm text-gray-700">Populaire</span>
        </div> */}
      </div>

      {/* Texte "For everything Apple" */}
      {/* <div className="text-xl font-semibold text-gray-900">
        For everything Apple
      </div> */}

      {/* iTunes France */}
      <div className="text-2xl font-bold text-orange-400 ">{item.nom}</div>

      {/* Prix et détails */}
      <div className="space-y-2">
        <div className="text-2xl font-semibold">{item.description}</div>
        <div className="text-xl text-gray-400">{item.price} FCFA</div>
      </div>

      {/* Bouton Acheter */}
      <button className="w-full bg-orange-400 text-white py-4 rounded-xl text-xl font-semibold hover:bg-orange-500 transition-colors">
        Acheter
      </button>
    </div>
  );
};

