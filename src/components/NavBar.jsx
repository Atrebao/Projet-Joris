import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function Navbar() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 60 ? setIsActive(true) : setIsActive(false);
    });
  });

  return (
    <div className="flex items-center justify-between p-4 z-[100] w-full absolute">
      <p className="text-2xl text-white sm:text-3xl  md:text-4xl md:text-slate-600 font-bold">
        RICHESSES{" "}
        <span className="text-blue-300">
          <i>STREAMING</i>
        </span>
      </p>
      <div className="w-full sm:w-[400px] md:w-[600px] flex flex-col sm:flex-row items-center justify-around">
        <div className="flex items-center">
          <FaWhatsapp className="mx-2 text-white md:text-blue-300 text-2xl sm:text-3xl" />
          <span className="text-white md:text-slate-500 text-xl sm:text-2xl">0585968574</span>
        </div>
        <button className="mt-4 sm:mt-0 px-4 sm:px-6 py-2 border border-blue-300 rounded-full uppercase shadow-md">
          Nos services
        </button>
      </div>
    </div>
  );
}
