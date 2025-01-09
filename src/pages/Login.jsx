import React, { useState, useEffect } from "react";
import logo from "../assets/images/logo.png";
import LoginForm from "../Auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { getUserProfil, HOMEADMIN } from "../Utils/Utils";

export default function Login() {
  const navigate = useNavigate()
  useEffect(() =>{

    if(getUserProfil()){
      navigate(`${HOMEADMIN}/stats`);
    }
  },[])
  


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100  grid grid-cols-1 md:grid-cols-2  gap-12 ">
      <div className="hidden h-screen flex-col md:flex bg-green-400">
        <img
          className="h-screen object-cover"
          src="https://cdn.lesnumeriques.com/optim/news/21/217269/1206e136-netflix-prime-video-canal-disney-quelle-est-la-meilleure-plateforme-de-streaming-en-janvier-2024__1200_900__0-0-1915-1079.jpg "
          alt=""
        />
      </div>

      <div className="flex flex-col items-center ">
        <div className="mt-10 py-5 w-44 md:w-48 lg:w-52">
          <img src={logo} className="w-full h-auto" alt="Pokeball" />
        </div>
        <div className="w-[450px] rounded-lg h-fit bg-white shadow-2xl p-5">
          <h1 className="text-center text-2xl font-bold">Login</h1>
          <LoginForm/>
        </div>
      </div>
    </div>
  );
}
