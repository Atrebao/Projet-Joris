import React, { useState } from 'react'
import { X, Lock, Phone, User, Mail, Sparkles, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsAPI } from '../lib/api'

export default function ClientAuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register states
  const [regNom, setRegNom] = useState('')
  const [regPrenoms, setRegPrenoms] = useState('')
  const [regPseudo, setRegPseudo] = useState('')
  const [regWhatsapp, setRegWhatsapp] = useState('')
  const [regTelephone, setRegTelephone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Forgot password states
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [newPassword, setNewPassword] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginIdentifier.trim() || !loginPassword) {
      toast.error('Veuillez renseigner votre pseudo/WhatsApp et mot de passe')
      return
    }

    setLoading(true)
    try {
      const res = await clientsAPI.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      })
      const data = res.data
      if (data?.accessToken) {
        localStorage.setItem('client_token', data.accessToken)
        localStorage.setItem('client_user', JSON.stringify(data.client))
        window.dispatchEvent(new Event('client-auth-change'))
        toast.success(`Ravi de vous revoir, ${data.client?.pseudo || 'Client'} ! 👋`)
        if (onSuccess) onSuccess(data.client)
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!regPseudo.trim() || !regWhatsapp.trim() || !regTelephone.trim() || !regPassword) {
      toast.error('Le nom d\'utilisateur (pseudo), le numéro WhatsApp, le numéro joignable et le mot de passe sont obligatoires')
      return
    }

    setLoading(true)
    try {
      const res = await clientsAPI.register({
        nom: regNom.trim() || undefined,
        prenoms: regPrenoms.trim() || undefined,
        pseudo: regPseudo.trim(),
        numeroWhatsapp: regWhatsapp.trim().replace(/\s/g, ''),
        telephone: regTelephone.trim().replace(/\s/g, ''),
        email: regEmail.trim() || undefined,
        password: regPassword,
      })
      const data = res.data
      if (data?.accessToken) {
        localStorage.setItem('client_token', data.accessToken)
        localStorage.setItem('client_user', JSON.stringify(data.client))
        window.dispatchEvent(new Event('client-auth-change'))
        toast.success(`Compte créé avec succès ! Bienvenue ${data.client?.pseudo} 🎉`)
        if (onSuccess) onSuccess(data.client)
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotIdentifier.trim() || !newPassword || newPassword.length < 4) {
      toast.error('Veuillez renseigner votre pseudo/WhatsApp et un nouveau mot de passe valide (min 4 caractères)')
      return
    }

    setLoading(true)
    try {
      const res = await clientsAPI.resetPassword({
        identifier: forgotIdentifier.trim(),
        newPassword,
      })
      toast.success(res.data?.message || 'Mot de passe réinitialisé avec succès !')
      setMode('login')
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erreur réinitialisation mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête du modal */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            {mode === 'login' && 'Espace Client'}
            {mode === 'register' && 'Créer un compte'}
            {mode === 'forgot' && 'Mot de passe oublié'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {mode === 'login' && 'Connectez-vous pour retrouver et gérer tous vos abonnements'}
            {mode === 'register' && 'Inscrivez-vous en 30 secondes pour suivre vos commandes'}
            {mode === 'forgot' && 'Entrez votre pseudo ou numéro WhatsApp pour réinitialiser votre accès'}
          </p>
        </div>

        {/* Onglets Login / Register */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-muted/40 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Créer un Compte
            </button>
          </div>
        )}

        {/* Formulaire Connexion */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Nom d'utilisateur (Pseudo) ou N° WhatsApp
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ex: Alex225 ou 0700000000"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground block">Mot de passe</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Votre mot de passe"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Me Connecter'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Formulaire Inscription */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">Nom</label>
                <input
                  type="text"
                  placeholder="ex: Kouassi"
                  value={regNom}
                  onChange={(e) => setRegNom(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">Prénoms</label>
                <input
                  type="text"
                  placeholder="ex: Jean"
                  value={regPrenoms}
                  onChange={(e) => setRegPrenoms(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                Nom d'utilisateur / Pseudo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ex: JeanStream225"
                  value={regPseudo}
                  onChange={(e) => setRegPseudo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">
                  Numéro WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="ex: 0700000000"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <p className="text-[9.5px] text-muted-foreground leading-tight">
                  Pour la livraison de vos comptes par WhatsApp.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">
                  Numéro Joignable (Appel) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="ex: 0500000000"
                    value={regTelephone}
                    onChange={(e) => setRegTelephone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <p className="text-[9.5px] text-muted-foreground leading-tight">
                  Numéro d'appel pour le suivi et le support.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">Email (Optionnel)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="jean@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                Mot de passe <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 4 caractères"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs mt-2"
            >
              {loading ? 'Création en cours...' : 'Créer mon Compte Client'}
              {!loading && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Formulaire Mot de passe oublié */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Votre Pseudo ou Numéro WhatsApp
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ex: Alex225 ou 0700000000"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 py-2.5 border border-border rounded-xl text-xs font-bold hover:bg-muted/40"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 transition text-xs"
              >
                {loading ? 'Mise à jour...' : 'Réinitialiser'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
