import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DATA } from "../data/data";
export default function AbonnementDetails() {
  const [formData, setFormData] = useState({
    nomPrenoms: "",
    numero: "",
    email: "",
    typeAbonnement: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  
    console.log(formData);
  };
  const [serviceId, setServiceId] = useState(null);
  const [abonnement, setAbonnement] = useState(null);
  const { id } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (abonnement) {
      setServiceId(abonnement.id);
      const data = { nomPrenoms, numero, email, serviceId: abonnement.id, typeAbonnement :formData.typeAbonnement };
      console.log(data);
    }
  };



  useEffect(() => {
    // Remplace DATA par les données réelles
    const filteredData = DATA.filter((x) => x.id === Number(id));
    setAbonnement(filteredData[0] || null);
    
  }, [id]);

  return (
    <div className="w-full h-screen md:h-[785px] py-[65px] bg-slate-200">
      <div className="w-full  h-full  flex flex-col md:flex-row   p-5">
        <div className="bg-white w-full md:w-2/3 h-[200px]  md:h-full rounded-2xl flex flex-col md:flex-row  items-center justify-center p-4 mb-5">
          {abonnement && (
            <img
              src={abonnement.image}
              className="bg-cover rounded-2xl max-h-full"
              alt="Abonnement"
            />
          )}
        </div>

        <div className="bg-white rounded-2xl w-full md:w-1/3 h-[500px]  md:h-full md:ml-2 p-4">
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nom & Prénoms</span>
              </label>
              <input
                value={formData.nomPrenoms}
                type="text"
                placeholder="Votre nom et prénoms"
                className="input input-bordered w-full"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Numéro WhatsApp</span>
              </label>
              <input
                value={formData.numero}
                type="text"
                placeholder="Votre numéro WhatsApp"
                className="input input-bordered w-full"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                value={formData.email}
                type="email"
                placeholder="Votre email"
                className="input input-bordered w-full"
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Type d'abonnement</span>
              </label>
              <select
                value={formData.typeAbonnement}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
              
                {abonnement?.modalite?.map((modalite, index) => (
                  <option key={index} value={`${modalite.mois} mois`}>
                    {modalite.mois} mois ( {modalite.prix} FCFA)
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-xl text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors">
              Soumettre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
