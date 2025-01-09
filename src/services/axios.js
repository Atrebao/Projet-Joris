import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URLS, HOMEADMIN, resetStorage, userToken } from "../Utils/Utils";


const clientAxios = axios.create({
  baseURL: BASE_URLS,
});

clientAxios.interceptors.request.use(
  (config) => {
    const token = userToken();
    
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

clientAxios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.code === "ERR_NETWORK") {
      toast.error("Oops! problème de connexion.");
    } else if ( 
      error &&
      error.response &&
      error.response.status &&
      error.response.status === 401
    ) {
      toast.error("Vous n'êtes pas authentifié");
      resetStorage();
      window.location.replace(`#${HOMEADMIN}/login`);
    }
    return Promise.reject(error);
  }
);

export default clientAxios;
