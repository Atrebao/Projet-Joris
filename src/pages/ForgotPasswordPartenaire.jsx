import { useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle2, Shield } from 'lucide-react';
import api, { authAPI } from "@/lib/api";

export default function ForgotPasswordPartenaire() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulez ou insérez l'appel à votre API ici
      await authAPI.forgotPasswordPartenaire(data.email);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      
      {/* COLONNE GAUCHE - Formulaire de récupération */}
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
              Espace Partenaire
            </p>
          </div>
        </div>

        {/* Centre : Boîtier du Formulaire ou Message de Succès */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          {/* Bouton Retour à la connexion */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </button>

          {!isSuccess ? (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Mot de passe oublié ?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pas de panique. Saisissez votre adresse email professionnelle pour recevoir un lien de réinitialisation.
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Votre Adresse Email Partenaire <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.email 
                          ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                          : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      {...register("email", {
                        required: "L'adresse email est requise",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Format d'email invalide",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Bouton d'action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Envoi du lien en cours...
                    </>
                  ) : (
                    "Recevoir le lien de récupération"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Écran d'état succès (Une fois l'email soumis) */
            <div className="text-center space-y-4 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="inline-flex p-3 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-500 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Vérifiez votre boîte mail
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Si un compte partenaire correspond à cette adresse, un message contenant les instructions de réinitialisation vient de vous être envoyé.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/backoffice/login")}
                  className="py-2.5 px-6 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                >
                  Revenir à la page de connexion
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <p className="text-center text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Richesses Streaming. Tous droits réservés.
        </p>
      </div>

      {/* COLONNE DROITE - Panneau Immersif Sombre */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-[120px]" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Protection des données</span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-4">
          <h3 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Sécurité renforcée de vos accès.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Les liens de récupération expirent automatiquement après 15 minutes pour des raisons de sécurité. Ne partagez jamais votre mot de passe temporaire ou vos identifiants de stock.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          Sécurisé par chiffrement de bout en bout (SSL).
        </div>
      </div>

    </div>
  );
}
