import React, { useEffect, useState } from "react";
import Catogories from '../components/Catogories'
import Abonnement from "./AbonnementDetails";
import Carousel from "../components/Carousel";
import Services from "../components/Services";
import ScrollingTextWithStyles from "../components/ScrollingText ";
export default function () {


  return (
<div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-200 py-10 md:py-[65px]">
  <div className="w-full h-full">
    {/* Carousel avec effet de transition fluide */}
    <div className="overflow-hidden">
      <Carousel />
    </div>

    {/* Section Services avec animation */}
    <div className="mt-16 animate-fade-in">
      <Services />
    </div>
  </div>
</div>

  );
}
