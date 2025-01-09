import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addOne, getAll } from "../services/service";
import {
  CHECK_ORDER_APPROVAL,
  PAYER,
  RECHERCHER_DETAILS,
  RECHERCHER_PAR_ID,
  SOUSCRIRE
} from "../Utils/constant";
import toast from "react-hot-toast";
import { HOMECLIENT } from "../Utils/Utils";
const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const data = location.state;
  const [abonnement, setAbonnement] = useState();
  const [modalite, setModalite] = useState();
  const navigate = useNavigate();
  
  useEffect(() => {
    getAll(`${RECHERCHER_DETAILS}/${data?.abonnementId}`)
      .then((res) => {
        if (res.data) {
          setAbonnement(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    getAll(`${RECHERCHER_PAR_ID}/${data.typeAbonnement}`)
      .then((res) => {
        if (res.data) {
          setModalite(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const paymentMethods = [
    {
      id: "wave",
      name: "Wave",
      icon: "", // Vous pouvez remplacer par une vraie image
      color: "blue-500",
    },
    {
      id: "orange",
      name: "Orange Money",
      icon: "",
      color: "orange-500",
    },
    {
      id: "mtn",
      name: "MTN Money",
      icon: "",
      color: "yellow-500",
    },
    {
      id: "visa",
      name: "Carte Visa",
      icon: "",
      color: "bindigo-500",
    },
  ];



  const handlePayment = async (method) => {
    setIsLoading(true);

    const dataReturn = {
      montant: modalite?.prix,
      nom: data.nom,
      prenoms: data.prenoms,
      conditionUtilisation: data.conditonUtilisation,
      numeroClient: data.numero,
      email: data.email,
      modePaiement: method,
      abonnementId: abonnement?.id,
      modaliteId: modalite?.id,
      typeAppareil: data.typeAppareil
    };

    console.log("=====DATA RETURN=============== ", dataReturn);

    addOne(SOUSCRIRE,"application/json", dataReturn)
      .then((res) => {
        if (res.data) {
       
          console.log("=====REPONSE SOUSCRITPION=============== ", res.data);
          if(method === "visa"){
           
            if(modalite?.categorie === "STANDARD_PLUS"){
              window.open("https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33", '_blank', 'noopener,noreferrer');
            }

            else if(modalite?.categorie === "PREMIUM"){
              window.open("https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33", '_blank', 'noopener,noreferrer');
            }
            else{
              window.open("https://amaterasu241.lemonsqueezy.com/buy/96897b67-3672-4724-b804-3d7203e18f33", '_blank', 'noopener,noreferrer');
            }

          }
          else{
            toast.success("Paiement effectué avec succès");
            setIsLoading()
            navigate("/")
          }
 
        }
       
      })
      .catch((error) => {
        console.error("Erreur lors du paiement:", error);
        toast.error("Erreur lors du paiement:", error);
      });
    

   
  };


  /*
  const handlePayment = async (method) => {
    setIsLoading(true);

    const dataReturn = {
      montant: modalite?.prix,
      nom: data.nom,
      prenoms: data.prenoms,
      conditionUtilisation: data.conditonUtilisation,
      numeroClient: data.numero,
      email: data.email,
      modePaiement: method,
      abonnementId: abonnement?.id,
      modaliteId: modalite?.id,
    };

    
  };
  */

  /*
  const handlePayment = async (method) => {
    setIsLoading(true);

    const dataReturn = {
      montant: modalite?.prix,
      nom: data.nom,
      prenoms: data.prenoms,
      conditionUtilisation: data.conditonUtilisation,
      numeroClient: data.numero,
      email: data.email,
      modePaiement: method,
      abonnementId: abonnement?.id,
      modaliteId: modalite?.id,
    };

    console.log("=====DATA RETURN=============== ", dataReturn);

    addOne(PAYER,"application/json", dataReturn)
      .then((res) => {
        if (res.data) {
          const paiement = res.data.paiement;
          const responseCreateOrder = res.data.responseCreateOrder;
          console.log("=====REPONSE PAYER=============== ", res.data);
          if(method === "visa"){
            const links = responseCreateOrder.links;
            
            window.open(`${links[1].href}`, '_blank', 'noopener,noreferrer');

            getAll(`${CHECK_ORDER_APPROVAL}?orderId=${responseCreateOrder?.id}&paiementId=${paiement?.id}`)
            .then((res)=>{
                if(res.data){
                  toast.success("Paiement effectué avec succès", error);
                  setIsLoading()
                  navigate("/")
                }
            })
            .catch((error) => {
              console.error("Erreur lors du paiement:", error);
              toast.error("Erreur lors du paiement:", error);
            });
          }
          else{
            toast.success("Paiement effectué avec succès");
            setIsLoading()
            navigate("/")
          }
 
        }
      })
      .catch((error) => {
        console.error("Erreur lors du paiement:", error);
        toast.error("Erreur lors du paiement:", error);
      });
    

   
  };
   */

  return (
    <div className="min-h-screen py-[65px] bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Récapitulatif de la commande */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              Nom & Prenoms:{" "}
              <span className="text-xl font-semibold">
                {data.nom} {data.prenoms}
              </span>
            </p>
            <p>
              Numéro:{" "}
              <span className="text-xl font-semibold">{data.numero} </span>
            </p>
            <p>
              Email:{" "}
              <span className="text-xl font-semibold">{data.email} </span>
            </p>
            <p>
              Abonnement:{" "}
              <span className="text-xl font-semibold">{abonnement?.nom}</span>
            </p>
            <p>
              Montant:{" "}
              <span className="text-xl font-semibold">
                {modalite?.prix} FCFA
              </span>
            </p>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            Choisissez votre moyen de paiement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between
                    ${
                      selectedMethod === method.id
                        ? `border-indigo-300 bg-indigo-600/10`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
                {/* {selectedMethod === method.id && (
                    <Check className="h-5 w-5 text-green-500" />
                  )} */}
              </button>
            ))}
          </div>

          {/* Instructions de paiement */}
          {/* {selectedMethod && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal ml-4 space-y-1 text-gray-600">
                  <li>Ouvrez votre application {selectedMethod === 'wave' ? 'Wave' : selectedMethod === 'orange' ? 'Orange Money' : 'MTN Money'}</li>
                  <li>Envoyez le montant au numéro: +225 07 58 28 48 83</li>
                  <li>Dans la description, mentionnez votre nom</li>
                  <li>Cliquez sur confirmer ci-dessous une fois le paiement effectué</li>
                </ol>
              </div>
            )} */}

          {/* Bouton de confirmation */}
          <button
            onClick={() => handlePayment(selectedMethod)}
            disabled={!selectedMethod || isLoading}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition-colors
                ${
                  selectedMethod
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement en cours...
              </span>
            ) : (
              "Confirmer le paiement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
