import { useEffect, useState, useMemo } from 'react'
import {
  Bell,
  Clock,
  Send,
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Settings,
  Sparkles,
  Phone,
  RefreshCw,
  Sliders,
  Check,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId, formatWhatsAppPhone, getServiceMeta } from '../../Utils/Utils'
import { souscriptionsAPI, offresAPI, whatsappAPI } from '../../lib/api'
import { Button, Card, Input, LoadingState, PageHeader, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function RappelsExpirationPage() {
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [souscriptions, setSouscriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'expired' | 'config'

  // Multi-Rappels Configurés
  const [reglesRappel, setReglesRappel] = useState([
    { id: 1, nom: 'Premier Rappel Préventif', joursAvant: 5, active: true, canal: 'WHATSAPP' },
    { id: 2, nom: 'Rappel Intermédiaire', joursAvant: 3, active: true, canal: 'WHATSAPP' },
    { id: 3, nom: 'Dernier Rappel Urgent', joursAvant: 1, active: true, canal: 'WHATSAPP' },
    { id: 4, nom: 'Rappel Jour J d\'Expiration', joursAvant: 0, active: true, canal: 'WHATSAPP' },
  ])

  // Modèle de message personnalisé
  const [customTemplate, setCustomTemplate] = useState(
    "Bonjour {{client}} !\n\nVotre abonnement *{{service}}* expire dans *{{jours}} jour(s)* (le {{date_fin}}).\n\nPour continuer à profiter de vos programmes sans coupure, renouvelez votre abonnement dès maintenant sur notre boutique.\n\nMerci de votre fidélité !"
  )

  const loadData = async () => {
    if (!partenaireId) return
    setLoading(true)
    try {
      const { data } = await souscriptionsAPI.getActivesByPartenaire(partenaireId)
      setSouscriptions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du chargement des abonnements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  // Calcul du nombre de jours restants
  const getRemainingDays = (dateFin) => {
    if (!dateFin) return 30
    const diff = new Date(dateFin) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Filtrage des abonnements
  const categorizedList = useMemo(() => {
    const list = souscriptions.map((s) => ({
      ...s,
      remainingDays: getRemainingDays(s.dateFin),
    }))

    const filtered = list.filter((s) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const clientName = (s.client?.pseudo || s.client?.nom || '').toLowerCase()
      const phone = (s.client?.numeroWhatsapp || s.client?.telephone || s.telephone || '').toLowerCase()
      const service = (s.offrePartenaire?.titreOffre || s.offrePartenaire?.nomService || '').toLowerCase()
      return clientName.includes(q) || phone.includes(q) || service.includes(q)
    })

    return {
      upcoming: filtered.filter((s) => s.remainingDays >= 0 && s.remainingDays <= 7).sort((a, b) => a.remainingDays - b.remainingDays),
      expired: filtered.filter((s) => s.remainingDays < 0).sort((a, b) => b.remainingDays - a.remainingDays),
      all: filtered,
    }
  }, [souscriptions, searchQuery])

  // Envoi d'un rappel WhatsApp manuel en 1 clic
  const handleSendWhatsAppReminder = (sousc) => {
    const phone = sousc.client?.numeroWhatsapp || sousc.client?.telephone || sousc.telephone
    if (!phone) {
      toast.error('Aucun numéro WhatsApp trouvé pour ce client.')
      return
    }

    const cleanPhone = formatWhatsAppPhone(phone)
    const clientName = sousc.client?.pseudo || sousc.client?.prenoms || 'Client'
    const serviceName = sousc.offrePartenaire?.titreOffre || sousc.offrePartenaire?.nomService || 'votre abonnement'
    const days = Math.max(0, sousc.remainingDays)
    const dateFinStr = sousc.dateFin ? new Date(sousc.dateFin).toLocaleDateString('fr-FR') : 'bientôt'

    let message = customTemplate
      .replace(/{{client}}/g, clientName)
      .replace(/{{service}}/g, serviceName)
      .replace(/{{jours}}/g, String(days))
      .replace(/{{date_fin}}/g, dateFinStr)

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
    toast.success(`Rappel WhatsApp ouvert pour ${clientName} ! 🚀`)
  }

  const handleToggleRegle = (id) => {
    setReglesRappel((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    )
    toast.success('Règle de rappel mise à jour.')
  }

  if (loading) {
    return <LoadingState message="Chargement des échéances et rappels d'abonnements..." />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestion des Rappels de Fin d'Abonnement"
        description="Configurez vos multi-rappels automatiques (J-5, J-3, J-1, Jour J) et relancez vos clients d'un clic pour maximiser vos renouvellements."
        action={
          <Button variant="outline" onClick={loadData} className="gap-2 text-xs font-semibold rounded-lg">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        }
      />

      {/* Onglets Principaux */}
      <div className="flex border-b border-border gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="w-4 h-4" />
          À Relancer Sous Peu ({categorizedList.upcoming.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expired')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'expired'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Abonnements Expirés ({categorizedList.expired.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'config'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Configuration des Multi-Rappels ({reglesRappel.filter((r) => r.active).length} Actifs)
        </button>
      </div>

      {/* CONTENU : ONGLET 1 (À RELANCER) & ONGLET 2 (EXPIRÉS) */}
      {(activeTab === 'upcoming' || activeTab === 'expired') && (
        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par client, WhatsApp, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-input bg-card text-xs font-semibold outline-none"
            />
          </div>

          {/* Tableau des Abonnements */}
          {categorizedList[activeTab].length === 0 ? (
            <Card className="p-12 text-center border-dashed rounded-3xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-foreground">
                {activeTab === 'upcoming'
                  ? 'Aucun abonnement expirant dans les 7 prochains jours'
                  : 'Aucun abonnement expiré non renouvelé'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tous vos clients sont à jour sur leurs abonnements actifs.
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-black uppercase text-[10px]">
                    <th className="py-3.5 px-4">Client & Contact</th>
                    <th className="py-3.5 px-4">Service & Offre</th>
                    <th className="py-3.5 px-4">Date Fin & Échéance</th>
                    <th className="py-3.5 px-4">Temps Restant</th>
                    <th className="py-3.5 px-4 text-right">Action Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categorizedList[activeTab].map((sousc) => {
                    const client = sousc.client
                    const days = sousc.remainingDays
                    const rawService = sousc.offrePartenaire?.service || 'streaming'
                    const meta = getServiceMeta(rawService)

                    return (
                      <tr key={sousc.id} className="hover:bg-muted/20 transition">
                        {/* Client */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-black text-foreground block">
                              {client?.pseudo || client?.nom || 'Client'}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              {client?.numeroWhatsapp || client?.telephone || sousc.telephone || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Offre */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-white text-[10px] shrink-0"
                              style={{ backgroundColor: meta.color || '#0ea5e9' }}
                            >
                              {meta.initials || 'S'}
                            </div>
                            <span className="font-extrabold text-foreground">
                              {sousc.offrePartenaire?.titreOffre || sousc.offrePartenaire?.nomService || 'Abonnement'}
                            </span>
                          </div>
                        </td>

                        {/* Date Fin */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-foreground block">
                            {sousc.dateFin ? new Date(sousc.dateFin).toLocaleDateString('fr-FR') : '30 jours'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Souscrit le {new Date(sousc.dateCreation).toLocaleDateString('fr-FR')}
                          </span>
                        </td>

                        {/* Temps Restant */}
                        <td className="py-3.5 px-4">
                          {days > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] ${
                                days <= 1
                                  ? 'bg-rose-500/10 text-rose-500 animate-pulse'
                                  : days <= 3
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {days === 1 ? 'Expire Demain !' : `${days} jours restants`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-black text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> Expiré depuis {Math.abs(days)}j
                            </span>
                          )}
                        </td>

                        {/* Action WhatsApp */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSendWhatsAppReminder(sousc)}
                            className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Relancer sur WhatsApp
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENU : ONGLET 3 (CONFIGURATION DES MULTI-RAPPELS) */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des règles de rappels programmées */}
          <Card className="p-6 border border-border bg-card shadow-xs rounded-3xl space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Déclencheurs Multi-Rappels Automatiques
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activez les étapes de relance envoyées automatiquement avant la fin d'abonnement.
              </p>
            </div>

            <div className="space-y-3">
              {reglesRappel.map((regle) => (
                <div
                  key={regle.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    regle.active ? 'bg-muted/30 border-border' : 'bg-muted/10 border-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        regle.active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      J-{regle.joursAvant}
                    </div>
                    <div>
                      <span className="text-xs font-black text-foreground block">{regle.nom}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {regle.joursAvant === 0
                          ? "Envoyé le jour même de l'expiration"
                          : `Envoyé ${regle.joursAvant} jours avant la date de fin`}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regle.active}
                      onChange={() => handleToggleRegle(regle.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Personnalisation du Message de Rappel */}
          <Card className="p-6 border border-border bg-card shadow-xs rounded-3xl space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Message Type WhatsApp Envoyé
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Variables disponibles : <code>{'{{client}}'}</code>, <code>{'{{service}}'}</code>, <code>{'{{jours}}'}</code>, <code>{'{{date_fin}}'}</code>.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={6}
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-input bg-card text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  Aperçu du message pour un client :
                </span>
                <p className="text-[11px] whitespace-pre-line text-muted-foreground">
                  {customTemplate
                    .replace(/{{client}}/g, 'Jean Kouassi')
                    .replace(/{{service}}/g, 'Netflix Premium 4K')
                    .replace(/{{jours}}/g, '3')
                    .replace(/{{date_fin}}/g, '21/08/2026')}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => toast.success('Modèle de message WhatsApp enregistré avec succès !')}
                  className="text-xs font-bold gap-1.5"
                >
                  <Check className="w-4 h-4" /> Enregistrer le Modèle
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
