import { create } from 'zustand'
import { RECHERCHER_LISTES_USER } from '../Utils/constant';

export const useStoreUser = create((set) => ({
    loading: false,
    data :[], 
    users: [],
    getAllData : async ()=>{
        set({
            loading: true,
            data: [],
            users : []
          });
      try{

        const users = await getAll(`${RECHERCHER_LISTES_USER}`);
        set({
            loading: false,
            data: users.data,
            users : users.data
          });

      }catch(error){
        set({
            loading: false,
            data: [],
            users : []
          });
      }
    },
  }))