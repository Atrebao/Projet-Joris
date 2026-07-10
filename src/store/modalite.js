import { create } from "zustand";
import { getAll, deleteOne } from "../services/service";

import { RECHERCHER_LISTES_FORFAIT, RECHERCHER_LISTES_MODALITE } from "../Utils/constant";
import { API_URL } from "@/lib/api";

export const useStoreModalite = create((set) => ({
  loading: false,
  data: [],
  typeAbonnements:[],
  modalite: async () => {
    set({
      loading: true,
      data: [],
      typeAbonnements:[]
    });
    try {
      const modalites = await getAll(`${API_URL}${RECHERCHER_LISTES_FORFAIT}`)
      set({
        loading: false,
        data: modalites.data,
        typeAbonnements: modalites.data,
      });
    } catch (error) {
      set({
        loading: false,
        data: [],
        typeAbonnements:[]
      });
    }
  },
}));
