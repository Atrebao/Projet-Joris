export const HOMECLIENT = "/client";
export const HOMEADMIN = "/backoffice";
export const BASE_URL = "http://localhost:3001";

export const BASE_URLS = "http://localhost:3000";

export const resetStorage = () => {
  localStorage.removeItem("infoUser");
};

export const saveUserProfil = (data) => {
  return localStorage.setItem("infoUser", JSON.stringify(data));
};

export const saveToken = (token) => {
  return localStorage.setItem("accessToken", JSON.stringify(token));
};

export const savePaiement = (paiement) => {

  const p = getPaiement();
  if(p){
    if(p.status === "SUCCES" || p.status === "ECHEC"){
     
      localStorage.removeItem("p");

      return localStorage.setItem("paiement", JSON.stringify(paiement));
    } 
   
  }
  
};

export const getPaiement = () => {
  return JSON.parse(localStorage.getItem("paiement"));
}

export const getUserProfil = () => {
  return JSON.parse(localStorage.getItem("infoUser"));
};

export const userToken = () => {
  const user = getUserProfil();

  return user ? user.accessToken : null;
};

export const months = [
  { code: 1, name: "Janvier" },
  { code: 2, name: "Février" },
  { code: 3, name: "Mars" },
  { code: 4, name: "Avril" },
  { code: 5, name: "Mai" },
  { code: 6, name: "Juin" },
  { code: 7, name: "Juillet" },
  { code: 8, name: "Août" },
  { code: 9, name: "Septembre" },
  { code: 10, name: "Octobre" },
  { code: 11, name: "Novembre" },
  { code: 12, name: "Décembre" },
];


// export const paymentMethods = [
//   {
//     id: "wave",
//     name: "Wave",
//     value: "WAVE",
//     icon: "", // Vous pouvez remplacer par une vraie image
//     color: "blue-500",
//   },
//   {
//     id: "orange",
//     name: "Orange Money",
//     value: "OM_SKAN",
//     icon: "",
//     color: "orange-500",
//   },
//   {
//     id: "mtn",
//     name: "MTN Money",
//     value: "MTN_SKAN",
//     icon: "",
//     color: "yellow-500",
//   },
//   {
//     id: "moov",
//     name: "Moov Money",
//     value: "MOOV_SKAN",
//     icon: "",
//     color: "yellow-500",
//   },
//   {
//     id: "visa",
//     name: "Visa",
//     icon: "",
//     value: "VISA",
//     color: "bindigo-500",
//   },
// ];


export const paymentMethods = [
     {
    id: "visa",
    name: "Visa",
    icon: "",
    value: "VISA",
    color: "bindigo-500",
  },
  {
    id: "mobile_money",
    name: "Mobile money",
    icon: "",
    value: "MOBILE_MONEY",
    color: "bindigo-500",
  },

]




export const years = [
  { name: "2027" },
  { name: "2026" },
  { name: "2025" },
  { name: "2024" },
  { name: "2023" },
  { name: "2022" },
];

export const categoriesForfait = [
  { designation: "Prive", value: "PRIVE" },
  { designation: "Public", value: "PUBLIC" },
];

export const periodes = [
  { designation: "jours", value: "JOURS" },
  { designation: "mois", value: "MOIS" },
  { designation: "annee", value: "ANNEE" },
];

export const plans = [
  { designation: "Standard", value: "STANDARD" },
  { designation: "Standard +", value: "STANDARD_PLUS" },
  { designation: "Premium", value: "PREMIUM_PLUS" },
];

export const statutPaiementsListe = [
  { libelle: "Succès", value: "SUCCES" },
  { libelle: "Echec", value: "ECHEC" },
  { libelle: "En attente de paiement", value: "EN_ATTENTE_DE_PAIEMENT" },
];

export const etatSouscriptionsListe = [
  { libelle: "Actif", value: "ACTIF" },
  { libelle: "Inactif", value: "INACTIF" },
  { libelle: "Expiré", value: "EXPIRE" },
];
