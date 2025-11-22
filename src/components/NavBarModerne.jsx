import { useState } from "react";
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
  Settings,
  Bell,
  Search
} from "lucide-react";

export default function NavBarModerne() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer si on est en mode admin ou partenaire
  const isAdmin = location.pathname.includes('/admin') || location.pathname.includes('/backoffice');
  const isPartenaire = location.pathname.includes('/partenaire');

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    resetStorage();
    navigate(isAdmin ? "/backoffice/login" : "/");
  };

  // Navigation admin
  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/partenaires", icon: Users, label: "Partenaires" },
    { to: "/admin/offres", icon: Package, label: "Offres" },
    { to: "/admin/clients", icon: ShoppingCart, label: "Clients" },
    { to: "/admin/stats", icon: BarChart3, label: "Stats" },
  ];

  // Navigation partenaire
  const partenaireLinks = [
    { to: "/partenaire", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/partenaire/offres/nouvelle", icon: Package, label: "Nouvelle Offre" },
    { to: "/partenaire/clients", icon: Users, label: "Clients" },
    { to: "/partenaire/stats", icon: BarChart3, label: "Statistiques" },
  ];

  const links = isPartenaire ? partenaireLinks : adminLinks;
  const gradientClass = isPartenaire 
    ? "from-purple-600 via-pink-500 to-rose-500" 
    : "from-indigo-600 via-purple-600 to-pink-500";

  return (
    <nav className={`sticky top-0 z-50 bg-gradient-to-r ${gradientClass} shadow-2xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink 
            to={isPartenaire ? "/partenaire" : "/admin"} 
            className="flex items-center gap-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                R
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-xl tracking-tight">
                RICHESSES
              </div>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                {isPartenaire ? "Partenaire" : "Admin"} Panel
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white text-purple-600 shadow-lg font-semibold"
                      : "text-white hover:bg-white/20 hover:shadow-md"
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <button className="p-2 text-white hover:bg-white/20 rounded-xl transition-all">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-white hover:bg-white/20 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-white hover:bg-white/20 rounded-xl transition-all">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l-2 border-white/20">
              <div className="text-right hidden lg:block">
                <div className="text-white text-sm font-semibold">Admin User</div>
                <div className="text-white/70 text-xs">admin@richesses.ci</div>
              </div>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                <UserCircle2 className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white text-purple-600 font-semibold shadow-lg"
                      : "text-white hover:bg-white/20"
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}

            {/* Mobile actions */}
            <div className="pt-4 mt-4 border-t border-white/20 space-y-2">
              <button className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all w-full">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Paramètres</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
