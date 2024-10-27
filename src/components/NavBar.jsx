import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 60 ? setIsActive(true) : setIsActive(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`p-4 z-[100] w-full fixed top-0 ${isActive ? "bg-white opacity-65 shadow-lg" : "bg-white"} transition duration-300`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <NavLink to="/">
          <div className="flex items-center">
            <img className="w-[60px] sm:w-[40px] mr-2" src={logo} alt="logo" />
            <p className="text-xl sm:text-2xl md:text-3xl text-black font-bold">
              RICHESSES
              <span className="text-blue-300 pl-1">
                <i>STREAMING</i>
              </span>
            </p>
          </div>
        </NavLink>

        <NavLink to="https://wa.me/+2250504668380" target="_blank">
          <div className="hidden sm:block cursor-pointer rounded-xl border border-blue-500 hover:bg-orange-400 hover:text-white px-4 py-2 transition-all duration-300">
            <p className="text-sm sm:text-lg font-semibold">Nous contacter</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}