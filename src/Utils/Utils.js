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

export const paymentMethods = [
  {
    id: "wave",
    name: "Wave",
    value: "WAVE",
    icon: "", // Vous pouvez remplacer par une vraie image
    color: "blue-500",
  },
  {
    id: "orange",
    name: "Orange Money",
    value: "OM_MONEY",
    icon: "",
    color: "orange-500",
  },
  {
    id: "mtn",
    name: "MTN Money",
    value: "MTN_MONEY",
    icon: "",
    color: "yellow-500",
  },
  {
    id: "visa",
    name: "Carte Visa",
    icon: "",
    value: "VISA",
    color: "bindigo-500",
  },
];

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
]

export   const periodes = [
  { designation: "jours", value: "JOURS" },
  { designation: "mois", value: "MOIS" },
  { designation: "annee", value: "ANNEE" },
];
