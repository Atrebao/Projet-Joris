import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { resetStorage, HOMEADMIN } from "../Utils/Utils";

// Icons (à ajuster selon votre bibliothèque d'icônes)
import { Menu as MenuIcon, Close as CloseIcon, QueryStats as QueryStatsIcon, Widgets as WidgetsIcon, BusinessCenter as BusinessCenterIcon, ManageAccounts as ManageAccountsIcon, Key as KeyIcon, Logout as LogoutIcon, Settings as SettingsIcon } from "@mui/icons-material";

export default function NavBarAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const exits = () => {
    resetStorage();
    navigate(`${HOMEADMIN}/login`);
  };

  return (
    <div className="px-4 py-3 md:py-6 z-[100] w-full bg-slate-800 shadow-lg">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to={`${HOMEADMIN}/`} onClick={() => setIsMenuOpen(false)}>
          <div className="flex items-center">
            <img className="w-[32px] md:w-[40px] mr-2" src="/path/to/logo.png" alt="logo" />
            <p className="text-lg md:text-2xl lg:text-3xl text-white font-bold">
              RICHESSES
              <span className="text-blue-400 pl-1">
                <i>STREAMING</i>
              </span>
            </p>
          </div>
        </NavLink>

        {/* Menu Toggle Button (mobile view) */}
        <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex flex-col md:flex-row items-start md:items-center absolute md:relative top-14 md:top-0 left-0 w-full md:w-auto bg-slate-800 md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none transition-all md:gap-4`}
        >
          <NavLink
            to={`${HOMEADMIN}/stats`}
            className={({ isActive }) => `text-sm flex items-center gap-x-1 ${isActive ? "font-bold text-blue-400" : "text-white"}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <QueryStatsIcon />
            <span>Tableau de bord</span>
          </NavLink>

          <NavLink
            to={`${HOMEADMIN}/abonnements`}
            className={({ isActive }) => `text-sm flex items-center gap-x-1 ${isActive ? "font-bold text-blue-400" : "text-white"}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <WidgetsIcon />
            <span>Abonnements</span>
          </NavLink>

          <NavLink
            to={`${HOMEADMIN}/souscriptions`}
            className={({ isActive }) => `text-sm flex items-center gap-x-1 ${isActive ? "font-bold text-blue-400" : "text-white"}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <BusinessCenterIcon />
            <span>Souscriptions</span>
          </NavLink>

          {/* Dropdown Reglages */}
          <div className="relative group">
            <button className="text-white flex items-center gap-x-1 group-hover:text-blue-400">
              <SettingsIcon />
              <span>Réglages</span>
            </button>
            <ul className="absolute hidden group-hover:block bg-white rounded-lg shadow-lg p-2 w-48 mt-1">
              <li>
                <NavLink
                  to={`${HOMEADMIN}/forfaits`}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ManageAccountsIcon className="mr-2" />
                  Forfaits
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`${HOMEADMIN}/utilisateurs`}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ManageAccountsIcon className="mr-2" />
                  Utilisateurs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`${HOMEADMIN}/identifiants`}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-100 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <KeyIcon className="mr-2" />
                  Identifiants
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={exits}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-x-2 transition-all"
        >
          <LogoutIcon />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
