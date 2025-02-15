/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStoreModalite } from "../store/modalite";
import { BASE_URL, BASE_URLS, paymentMethods } from "../Utils/Utils";
import { addOne, getAll } from "../services/service";
import {
  ENVOYER_MAIL,
  SOUSCRIRE,
  VERIFIER_STATUT_SOUSCRIPTION,
} from "../Utils/constant";
import toast from "react-hot-toast";

export default function FormsClient({ abonnement, userProfile, forfait }) {
  const navigate = useNavigate();
  const modalitesStore = useStoreModalite();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    numero: "",
    email: "",
    modePaiement: {},
    conditionUtilisation: "",
    typeAppareil: ""
   
  });

  const [modalite, setModalite] = useState({
    categorie: "",
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
      modePaiement: {},
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
    
  }, [abonnement, userProfile, forfait]);

  const verifierStatutPaiement = async (reference) => {
    const interval = 5000; // Intervalle en millisecondes (5 secondes)
    const timeout = 5 * 60 * 1000; // Durée maximale (5 minutes)

    const startTime = Date.now();

    const timer = setInterval(async () => {
      if (Date.now() - startTime > timeout) {
        clearInterval(timer);
        console.log("Durée maximale atteinte. Arrêt du processus.");
        toast.error(
          "Paiement échoué: Durée maximale atteinte. Veuillez réessayer."
        );
        return;
      }
      getAll(`${VERIFIER_STATUT_SOUSCRIPTION}?reference=${reference}`)
        .then((res) => {
          if (res.data) {
            const souscription = res.data;
            if (res.data.statutPaiement === "SUCCES") {
              clearInterval(timer);
              toast.success("Paiement effectué avec succès");
              setIsLoading(false);
              const dataMail = {
                email: souscription.user.email,
                username:
                  souscription.user.nom + " " + souscription.user.prenoms,
                abonnement:
                  souscription.abonnement.nom + " " + forfait.categorie,
              };
              envoyerMail(dataMail);
              navigate("/");
              clearForms();
            } else if (res.data.statutPaiement === "ECHEC") {
              clearInterval(timer);
              toast.error("Paiement échoué. Veuillez réessayer.");
              setIsLoading(false);
            }
          }
        })
        .catch((error) => {
          console.error("Erreur lors du paiement:", error);
          toast.error("Erreur lors du paiement:", error);
          setIsLoading(false);
        });
    }, interval);
  };

  const envoyerMail = (data) => {
    addOne(`${BASE_URLS}${ENVOYER_MAIL}`, "application/json", data)
      .then((res) => {
        if (res.data) {
          console.log("=====REPONSE MAIL=============== ", res.data);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du mail:", error);
      });
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataReturn = { ...formData, montant: forfait?.prix || 0, abonnementId: abonnement?.id || 0 , forfaitId: forfait?.id || 0};

    //console.log("=====DATA RETURN=============== ", dataReturn);

    addOne(SOUSCRIRE, "application/json", dataReturn)
      .then((res) => {
        if (res.data) {
          console.log("=====REPONSE SOUSCRITPION=============== ", res.data);
          if (formData.modePaiement === "VISA") {
            if (forfait?.categorie === "STANDARD_PLUS") {
              window.open(
                "https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33",
                "_blank",
                "noopener,noreferrer"
              );
            } else if (forfait?.categorie === "PREMIUM") {
              window.open(
                "https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33",
                "_blank",
                "noopener,noreferrer"
              );
            } else {
              window.open(
                "https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33",
                "_blank",
                "noopener,noreferrer"
              );
            }
          } else {
            
            toast.success("Paiement effectué avec succès");
           
            setIsLoading()
            navigate("/")
            
          }

          verifierStatutPaiement(res.data.reference);
        }
        
      })
      .catch((error) => {
        console.error("Erreur lors du paiement:", error);
        toast.error("Erreur lors du paiement:", error);
        setIsLoading(false);
      });
      
  };

  return (
    <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-2xl  mx-auto">
      <h2 className="text-2xl text-center font-bold mb-6">
        {formData.abonnement ? "Informations client" : "S'inscrire"}
      </h2>
      
      {/* Détails du forfait */}
      {forfait && (
        <div className="bg-gray-100 text-gray-500 p-4 rounded-lg mb-6 text-sm md:text-base">
          <p><strong>Prix:</strong> {forfait.prix} FCFA</p>
          <p><strong>Durée:</strong> {forfait.duree} {forfait.periode.toLowerCase()}  </p>
          {/* <p><strong>Période:</strong> {forfait.periode}</p> */}
          <p><strong>Catégorie:</strong> {forfait.categorie}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Nom", name: "nom", type: "text", placeholder: "Votre nom" },
            { label: "Prénoms", name: "prenoms", type: "text", placeholder: "Votre prénom" },
            { label: "Numéro WhatsApp", name: "numero", type: "text", placeholder: "+XX XXX XXX XXX" },
            { label: "Email", name: "email", type: "email", placeholder: "Votre email" }
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className="form-control">
              <label className="label">
                <span className="label-text text-slate-600">{label}</span>
              </label>
              <input
                value={formData[name]}
                name={name}
                type={type}
                placeholder={placeholder}
                className="input input-bordered w-full"
                required
                onChange={(e) => handleUpdate(name, e.target.value)}
              />
            </div>
          ))}
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-600">Type d'appareil</span>
            </label>
            <select
              value={formData.typeAppareil}
              name="typeAppareil"
              onChange={(e) => handleUpdate("typeAppareil", e.target.value)}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>Sélectionnez un type</option>
              {typeAppareilListes.map((item, index) => (
                <option key={index} value={item.libelle}>{item.value}</option>
              ))}
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-600">Mode de paiement</span>
            </label>
            <select
              value={formData.modePaiement}
              name="modePaiement"
              onChange={(e) => handleUpdate("modePaiement", e.target.value)}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>Sélectionnez un type</option>
              {paymentMethods.map((methode, index) => (
                <option key={index} value={methode.value}>{methode.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-control mt-4">
          <label className="flex items-center gap-3 cursor-pointer py-2">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
              checked={formData.conditionUtilisation}
              onChange={(e) => handleUpdate("conditionUtilisation", e.target.checked)}
            />
            <span className="text-sm md:text-base text-slate-600">
              J'accepte les {" "}
              <NavLink to="/conditions" className="text-blue-600 hover:underline">
                conditions générales d'utilisation
              </NavLink>
            </span>
          </label>
        </div>
  

        <button
            type="submit"
          
            className="w-full bg-blue-500 text-white py-2 rounded-xl text-lg font-semibold mt-4 hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement en cours...
              </span>
            ) : (
              "Soumettre"
            )}
          </button>
      </form>
    </div>
  );
}
