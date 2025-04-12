import { create } from "zustand";
import { getAll, deleteOne } from "../services/service";
import {
  RECHERCHER_DETAILS_SOUSCRIPTION,
  RECHERCHER_LISTES_SOUSCRIPTION,
} from "../Utils/constant";

export const useSouscriptionStore = create((set) => ({
  loading: false,
  data: [],
  sosucriptions: [],
  souscription: {},
  getAllData: async (statut, etat, param) => {
    set({
      loading: true,
      data: [],
      sosucriptions: [],
    });
    try {
      const souscriptions = await getAll(
        `${RECHERCHER_LISTES_SOUSCRIPTION}?statut=${statut}&etat=${etat}&param=${param}`
      );
      setTimeout(() => {
        set({
          loading: false,
          data: souscriptions.data,
          sosucriptions: souscriptions.data,
        });
      }, 1000);
    } catch (error) {
      set({
        loading: false,
        data: [],
        sosucriptions: [],
      });
    }
  },
  getSouscription: async (id) => {
    const souscription = await getAll(
      `${RECHERCHER_DETAILS_SOUSCRIPTION}/${id}`
    );
    set({
      loading: false,
      souscription: souscription,
    });
  },
}));
