import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Send,
  Loader2,
  ShieldCheck,
  Radio,
  RotateCw,
} from 'lucide-react'
import { getPartenaire, getPartenaireId } from '../../Utils/Utils'
import { whatsappAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Button, Card, Input, LoadingState, PageHeader } from '../../components/saas/SaasPrimitives'

export default function WhatsappPartenairePage() {
  const navigate = useNavigate()
  const partenaire = getPartenaire()
  const partenaireId = getPartenaireId()
  const boutiqueNom = partenaire?.nomBoutique || partenaire?.nom || 'Votre boutique'

  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [togglingAutoSend, setTogglingAutoSend] = useState(false)

  // Formulaire test
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState(`Bonjour ! Ceci est un message test depuis ${boutiqueNom} via WhatsApp.`)
  const [sendingTest, setSendingTest] = useState(false)

  const loadStatus = useCallback(
    async (isBackground = false) => {
      if (!partenaireId) return
      if (!isBackground) setLoading(true)
      try {
        const { data } = await whatsappAPI.getStatus(partenaireId)
        setStatus(data)
      } catch (error) {
        console.error('Erreur chargement statut WhatsApp partenaire:', error)
        if (!isBackground) toast.error('Impossible de récupérer le statut WhatsApp')
      } finally {
        if (!isBackground) setLoading(false)
      }
    },
    [partenaireId]
  )

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    loadStatus()

    // Écoute des événements WebSocket en direct
    const unsub = onSocketEvent('notification', (payload) => {
      if (
        payload?.titre === 'Statut WhatsApp Partenaire' &&
        payload?.data &&
        Number(payload.data.partenaireId) === Number(partenaireId)
      ) {
        setStatus((prev) => ({
          ...prev,
          status: payload.data.status,
          isConnected: payload.data.status === 'CONNECTED',
          phoneNumber: payload.data.phoneNumber,
          qrCode: payload.data.qrCode,
          autoSendEnabled: payload.data.autoSendEnabled,
        }))
      }
    })

    return () => {
      unsub()
    }
  }, [partenaireId, navigate, loadStatus])

  // Polling automatique si en attente de scan QR ou en cours de connexion
  useEffect(() => {
    if (!partenaireId) return
    const timer = setInterval(() => {
      if (status?.status !== 'CONNECTED') {
        loadStatus(true)
      }
    }, 2500)
    return () => clearInterval(timer)
  }, [partenaireId, status?.status, loadStatus])

  const handleConnect = async () => {
    if (!partenaireId) return
    setConnecting(true)
    try {
      const { data } = await whatsappAPI.connect(partenaireId)
      setStatus((prev) => ({
        ...prev,
        status: data.status,
        qrCode: data.qrCode || prev?.qrCode,
      }))
      toast.success('Génération de votre QR code en cours...')
      setTimeout(() => loadStatus(true), 2000)
    } catch (error) {
      console.error('Erreur connexion WhatsApp:', error)
      toast.error('Erreur lors du démarrage de votre session WhatsApp')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!partenaireId) return
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte WhatsApp ?')) return
    setDisconnecting(true)
    try {
      await whatsappAPI.disconnect(partenaireId)
      toast.success('Compte WhatsApp déconnecté')
      loadStatus(true)
    } catch (error) {
      console.error('Erreur déconnexion WhatsApp:', error)
      toast.error('Impossible de déconnecter le compte')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleToggleAutoSend = async () => {
    if (!partenaireId || !status) return
    const nextState = !status.autoSendEnabled
    setTogglingAutoSend(true)
    try {
      await whatsappAPI.setAutoSend(partenaireId, nextState)
      setStatus((prev) => ({ ...prev, autoSendEnabled: nextState }))
      toast.success(
        nextState
          ? 'Envoi automatique WhatsApp activé pour vos livraisons'
          : 'Envoi automatique WhatsApp désactivé'
      )
    } catch (error) {
      console.error('Erreur toggle auto-send:', error)
      toast.error('Impossible de modifier le paramètre')
    } finally {
      setTogglingAutoSend(false)
    }
  }

  const handleSendTest = async (e) => {
    e.preventDefault()
    if (!partenaireId) return
    if (!testPhone.trim()) {
      toast.error('Veuillez renseigner un numéro de téléphone valide')
      return
    }

    setSendingTest(true)
    try {
      // Vérifier le statut d'abord si besoin
      const { data } = await whatsappAPI.sendTest(partenaireId, testPhone.trim(), testMessage.trim())
      if (data?.success) {
        toast.success(`Message envoyé avec succès au ${testPhone} !`)
        loadStatus(true)
      } else {
        toast.error(data?.message || 'Échec de l’envoi. Assurez-vous d’avoir scanné le QR Code.')
        loadStatus(true)
      }
    } catch (error) {
      console.error('Erreur envoi test WhatsApp:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l’envoi. Vérifiez votre connexion WhatsApp.')
      loadStatus(true)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading && !status) return <LoadingState label="Chargement de votre configuration WhatsApp..." />

  const isConnected = status?.status === 'CONNECTED'
  const isQrReady = status?.status === 'QR_READY' && status?.qrCode
  const isConnecting = status?.status === 'CONNECTING'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Mon Bot WhatsApp"
          description={`Connectez le numéro WhatsApp de ${boutiqueNom} pour livrer automatiquement vos identifiants à vos clients.`}
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadStatus()}
            className="text-xs font-bold gap-1.5 rounded-xl border-slate-200"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Actualiser l&apos;état
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
            Livraison instantanée
          </div>
        </div>
      </div>

      {/* Grille principale : Statut / Scan QR Code & Paramètres */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Colonne Gauche : Écran de connexion WhatsApp (7 colonnes) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border border-border shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">WhatsApp de votre boutique</h3>
                  <p className="text-xs text-muted-foreground">{boutiqueNom}</p>
                </div>
              </div>

              {/* Badge de statut dynamique */}
              <div>
                {isConnected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100/80 border border-emerald-300 text-emerald-800 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    CONNECTÉ
                  </span>
                )}
                {isQrReady && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100/80 border border-amber-300 text-amber-800 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
                    QR CODE PRÊT
                  </span>
                )}
                {isConnecting && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100/80 border border-sky-300 text-sky-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    CONNEXION...
                  </span>
                )}
                {!isConnected && !isQrReady && !isConnecting && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 border border-slate-300 text-slate-700">
                    DÉCONNECTÉ
                  </span>
                )}
              </div>
            </div>

            {/* CAS 1 : CONNECTÉ AVEC SUCCÈS */}
            {isConnected && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-emerald-950 text-sm">Votre WhatsApp est actif</p>
                    <p className="text-xs text-emerald-800/80 font-mono mt-0.5">
                      Numéro expéditeur : <span className="font-bold font-mono">+{status.phoneNumber}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Vos clients recevront directement leurs identifiants de streaming depuis votre numéro de téléphone.
                    </p>
                  </div>
                </div>

                {/* Option d'envoi automatique */}
                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
                  <div>
                    <p className="text-sm font-bold text-foreground">Envoi automatique lors de la livraison</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Transmettre automatiquement les identifiants au client dès validation d&apos;une commande ou depuis le stock.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAutoSend}
                    disabled={togglingAutoSend}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      status.autoSendEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        status.autoSendEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-destructive border-destructive/20 hover:bg-destructive/10 text-xs font-bold gap-1.5 rounded-xl"
                  >
                    {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    Déconnecter mon compte
                  </Button>
                </div>
              </div>
            )}

            {/* CAS 2 : QR CODE PRÊT À ÊTRE SCANNÉ */}
            {!isConnected && isQrReady && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="relative p-3 bg-white rounded-xl shadow-md border border-slate-200">
                    <img
                      src={status.qrCode}
                      alt="WhatsApp QR Code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-3 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-emerald-600" /> Scannez avec votre téléphone
                  </p>
                </div>

                {/* Instructions étape par étape */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-950 text-[13px] mb-2 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-600" /> Comment connecter votre WhatsApp :
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Ouvrez <strong>WhatsApp</strong> sur votre téléphone.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Allez dans <strong>Réglages</strong> (iPhone) ou <strong>Menu ⋮</strong> (Android) &gt; <strong>Appareils connectés</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Appuyez sur <strong>Connecter un appareil</strong> et scannez le QR code ci-dessus.
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="text-xs font-bold gap-1.5 rounded-xl"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${connecting ? 'animate-spin' : ''}`} />
                    Recharger le QR code
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-xs text-muted-foreground"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* CAS 3 : DÉCONNECTÉ OU EN ATTENTE */}
            {!isConnected && !isQrReady && (
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-extrabold text-foreground text-sm">Connectez votre numéro WhatsApp</h4>
                  <p className="text-xs text-muted-foreground">
                    Associez le compte WhatsApp de votre boutique pour envoyer automatiquement les comptes et codes d&apos;accès à vos acheteurs.
                  </p>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs px-6 py-2.5 h-auto"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  Générer mon QR Code de connexion
                </Button>
              </div>
            )}
          </Card>

          {/* Formulaire de Test d'envoi */}
          <Card className="p-5 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 mb-3">
              <Send className="h-3.5 w-3.5 text-primary" /> Tester l&apos;envoi d&apos;un message depuis votre WhatsApp
            </h4>
            <form onSubmit={handleSendTest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Numéro destinataire *
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="Ex: +225 07 01 02 03 04"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Message test
                  </label>
                  <Input
                    required
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={sendingTest}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 rounded-xl shadow-2xs"
                >
                  {sendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Envoyer le test
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Colonne Droite : Aperçu du message WhatsApp reçu par le client (5 colonnes) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 border border-border bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Aperçu du message reçu par le client</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{boutiqueNom}</span>
            </div>

            {/* Mockup d'une bulle de conversation WhatsApp */}
            <div className="p-4 rounded-2xl bg-[#005c4b] text-white shadow-md text-xs space-y-3 font-sans leading-relaxed">
              <p className="font-extrabold text-sm text-emerald-200">
                🚀 *Vos Identifiants de Connexion*
              </p>
              <p>
                Bonjour <span className="font-bold">*Alexandre Yao*</span>,
              </p>
              <p>
                Votre commande pour l&apos;offre <span className="font-bold">*Canal+ Tout Canal*</span> a été traitée et vos identifiants sont prêts ! 🎉
              </p>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1 font-mono text-[11px]">
                <p className="font-bold text-emerald-200">🔑 *Vos Accès :*</p>
                <p>• *Identifiant :* <code className="bg-black/30 px-1 py-0.5 rounded">alexandre@client.ci</code></p>
                <p>• *Mot de passe :* <code className="bg-black/30 px-1 py-0.5 rounded">Pass2026!</code></p>
                <p>• *Instructions :* Se connecter sur l&apos;application myCanal</p>
                <p>• *Valable jusqu&apos;au :* 13 Septembre 2026</p>
              </div>
              <p className="text-[11px] text-emerald-100/90">
                💬 *Besoin d&apos;aide ?* Répondez directement à ce message WhatsApp.
              </p>
              <p className="text-[10px] text-emerald-200/70 italic text-right">
                12:45 ✓✓
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>100% Automatisé lors de vos livraisons</span>
              </div>
              <p>
                Dès que vous validez une livraison ou que votre stock automatique délivre un compte, le client reçoit instantanément ce message avec vos accès.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
