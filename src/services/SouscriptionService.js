import axios from "axios";

const BASE_URL_SOUSCRIPTIONS =  "http://localhost:3001/souscriptions";

export const getSouscriptions = async ()=>{
    return axios.get(BASE_URL_SOUSCRIPTIONS);
}

export const getSouscription = async (id)=>{
    return axios.get(`${BASE_URL_SOUSCRIPTIONS/{id}}`)
}