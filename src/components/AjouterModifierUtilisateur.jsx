import React, { useState, useEffect } from "react";
import { addOne } from "../services/service";
import { AJOUTER_USER } from "../Utils/constant";



export default function AjouterModifierUtilisateur({ user }) {
  const [formData, setFormData] = useState({
    nom: user ? user.nom : "",
    prenoms: user ? user.prenoms : "",
    username: user ? user.username : "",
    email: user ? user.email : "",
    numero: user ? user.numero : "",
    role: user ? user.role : "",
  });



  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenoms: user.prenoms || "",
        username: user.username || "",
        email: user.email || "",
        numero: user.numero || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const clearForm = () => {
    setFormData({
      nom: "",
      prenoms: "",
      username: "",
      email: "",
      numero: "",
      role: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis :", formData);

    if(user){

        // Ajoutez votre logique de soumission ici
        clearForm();
    }else{

      addOne(AJOUTER_USER,"application/json", formData)
      .then((res) =>{
        toast.success("Utilsateur ajouté avec succès");
          clearForm();
          document.getElementById("fermer-modal-ajout-user").click();
      })
      .catch((err) =>{
        console.error("Erreur lors de la soumission:", err);
        toast.error("Erreur lors de la soumission:", err);
      })
    }

  


  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-3">
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Nom</span>
        </label>
        <input
          value={formData.nom}
          name="nom"
          type="text"
          placeholder="Nom"
          className="input input-bordered w-full"
          onChange={handleChange}
          required
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
          placeholder="Prénoms"
          className="input input-bordered w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Numéro</span>
        </label>
        <input
          value={formData.numero}
          name="numero"
          type="text"
          placeholder="Numéro de téléphone"
          className="input input-bordered w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Nom d'utilisateur</span>
        </label>
        <input
          value={formData.username}
          name="username"
          type="text"
          placeholder="Nom d'utilisateur"
          className="input input-bordered w-full"
          onChange={handleChange}
          required
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
          placeholder="Adresse email"
          className="input input-bordered w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Rôle</span>
        </label>
        <select
          value={formData.role}
          name="role"
          className="select select-bordered w-full"
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Sélectionnez un rôle
          </option>
          <option value="Admin">Admin</option>
          <option value="User">Utilisateur</option>
        </select>
      </div>



      <div className="col-span-2 modal-action mt-5">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 px-3 rounded-lg text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
}
