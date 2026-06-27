import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Loader, Sparkles, TrendingUp, User, Store, Shield } from "lucide-react";
import { getUserProfil, HOMEADMIN, HOMEPARTENAIRE, saveUserProfil, getPartenaireId } from "../Utils/Utils";
import { authAPI } from "../lib/api";



export default function LoginModerne() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("admin"); // "admin" | "partenaire"
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const info = getUserProfil();
    if (info) {
      if (getPartenaireId()) {
        navigate(`${HOMEPARTENAIRE}/dashboard`);
      } else {
        navigate(`${HOMEADMIN}/stats`);
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let res;
      if (loginType === "partenaire") {
        res = await authAPI.loginPartenaire({ email: data.email || data.username, password: data.password });
      } else {
        res = await authAPI.loginAdmin({ username: data.username || data.email, password: data.password });
      }
      if (res?.data) {
        saveUserProfil(res.data);
        toast.success("Connexion réussie !");
        if (loginType === "partenaire") {
          navigate(`${HOMEPARTENAIRE}/dashboard`);
        } else {
          navigate(`${HOMEADMIN}/stats`);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      if (err?.response?.status === 401 || err?.code === "ERR_BAD_REQUEST") {
        const message = err?.response?.data?.message || "Identifiants incorrects";
        toast.error(message);
       
      } else {
        toast.error(err?.response?.data?.message || "Erreur de connexion");
      }
    }
  };

return (
  <div className="min-h-screen flex bg-slate-50/50">
    
    {/* COLONNE GAUCHE - Formulaire de Connexion (Prend tout l'espace sur mobile, 50% sur grand écran) */}
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:max-w-2xl bg-card border-r border-border">
      
      {/* En-tête : Logo de l'application */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl shadow-md shadow-primary/20">
          <span className="text-xl font-black text-primary-foreground tracking-tighter">R</span>
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
            RICHESSES STREAMING
          </h1>
          <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-0.5">
            Marketplace SaaS
          </p>
        </div>
      </div>

      {/* Centre : Boîtier du Formulaire */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Se connecter
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenue. Renseignez vos accès pour administrer vos services.
          </p>
        </div>

        {/* Sélecteur de type de compte (Style onglet épuré) */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              loginType === "admin" 
                ? "bg-card shadow-sm text-slate-900 border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            Espace Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginType("partenaire")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              loginType === "partenaire" 
                ? "bg-card shadow-sm text-slate-900 border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Store className="h-4 w-4 shrink-0" />
            Espace Partenaire
          </button>
        </div>

        {/* Formulaire principal */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Identifiant */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {loginType === "partenaire" ? "Adresse Email" : "Nom d'utilisateur"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={loginType === "partenaire" ? "email" : "text"}
                placeholder={loginType === "partenaire" ? "votre@email.com" : "Ex: admin_richesses"}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                  (errors.username || errors.email) 
                    ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                    : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
                {...register(loginType === "partenaire" ? "email" : "username", {
                  required: loginType === "partenaire" ? "L'email est requis" : "Le nom d'utilisateur est requis",
                })}
              />
            </div>
            {(errors.username || errors.email) && (
              <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.username?.message || errors.email?.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Mot de passe
              </label>
              <button
                type="button"
                className="text-xs text-primary hover:underline font-semibold"
                onClick={() => navigate("/forgot-password-partenaire")}
              >
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm outline-none transition-all ${
                  errors.password
                    ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10"
                    : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
                {...register("password", {
                  required: "Le mot de passe est requis",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Se souvenir de moi */}
          <div className="flex items-center text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 accent-primary" />
              <span className="text-slate-500 font-medium">Rester connecté sur cet appareil</span>
            </label>
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-[0.99] mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Vérification des accès...
              </>
            ) : (
              <>
                Se connecter au tableau de bord
              </>
            )}
          </button>
        </form>

        {/* Séparateur horizontal */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
            <span className="px-3 bg-card text-slate-400">Nouveau membre ?</span>
          </div>
        </div>

        {/* Boutons de création de compte secondaires */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="py-2.5 border border-slate-200 text-slate-700 bg-slate-50/50 rounded-xl text-xs font-bold hover:bg-slate-100/80 hover:border-slate-300 transition-all text-center"
          >
            Espace Client
          </button>
          <button
            type="button"
            onClick={() => navigate("/register-partenaire")}
            className="py-2.5 border border-primary/20 text-primary bg-primary/5 rounded-xl text-xs font-bold hover:bg-primary/10 transition-all text-center"
          >
            Devenir Partenaire
          </button>
        </div>
      </div>

      {/* Pied de page du formulaire */}
      <p className="text-center text-xs font-medium text-slate-400">
        &copy; {new Date().getFullYear()} Richesses Streaming. Tous droits réservés.
      </p>
    </div>

    {/* COLONNE DROITE - Panneau Immersif (Masqué sur mobile, prend 50% sur grand écran) */}
    <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
      {/* Texture d'arrière-plan abstraite et discrète */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-[120px]" />

      <div className="relative z-10 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Serveur d&apos;automatisation actif</span>
      </div>

      {/* Message marketing au centre */}
      <div className="relative z-10 my-auto max-w-md space-y-4">
        <h3 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
          Gérez vos stocks de comptes en temps réel.
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          Une plateforme africaine automatisée. Vos clients achètent par Mobile Money (Orange, MTN, Moov, Wave) et reçoivent leurs identifiants instantanément.
        </p>
        
               {/* Mini boîte d'état synthétique */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Disponibilité</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">98.7%</p>
            <p className="text-[10px] text-slate-500 font-medium">Temps de service</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Livraisons</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">1,284</p>
            <p className="text-[10px] text-slate-500 font-medium">Comptes livrés</p>
          </div>
        </div>

        {/* Badge de sécurité */}
        <div className="flex items-center gap-3 mt-4 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 w-fit">
          <div className="flex -space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">S</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">M</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">W</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">
            PAIEMENTS SÉCURISÉS
          </span>
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
        </div>
      </div>

      {/* Pied de page - Partenaires */}
      <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold text-lg">+</span>
          <span className="font-medium">56 partenaires actifs</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <span className="font-medium">📱</span>
          <span className="font-medium">Orange, MTN, Moov, Wave</span>
        </div>
        <div className="w-px h-4 bg-slate-800 hidden xl:block"></div>
        <span className="hidden xl:block font-medium">v3.2.1</span>
      </div>
    </div>
  </div>
);

}
