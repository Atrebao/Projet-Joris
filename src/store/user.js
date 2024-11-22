import { create } from 'zustand'

export const useStoreUser = create((set) => ({
    loading: false,
    data :[],
    getUsers : async ()=>{
        set({
            loading: true,
            data: [],
          });
      
    }
  }))