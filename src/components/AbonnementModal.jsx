import React, { useEffect, useState } from "react";

export default function AbonnementModal({ showModal, onClose, abonnement }) {
  const [formData, setFormData] = useState({
    libelle: abonnement ? abonnement.nom : "",
    url: abonnement ? abonnement.image : "",
    typeAbonnement: abonnement ? "" : "",
  });

  useEffect(() => {
    const modal = document.getElementById("my_modal_1");
    if (modal) {
      if (showModal) {
        modal.showModal();
      } else {
        modal.close();
      }
    }
  }, [showModal]);

  const clearForm = () => {
    const form = {
      libelle: "",
      url: "",
      typeAbonnement: "",
    };

    setFormData(form);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    clearForm();
    onClose();
    console.log("Formulaire soumis", formData);

    // Ajoutez votre logique de soumission ici
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-2xl text-center py-5">
            {abonnement ? "Modifier " : "Enregistrer "} abonnement
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Libellé</span>
              </label>
              <input
                value={formData.libelle}
                name="libelle"
                type="text"
                placeholder="libelle"
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
                <span className="label-text text-slate-600">Categorie</span>
              </label>
              <select
                name="typeAbonnement"
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>
                  Sélectionnez une catégorie
                </option>
                
                <option>Music</option>
                <option>Films et séries</option>
              </select>
            </div>

            <div className="modal-action mt-5">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 px-3 rounded-lg text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
              >
                Envoyer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white p-2 px-3 rounded-lg text-lg font-semibold mt-4 hover:bg-red-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
