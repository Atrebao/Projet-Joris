import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Loader, Sparkles, TrendingUp, User, Store } from "lucide-react";
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
        toast.error("Identifiants incorrects");
      } else {
        toast.error(err?.response?.data?.message || "Erreur de connexion");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-600 rounded-2xl mb-4 shadow-2xl">
              <span className="text-3xl font-bold text-white">R</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-600 bg-clip-text text-transparent mb-2">
              RICHESSES STREAMING
            </h1>
            <p className="text-gray-600">Connectez-vous à votre espace</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connexion</h2>

            {/* Type de connexion */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-semibold transition-all ${
                  loginType === "admin" ? "bg-white shadow text-slate-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="h-4 w-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setLoginType("partenaire")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-semibold transition-all ${
                  loginType === "partenaire" ? "bg-white shadow text-slate-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Store className="h-4 w-4" />
                Partenaire
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Identifiant (username ou email selon le type) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {loginType === "partenaire" ? "Email" : "Nom d'utilisateur"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={loginType === "partenaire" ? "email" : "text"}
                    placeholder={loginType === "partenaire" ? "votre@email.com" : "Nom d'utilisateur"}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      (errors.username || errors.email) ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-slate-500"
                    }`}
                    {...register(loginType === "partenaire" ? "email" : "username", {
                      required: loginType === "partenaire" ? "L'email est requis" : "Le nom d'utilisateur est requis",
                    })}
                  />
                </div>
                {(errors.username || errors.email) && (
                  <p className="mt-1 text-sm text-red-600">{errors.username?.message || errors.email?.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-slate-500"
                    }`}
                    {...register("password", {
                      required: "Le mot de passe est requis",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-slate-600" />
                  <span className="text-gray-600">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-700 font-semibold"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-slate-600 to-slate-600 text-white hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <Sparkles className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Nouveau sur la plateforme ?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                Compte Client
              </button>
              <button
                type="button"
                onClick={() => navigate("/register-partenaire")}
                className="py-3 border-2 border-slate-600 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                Devenir Partenaire
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            © 2025 Richesses Streaming. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-600 via-slate-600 to-slate-600 p-12 items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 mb-6" />
            <h2 className="text-5xl font-bold mb-4 leading-tight">
              Gérez votre plateforme de streaming
            </h2>
            <p className="text-xl text-slate-100 leading-relaxed">
              Accédez à un tableau de bord complet pour gérer vos partenaires, offres et clients en toute simplicité.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-3xl font-bold">45+</span>
              </div>
              <p className="text-slate-100">Partenaires actifs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6" />
                <span className="text-3xl font-bold">287</span>
              </div>
              <p className="text-slate-100">Offres disponibles</p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-slate-100">Tableau de bord en temps réel</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-slate-100">Gestion simplifiée des partenaires</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-slate-100">Statistiques détaillées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
