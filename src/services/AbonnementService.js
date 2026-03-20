import axios from "axios";
import { BASE_URL } from "../Utils/Utils"

const BASE_URL_ABONNEMENT = `${BASE_URL}/abonnements`;
const BASE_URL_MODALITES = `${BASE_URL}/modalites`;

export const getAbonnements = async () => {
  return await axios.get(BASE_URL_ABONNEMENT);
};

export const getAbonnement = async (id) => {
  return await axios.get(`${BASE_URL}/${id}`);
};

export const addAbonnement = async (abonnememnt) => {
  return await axios.post(BASE_URL_ABONNEMENT, abonnememnt, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateAbonnement = async (id) => {
  return await axios.put(`${BASE_URL_ABONNEMENT}/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteAbonnement = async (id) => {
  return await axios.delete(`${BASE_URL_ABONNEMENT}/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export const getModalites = async () => {
  return await axios.get(BASE_URL_MODALITES);
}

// Méthodes pour la gestion des souscriptions clients
export const getSouscriptionsByEmail = async (email) => {
  return await axios.get(`${BASE_URL}/souscriptions/by-email/${email}`);
};

export const getSouscriptionByReference = async (reference) => {
  return await axios.get(`${BASE_URL}/souscriptions/reference/${reference}`);
};

export const checkActiveSubscription = async (email, offreNom) => {
  return await axios.get(`${BASE_URL}/souscriptions/check-active`, {
    params: { email, offreNom }
  });
};
