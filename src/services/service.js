import clientAxios from "./axios";


export const addOne = async (url, contentType, ...data) => {
    return await clientAxios.post(`${url}`, ...data, {
      headers: { "Content-Type": contentType },
    });
  };

  
export const editOne = async (url, id, ...data) => {
    return await clientAxios.post(`${url}/${id}`, ...data);
  };

export const disable = async (url, id) =>{
  return await clientAxios.post(`${url}/${id}`);
}


  export const getAll = async (url) => {
    return await clientAxios.get(`${url}`);
  };

  export const deleteOne  = async (url, id) =>{
    return await clientAxios.delete(`${url}/${id}`);
  }