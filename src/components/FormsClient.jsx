/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStoreModalite } from "../store/modalite";
import { paymentMethods } from "../Utils/Utils";
import { addOne, getAll } from "../services/service";
import {
  ENVOYER_MAIL,
  SOUSCRIRE,
  VERIFIER_STATUT_SOUSCRIPTION,
} from "../Utils/constant";
import toast from "react-hot-toast";

export default function FormsClient({ abonnement, userProfile }) {
  const navigate = useNavigate();
  const modalitesStore = useStoreModalite();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    numero: "",
    email: "",
    typeAbonnement: {},
    conditonUtilisation: "",
    typeAppareil: "",
    modePaiement: "",
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
                  souscription.abonnement.nom + " " + modalite.categorie,
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
    addOne(ENVOYER_MAIL, "application/json", data)
      .then((res) => {
        if (res.data) {
          console.log("=====REPONSE MAIL=============== ", res.data);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du mail:", error);
      });
  };

  const handlePayment = async (method) => {};

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const data = abonnement
  //     ? { ...formData, abonnementId: abonnement.id }
  //     : { ...formData };
  //   navigate(`/paiement`, {
  //     state: { ...data, typeAppareil: formData.typeAppareil },
  //   });
  //   clearForms();
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataReturn = { ...formData };

    console.log("=====DATA RETURN=============== ");

    addOne(SOUSCRIRE, "application/json", dataReturn)
      .then((res) => {
        if (res.data) {
          console.log("=====REPONSE SOUSCRITPION=============== ", res.data);
          if (formData.modePaiement === "VISA") {
            if (modalite?.categorie === "STANDARD_PLUS") {
              window.open(
                "https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33",
                "_blank",
                "noopener,noreferrer"
              );
            } else if (modalite?.categorie === "PREMIUM") {
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
            /*
            toast.success("Paiement effectué avec succès");
           
            setIsLoading()
            navigate("/")
            */
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
              <span className="label-text text-slate-600">Type d'appareil</span>
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
              {typeAppareilListes.map((item, index) => (
                <option key={index} value={item.libelle}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          {/* {abonnement && (
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
          )} */}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-slate-600">
                Mode de paiement
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
              {paymentMethods.map((methode, index) => (
                <option key={index} value={methode.id}>
                  {methode.name}
                </option>
              ))}
            </select>
          </div>
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
