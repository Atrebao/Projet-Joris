import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Lock, KeyRound, CheckCircle2, Save, Loader2, AlertCircle } from 'lucide-react';
import { partenairesAPI } from '@/lib/api';
import { getPartenaireId } from '@/Utils/Utils';

export default function ModifierPasswordPartenaire() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

   const partenaireId = getPartenaireId();


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Permet de surveiller la valeur du nouveau mot de passe pour la comparaison
  const nouveauPasswordValue = watch("nouveauPassword");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
        // Appel à l'API pour modifier le mot de passe
        await partenairesAPI.modifyPassword(partenaireId, data.nouveauPassword, data.confirmPassword);
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulation réseau
      setSuccessMessage('Votre mot de passe a été modifié avec succès.');
      reset(); // Réinitialise les champs du formulaire
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'L\'ancien mot de passe est incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-6 px-4">
      
      {/* En-tête de section de l'espace de travail */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Sécurité & Authentification
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Modifiez régulièrement vos accès pour protéger vos données et vos stocks de livraisons.
        </p>
      </div>

      {/* Boîtier du Formulaire */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        
        {/* Messages d'alerte contextuels (Succès / Échec API) */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-destructive/5 border border-destructive/10 px-4 py-3 text-xs font-semibold text-destructive animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* 1. Ancien mot de passe */}
          {/* <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Ancien mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="Entrez votre mot de passe actuel"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                  errors.ancienPassword 
                    ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                    : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
                {...register("ancienPassword", { required: "L'ancien mot de passe est requis" })}
              />
            </div>
            {errors.ancienPassword && (
              <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.ancienPassword.message}</p>
            )}
          </div> */}

          {/* Séparateur visuel élégant */}
          <div className="border-t border-slate-100 my-2 pt-2" />

          {/* 2. Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nouveau mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="Minimum 8 caractères conseillés"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                  errors.nouveauPassword 
                    ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                    : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
                {...register("nouveauPassword", { 
                  required: "Le nouveau mot de passe est requis",
                  minLength: { value: 6, message: "Le mot de passe doit contenir au moins 6 caractères" }
                })}
              />
            </div>
            {errors.nouveauPassword && (
              <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.nouveauPassword.message}</p>
            )}
          </div>

          {/* 3. Confirmation du nouveau mot de passe */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Confirmer le nouveau mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="Répétez le nouveau mot de passe"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                  errors.confirmPassword 
                    ? "border-destructive bg-destructive/5 focus:ring-4 focus:ring-destructive/10" 
                    : "border-input bg-card focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
                {...register("confirmPassword", { 
                  required: "Veuillez confirmer votre mot de passe",
                  validate: (value) => value === nouveauPasswordValue || "Les mots de passe ne correspondent pas"
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Bouton de validation d'action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer mon nouveau mot de passe
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
