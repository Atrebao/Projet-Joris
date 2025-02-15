import React, { useState, useEffect } from "react";
import Select from "react-select";
//import { Select, MenuItem, OutlinedInput, Chip, Box } from "@mui/material";
import { Check, X, ChevronDown } from "lucide-react";

import { useAbonnementStore } from "../store/abonnement";
import toast from "react-hot-toast";
import { addOne, editOne, getAll } from "../services/service";
import { AJOUTER_ABONNEMENT, MODIFIER_ABONNEMENT, RECHERCHER_LISTES_FORFAIT } from "../Utils/constant";
import { BASE_URLS } from "../Utils/Utils";

export default function AjouterModifierAbonnement({ abonnement }) {
  const abonnementStore = useAbonnementStore();
  const listeForfait = [];
  const [forfaits, setForfaits] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    image: "",
    categorie: "",
   
  });

  const [selected, setSelected] = useState([]);

  useEffect(() => {
   
    if (abonnement) {
      setFormData({
        nom: abonnement.nom || "",
        image: abonnement.image || "",
        categorie: abonnement.categorie || "",
      });
    }
  }, [abonnement ]);

  useEffect(() => {
      getAll(`${BASE_URLS}${RECHERCHER_LISTES_FORFAIT}`)
      .then((res) => {
        if(res.data){
          setForfaits(res.data);
        }
      })
  }, []);

  forfaits.map((forfait) => {
    listeForfait.push({value: forfait.id, label: `${forfait.duree} ${forfait.periode.toLowerCase()} (${forfait.prix} FCFA) - ${forfait.categorie} `} );
  });

  const clearForm = () => {
    setFormData({
      nom: "",
      image: "",
      categorie: "",
    });
    setSelected([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, forfaits: selected };

    if (abonnement) {
      editOne(MODIFIER_ABONNEMENT, abonnement.id, formData)
        .then(() => {
          abonnementStore.getAllData();
          toast.success("Element modifié avec succès");
          clearForm();
          document
            .getElementById(`fermer-modal-edit-abonnement-${abonnement?.id}`)
            .click();
        })
        .catch((err) => {
          console.error("Erreur lors de la soumission:", err);
          toast.error("Erreur lors de la soumission:", err);
        });
    } else {
      addOne(AJOUTER_ABONNEMENT, "application/json", data)
        .then(() => {
          abonnementStore.getAllData();
          toast.success("Element ajouté avec succès");
          clearForm();
          document.getElementById("fermer-modal-ajout-abonnement").click();
        })
        .catch((err) => {
          console.error("Erreur lors de la soumission:", err);
          toast.error("Erreur lors de la soumission:", err);
        });
    }

    console.log("Formulaire soumis :", formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map(option => option.value);
    setSelected(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      forfaits: selectedOptions,
    }));
  };
/*
  const options = [
    { id :1, value: "chocolate", label: "Chocolate" },
    { id :2,value: "strawberry", label: "Strawberry" },
    { id :3,value: "vanilla", label: "Vanilla" },
  ];
*/
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Champ libellé */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Libellé</span>
          </label>
          <input
            value={formData.nom}
            name="nom"
            type="text"
            placeholder="Libellé"
            className="input input-bordered w-full"
            onChange={handleChange}
            required
          />
        </div>
        {/* Champ URL */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Lien image</span>
          </label>
          <input
            value={formData.image}
            name="image"
            type="text"
            placeholder="Lien de l'image"
            className="input input-bordered w-full"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-slate-600">Forfaits</span>
          </label>
          <Select
            isMulti
            name="forfaits"
            options={listeForfait}
            className="basic-multi-select  select-bordered w-full"
            classNamePrefix="select"
            onChange={handleMultiSelectChange}
            
          />
        </div>
        {/* Sélection multiple */}
        {/* <MultiSelect
          label="Modalités"
          options={modalitesStore.data}
          value={selected}
          onChange={handleMultiSelectChange}
          name="modalites"
        /> */}
        {/* Champ catégorie (si non mode édition) */}
        {!abonnement && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-slate-600">Catégorie</span>
            </label>
            <select
              value={formData.categorie}
              name="categorie"
              className="select select-bordered w-full"
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Sélectionnez une catégorie
              </option>
              <option value="MUSIQUE">Musique</option>
              <option value="FILMS_SERIES">Films et séries</option>
            </select>
          </div>
        )}

        {/* Bouton de soumission */}
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

export const MultiSelect = ({
  label = "Sélection multiple",
  options = [],
  value = [],
  onChange,
  name,
  required = false,
  placeholder = "Sélectionnez des options",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gérer la sélection/dé-sélection d'une option
  const handleSelect = (option) => {
    const isSelected = value.find((item) => item.id === option.id);
    const newValue = isSelected
      ? value.filter((item) => item.id !== option.id)
      : [...value, option];
    onChange({ target: { name, value: newValue } });
  };

  // Supprimer une seule sélection
  const handleRemoveOption = (optionToRemove, e) => {
    e.stopPropagation();
    const newValue = value.filter((option) => option.id !== optionToRemove.id);
    onChange({ target: { name, value: newValue } });
  };

  // Supprimer toutes les sélections
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: [] } });
  };

  // Toggle de la liste déroulante
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div className="form-control mb-4">
      {label && (
        <label className="label">
          <span className="label-text text-slate-600">{label}</span>
        </label>
      )}

      <div className="relative">
        {/* Zone de sélection principale */}
        <div
          className={`select select-bordered w-full min-h-[2.5rem] flex items-center flex-wrap gap-1 p-1 cursor-pointer ${
            isOpen ? "border-primary" : ""
          }`}
          onClick={toggleDropdown}
        >
          {value.length === 0 ? (
            <span className="text-gray-500 px-2">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 pr-8">
              {Array.isArray(value) && value.length > 0 ? (
                value.map((option) => (
                  <span
                    key={option.id}
                    className="bg-primary/10 text-primary rounded-md px-2 py-1 text-sm flex items-center gap-1"
                  >
                    {option.mois} mois - {option.prix} FCFA
                    <X
                      size={14}
                      className="cursor-pointer hover:text-primary/80"
                      onClick={(e) => handleRemoveOption(option, e)}
                    />
                  </span>
                ))
              ) : (
                <span className="text-gray-500 px-2">{placeholder}</span>
              )}
            </div>
          )}

          {/* Icônes à droite */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value.length > 0 && (
              <X
                size={16}
                className="cursor-pointer hover:text-primary"
                onClick={handleClearAll}
              />
            )}
            <ChevronDown
              size={16}
              className={`transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Liste déroulante */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                  value.some((val) => val.id === option.id)
                    ? "bg-primary/5"
                    : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                <span>{`${option.mois} mois - ${option.prix} FCFA`}</span>
                {value.some((val) => val.id === option.id) && (
                  <Check size={16} className="text-primary" />
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-center">
                Aucune option disponible
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message requis */}
      {required && value.length === 0 && (
        <label className="label">
          <span className="label-text-alt text-error">Ce champ est requis</span>
        </label>
      )}
    </div>
  );
};
