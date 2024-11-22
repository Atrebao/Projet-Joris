import React, { useEffect, useState } from "react";
import Catogories from '../components/Catogories'
import Abonnement from "./AbonnementDetails";
import Carousel from "../components/Carousel";
import Services from "../components/Services";
export default function () {


  return (
    <div className="w-full h-full md:py-[65px] bg-slate-100   ">
      <div className="w-full h-full">
        <Carousel />
        <Services />
       
      </div>
    </div>
  );
}
