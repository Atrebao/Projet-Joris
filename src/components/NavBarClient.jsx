import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, FileText, Home, Bell, CheckCircle, AlertCircle } from 'lucide-react'

export default function NavBarClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  // Fermer les notifs si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const links = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/catalogue', label: 'Catalogue', icon: ShoppingBag },
    { to: '/mes-abonnements', label: 'Mes Abonnements', icon: User },
    { to: '/conditions', label: 'Conditions', icon: FileText },
  ]

  const notifications = [
    {
      id: 1,
      title: 'Bienvenue !',
      message: 'Profitez de nos offres de streaming à prix réduits.',
      type: 'info',
      date: 'Aujourd\'hui'
    },
    {
      id: 2,
      title: 'Promo Flash',
      message: '-20% sur Netflix Premium ce week-end !',
      type: 'promo',
      date: 'Hier'
    }
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-white">
                R
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-800 font-bold text-xl tracking-tight">
                RICHESSES
              </div>
              <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                Streaming
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
                  `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-slate-100 text-slate-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Actions Droite */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Dropdown Notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                        <div className="flex gap-3">
                          <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {notif.type === 'promo' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-2 block">{notif.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-50 bg-gray-50/50">
                    <button className="text-xs font-medium text-slate-600 hover:text-slate-700">
                      Marquer tout comme lu
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/catalogue')}
              className="px-5 py-2.5 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm"
            >
              Découvrir les offres
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-slate-100 text-slate-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}

            {/* Mobile Notifications Link */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-left"
              onClick={() => {
                setIsMenuOpen(false)
                // TODO: Ouvrir page notifs mobile
              }}
            >
              <Bell className="h-5 w-5" />
              <span className="font-medium">Notifications</span>
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</span>
            </button>

            {/* Mobile CTA */}
            <button
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/catalogue')
              }}
              className="w-full mt-4 px-5 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Découvrir les offres
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
