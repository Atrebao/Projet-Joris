import React, { useEffect, useState } from "react";


import Carousel from "../components/Carousel";
import Services from "../components/Services";
export default function () {


  return (
    <div className="w-full h-full md:py-[65px]   ">
      <div className="w-full h-full">
        <Carousel />
        <Services />
      </div>
    </div>
  );
}
