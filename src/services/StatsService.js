import axios from "axios";

import { BASE_URL, BASE_URLS } from "../Utils/Utils";
import clientAxios from "./axios";

export const getGrapheChiffreAffaire = async (
  url,
  contentType,
  ...filterData
) => {
  return await clientAxios.get(BASE_URLS + url, {
    headers: {
      "Content-Type": contentType,
    },
    params: filterData[0],
  });
};
