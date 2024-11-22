import React, { useState, useEffect } from "react";
import { Apple, Music2, Check, Clapperboard, ChevronDown } from "lucide-react";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { DATA } from "../data/data";
import PaymentPage from "./PaymentPage";
export default function Abonnement() {
  const [formData, setFormData] = useState({
    nomPrenoms: "",
    numero: "",
    email: "",
    typeAbonnement: "",
    conditonUtilisation: false,
  });

  const { id } = useParams();
  const [abonnement, setAbonnement] = useState(null);

  const handleUpdate = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, serviceId: abonnement.id };
    console.log("Form Data:", data);
  };

  useEffect(() => {
    // Remplacez DATA par votre source de données réelle
    const filteredData = DATA.filter((x) => x.id === Number(id));
    setAbonnement(filteredData[0] || null);
    console.log("Abonnement:", filteredData[0] || null);
  }, [id]);

  const iconMap = {
    Music2: <Music2 className="h-10 w-10" />,
    Clapperboard: <Clapperboard className="h-10 w-10" />,
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  return (
    <div className="min-h-screen py-[65px] bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2  gap-12">
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
        </div>

        {/* Right Column - Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl text-center font-bold mb-6">
            Informations client
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Nom & Prénoms</span>
              </label>
              <input
                value={formData.nomPrenoms}
                name="nomPrenoms"
                type="text"
                placeholder="Votre nom et prénoms"
                className="input input-bordered w-full"
                required
                onChange={(e) => handleUpdate("nomPrenoms", e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">
                  Numéro WhatsApp
                </span>
              </label>
              <input
                value={formData.numero}
                name="numero"
                type="text"
                placeholder="+XX XXX XXX XXX"
                className="input input-bordered w-full"
                required
                onChange={(e) => handleUpdate("numero", e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Email</span>
              </label>
              <input
                value={formData.email}
                name="email"
                type="email"
                placeholder="Votre email"
                className="input input-bordered w-full"
                onChange={(e) => handleUpdate("email", e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">
                  Type d'abonnement
                </span>
              </label>
              <select
                value={formData.typeAbonnement}
                name="typeAbonnement"
                onChange={(e) => handleUpdate("typeAbonnement", e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>
                  Sélectionnez un type
                </option>
                {abonnement?.modalite?.map((modalite, index) => (
                  <option key={index} value={`${modalite.mois} mois`}>
                    {modalite.mois} mois ({modalite.prix} FCFA)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                  checked={formData.conditonUtilisation}
                  onChange={(e) =>
                    handleUpdate("conditonUtilisation", e.target.checked)
                  }
                />
                <span className="text-sm md:text-base text-slate-600">
                  J'accepte les{" "}
                  <NavLink
                    to="/conditions"
                    className="text-blue-600 hover:underline"
                  >
                    conditions générales d'utilisation
                  </NavLink>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-xl text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
            >
              Soumettre
            </button>
          </form>
        </div>
      </div>
      <PaymentPage formData={formData}/>
    </div>
  );
}
