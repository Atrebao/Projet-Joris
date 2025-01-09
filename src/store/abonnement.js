import { create } from "zustand";

import { getAll, deleteOne } from "../services/service";
import { RECHERCHER_DETAILS, RECHERCHER_LISTES_ABONNEMENT } from "../Utils/constant";

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
      const abonnements = await getAll(RECHERCHER_LISTES_ABONNEMENT);

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
    const abonnement = await getAll(`${RECHERCHER_DETAILS}/${id}`);
    set({
      loading: false,
      abonnement : abonnement
    });
  }
}));
