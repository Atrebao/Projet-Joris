import { act, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAll } from "../services/service";
import { BASE_URLS } from "../Utils/Utils";
import { RECHERCHER_FORFAITS_ABONNEMENT } from "../Utils/constant";

export default function PricingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("PUBLIC");
  const [data, setData] = useState([]);
  

  useEffect(() => {
    getAll(
      `${BASE_URLS}${RECHERCHER_FORFAITS_ABONNEMENT}/${id}?categorie=${activeTab}`
    ).then((response) => {
      if (response.data) {
        setData(response.data);
        console.log(response.data);
      }
    });
  }, [activeTab, id]);

  return (
    <div className="py-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 via-white to-purple-50">
    <div className="w-full max-w-6xl px-6 py-12 ">
      {/* Titre principal */}
      <h1 className="text-4xl font-bold text-center text-purple-700">
        Choisissez votre forfait idéal ! 🚀
      </h1>
  
      {/* Onglets Public / Privé */}
      <div
        role="tablist"
        className="tabs tabs-boxed flex mx-auto items-center justify-center mt-8 bg-gray-100 p-2 rounded-full shadow-md w-64"
      >
        <button
          role="tab"
          className={`tab px-6 py-2 rounded-full flex text-lg   font-semibold transition ${
            activeTab === "PUBLIC"
              ? "bg-purple-600 text-white shadow-lg "
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("PUBLIC")}
        >
          Public
        </button>
        <button
          role="tab"
          className={`tab px-6 py-2 rounded-full text-lg font-semibold transition ${
            activeTab === "PRIVE"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("PRIVE")}
        >
          Privé
        </button>
      </div>
  
      {/* Description selon le type de profil */}
      <p className="text-gray-700 text-lg text-center mt-10 leading-relaxed max-w-2xl mx-auto">
        {activeTab === "PUBLIC"
          ? "Nous vous donnons un profil avec un code que vous allez partager avec plusieurs utilisateurs. Le code peut changer plusieurs fois dans le mois. 😊"
          : "Vous choisissez vous-même le nom et le code du profil. Vous êtes seul(e) dessus et le code ne change jamais."}
      </p>
  
      {/* Cartes des forfaits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
        {data.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl p-8 shadow-lg border border-gray-200 bg-white hover:shadow-2xl transform hover:-translate-y-2 transition duration-300"
          >
            {/* Titre du forfait */}
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-600 h-10 rounded-md flex items-center justify-center">
                <h2 className="text-white text-lg font-semibold">{item?.plan}</h2>
              </div>
            </div>

            {/* Prix */}
            <p className="text-5xl font-extrabold text-purple-800 mt-6">
              {item?.prix}F
              {/* <span className="text-lg text-gray-500"> / {item?.duree} {item?.periode.toLowerCase()}</span> */}
            </p>
  
            {/* Avantages */}
            <ul className="mt-6 space-y-3 text-gray-600">
              <li className="font-bold text-purple-900">&#10003; Durée : {item?.duree} {item?.periode.toLowerCase()}</li>
              <li>&#10003; Mise en place rapide (1-3 jours)</li>
              <li>&#10003; Accès sécurisé et fluide</li>
              <li>&#10003; Assistance prioritaire</li>
            </ul>
  
            {/* Bouton d'abonnement */}
            <button
              onClick={() => {
                navigate(`/abonnement/${id}`, { state: {item} });
              }}
              className="w-full mt-6 bg-purple-700 text-white py-3 rounded-lg text-lg font-medium hover:bg-purple-800 transition"
            >
              Commencer 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
  
  );
}
