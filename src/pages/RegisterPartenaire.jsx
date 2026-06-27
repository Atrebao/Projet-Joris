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
  Loader,
  ArrowRight 
} from "lucide-react";
import { partenairesAPI } from "@/lib/api";

export default function RegisterPartenaire() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);

  const password = watch("password");
  const passwordStrength = password ? Math.min(4, Math.floor(password.length / 4)) : 0;
  const onSubmit = async (data) => {
    setIsSubmitting(true);
  
    try {
      const response = await partenairesAPI.create(data);
      console.log("Données partenaire:", response.data);
    // console.log("Données partenaire:", data);
      toast.success("Inscription réussie ! Votre compte est en attente de validation.");
      navigate("/backoffice/login");
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
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
  <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
    <div className="max-w-3xl mx-auto">
      
      {/* En-tête de la page */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-sm shadow-primary/20">
          <span className="text-xl font-black text-primary-foreground tracking-tighter">R</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          Devenir Partenaire
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
          Rejoignez notre réseau de distribution et développez votre activité de streaming en Afrique.
        </p>
      </div>

      {/* Barre de progression (Stepper) Moderne */}
      <div className="mb-10 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-center max-w-xl mx-auto">
          {etapes.map((etape, index) => {
            const isPassed = etapeActuelle > etape.numero;
            const isActive = etapeActuelle === etape.numero;
            
            return (
              <div key={etape.numero} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-200 border ${
                      isPassed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <etape.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap hidden sm:block ${
                    isActive ? "text-slate-900" : "text-slate-400 font-semibold"
                  }`}>
                    {etape.titre}
                  </span>
                </div>
                
                {/* Ligne de liaison entre les étapes */}
                {index < etapes.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 bg-slate-100 min-w-[40px] relative overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                        isPassed ? "w-full bg-emerald-500" : "w-0 bg-primary"
                      }`} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Boîtier du Formulaire */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Étape 1: Informations personnelles */}
          {etapeActuelle === 1 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Informations personnelles
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Renseignez vos coordonnées de contact officiel.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Votre nom"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.nom 
                          ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                          : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      {...register("nom", { required: "Le nom est requis" })}
                    />
                  </div>
                  {errors.nom && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.nom.message}</p>}
                </div>

                {/* Prénoms */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Prénoms <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Vos prénoms"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.prenoms 
                          ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                          : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      {...register("prenoms", { required: "Les prénoms sont requis" })}
                    />
                  </div>
                  {errors.prenoms && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.prenoms.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email professionnel <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="exemple@domaine.ci"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                      errors.email 
                        ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                        : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                {errors.email && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.email.message}</p>}
              </div>

              {/* Téléphone & Ville */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Ex: 0707070707"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.telephone 
                          ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                          : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      {...register("telephone", { required: "Le téléphone est requis" })}
                    />
                  </div>
                  {errors.telephone && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.telephone.message}</p>}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Ville <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ex: Abidjan"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.ville 
                          ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                          : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      {...register("ville", { required: "La ville est requise" })}
                    />
                  </div>
                  {errors.ville && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.ville.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Informations boutique */}
          {etapeActuelle === 2 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Informations de votre boutique
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Configurez votre espace de vente en ligne.</p>
              </div>

              {/* Nom boutique */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nom de la boutique <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: StreamPro CI"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                      errors.nomBoutique 
                        ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                        : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...register("nomBoutique", { required: "Le nom de la boutique est requis" })}
                  />
                </div>
                {errors.nomBoutique && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.nomBoutique.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Description de votre activité <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    rows="4"
                    placeholder="Décrivez votre activité et les services que vous proposez..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all resize-none ${
                      errors.description 
                        ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                        : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...register("description", { required: "La description est requise" })}
                  />
                </div>
                {errors.description && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.description.message}</p>}
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Logo de la boutique
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {logoPreview && (
                    <div className="relative group">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/50 hover:bg-slate-50/50 cursor-pointer transition-all">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">
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
                <p className="mt-2 text-[11px] font-medium text-slate-400">Format PNG ou JPG • Max 2MB • 200×200px recommandé</p>
              </div>

              {/* Adresse physique */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Adresse physique
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Adresse complète de votre boutique"
                    className="w-full pl-10 pr-4 py-3 border border-input bg-card rounded-xl text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    {...register("adresse")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Sécurité */}
          {etapeActuelle === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Sécurité de votre compte
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Protégez l'accès à votre espace partenaire.</p>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Mot de passe <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm outline-none transition-all ${
                      errors.password 
                        ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                        : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...register("password", {
                      required: "Le mot de passe est requis",
                      minLength: { value: 8, message: "Minimum 8 caractères" },
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
                {errors.password && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.password.message}</p>}
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Confirmer le mot de passe <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer votre mot de passe"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm outline-none transition-all ${
                      errors.confirmPassword 
                        ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                        : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...register("confirmPassword", {
                      required: "Veuillez confirmer le mot de passe",
                      validate: (value) => value === watch('password') || "Les mots de passe ne correspondent pas",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Indicateur de force du mot de passe (optionnel) */}
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength >= i + 1 
                          ? i < 2 
                            ? 'bg-destructive' 
                            : i < 3 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-medium text-slate-400">
                  {passwordStrength === 0 && 'Saisissez un mot de passe'}
                  {passwordStrength === 1 && 'Faible - Ajoutez des chiffres et symboles'}
                  {passwordStrength === 2 && 'Moyen - Ajoutez des majuscules et symboles'}
                  {passwordStrength === 3 && 'Fort - Excellente sécurité'}
                  {passwordStrength === 4 && 'Très fort - Sécurité maximale'}
                </p>
              </div>

              {/* Conditions générales */}
              <div className={`rounded-xl p-4 border-2 transition-all ${
                errors.accepteConditions 
                  ? "border-destructive bg-destructive/5" 
                  : "border-slate-100 bg-slate-50/50"
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className={`mt-0.5 w-4 h-4 rounded border-2 transition-all ${
                      errors.accepteConditions 
                        ? "border-destructive accent-destructive" 
                        : "border-slate-300 accent-primary"
                    }`}
                    {...register("accepteConditions", {
                      required: "Vous devez accepter les conditions",
                    })}
                  />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    J'accepte les{" "}
                    <button type="button" className="text-primary font-bold hover:underline">
                      conditions d'utilisation
                    </button>{" "}
                    et la{" "}
                    <button type="button" className="text-primary font-bold hover:underline">
                      politique de confidentialité
                    </button>
                  </span>
                </label>
                {errors.accepteConditions && (
                  <p className="mt-2 text-xs font-semibold text-destructive">{errors.accepteConditions.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation - Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            {etapeActuelle > 1 && (
              <button
                type="button"
                onClick={() => setEtapeActuelle(etapeActuelle - 1)}
                className="sm:flex-1 px-6 py-3 border border-slate-200 bg-card rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                ← Retour
              </button>
            )}

            {etapeActuelle < 3 ? (
              <button
                type="button"
                onClick={() => setEtapeActuelle(etapeActuelle + 1)}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 hover:shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-sm active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Lien de connexion */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Vous avez déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => navigate("/backoffice/login")}
              className="text-primary font-bold hover:underline"
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
