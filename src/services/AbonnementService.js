import axios from "axios";

const BASE_URL = "http://localhost:3001/abonnements";

export const getAbonnements = async () => {
  return await axios.get(BASE_URL);
};

export const getAbonnement = async (id) => {
  return await axios.get(`${BASE_URL}/${id}`);
};

export const addAbonnement = async (abonnememnt) => {
  return await axios.post(BASE_URL, abonnememnt, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateAbonnement = async (id) => {
  return await axios.put(`${BASE_URL}/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteAbonnement = async (id) => {
  return await axios.delete(`${BASE_URL}/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};
