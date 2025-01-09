import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ajouterModalite } from "../services/TypeAbonnementService";
import toast from "react-hot-toast";
import { addOne, editOne } from "../services/service";
import { AJOUTER_MODALITE, MODIFIER_MODALITE } from "../Utils/constant";
import { getAll } from "../services/service";
import { useStoreModalite } from "../store/modalite";
export default function FormsModalite({ item, handleCloseModal }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const categories = [
    { designation: "Standard", value: "STANDARD" },
    { designation: "Standard +", value: "STANDARD_PLUS" },
    { designation: "Premium", value: "PREMIUM" },
    { designation: "Premium +", value: "PREMIM_PLUS" },
  ];

  const modalites = useStoreModalite();

  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (item) {
      reset(item); // Préremplit le formulaire si "item" est fourni
    }
  }, [item, reset]);

  const onSubmit = async (data) => {
    setIsSubmit(true);
    try {
      if (item) {
        editOne(MODIFIER_MODALITE, item.id, data)
          .then((res) => {
            if (res.data) {
              toast.success("Element modifié avec succès");
              setIsSubmit(false);
              reset();
              handleCloseModal();
              modalites.modalite();
            }
          })
          .catch((err) => {
            console.error("Erreur lors de la soumission:", err);
            toast.error("Erreur lors de la soumission:", err);
          });
      } else {
        addOne(AJOUTER_MODALITE, "application/json", data)
          .then((res) => {
            if (res.data) {
              toast.success("Element ajouter avec succès");
              setIsSubmit(false);
              reset();
              handleCloseModal();
              modalites.modalite();
            }
          })
          .catch((err) => {
            console.error("Erreur lors de la soumission:", err);
            toast.error("Erreur lors de la soumission:", err);
          });
      }

      console.log("Données soumises:", data);
      // Ajoutez ici votre logique d'envoi ou de traitement des données
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
      {/* Champ Mois */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Mois</span>
        </label>
        <input
          name="mois"
          type="number"
          placeholder="mois"
          className="input input-bordered w-full"
          {...register("mois", {
            required: "Le champ Mois est obligatoire.",
          })}
        />
        {errors.mois && (
          <span className="text-sm text-rose-600">{errors.mois.message}</span>
        )}
      </div>

      {/* Champ Montant */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Montant</span>
        </label>
        <input
          name="prix"
          type="text"
          placeholder="montant"
          className="input input-bordered w-full"
          {...register("prix", {
            required: "Le champ Montant est obligatoire.",
          })}
        />
        {errors.montant && (
          <span className="text-sm text-rose-600">
            {errors.montant.message}
          </span>
        )}
      </div>

      {/* Champ Montant */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Categorie</span>
        </label>
        <select
          {...register("categorie", {
            required: "Le champ categorie est obligatoire.",
          })}
          className="select select-bordered w-full"
        >
          <option disabled defaultValue={`Selectionner une categorie`}>
            
          </option>
          {categories.map((item, index) => (
            <option key={index} value={item.value}>
              {item.designation}
            </option>
          ))}
        </select>
        {/* {errors.categorie && (
          <span className="text-sm text-rose-600">
            {errors.categorie.message}
          </span>
        )} */}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmit}
        className={`${
          isSubmit
            ? "text-slate-800 bg-slate-200"
            : "text-white bg-blue-500 hover:bg-blue-600"
        } mt-5 p-3 w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2`}
      >
        {isSubmit ? (
          <>
            Veuillez patientez...
            <span className="loading loading-dots loading-xs ml-2"></span>
          </>
        ) : (
          "Soumettre"
        )}
      </button>
    </form>
  );
}
