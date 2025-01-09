import React, { useState, useEffect } from "react";
import { Apple, Music2, Check, Clapperboard, ChevronDown } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
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

  const [abonnement, setAbonnement] = useState(null);
  
  const userProfile =getUserProfil();
  


  const [formData, setFormData] = useState({
    nom: userProfile ? userProfile.nom : "",
    prenoms: userProfile ? userProfile.prenoms : "",
    numero: userProfile ? userProfile.numero : "",
    email: userProfile ? userProfile.email : "",
    typeAbonnement:  "",
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

  useEffect(() => {
   
    getAll(`${RECHERCHER_DETAILS}/${id}`)
    .then((res) =>{
      if(res.data){
        setAbonnement(res.data);
      }
    })
    .catch((error) =>{
      console.log("Erreur ",error)
    })
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
    <div className="min-h-screen py-[65px] bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Main Content */}
      <div
        className={` max-w-7xl mx-auto px-4 py-12  ${
          (userProfile && userProfile.role === "client") ? "" : "grid grid-cols-1 md:grid-cols-2  gap-12"
        }`}
      >
        {/* Left Column - Info */}
        <div className="space-y-8">
          <div className="bg-black p-8 rounded-2xl text-white">
            <div className="flex items-center space-x-3 mb-6">
              {iconMap[abonnement?.icon]}
              <h1 className="text-3xl font-bold">{abonnement?.nom}</h1>
            </div>
            <p className="text-xl mb-6">{abonnement?.description}</p>
          </div>

          {/* Features */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
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
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {(userProfile && userProfile.role === "client") && (
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">
                Veuillez choisir le type d'abonnement
              </h2>
              <div>
                {abonnement?.modalite?.map((item, index) => (
                  <div key={index} className="form-control">
                    <label className="flex items-center gap-3 cursor-pointer py-2">
                      <input
                        value={typeAbonnement}
                        type="checkbox"
                        
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={checkedIndex === index}
                        onChange={(e) => handleCheckboxChange(index, item)}
                      />
                      <span className="text-sm md:text-xl text-slate-600 font-semibold">
                        {item.mois} mois - {item.prix} FCFA
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Form */}
        {!(userProfile && userProfile.role === "client") && (
            <FormsClient abonnement={ abonnement} userProfile={userProfile}/>
        )}
      </div>
      {/* <PaymentPage formData={formData} /> */}
    </div>
  );
}
