import axios from "axios";
import { BASE_URL } from "../Utils/Utils";


export const  getGrapheChiffreAffaire = async (url, contentType, ...filterData) =>{
    return await axios.get(BASE_URL);
}
