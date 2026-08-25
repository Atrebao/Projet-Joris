import { useEffect, useState, useCallback, useRef } from 'react'
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
  Save,
  Tag,
  Sparkles,
  Zap,
} from 'lucide-react'
import { getPartenaire, getPartenaireId } from '../../Utils/Utils'
import { whatsappAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Button, Card, Input, LoadingState, PageHeader } from '../../components/saas/SaasPrimitives'

const DEFAULT_TEMPLATE = `🚀 *Vos Identifiants de Connexion*

Bonjour *{{client}}*,

Votre commande pour l'offre *{{service}}* a été traitée et vos identifiants sont prêts ! 🎉

🔑 *Vos Accès :*
• *Identifiant / Email :* \`{{login}}\`
• *Mot de passe :* \`{{password}}\`
• *Instructions :* {{instructions}}
• *Valable jusqu'au :* {{date_expiration}}

💬 *Besoin d'aide ?* Répondez directement à ce message WhatsApp.
_Merci pour votre confiance !_ 🌟`

const VARIABLE_TAGS = [
  { tag: '{{client}}', label: 'Nom Client', desc: 'Prénom ou Pseudo' },
  { tag: '{{service}}', label: 'Service', desc: 'Nom du service' },
  { tag: '{{login}}', label: 'Identifiant', desc: 'Email ou Login' },
  { tag: '{{password}}', label: 'Mot de passe', desc: 'Mot de passe' },
  { tag: '{{instructions}}', label: 'Instructions', desc: 'PIN / Profil' },
  { tag: '{{date_expiration}}', label: 'Date Expiration', desc: 'Date de fin' },
  { tag: '{{boutique}}', label: 'Boutique', desc: 'Nom de votre boutique' },
]

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

  // Template personnalisé & Quota
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE)
  const [quotaInfo, setQuotaInfo] = useState({ quotaMessagesJour: 50, messagesEnvoyesAujourdhui: 0 })
  const [savingTemplate, setSavingTemplate] = useState(false)
  const textareaRef = useRef(null)

  // Formulaire test
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState(`Bonjour ! Ceci est un message test depuis ${boutiqueNom} via WhatsApp.`)
  const [sendingTest, setSendingTest] = useState(false)

  const loadStatus = useCallback(
    async (isBackground = false) => {
      if (!partenaireId) return
      if (!isBackground) setLoading(true)
      try {
        const [statusRes, templateRes] = await Promise.allSettled([
          whatsappAPI.getStatus(partenaireId),
          whatsappAPI.getTemplate(partenaireId),
        ])

        if (statusRes.status === 'fulfilled') {
          setStatus(statusRes.value.data)
        }
        if (templateRes.status === 'fulfilled' && templateRes.value?.data) {
          const t = templateRes.value.data
          if (t.messageTemplateLivraison && t.messageTemplateLivraison.trim()) {
            setMessageTemplate(t.messageTemplateLivraison)
          }
          setQuotaInfo({
            quotaMessagesJour: Number(t.quotaMessagesJour || 50),
            messagesEnvoyesAujourdhui: Number(t.messagesEnvoyesAujourdhui || 0),
          })
        }
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
      setStatus((prev) => ({
        ...prev,
        status: 'DISCONNECTED',
        isConnected: false,
        qrCode: null,
        phoneNumber: null,
      }))
      toast.success('Compte WhatsApp déconnecté')
      loadStatus(true)
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleToggleAutoSend = async () => {
    if (!partenaireId) return
    const nextState = !status?.autoSendEnabled
    setTogglingAutoSend(true)
    try {
      await whatsappAPI.setAutoSend(partenaireId, nextState)
      setStatus((prev) => ({ ...prev, autoSendEnabled: nextState }))
      toast.success(nextState ? 'Envoi automatique activé' : 'Envoi automatique mis en pause')
    } catch (error) {
      console.error('Erreur toggle auto-send:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setTogglingAutoSend(false)
    }
  }

  // Insertion sécurisée d'une variable à l'endroit du curseur
  const insertVariableTag = (tag) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setMessageTemplate((prev) => `${prev} ${tag}`)
      return
    }

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const text = messageTemplate
    const newText = text.substring(0, start) + tag + text.substring(end)
    setMessageTemplate(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    }, 50)
  }

  // Sauvegarde du modèle de message personnalisé
  const handleSaveTemplate = async (e) => {
    if (e) e.preventDefault()
    if (!partenaireId) return
    setSavingTemplate(true)
    try {
      await whatsappAPI.saveTemplate(partenaireId, messageTemplate)
      toast.success('Modèle de message WhatsApp enregistré avec succès ! 🎉')
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement du modèle")
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleSendTest = async (e) => {
    e.preventDefault()
    if (!partenaireId) return
    if (!testPhone.trim()) {
      toast.error('Veuillez renseigner un numéro de téléphone')
      return
    }

    setSendingTest(true)
    try {
      const { data } = await whatsappAPI.sendTest(partenaireId, testPhone.trim(), testMessage.trim())
      if (data?.success) {
        toast.success(`Message de test délivré avec succès au ${testPhone} ! 🎉`)
        setQuotaInfo((prev) => ({
          ...prev,
          messagesEnvoyesAujourdhui: prev.messagesEnvoyesAujourdhui + 1,
        }))
      } else {
        toast.error(data?.message || "Échec de l'envoi du test")
      }
    } catch (error) {
      console.error('Erreur test WhatsApp:', error)
      toast.error(error?.response?.data?.message || "Erreur lors de l'envoi du test")
    } finally {
      setSendingTest(false)
    }
  }

  // Génération de l'aperçu dynamique du message
  const renderPreviewMessage = () => {
    let t = messageTemplate || DEFAULT_TEMPLATE
    return t
      .replace(/{{client}}/gi, 'Alexandre Yao')
      .replace(/{{service}}/gi, 'Netflix Premium 4K')
      .replace(/{{login}}/gi, 'alexandre@client.ci')
      .replace(/{{password}}/gi, 'Pass2026!')
      .replace(/{{instructions}}/gi, 'Profil 1 - PIN: 4421')
      .replace(/{{date_expiration}}/gi, '13 Septembre 2026')
      .replace(/{{boutique}}/gi, boutiqueNom)
  }

  if (loading) return <LoadingState label="Chargement de votre session WhatsApp..." />

  const isConnected = status?.status === 'CONNECTED'
  const isQrReady = status?.status === 'QR_READY' && status?.qrCode
  const isConnecting = status?.status === 'CONNECTING' || connecting

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Connexion & Modèles WhatsApp"
        description="Associez le compte WhatsApp de votre boutique, personnalisez vos modèles de messages et suivez vos quotas d'envoi anti-bannissement."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Colonne Gauche : Statut, QR Code & Éditeur de Modèle (7 colonnes) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1 : État de la Connexion */}
          <Card className="p-6 border border-border bg-card shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  État de votre Session WhatsApp
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Boutique : <span className="font-bold text-foreground">{boutiqueNom}</span>
                </p>
              </div>

              {/* Badge de statut */}
              <div>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connecté (+{status?.phoneNumber || 'Associé'})
                  </span>
                ) : isQrReady ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    QR Code prêt à être scanné
                  </span>
                ) : isConnecting ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Déconnecté
                  </span>
                )}
              </div>
            </div>

            {/* Quota Quotidien Anti-Ban */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">Protection Anti-Bannissement Active</span>
                  <span className="text-[11px] text-muted-foreground">
                    Messages envoyés aujourd'hui : <strong>{quotaInfo.messagesEnvoyesAujourdhui}</strong> / {quotaInfo.quotaMessagesJour} max
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Sécurisé
              </span>
            </div>

            {/* CAS 1 : CONNECTÉ */}
            {isConnected && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-foreground">Envois automatiques activés</p>
                      <p className="text-[11px] text-muted-foreground">
                        Numéro actif : <span className="font-mono font-bold text-foreground">+{status?.phoneNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={status?.autoSendEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleAutoSend}
                      disabled={togglingAutoSend}
                      className="text-xs font-bold gap-1.5 rounded-xl h-8"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      {status?.autoSendEnabled ? 'Actif' : 'En pause'}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="text-xs font-bold gap-1.5 rounded-xl h-8"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Déconnecter
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* CAS 2 : QR CODE PRÊT */}
            {!isConnected && isQrReady && (
              <div className="text-center space-y-4 py-2">
                <div className="inline-block p-4 bg-white rounded-3xl border-2 border-emerald-500/40 shadow-md">
                  <img
                    src={status.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 mx-auto object-contain rounded-xl"
                  />
                </div>

                <div className="max-w-sm mx-auto text-xs text-muted-foreground space-y-2">
                  <p className="font-bold text-foreground">Comment connecter votre WhatsApp :</p>
                  <ol className="text-left list-decimal list-inside space-y-1 text-[11px]">
                    <li>Ouvrez <strong>WhatsApp</strong> sur votre téléphone</li>
                    <li>Allez dans <strong>Réglages / Paramètres</strong> &gt; <strong>Appareils connectés</strong></li>
                    <li>Appuyez sur <strong>Connecter un appareil</strong> et scannez le QR code ci-dessus</li>
                  </ol>
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
                  <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-xs text-muted-foreground">
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* CAS 3 : DÉCONNECTÉ */}
            {!isConnected && !isQrReady && (
              <div className="py-6 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <Smartphone className="h-7 w-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-extrabold text-foreground text-sm">Associez votre compte WhatsApp</h4>
                  <p className="text-xs text-muted-foreground">
                    Permet d'expédier directement vos comptes et identifiants à vos clients depuis votre numéro officiel.
                  </p>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs px-6 py-2 h-auto"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  Générer mon QR Code de connexion
                </Button>
              </div>
            )}
          </Card>

          {/* Card 2 : ÉDITEUR DU MODÈLE DE MESSAGE DE LIVRAISON */}
          <Card className="p-6 border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Modèle de Message WhatsApp de Livraison
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personnalisez le message exact expédié automatiquement à vos clients lors de chaque livraison.
                </p>
              </div>
            </div>

            {/* Boutons d'insertion de balises sécurisées */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Cliquez pour insérer une variable dynamique sans faute :
              </label>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_TAGS.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariableTag(v.tag)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                    title={`Insère ${v.tag} (${v.desc})`}
                  >
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span>{v.tag}</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-normal">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de saisie du modèle */}
            <div className="space-y-1.5">
              <textarea
                ref={textareaRef}
                rows={9}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Rédigez votre modèle de message avec les balises {{client}}, {{service}}, {{login}}, {{password}}..."
                className="w-full p-3.5 rounded-xl border border-input bg-card font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMessageTemplate(DEFAULT_TEMPLATE)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Rétablir le modèle par défaut
              </Button>

              <Button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs"
              >
                {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {savingTemplate ? 'Enregistrement...' : 'Enregistrer le Modèle'}
              </Button>
            </div>
          </Card>

          {/* Formulaire de Test d'envoi */}
          <Card className="p-5 border border-border bg-card shadow-xs">
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
                  disabled={sendingTest || !isConnected}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 rounded-xl shadow-xs"
                >
                  {sendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Envoyer le test
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Colonne Droite : Aperçu dynamique du message WhatsApp reçu par le client (5 colonnes) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 border border-border bg-slate-900 text-slate-100 overflow-hidden shadow-lg sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Aperçu Dynamique Réel</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{boutiqueNom}</span>
            </div>

            {/* Bulle de conversation WhatsApp avec rendu dynamique */}
            <div className="p-4 rounded-2xl bg-[#005c4b] text-white shadow-md text-xs font-sans leading-relaxed whitespace-pre-wrap">
              {renderPreviewMessage()}
              <p className="text-[10px] text-emerald-200/70 italic text-right mt-2">
                12:45 ✓✓
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>100% Automatisé lors de vos livraisons</span>
              </div>
              <p>
                Dès que vous validez une livraison ou que le stock automatique délivre un compte, le client reçoit instantanément ce message formaté avec ses identifiants.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
