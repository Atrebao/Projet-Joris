import { create } from "zustand";
import { getAll, deleteOne } from "../services/service";
import { BASE_URLS } from "../Utils/Utils";
import { RECHERCHER_LISTES_FORFAIT, RECHERCHER_LISTES_MODALITE } from "../Utils/constant";

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
      const modalites = await getAll(`${BASE_URLS}${RECHERCHER_LISTES_FORFAIT}`)
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
