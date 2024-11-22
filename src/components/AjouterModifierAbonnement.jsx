import React, { useState, useEffect } from "react";

export default function AjouterModifierAbonnement({ abonnement }) {
  const [formData, setFormData] = useState({
    libelle: abonnement ? abonnement.nom : "",
    url: abonnement ? abonnement.image : "",
    typeAbonnement: abonnement ? abonnement.type : "",
  });

  useEffect(() => {
    if (abonnement) {
      setFormData({
        libelle: abonnement.nom || "",
        url: abonnement.image || "",
        typeAbonnement: abonnement.type || "",
      });
      console.log("Coucou ", abonnement);
    }
  }, [abonnement]);

  const clearForm = () => {
    setFormData({
      libelle: "",
      url: "",
      typeAbonnement: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis :", formData);

    // Ajoutez votre logique de soumission ici
    clearForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Libellé</span>
          </label>
          <input
            value={formData.libelle}
            name="libelle"
            type="text"
            placeholder="libellé"
            className="input input-bordered w-full"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Lien image</span>
          </label>
          <input
            value={formData.url}
            name="url"
            type="text"
            placeholder="lien de l'image"
            className="input input-bordered w-full"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Catégorie</span>
          </label>
          <select
            value={formData.typeAbonnement}
            name="typeAbonnement"
            className="select select-bordered w-full"
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Sélectionnez une catégorie
            </option>
            <option value="Music">Musique</option>
            <option value="Films et séries">Films et séries</option>
          </select>
        </div>

        <div className="modal-action mt-5">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 px-3 rounded-lg text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
          >
            Envoyer
          </button>
        </div>
      </form>
    </>
  );
}
