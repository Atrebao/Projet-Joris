import clientAxios from "axios";
import { BASE_URLS } from "../Utils/Utils";


export const loginUser = async (...data) => {
    return await clientAxios.post(`${BASE_URLS}/auth/signin`, ...data);
  };
  