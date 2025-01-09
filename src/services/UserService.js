import axios from "axios";

const BASE_URL_USERS =  "http://localhost:3000/users";

export const getUsers = async () =>{
    return await axios.get({BASE_URL_USERS})
}

