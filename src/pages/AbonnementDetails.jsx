import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DATA } from "../data/data";
export default function AbonnementDetails() {
  const [formData, setFormData] = useState({
    nomPrenoms: "",
    numero: "",
    email: "",
    typeAbonnement: "",
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

  return (
    <div className="w-full h-screen md:h-fit py-[65px] bg-slate-200">
      <div className="w-full flex flex-col md:flex-row h-[655px] py-[65px] space-y-5 md:space-y-0  items-center p-5">
        <div className="bg-white w-full md:w-2/3 h-full rounded-2xl flex items-center justify-center p-4 ">
          {abonnement && (
            <img
              src={abonnement.image}
              className="bg-cover rounded-2xl max-h-full"
              alt="Abonnement"
            />
          )}
        </div>

        <div className="bg-white rounded-2xl w-full md:w-1/3 h-full md:ml-2 p-4">
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nom & Prénoms</span>
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
                <span className="label-text">Numéro WhatsApp</span>
              </label>
              <input
                value={formData.numero}
                name="numero"
                type="text"
                placeholder="Votre numéro WhatsApp"
                className="input input-bordered w-full"
                required
                onChange={(e) => handleUpdate("numero", e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Email</span>
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
                <span className="label-text">Type d'abonnement</span>
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

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-xl text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
            >
              Soumettre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
