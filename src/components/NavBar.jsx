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
    <div
      className={`px-4 py-2 md:py-4 z-[100] w-full fixed top-0 ${
        isActive ? "bg-white/90 backdrop-blur-sm shadow-lg" : "bg-white"
      } transition duration-300`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <NavLink to="/">
          <div className="flex items-center">
            <img className="w-[32px] md:w-[40px] mr-2" src={logo} alt="logo" />
            <p className="text-lg md:text-2xl lg:text-3xl text-black font-bold">
              RICHESSES
              <span className="text-blue-300 pl-1">
                <i>STREAMING</i>
              </span>
            </p>
          </div>
        </NavLink>

        <NavLink
          to="https://wa.me/+2250758284883"
          target="_blank"
          className="flex-shrink-0"
        >
          <button className="bg-blue-600 text-white text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Nous contacter
          </button>
        </NavLink>
      </div>
    </div>
  );
}
