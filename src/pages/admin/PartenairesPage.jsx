import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Percent,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  History,
  AlertCircle,
  X,
  Store,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Building2,
  UserCheck,
  FileText,
  DollarSign,
  MessageSquare,
} from 'lucide-react'
import { partenairesAPI, reversementsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

const MODES_PAIEMENT = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money (Wave / Orange / MTN / Moov)' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'MTN_MOMO', label: 'MTN MoMo' },
  { value: 'MOOV_MONEY', label: 'Moov Money' },
  { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'AUTRE', label: 'Autre' },
]

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal Détails Partenaire
  const [detailPartenaire, setDetailPartenaire] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailBalance, setDetailBalance] = useState(null)

  // Commission inline
  const [commissions, setCommissions] = useState({})
  const [updatingCommissionId, setUpdatingCommissionId] = useState(null)

  // Modal Effectuer un Reversement
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [payoutPartenaire, setPayoutPartenaire] = useState(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutMode, setPayoutMode] = useState('MOBILE_MONEY')
  const [payoutRef, setPayoutRef] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [submittingPayout, setSubmittingPayout] = useState(false)

  // Modal Historique des Reversements
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [reversementsHistory, setReversementsHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadPartenaires = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true)
      try {
        const [partenairesRes, balancesRes] = await Promise.allSettled([
          partenairesAPI.getAll({
            search: recherche.trim() || undefined,
            statut: filtreStatut !== 'TOUS' ? filtreStatut : undefined,
            page,
            limit: 12,
          }),
          reversementsAPI.getAllBalances(),
        ])

        if (partenairesRes.status === 'fulfilled') {
          const resData = partenairesRes.value?.data
          const list = Array.isArray(resData) ? resData : resData?.data || []
          setPartenaires(list)
          setTotalPages(resData?.totalPages || 1)
          setTotal(resData?.total || list.length)

          // Initialiser les commissions
          const commMap = {}
          list.forEach((p) => {
            if (p && p.id) {
              commMap[p.id] = p.tauxCommission !== undefined ? p.tauxCommission : 10
            }
          })
          setCommissions(commMap)
        }

        if (balancesRes.status === 'fulfilled') {
          const resVal = balancesRes.value?.data
          const rawBalances = Array.isArray(resVal)
            ? resVal
            : Array.isArray(resVal?.data)
            ? resVal.data
            : []
          const balanceMap = {}
          rawBalances.forEach((b) => {
            if (b && b.partenaireId) {
              balanceMap[b.partenaireId] = b
            }
          })
          setBalances(balanceMap)
        }
      } catch (error) {
        console.error('Erreur chargement partenaires:', error)
        if (!isBackground) toast.error('Impossible de charger les partenaires')
      } finally {
        if (!isBackground) setLoading(false)
      }
    },
    [recherche, filtreStatut, page]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPartenaires()
    }, 200)
    return () => clearTimeout(timer)
  }, [loadPartenaires])

  useEffect(() => {
    const unsubPartenaire = onSocketEvent('nouveau_partenaire', () => {
      toast.success('Nouveau partenaire inscrit', { duration: 4000 })
      loadPartenaires(true)
    })
    const unsubPayout = onSocketEvent('nouveau_reversement', () => {
      loadPartenaires(true)
    })
    return () => {
      unsubPartenaire()
      unsubPayout()
    }
  }, [loadPartenaires])

  // Validation / Activation
  const handleValiderPartenaire = async (id, nom) => {
    try {
      await partenairesAPI.valider(id)
      toast.success(`Partenaire "${nom}" validé avec succès !`)
      loadPartenaires(true)
    } catch {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleToggleActif = async (id, statutActuel) => {
    try {
      await partenairesAPI.toggleActive(id)
      toast.success(statutActuel ? 'Partenaire mis en pause' : 'Partenaire activé')
      loadPartenaires(true)
    } catch {
      toast.error('Erreur lors du changement de statut')
    }
  }

  // Sauvegarde Commission
  const handleSaveCommission = async (id) => {
    setUpdatingCommissionId(id)
    try {
      const taux = Number(commissions[id] || 0)
      await partenairesAPI.updateCommission(id, {
        tauxCommission: taux,
        isCommissionActive: true,
      })
      toast.success('Taux de commission mis à jour')
      loadPartenaires(true)
    } catch {
      toast.error('Erreur lors de la mise à jour de la commission')
    } finally {
      setUpdatingCommissionId(null)
    }
  }

  // Ouvrir modal Versement
  const openPayoutModal = (partenaire) => {
    const bal = balances[partenaire.id] || {}
    const solde = bal.soldeRestant || bal.soldeDisponible || 0
    setPayoutPartenaire(partenaire)
    setPayoutAmount(solde > 0 ? String(solde) : '')
    setPayoutMode('MOBILE_MONEY')
    setPayoutRef('')
    setPayoutNotes('')
    setPayoutModalOpen(true)
  }

  // Soumettre Versement
  const handleExecutePayout = async (e) => {
    e.preventDefault()
    if (!payoutPartenaire || !payoutAmount) return

    setSubmittingPayout(true)
    try {
      await reversementsAPI.create(payoutPartenaire.id, {
        montant: Number(payoutAmount),
        modePaiement: payoutMode,
        referencePaiement: payoutRef.trim() || undefined,
        referenceTransaction: payoutRef.trim() || undefined,
        notes: payoutNotes.trim() || undefined,
      })

      toast.success(`Reversement de ${formatFCFA(payoutAmount)} effectué avec succès !`)
      setPayoutModalOpen(false)
      loadPartenaires(true)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erreur lors du reversement')
    } finally {
      setSubmittingPayout(false)
    }
  }

  // Ouvrir Historique Versements
  const openHistoryModal = async (partenaire) => {
    setPayoutPartenaire(partenaire)
    setHistoryModalOpen(true)
    setHistoryLoading(true)
    try {
      const res = await reversementsAPI.getByPartenaire(partenaire.id)
      const rawH = res?.data
      setReversementsHistory(Array.isArray(rawH) ? rawH : rawH?.data || [])
    } catch {
      toast.error("Impossible de charger l'historique")
      setReversementsHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  // Ouvrir Détails Partenaire
  const openDetailModal = async (partenaire) => {
    setDetailPartenaire(partenaire)
    setDetailBalance(balances[partenaire.id] || null)
    setDetailLoading(true)
    try {
      const [pRes, bRes] = await Promise.allSettled([
        partenairesAPI.getOne(partenaire.id),
        reversementsAPI.getBalance(partenaire.id),
      ])
      if (pRes.status === 'fulfilled') setDetailPartenaire(pRes.value.data)
      if (bRes.status === 'fulfilled') setDetailBalance(bRes.value.data)
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  // Calculs KPIs
  const totalPartenaires = total || partenaires.length
  const valides = partenaires.filter((p) => p.isValidated && p.isActive !== false).length
  const enAttente = partenaires.filter((p) => !p.isValidated).length
  const totalSoldeRestant = Object.values(balances).reduce(
    (acc, b) => acc + Number(b.soldeRestant || b.soldeDisponible || 0),
    0
  )

  if (loading && partenaires.length === 0) {
    return <LoadingState label="Chargement des partenaires marchands..." />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Gestion des Partenaires & Boutiques"
        description="Validation des comptes marchands, gestion des taux de commission et suivi des reversements."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Boutiques"
          value={totalPartenaires}
          subtext="Partenaires enregistrés"
          icon={Store}
        />
        <KpiCard
          title="Boutiques Actives"
          value={valides}
          subtext="En ligne sur le catalogue"
          icon={ShieldCheck}
        />
        <KpiCard
          title="En Attente de Validation"
          value={enAttente}
          subtext="Nouveaux comptes à approuver"
          icon={AlertCircle}
        />
        <KpiCard
          title="Soldes à Reverser"
          value={formatFCFA(totalSoldeRestant)}
          subtext="Sur commandes livrées"
          icon={Wallet}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher une boutique, gérant, email, tel..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filtreStatut}
              onChange={(e) => {
                setFiltreStatut(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="VALIDATED">Validés & Actifs</option>
              <option value="PENDING">En attente de validation</option>
              <option value="SUSPENDED">Suspendus / Inactifs</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grille de Partenaires */}
      {partenaires.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Store}
            title="Aucun partenaire trouvé"
            description="Aucun compte marchand ne correspond à vos critères de recherche actuels."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {partenaires.map((p) => {
            const bal = balances[p.id] || {}
            const soldeRestant = Number(bal.soldeRestant || bal.soldeDisponible || 0)
            const montantEnAttente = Number(bal.montantEnAttenteLivraison || 0)

            return (
              <Card
                key={p.id}
                className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
                  !p.isValidated
                    ? 'border-amber-200 bg-amber-50/10'
                    : p.isActive === false
                    ? 'border-slate-300 bg-slate-50 opacity-75'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* En-tête Carte */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-2xs">
                        {p.nomBoutique ? p.nomBoutique.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                          {p.nomBoutique || p.nom}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          Gérant : <strong className="text-slate-800 font-semibold">{p.nom} {p.prenoms}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Statut Badge */}
                    <div>
                      {!p.isValidated ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          EN ATTENTE
                        </span>
                      ) : p.isActive === false ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          SUSPENDU
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ACTIF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.email || 'Pas d’email'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{p.telephone || 'Non renseigné'}</span>
                    </div>
                  </div>

                  {/* Taux de Commission */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Commission Plateforme
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={commissions[p.id] !== undefined ? commissions[p.id] : 10}
                          onChange={(e) =>
                            setCommissions((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className="w-16 h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-900 outline-none text-center"
                        />
                        <span className="text-xs font-semibold text-slate-500">%</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={updatingCommissionId === p.id}
                      onClick={() => handleSaveCommission(p.id)}
                      className="text-xs font-semibold bg-slate-900 text-white rounded-lg h-8 px-3 hover:bg-slate-800"
                    >
                      {updatingCommissionId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                  </div>

                  {/* Soldes Financiers */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold uppercase text-indigo-700 block">
                        Prêt à reverser
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatFCFA(soldeRestant)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold uppercase text-amber-700 block">
                        Attente livraison
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatFCFA(montantEnAttente)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bas de Carte : Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailModal(p)}
                      className="text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 h-8 px-2.5"
                      title="Voir détails"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openHistoryModal(p)}
                      className="text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 h-8 px-2.5"
                      title="Historique des versements"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!p.isValidated ? (
                      <Button
                        size="sm"
                        onClick={() => handleValiderPartenaire(p.id, p.nomBoutique || p.nom)}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 px-3 gap-1 shadow-2xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Valider
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPayoutModal(p)}
                          disabled={soldeRestant <= 0}
                          className="text-xs font-bold rounded-lg text-slate-800 border-slate-200 hover:bg-slate-100 h-8 px-3 gap-1 disabled:opacity-50"
                        >
                          <Wallet className="h-3.5 w-3.5" /> Verser
                        </Button>

                        <button
                          onClick={() => handleToggleActif(p.id, p.isActive !== false)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            p.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={p.isActive !== false ? 'Mettre en pause' : 'Activer'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              p.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 font-medium">
            Affichage de la page {page} sur {totalPages} ({total} partenaires)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-semibold rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-semibold rounded-lg"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Effectuer un Reversement */}
      {payoutModalOpen && payoutPartenaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setPayoutModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Effectuer un Versement Partenaire
                </h3>
                <p className="text-xs text-slate-500">
                  Destinataire : <strong>{payoutPartenaire.nomBoutique || payoutPartenaire.nom}</strong> ({payoutPartenaire.telephone})
                </p>
              </div>
            </div>

            <form onSubmit={handleExecutePayout} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Montant à reverser (FCFA) *
                </label>
                <Input
                  type="number"
                  required
                  min="100"
                  placeholder="Ex: 50000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="text-base font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Moyen de paiement utilisé *
                </label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none"
                >
                  {MODES_PAIEMENT.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Référence de transaction (Wave / Orange / Moov / MTN / Virement)
                </label>
                <Input
                  placeholder="Ex: TXN-WAVE-983109"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Notes internes (optionnel)
                </label>
                <Input
                  placeholder="Ex: Virement des ventes de la semaine"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPayoutModalOpen(false)}
                  className="text-xs font-semibold rounded-lg"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPayout}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-4 h-9 shadow-2xs"
                >
                  {submittingPayout ? 'Validation...' : 'Confirmer le reversement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historique des Versements */}
      {historyModalOpen && payoutPartenaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Historique des Versements : {payoutPartenaire.nomBoutique || payoutPartenaire.nom}
              </h3>
              <p className="text-xs text-slate-500">
                Transactions de reversement enregistrées pour ce partenaire.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyLoading ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  Chargement de l&apos;historique...
                </div>
              ) : reversementsHistory.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  Aucun versement enregistré pour ce partenaire.
                </div>
              ) : (
                reversementsHistory.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">
                        {rev.referencePaiement || rev.referenceTransaction || `REV-${rev.id}`}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rev.dateCreation || rev.createdAt).toLocaleDateString('fr-FR')} • {rev.modePaiement}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 font-mono text-sm block">
                        {formatFCFA(rev.montant)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {rev.statut || 'EFFECTUÉ'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Partenaire */}
      {detailPartenaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setDetailPartenaire(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center">
                {detailPartenaire.nomBoutique ? detailPartenaire.nomBoutique.charAt(0) : 'B'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {detailPartenaire.nomBoutique || detailPartenaire.nom}
                </h3>
                <p className="text-xs text-slate-500">Fiche Partenaire Détaillée</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gérant :</span>
                <span className="font-semibold text-slate-800">{detailPartenaire.nom} {detailPartenaire.prenoms}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Téléphone :</span>
                <span className="font-semibold text-slate-800 font-mono">{detailPartenaire.telephone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email :</span>
                <span className="font-semibold text-slate-800">{detailPartenaire.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Commission :</span>
                <span className="font-bold text-indigo-700">{detailPartenaire.tauxCommission || 10}%</span>
              </div>
              {detailBalance && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Solde Éligible :</span>
                    <span className="font-bold text-indigo-700">{formatFCFA(detailBalance.soldeRestant || detailBalance.soldeRestantAReverser || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Déjà Reversé :</span>
                    <span className="font-bold text-emerald-700">{formatFCFA(detailBalance.totalReverser || detailBalance.totalDejaReverser || 0)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailPartenaire(null)}
                className="text-xs font-semibold rounded-lg"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
