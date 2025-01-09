import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStoreModalite } from "../store/modalite";

export default function FormsClient({ abonnement, userProfile }) {
  const navigate = useNavigate();
  const modalitesStore = useStoreModalite();

  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    numero: "",
    email: "",
    typeAbonnement: {},
    conditonUtilisation: "",
    typeAppareil: "",
  });

  const typeAppareilListes = [
    { id: 1, libelle: "TELEPHONE", value: "Telephone" },
    { id: 2, libelle: "ORDINATEUR_TABLETTE", value: "Ordinateur/Tablette" },
 
  ];

  const clearForms = () => {
    const data = {
      nom: "",
      prenoms: "",
      numero: "",
      email: "",
      typeAbonnement: {},
      conditonUtilisation: "",
    };
    setFormData(data);
  };

  const handleUpdate = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    modalitesStore.modalite();
  }, [abonnement, userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = abonnement
      ? { ...formData, abonnementId: abonnement.id }
      : { ...formData };
    navigate(`/paiement`, { state: {...data, typeAppareil: formData.typeAppareil} });
    clearForms();
  };

  return (
    <div className=" lg:w-full  bg-white p-8 rounded-2xl shadow-sm ">
      <h2 className="text-2xl text-center font-bold mb-4">
        {abonnement ? "Informations client" : "S'inscrire"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-5 ">
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-slate-600">Nom</span>
            </label>
            <input
              value={formData.nom}
              name="nomPrenoms"
              type="text"
              placeholder="Votre nom"
              className="input input-bordered w-full"
              required
              onChange={(e) => handleUpdate("nom", e.target.value)}
            />
          </div>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-slate-600">Prénoms</span>
            </label>
            <input
              value={formData.prenoms}
              name="prenoms"
              type="text"
              placeholder="Votre prénoms"
              className="input input-bordered w-full"
              required
              onChange={(e) => handleUpdate("prenoms", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-slate-600">Numéro WhatsApp</span>
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
                  Type d'appareil
                </span>
              </label>
              <select
                value={formData.typeAppareil}
                name="typeAppareil"
                onChange={(e) => handleUpdate("typeAppareil", e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>
                  Sélectionnez un type
                </option>
               { typeAppareilListes.map((item, index) => (
                  <option key={index} value={item.libelle}>
                    {item.value}
                  </option>
                ))}
              </select>
            </div>

          {abonnement && (
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
                {modalitesStore.data?.map((modalite, index) => (
                  <option key={index} value={modalite.id}>
                    {modalite.mois} mois ({modalite.prix} FCFA)
                  </option>
                ))}
              </select>
            </div>
          )}
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
  );
}
