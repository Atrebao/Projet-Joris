/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Apple, Music2, Check, Clapperboard, ChevronDown } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { DATA } from "../data/data";
import PaymentPage from "./PaymentPage";
import { getUserProfil } from "../Utils/Utils";
import FormsClient from "../components/FormsClient";
import { useAbonnementStore } from "../store/abonnement";
import { getAll } from "../services/service";
import { RECHERCHER_DETAILS } from "../Utils/constant";

export default function Abonnement() {
  const { id } = useParams();
  const location = useLocation();
  const [forfait, setForfait] = useState(null);
  const forfaitItem = location.state;
  const [abonnement, setAbonnement] = useState(null);

  const userProfile = getUserProfil();

  const [formData, setFormData] = useState({
    nom: userProfile ? userProfile.nom : "",
    prenoms: userProfile ? userProfile.prenoms : "",
    numero: userProfile ? userProfile.numero : "",
    email: userProfile ? userProfile.email : "",
    typeAbonnement: "",
    conditonUtilisation: userProfile ? userProfile.condition : "",
  });

  const [checkedIndex, setCheckedIndex] = useState(null);
  const [typeAbonnement, setTypeAbonnement] = useState();

  const handleCheckboxChange = (index, item) => {
    if (checkedIndex === index) {
      // Si la case actuelle est déjà cochée, la décocher
      setCheckedIndex(null);
    } else {
      // Sinon, activer cette case et désactiver les autres
      setCheckedIndex(index);
    }
    setTypeAbonnement(item);
    //setFormData((prev)=>({...prev, typeAbonnement:item}))
  };

  const handleUpdate = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //setFormData((prev) =>({...prev, typeAbonnement:typeAbonnement}))
    const data = { ...formData, abonnementId: abonnement.id };
    console.log("Form Data:", data);
  };

  useEffect(() => {setForfait(forfaitItem.item)}, [forfaitItem]);

  useEffect(() => {
    getAll(`${RECHERCHER_DETAILS}/${id}`)
      .then((res) => {
        if (res.data) {
          setAbonnement(res.data);
        }
      })
      .catch((error) => {
        console.log("Erreur ", error);
      });
    /*
    const filteredData = DATA.filter((x) => x.id === Number(id));
    setAbonnement(filteredData[0] || null);
    */
  }, [id]);

  const iconMap = {
    Music2: <Music2 className="h-10 w-10" />,
    Clapperboard: <Clapperboard className="h-10 w-10" />,
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-purple-200 via-white to-purple-50">
  {/* Contenu principal */}
  <div
    className={`max-w-7xl mx-auto px-6 py-12 ${
      userProfile && userProfile.role === "client"
        ? ""
        : "grid grid-cols-1 md:grid-cols-2 gap-12"
    }`}
  >
    {/* Colonne gauche - Infos */}
    <div className="space-y-8">
      {/* Carte principale */}
      <div className="bg-black p-10 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center space-x-4 mb-6">
          {iconMap[abonnement?.icon]}
          <h1 className="text-4xl font-bold">{abonnement?.nom}</h1>
        </div>
        <p className="text-xl opacity-90">{abonnement?.description}</p>
      </div>

      {/* Avantages */}
      <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Pourquoi choisir {abonnement?.nom} ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Son Spatial & Lossless",
            "Paroles en temps réel",
            "Mix personnalisés",
            "Experts musicaux",
            "Compatible tous appareils",
            "Partage facile",
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Check className="h-6 w-6 text-green-500" />
              <span className="text-lg text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sélection de l'abonnement */}
      {userProfile && userProfile.role === "client" && (
        <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Choisissez votre abonnement
          </h2>
          <div className="space-y-4">
            {abonnement?.modalite?.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-4 cursor-pointer p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                <input
                  value={typeAbonnement}
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={checkedIndex === index}
                  onChange={() => handleCheckboxChange(index, item)}
                />
                <span className="text-lg font-semibold text-gray-700">
                  {item.mois} mois - {item.prix} FCFA
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Colonne droite - Formulaire */}
    {!(userProfile && userProfile.role === "client") && (
      <div className="bg-white p-10 rounded-3xl  hover:shadow-2xl transition-all duration-300">
        <FormsClient abonnement={abonnement} userProfile={userProfile} forfait={forfait} />
      </div>
    )}
  </div>
</div>

  );
}
