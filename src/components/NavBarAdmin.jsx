import React,{useState} from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import WidgetsIcon from "@mui/icons-material/Widgets";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyIcon from "@mui/icons-material/Key";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import logo from "../assets/images/logo.png";
import { NavLink } from "react-router-dom";
import { HOMEADMIN } from "../Utils/Utils";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export default function NavBarAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="px-4 py-3 md:py-6 z-[100] w-full bg-stone-700">
      <div className="max-w-8xl mx-auto flex items-center justify-between ">
        {/* Logo */}
        <NavLink to={`${HOMEADMIN}/`}>
          <div className="flex items-center">
            <img
              className="w-[32px] md:w-[40px] mr-2"
              src={logo}
              alt="logo"
            />
            <p className="text-lg md:text-2xl lg:text-3xl text-white font-bold">
              RICHESSES
              <span className="text-blue-300 pl-1">
                <i>STREAMING</i>
              </span>
            </p>
          </div>
        </NavLink>

        {/* Menu Toggle Button (mobile view) */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex flex-col md:flex-row items-start md:items-center gap-y-4 md:gap-y-0 gap-x-5 md:gap-x-8 absolute md:relative top-14 md:top-0 left-0 w-full md:w-auto bg-stone-700 md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none`}
        >
          <NavLink
            to={`${HOMEADMIN}/stats`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <QueryStatsIcon />
              <span>Tableau de bord</span>
            </button>
          </NavLink>
          <NavLink
            to={`${HOMEADMIN}/abonnements`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <WidgetsIcon />
              <span>Abonnements</span>
            </button>
          </NavLink>
          <NavLink
            to={`${HOMEADMIN}/souscriptions`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <BusinessCenterIcon />
              <span>Souscriptions</span>
            </button>
          </NavLink>
          <NavLink
            to={`${HOMEADMIN}/clients`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <PeopleIcon />
              <span>Clients</span>
            </button>
          </NavLink>
          <NavLink
            to={`${HOMEADMIN}/utilisateurs`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <ManageAccountsIcon />
              <span>Utilisateurs</span>
            </button>
          </NavLink>
          <NavLink
            to={`${HOMEADMIN}/identifiants`}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-500" : "text-white"
            }
          >
            <button className="text-sm flex items-center gap-x-1">
              <KeyIcon />
              <span>Identifiants</span>
            </button>
          </NavLink>
          <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-x-2">
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}