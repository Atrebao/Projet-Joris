import React from "react";
import FormsClient from "../components/FormsClient";

export default function Register() {

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100  grid grid-cols-1 md:grid-cols-2  gap-12 ">
      <div className="hidden h-screen flex-col md:flex bg-green-400">
        <img
          className="h-screen object-cover"
          src="https://cdn.lesnumeriques.com/optim/news/21/217269/1206e136-netflix-prime-video-canal-disney-quelle-est-la-meilleure-plateforme-de-streaming-en-janvier-2024__1200_900__0-0-1915-1079.jpg "
          alt=""
        />
      </div>

      <div className="flex flex-col items-center justify-center ">
        <FormsClient />
      </div>
    </div>
  );
}
