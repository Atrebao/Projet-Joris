import axios from "axios";
import { AwardIcon } from "lucide-react";
import { AJOUTER_MODALITE, RECHERCHER_LISTES_MODALITE } from "../Utils/constant";


export const getModalites = async ()=>{
    return await axios.get(RECHERCHER_LISTES_MODALITE);
}

export const ajouterModalite = async (data)=>{

    return await axios.post(AJOUTER_MODALITE,data);
}