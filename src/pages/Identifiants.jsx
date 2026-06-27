import React, { useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import toast from "react-hot-toast";
import ButtonBack from "../components/ButtonBack";
import { 
  User, Mail, Phone, MapPin, Building2, FileText, 
  Upload, Lock, Eye, EyeOff, Loader, Sparkles, 
  CheckCircle, ArrowRight , KeyRound, Save
} from 'lucide-react';

export default function Identifiants() {
  const [formData, setFormData] = useState({
    ancienPassword: "",
    nouveauPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = () => {
    if (formData.nouveauPassword !== formData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !");
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setFormData({
      ancienPassword: "",
      nouveauPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      console.log("FormData", formData);
      toast.success("Identifiants modifiés avec succès !");
      clearForm();
    }
  };

  const handleBack = () => {
    window.history.back();
  };

 return (
  <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
    <div className="max-w-xl mx-auto">
      
      {/* Bouton de retour personnalisé */}
      <div className="mb-6">
        <ButtonBack title="Modifier vos identifiants" textSize="3xl" />
      </div>

      {/* Boîtier du Formulaire Épuré */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
        
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Sécurité du compte
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Modifiez votre mot de passe pour garantir la sécurité de vos accès partenaires.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nom d'utilisateur (Lecture seule / Bloqué) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nom d&apos;utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value="username"
                name="username"
                type="text"
                placeholder="Nom d'utilisateur"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-400 font-medium rounded-xl text-sm outline-none cursor-not-allowed select-none"
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Le nom d&apos;utilisateur ne peut pas être modifié.</p>
          </div>

          {/* Ancien mot de passe */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Ancien mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={formData.ancienPassword}
                name="ancienPassword"
                type="password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-input bg-card rounded-xl text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Séparateur visuel discret */}
          <div className="border-t border-slate-100 my-2 pt-2" />

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nouveau mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={formData.nouveauPassword}
                name="nouveauPassword"
                type="password"
                placeholder="Minimum 8 caractères"
                className="w-full pl-10 pr-4 py-2.5 border border-input bg-card rounded-xl text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Confirmer le nouveau mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={formData.confirmPassword}
                name="confirmPassword"
                type="password"
                placeholder="Répétez le nouveau mot de passe"
                className="w-full pl-10 pr-4 py-2.5 border border-input bg-card rounded-xl text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Bouton de soumission principal */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              Mettre à jour le mot de passe
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
);

}
