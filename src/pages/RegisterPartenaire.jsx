import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building2, 
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  Upload,
  Loader
} from "lucide-react";

export default function RegisterPartenaire() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    setTimeout(() => {
      // TODO: Appel API pour créer le partenaire
      console.log("Données partenaire:", data);
      toast.success("Inscription réussie ! Votre compte est en attente de validation.");
      navigate("/backoffice/login");
    }, 2000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const etapes = [
    { numero: 1, titre: "Informations personnelles", icon: User },
    { numero: 2, titre: "Informations boutique", icon: Building2 },
    { numero: 3, titre: "Sécurité", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Devenir Partenaire
          </h1>
          <p className="text-gray-600 text-lg">
            Rejoignez notre réseau et développez votre activité
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {etapes.map((etape, index) => (
              <div key={etape.numero} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      etapeActuelle >= etape.numero
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {etapeActuelle > etape.numero ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <etape.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center font-medium hidden sm:block">
                    {etape.titre}
                  </span>
                </div>
                {index < etapes.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 transition-all ${
                      etapeActuelle > etape.numero
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Étape 1: Informations personnelles */}
            {etapeActuelle === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Informations personnelles
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Votre nom"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                          errors.nom ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                        }`}
                        {...register("nom", { required: "Le nom est requis" })}
                      />
                    </div>
                    {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>}
                  </div>

                  {/* Prénoms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénoms *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Vos prénoms"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                          errors.prenoms ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                        }`}
                        {...register("prenoms", { required: "Les prénoms sont requis" })}
                      />
                    </div>
                    {errors.prenoms && <p className="mt-1 text-sm text-red-600">{errors.prenoms.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="exemple@domaine.ci"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.email ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("email", {
                        required: "L'email est requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email invalide",
                        },
                      })}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.telephone ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("telephone", { required: "Le téléphone est requis" })}
                    />
                  </div>
                  {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ex: Abidjan"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.ville ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("ville", { required: "La ville est requise" })}
                    />
                  </div>
                  {errors.ville && <p className="mt-1 text-sm text-red-600">{errors.ville.message}</p>}
                </div>
              </div>
            )}

            {/* Étape 2: Informations boutique */}
            {etapeActuelle === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Informations de votre boutique
                </h2>

                {/* Nom boutique */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la boutique *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ex: StreamPro CI"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.nomBoutique ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("nomBoutique", { required: "Le nom de la boutique est requis" })}
                    />
                  </div>
                  {errors.nomBoutique && <p className="mt-1 text-sm text-red-600">{errors.nomBoutique.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description de votre activité *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      rows="4"
                      placeholder="Décrivez votre activité et les services que vous proposez..."
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.description ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("description", { required: "La description est requise" })}
                    />
                  </div>
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo de la boutique
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">
                        {logoPreview ? "Changer le logo" : "Télécharger un logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Format recommandé: PNG ou JPG, max 2MB</p>
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse physique
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Adresse complète de votre boutique"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                      {...register("adresse")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Sécurité */}
            {etapeActuelle === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Sécurité de votre compte
                </h2>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Choisissez un nom d'utilisateur unique"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.username ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("username", { required: "Le nom d'utilisateur est requis" })}
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.password ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("password", {
                        required: "Le mot de passe est requis",
                        minLength: { value: 8, message: "Minimum 8 caractères" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmer votre mot de passe"
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.confirmPassword ? "border-red-300" : "border-gray-200 focus:border-purple-500"
                      }`}
                      {...register("confirmPassword", {
                        required: "Veuillez confirmer le mot de passe",
                        validate: (value) => value === password || "Les mots de passe ne correspondent pas",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Conditions */}
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 accent-purple-600"
                      {...register("accepteConditions", {
                        required: "Vous devez accepter les conditions",
                      })}
                    />
                    <span className="text-sm text-gray-700">
                      J'accepte les{" "}
                      <button type="button" className="text-purple-600 font-semibold hover:underline">
                        conditions d'utilisation
                      </button>{" "}
                      et la{" "}
                      <button type="button" className="text-purple-600 font-semibold hover:underline">
                        politique de confidentialité
                      </button>
                    </span>
                  </label>
                  {errors.accepteConditions && (
                    <p className="mt-2 text-sm text-red-600">{errors.accepteConditions.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              {etapeActuelle > 1 && (
                <button
                  type="button"
                  onClick={() => setEtapeActuelle(etapeActuelle - 1)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Retour
                </button>
              )}

              {etapeActuelle < 3 ? (
                <button
                  type="button"
                  onClick={() => setEtapeActuelle(etapeActuelle + 1)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Créer mon compte
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => navigate("/backoffice/login")}
                className="text-purple-600 font-semibold hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
