import React, { useEffect, useState } from "react";
import netflix from "../assets/images/netflix.jpg";
import { DATA } from "../data/data";
import { categories } from "../data/data";
import services from "../assets/images/services.png";
import Service from "./Service";
import { NavLink } from "react-router-dom";
export default function Services() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(DATA);
  }, []);

  const filterType = (cateogorie) => {
    const service = DATA.filter((x) => x.categorie === cateogorie);
    setData(service);
  };

  return (
    <div>
      {/* Categories */}
      <div className=" w-full mx-auto my-[100px]">
        <h1 className="text-blue-300  font-bold text-4xl text-center py-10 ">
          NOS SERVICES
        </h1>
        <div className="w-11/12 lg:w-4/5 mx-auto  ">
          <img className="bg-cover w-full" src={services} alt="" />
        </div>
        {/* <div className="w-11/12 lg:w-4/5 mx-auto carousel  flex items-center justify-center space-x-[4px]  px-4 py-5   ">
          {categories.map((data, index) => (
            <div className="carousel-item">
              <div
                className={`  ${data.bgColor}  w-[80px]  md:w-[140px] h-[250px] rounded-[30px]  shadow-[0_20px_13px_-10px_rgba(0,0,0,0.5)]  flex items-center justify-center cursor-pointer hover:scale-105 duration-300 '`}
              >
                <img src={data.image} className="w-24 rounded-full " alt="" />
              </div>
            </div>
          ))}
        </div> */}
      </div>
      {/* Services */}
      <div className="max-w-[1640px] mx-auto  px-4  ">
        <h1 className="text-orange-400 font-bold text-4xl text-center">
          <i>ABONNEMENTS</i>
        </h1>

        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
          {data.map((item, index) => (
            <Cards key={index} item={item} />
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

const Cards = ({ item }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4 flex flex-col h-full">
      {/* Header avec image */}
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
      <div className="grid grid-cols-2 gap-4 mt-auto">
        {item.modalite.map((modal, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-medium">{modal.mois} mois</div>
            <div className="text-xl font-bold">{modal.prix} FCFA</div>
          </div>
        ))}
      </div>

      {/* Bouton Acheter */}
      <NavLink to={`/abonnement/${item.id}`} className="mt-4">
        <button className="w-full bg-orange-400 text-white py-3 rounded-xl text-lg font-semibold hover:bg-orange-500 transition-colors">
          Acheter
        </button>
      </NavLink>
    </div>
  );
};
