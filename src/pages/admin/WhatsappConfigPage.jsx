import { useEffect, useState, useCallback } from 'react'
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
import { whatsappAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Button, Card, Input, LoadingState, PageHeader } from '../../components/saas/SaasPrimitives'

export default function WhatsappConfigPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [togglingAutoSend, setTogglingAutoSend] = useState(false)

  // Formulaire test
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Bonjour ! Ceci est un message officiel de test depuis l’administration Joris Streaming.')
  const [sendingTest, setSendingTest] = useState(false)

  const loadStatus = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const { data } = await whatsappAPI.getAdminStatus()
      setStatus(data)
    } catch (error) {
      console.error('Erreur chargement statut WhatsApp Admin:', error)
      if (!isBackground) toast.error('Impossible de récupérer le statut WhatsApp Admin')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()

    // Écoute des événements WebSocket en direct pour admin
    const unsub = onSocketEvent('notification', (payload) => {
      if (
        payload?.titre === 'Statut WhatsApp Partenaire' &&
        payload?.data &&
        Number(payload.data.partenaireId) === 0
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
  }, [loadStatus])

  // Polling automatique toutes les 2.5s si en attente de scan
  useEffect(() => {
    const timer = setInterval(() => {
      if (status?.status !== 'CONNECTED') {
        loadStatus(true)
      }
    }, 2500)
    return () => clearInterval(timer)
  }, [status?.status, loadStatus])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const { data } = await whatsappAPI.connectAdmin()
      setStatus((prev) => ({
        ...prev,
        status: data.status,
        qrCode: data.qrCode || prev?.qrCode,
      }))
      toast.success('Génération du QR code en cours...')
      setTimeout(() => loadStatus(true), 2000)
    } catch (error) {
      console.error('Erreur connexion WhatsApp Admin:', error)
      toast.error('Erreur lors du démarrage de la session WhatsApp Admin')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter ce compte WhatsApp ?')) return
    setDisconnecting(true)
    try {
      await whatsappAPI.disconnectAdmin()
      toast.success('Compte WhatsApp déconnecté')
      loadStatus(true)
    } catch (error) {
      console.error('Erreur déconnexion WhatsApp Admin:', error)
      toast.error('Impossible de déconnecter le compte')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleToggleAutoSend = async () => {
    if (!status) return
    const nextState = !status.autoSendEnabled
    setTogglingAutoSend(true)
    try {
      await whatsappAPI.setAutoSendAdmin(nextState)
      setStatus((prev) => ({ ...prev, autoSendEnabled: nextState }))
      toast.success(
        nextState
          ? 'Envoi automatique WhatsApp activé lors de l’activation d’un partenaire'
          : 'Envoi automatique désactivé'
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
    if (!testPhone.trim()) {
      toast.error('Veuillez renseigner un numéro de téléphone valide')
      return
    }

    setSendingTest(true)
    try {
      const { data } = await whatsappAPI.sendAdminTest(testPhone.trim(), testMessage.trim())
      if (data?.success) {
        toast.success(`Message envoyé avec succès au ${testPhone} !`)
        loadStatus(true)
      } else {
        toast.error(data?.message || 'Échec de l’envoi. Assurez-vous d’avoir scanné le QR Code.')
        loadStatus(true)
      }
    } catch (error) {
      console.error('Erreur envoi test WhatsApp:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l’envoi')
      loadStatus(true)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading && !status) return <LoadingState label="Chargement de la configuration WhatsApp de l'administration..." />

  const isConnected = status?.status === 'CONNECTED'
  const isQrReady = status?.status === 'QR_READY' && status?.qrCode
  const isConnecting = status?.status === 'CONNECTING'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="WhatsApp de la Plateforme (Admin)"
          description="Connectez le numéro officiel de la plateforme pour envoyer les notifications de bienvenue et d'activation à vos nouveaux partenaires."
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
            Notification Partenaires
          </div>
        </div>
      </div>

      {/* Grille principale */}
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
                  <h3 className="font-extrabold text-foreground text-base">Numéro WhatsApp Officiel</h3>
                  <p className="text-xs text-muted-foreground">Joris Streaming Plateforme</p>
                </div>
              </div>

              {/* Badge de statut */}
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

            {/* CAS 1 : CONNECTÉ */}
            {isConnected && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-emerald-950 text-sm">Le WhatsApp officiel est actif</p>
                    <p className="text-xs text-emerald-800/80 font-mono mt-0.5">
                      Numéro émetteur : <span className="font-bold font-mono">+{status.phoneNumber}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Chaque fois que vous activez ou validez un partenaire, il reçoit automatiquement un message WhatsApp de bienvenue.
                    </p>
                  </div>
                </div>

                {/* Option d'envoi automatique */}
                <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
                  <div>
                    <p className="text-sm font-bold text-foreground">Notifier les partenaires à l&apos;activation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Envoyer automatiquement le message WhatsApp d&apos;accueil dès que vous activez un compte partenaire.
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
                    Déconnecter ce numéro
                  </Button>
                </div>
              </div>
            )}

            {/* CAS 2 : QR CODE */}
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
                    <QrCode className="h-4 w-4 text-emerald-600" /> Scannez avec le téléphone de la plateforme
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-950 text-[13px] mb-2 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-600" /> Comment connecter le WhatsApp officiel :
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Ouvrez <strong>WhatsApp</strong> sur le smartphone officiel.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Allez dans <strong>Réglages / Menu ⋮</strong> &gt; <strong>Appareils connectés</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Appuyez sur <strong>Connecter un appareil</strong> et scannez le QR code ci-dessus.</span>
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

            {/* CAS 3 : DÉCONNECTÉ */}
            {!isConnected && !isQrReady && (
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-extrabold text-foreground text-sm">Associez le WhatsApp officiel</h4>
                  <p className="text-xs text-muted-foreground">
                    Connectez le compte WhatsApp de la plateforme pour automatiser l&apos;envoi des messages de bienvenue lors de la validation des partenaires.
                  </p>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs px-6 py-2.5 h-auto"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  Générer le QR Code Admin
                </Button>
              </div>
            )}
          </Card>

          {/* Test d'envoi Admin */}
          <Card className="p-5 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 mb-3">
              <Send className="h-3.5 w-3.5 text-primary" /> Tester l&apos;envoi depuis le WhatsApp officiel
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
                  Envoyer le test Admin
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Colonne Droite : Aperçu du message WhatsApp reçu par le partenaire */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 border border-border bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Message reçu par le Partenaire activé</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">Joris Streaming</span>
            </div>

            {/* Mockup WhatsApp */}
            <div className="p-4 rounded-2xl bg-[#005c4b] text-white shadow-md text-xs space-y-3 font-sans leading-relaxed">
              <p className="font-extrabold text-sm text-emerald-200">
                🎉 *Félicitations ! Votre compte Partenaire est activé*
              </p>
              <p>
                Bonjour <span className="font-bold">*Kouamé Eric*</span>,
              </p>
              <p>
                Nous avons le plaisir de vous informer que votre boutique <span className="font-bold">*AboPlus Streaming*</span> a été validée et activée avec succès sur notre plateforme ! 🚀
              </p>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1 text-[11px]">
                <p className="font-bold text-emerald-200">Vous pouvez dès à présent :</p>
                <p>• Créer et publier vos offres de streaming</p>
                <p>• Connecter votre propre numéro WhatsApp pour la livraison automatique à vos clients</p>
                <p>• Gérer vos stocks d&apos;identifiants et forfaits</p>
                <p>• Suivre vos commandes et vos reversements financiers</p>
              </div>
              <p className="text-[11px] text-emerald-100/90">
                _Bienvenue parmi nos partenaires d&apos;exception !_ 🌟<br />
                L&apos;équipe Joris Streaming
              </p>
              <p className="text-[10px] text-emerald-200/70 italic text-right">
                10:30 ✓✓
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Déclenché automatiquement à l&apos;activation</span>
              </div>
              <p>
                Dès que vous validez un partenaire depuis la liste des partenaires (bouton Valider ou switch Actif), cette notification WhatsApp lui est immédiatement transmise.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
