import axios from "axios";

import { BASE_URL } from "../Utils/Utils";

export const getPaiements = async () => {
  return await axios.get(`${BASE_URL}/paiements`);
};
