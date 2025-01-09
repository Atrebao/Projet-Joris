import React, { useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import toast from "react-hot-toast";
import ButtonBack from "../components/ButtonBack";

export default function Identifiants() {
  const [formData, setFormData] = useState({
    ancienPassword: "",
    nouveauPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = () => {
    if (formData.nouveauPassword !== formData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !");
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setFormData({
      ancienPassword: "",
      nouveauPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      console.log("FormData", formData);
      toast.success("Identifiants modifiés avec succès !");
      clearForm();
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="w-11/12 h-full mx-auto pt-16">
      <ButtonBack title ={"Modifier vos identifiants"} textSize={"3xl"}/>
      <div className="w-full py-16 flex items-center justify-center">
        <div className="w-[450px] rounded-lg h-fit bg-white shadow-2xl p-5">
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Nom d'utilisateur</span>
              </label>
              <input
                value="username"
                name="username"
                type="text"
                placeholder="Nom d'utilisateur"
                className="input input-bordered w-full"
                disabled
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Ancien mot de passe</span>
              </label>
              <input
                value={formData.ancienPassword}
                name="ancienPassword"
                type="password"
                placeholder="Ancien mot de passe"
                className="input input-bordered w-full"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">Nouveau mot de passe</span>
              </label>
              <input
                value={formData.nouveauPassword}
                name="nouveauPassword"
                type="password"
                placeholder="Nouveau mot de passe"
                className="input input-bordered w-full"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-slate-600">
                  Confirmer le mot de passe
                </span>
              </label>
              <input
                value={formData.confirmPassword}
                name="confirmPassword"
                type="password"
                placeholder="Confirmer le mot de passe"
                className="input input-bordered w-full"
                required
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full mt-7 p-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
            >
              Modifier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
