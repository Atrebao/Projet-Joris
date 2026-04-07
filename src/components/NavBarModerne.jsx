import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { resetStorage } from "../Utils/Utils";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  UserCircle2,
  LogOut,
  ShoppingCart,
  Bell,
  Search,
  Percent,
  Layers
} from "lucide-react";

export default function NavBarModerne() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer le type d'utilisateur de manière plus robuste
  const getUserType = () => {
    const path = location.pathname;
    if (path.includes('/backoffice') || path === '/backoffice') return 'admin';
    if (path.includes('/partenaire')) return 'partenaire';
    
    // Vérifier dans le localStorage si l'utilisateur est connecté
    const partenaire = localStorage.getItem('partenaire');
    if (partenaire) return 'partenaire';

    const user = localStorage.getItem('user');
    const infoUser = localStorage.getItem('infoUser');
    const data = infoUser ? (() => { try { return JSON.parse(infoUser); } catch { return null; } })() : null;
    if (data?.partenaire) return 'partenaire';
    if (user || data?.user) {
      try {
        const userData = JSON.parse(user || JSON.stringify(data?.user || {}));
        const role = userData?.role || data?.user?.role;
        if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'admin' || role === 'super_admin') return 'admin';
        if (role === 'PARTENAIRE' || role === 'partenaire') return 'partenaire';
      } catch (e) {
        console.error('Erreur parsing user data:', e);
      }
    }
    
    return null; // Non authentifié
  };

  const userType = getUserType();
  const isAdmin = userType === 'admin';
  const isPartenaire = userType === 'partenaire';

  // Gestion du scroll pour l'effet sticky amélioré
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    resetStorage();
    navigate("/");
    setIsMenuOpen(false);
  };

  // Navigation admin
  const adminLinks = [
    { to: "/backoffice", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/backoffice/partenaires", icon: Users, label: "Partenaires" },
    { to: "/backoffice/offres", icon: Package, label: "Offres" },
    { to: "/backoffice/commandes", icon: ShoppingCart, label: "Commandes" },
    { to: "/backoffice/clients", icon: ShoppingCart, label: "Clients" },
    { to: "/backoffice/stats", icon: BarChart3, label: "Stats" },
  ];

  // Navigation partenaire
  const partenaireLinks = [
    { to: "/partenaire", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/partenaire/commandes", icon: ShoppingCart, label: "Commandes" },
    { to: "/partenaire/identifiants", icon: UserCircle2, label: "Identifiants" },
    { to: "/partenaire/offres/nouvelle", icon: Package, label: "Nouvelle Offre" },
    { to: "/partenaire/forfaits", icon: Layers, label: "Forfaits" },
    { to: "/partenaire/clients", icon: Users, label: "Clients" },
    { to: "/partenaire/promotions", icon: Percent, label: "Promotions" },
    { to: "/partenaire/stats", icon: BarChart3, label: "Statistiques" },
  ];

  const links = isPartenaire ? partenaireLinks : (isAdmin ? adminLinks : []);

  // Si l'utilisateur n'est pas authentifié, ne pas afficher la navbar
  if (!userType) {
    return null;
  }

  // Couleurs sobres pour admin/partenaire
  const themeColor = isPartenaire ? "text-slate-700" : "text-slate-700";
  const themeBg = isPartenaire ? "bg-slate-700" : "bg-slate-700";
  const themeHoverBg = isPartenaire ? "hover:bg-slate-50" : "hover:bg-slate-50";

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
        : 'bg-white border-b border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to={isPartenaire ? "/partenaire" : "/backoffice"}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className={`w-10 h-10 ${themeBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-2xl font-bold text-white">R</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-800 font-bold text-xl tracking-tight">
                RICHESSES
              </div>
              <div className={`${themeColor} text-xs font-semibold uppercase tracking-wider`}>
                {isPartenaire ? "Espace Partenaire" : "Administration"}
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact || false}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${themeBg} text-white shadow-md font-medium`
                      : `text-slate-600 ${themeHoverBg} hover:scale-105`
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search - optionnel */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden lg:block">
                <div className="text-slate-800 text-sm font-semibold">
                  {isPartenaire ? "Espace Partenaire" : "Administrateur"}
                </div>
                <div className="text-slate-500 text-xs">Connecté</div>
              </div>
              <div className={`p-2 ${isPartenaire ? 'bg-slate-100' : 'bg-slate-100'} ${themeColor} rounded-xl cursor-pointer hover:scale-105 transition-transform`}>
                <UserCircle2 className="h-6 w-6" />
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu avec animation */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact || false}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? `${themeBg} text-white font-medium shadow-md`
                      : `text-slate-600 ${themeHoverBg}`
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}

            {/* Mobile search */}
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all w-full">
              <Search className="h-5 w-5" />
              <span className="font-medium">Rechercher</span>
            </button>

            {/* Mobile notifications */}
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all w-full relative">
              <Bell className="h-5 w-5" />
              <span className="font-medium">Notifications</span>
              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Mobile logout */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
