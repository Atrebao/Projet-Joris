import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  Tv,
  ArrowRightLeft,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  Shield,
  Layers,
  Lock,
  ChevronRight,
  Send,
  Loader2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId, SERVICES_MARKETPLACE, getServiceMeta } from '../../Utils/Utils'
import { offresAPI, identifiantsStockAPI, souscriptionsAPI } from '../../lib/api'
import { Button, Card, Input, LoadingState, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function AffectationsComptesPage() {
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [offres, setOffres] = useState([])
  const [selectedOffreId, setSelectedOffreId] = useState('ALL')
  const [stocks, setStocks] = useState([])
  const [souscriptions, setSouscriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'PARTAGE' | 'PRIVE'

  // Modal de Déplacement / Transfert de Client
  const [transferModal, setTransferModal] = useState({
    open: false,
    souscription: null,
    targetStockId: '',
    notifyClient: true,
    submitting: false,
  })

  const loadData = async () => {
    if (!partenaireId) return
    setLoading(true)
    try {
      const [offresRes, stocksRes, souscriptionsRes] = await Promise.allSettled([
        offresAPI.getByPartenaire(partenaireId),
        identifiantsStockAPI.listByPartenaire(partenaireId),
        souscriptionsAPI.getActivesByPartenaire(partenaireId),
      ])

      if (offresRes.status === 'fulfilled') {
        const list = Array.isArray(offresRes.value.data) ? offresRes.value.data : []
        setOffres(list)
      }

      if (stocksRes.status === 'fulfilled') {
        const list = Array.isArray(stocksRes.value.data) ? stocksRes.value.data : []
        setStocks(list)
      }

      if (souscriptionsRes.status === 'fulfilled') {
        const list = Array.isArray(souscriptionsRes.value.data) ? souscriptionsRes.value.data : []
        setSouscriptions(list)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du chargement des affectations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  // Filtrage des profils & comptes maîtres
  const filteredStocks = useMemo(() => {
    return stocks.filter((st) => {
      if (selectedOffreId !== 'ALL' && String(st.offre?.id || st.offre_id) !== String(selectedOffreId)) {
        return false
      }
      if (filterType !== 'ALL' && st.typeAbonnement !== filterType) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const loginMatch = (st.login || '').toLowerCase().includes(q)
        const profilMatch = (st.nomProfil || '').toLowerCase().includes(q)
        const clientMatch = (st.souscription?.client?.pseudo || st.souscription?.client?.nom || '').toLowerCase().includes(q)
        const phoneMatch = (st.souscription?.client?.numeroWhatsapp || st.souscription?.telephone || '').includes(q)
        return loginMatch || profilMatch || clientMatch || phoneMatch
      }
      return true
    })
  }, [stocks, selectedOffreId, filterType, searchQuery])

  // Regroupement des profils par Compte Maître (email login + numeroCompte + offre)
  const groupedAccounts = useMemo(() => {
    const map = new Map()

    filteredStocks.forEach((st) => {
      const key = `${st.offre?.id || st.offre_id || 0}_${st.numeroCompte || 1}_${st.login}`
      if (!map.has(key)) {
        map.set(key, {
          key,
          offre: st.offre,
          offreId: st.offre?.id || st.offre_id,
          numeroCompte: st.numeroCompte || 1,
          login: st.login,
          password: st.password,
          profils: [],
        })
      }
      map.get(key).profils.push(st)
    })

    return Array.from(map.values())
  }, [filteredStocks])

  // Liste des profils libres pour le modal de transfert
  const availableTargetProfiles = useMemo(() => {
    if (!transferModal.souscription) return []
    const curOffreId = transferModal.souscription.offrePartenaire?.id
    return stocks.filter((s) => {
      if (curOffreId && String(s.offre?.id || s.offre_id) !== String(curOffreId)) return false
      // Profil libre
      const placesLibres = (s.capaciteMax || 1) - (s.placesOccupees || 0)
      return s.isActive && !s.isUsed && placesLibres > 0
    })
  }, [stocks, transferModal.souscription])

  const openTransferModal = (souscription) => {
    setTransferModal({
      open: true,
      souscription,
      targetStockId: '',
      notifyClient: true,
      submitting: false,
    })
  }

  const handleExecuteTransfer = async (e) => {
    e.preventDefault()
    if (!transferModal.targetStockId) {
      toast.error('Veuillez sélectionner le profil de destination.')
      return
    }

    setTransferModal((prev) => ({ ...prev, submitting: true }))
    try {
      await souscriptionsAPI.transfererProfil(
        Number(transferModal.souscription.id),
        Number(transferModal.targetStockId),
        transferModal.notifyClient
      )
      toast.success('Client déplacé avec succès vers son nouveau profil ! 🎉')
      setTransferModal({ open: false, souscription: null, targetStockId: '', notifyClient: true, submitting: false })
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erreur lors du déplacement du client')
      setTransferModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  // Calcul du temps restant (jours)
  const getRemainingDays = (dateFin) => {
    if (!dateFin) return null
    const diff = new Date(dateFin) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return <LoadingState message="Chargement de la cartographie des comptes et profils clients..." />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Affectations & Déplacement des Clients"
        description="Visualisez en temps réel qui est sur quel profil pour chaque compte maître, et déplacez vos clients d'un compte à un autre en 1 clic."
        action={
          <Button variant="outline" onClick={loadData} className="gap-2 text-xs font-semibold rounded-lg">
            <RefreshCw className="h-4 w-4" /> Rafraîchir
          </Button>
        }
      />

      {/* Barre de Recherche et Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Filtrer par Offre</label>
          <select
            value={selectedOffreId}
            onChange={(e) => setSelectedOffreId(e.target.value)}
            className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none"
          >
            <option value="ALL">📺 Toutes les offres ({offres.length})</option>
            {offres.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nomService || o.service} - {o.titreOffre || o.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Type d'accès</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none"
          >
            <option value="ALL">Tous les types (Partagé & Privé)</option>
            <option value="PARTAGE">👥 Profils Partagés</option>
            <option value="PRIVE">👑 Profils Privés (Dédiés)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Rechercher un Client / Compte</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pseudo, WhatsApp, Nom, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-input bg-card text-xs font-semibold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cartographie Visuelle des Comptes Maîtres & Profils */}
      {groupedAccounts.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-foreground">Aucun compte ou profil trouvé</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Ajoutez des comptes maîtres dans <strong>Stock & Identifiants</strong> pour visualiser les profils et les clients affectés.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedAccounts.map((account) => {
            const rawService = account.offre?.service || account.offre?.nomService || 'streaming'
            const meta = getServiceMeta(rawService)

            return (
              <Card key={account.key} className="p-6 border border-border bg-card shadow-xs rounded-3xl space-y-4">
                {/* En-tête du Compte Maître */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-xs"
                      style={{ backgroundColor: meta.color || '#0ea5e9' }}
                    >
                      {meta.initials || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">
                          {account.offre?.titreOffre || account.offre?.nomService || 'Compte Streaming'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black text-[10px]">
                          Compte #{account.numeroCompte}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        📧 {account.login} &nbsp;|&nbsp; 🔑 {account.password}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-muted-foreground">
                    {account.profils.length} Profil(s) configuré(s)
                  </span>
                </div>

                {/* Grille des Profils du Compte */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {account.profils.map((profil) => {
                    const sousc = profil.souscription
                    const client = sousc?.client
                    const isOccupied = (profil.placesOccupees || 0) > 0
                    const remainingDays = getRemainingDays(sousc?.dateFin)

                    return (
                      <div
                        key={profil.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isOccupied
                            ? 'bg-muted/30 border-border/80'
                            : 'bg-emerald-500/5 border-emerald-500/20'
                        }`}
                      >
                        {/* Header Profil */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-extrabold text-xs text-foreground truncate">
                              👤 {profil.nomProfil || `Profil #${profil.id}`}
                            </span>
                            {profil.codePin && (
                              <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono text-muted-foreground">
                                PIN: {profil.codePin}
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              profil.typeAbonnement === 'PRIVE'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {profil.typeAbonnement === 'PRIVE'
                              ? `👑 Privé (${profil.nbAppareilsMax || 1} écran)`
                              : `👥 Partagé (${profil.placesOccupees || 0}/${profil.capaciteMax || 1})`}
                          </span>
                        </div>

                        {/* Corps : Client occupant OU Profil Libre */}
                        <div className="pt-3 space-y-2">
                          {isOccupied && sousc ? (
                            <div className="space-y-2">
                              {/* Infos Client */}
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                                  Client Occupant
                                </span>
                                <p className="text-xs font-black text-foreground">
                                  {client?.pseudo || client?.nom || 'Client'}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  📱 {client?.numeroWhatsapp || client?.telephone || sousc.telephone || 'Non renseigné'}
                                </p>
                              </div>

                              {/* Dates Début & Fin */}
                              <div className="p-2 rounded-xl bg-card border border-border/60 text-[11px] space-y-1">
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Début :
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {sousc.dateCreation ? new Date(sousc.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Expiration :
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {sousc.dateFin ? new Date(sousc.dateFin).toLocaleDateString('fr-FR') : '30 jours'}
                                  </span>
                                </div>
                                {remainingDays !== null && (
                                  <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Temps restant :</span>
                                    <span
                                      className={`text-[10px] font-black ${
                                        remainingDays <= 3
                                          ? 'text-rose-500 animate-pulse'
                                          : remainingDays <= 7
                                          ? 'text-amber-500'
                                          : 'text-emerald-500'
                                      }`}
                                    >
                                      {remainingDays > 0 ? `${remainingDays} jours restants` : 'Expiré aujourd\'hui'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Bouton de Déplacement / Transfert */}
                              <div className="pt-1 flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openTransferModal(sousc)}
                                  className="w-full text-[11px] font-bold h-7 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 rounded-lg"
                                >
                                  <ArrowRightLeft className="w-3 h-3" /> Déplacer le Client
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-4 text-center space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Place Libre & Disponible
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                Prêt à être attribué automatiquement lors d'une commande.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Déplacement / Transfert de Client */}
      {transferModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-primary font-black text-base">
                <ArrowRightLeft className="w-5 h-5" />
                Déplacer le Client vers un Nouveau Profil
              </div>
              <button
                type="button"
                onClick={() => setTransferModal({ open: false, souscription: null, targetStockId: '', notifyClient: true, submitting: false })}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              {/* Récapitulatif Client */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground block">Client concerné</span>
                <p className="text-xs font-black text-foreground">
                  {transferModal.souscription?.client?.pseudo || transferModal.souscription?.client?.nom || 'Client'} (
                  {transferModal.souscription?.client?.numeroWhatsapp || transferModal.souscription?.telephone || 'Sans numéro'}
                  )
                </p>
                <p className="text-[11px] text-primary font-bold">
                  Offre : {transferModal.souscription?.offrePartenaire?.titreOffre || 'Abonnement'}
                </p>
              </div>

              {/* Sélection du Profil Libre */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground block">
                  Choisir le Nouveau Compte / Profil de destination *
                </label>
                {availableTargetProfiles.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5 text-xs text-rose-500 font-bold text-center">
                    Aucun autre profil libre trouvé pour cette offre. Veuillez d'abord ajouter un profil disponible dans Stock & Identifiants.
                  </div>
                ) : (
                  <select
                    required
                    value={transferModal.targetStockId}
                    onChange={(e) => setTransferModal((prev) => ({ ...prev, targetStockId: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="">-- Sélectionnez un profil disponible --</option>
                    {availableTargetProfiles.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        Compte #{tp.numeroCompte} ({tp.login}) ➔ {tp.nomProfil || `Profil #${tp.id}`} [{tp.typeAbonnement === 'PRIVE' ? '👑 Privé' : '👥 Partagé'}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Notification WhatsApp automatique */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferModal.notifyClient}
                  onChange={(e) => setTransferModal((prev) => ({ ...prev, notifyClient: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Envoyer automatiquement les nouveaux identifiants par WhatsApp
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Le client recevra un message WhatsApp instantané avec son nouvel identifiant, mot de passe et PIN.
                  </span>
                </div>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransferModal({ open: false, souscription: null, targetStockId: '', notifyClient: true, submitting: false })}
                  disabled={transferModal.submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={transferModal.submitting || !transferModal.targetStockId}
                  className="gap-2 font-bold"
                >
                  {transferModal.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                  {transferModal.submitting ? 'Déplacement en cours...' : 'Confirmer le Déplacement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
