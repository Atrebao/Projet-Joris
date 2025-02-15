import { create } from "zustand";

import { getAll, deleteOne } from "../services/service";
import { RECHERCHER_DETAILS, RECHERCHER_LISTES_ABONNEMENT } from "../Utils/constant";
import { BASE_URLS } from "../Utils/Utils";

export const useAbonnementStore = create((set) => ({
  loading: false,
  data: [],
  abonnements : [],
  abonnement :{},
  getAllData: async () => {
    set({
      loading: true,
      data: [],
      abonnements : []
    });

    try {
      const abonnements = await getAll(`${BASE_URLS}${RECHERCHER_LISTES_ABONNEMENT}`);

      setTimeout(() => {
        set({
          loading: false,
          data: abonnements.data,
          abonnements : abonnements.data,
        });
      }, 1000);
    } catch (error) {
      set({
        loading: false,
        data: [],
        abonnements : [],
      });
    }
  },
  getAbonnement : async (id)=>{
    const abonnement = await getAll(`${BASE_URLS} ${RECHERCHER_DETAILS}/${id}`);
    set({
      loading: false,
      abonnement : abonnement
    });
  }
}));
