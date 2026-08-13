import { useEffect, useState, useCallback } from 'react'
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
} from 'lucide-react'
import { partenairesAPI, reversementsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { Button, Card, DataTable, Input, LoadingState, PageHeader, Select, ServiceLogo, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

const MODES_PAIEMENT = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
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

  // Commission
  const [commissionInput, setCommissionInput] = useState('')
  const [commissionActive, setCommissionActive] = useState(true)
  const [updatingCommission, setUpdatingCommission] = useState(false)

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

  const loadPartenaires = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const [partenairesRes, balancesRes] = await Promise.allSettled([
        partenairesAPI.getAll({
          search: recherche.trim() || undefined,
          statut: filtreStatut !== 'TOUS' ? filtreStatut : undefined,
          page,
          limit: 10,
        }),
        reversementsAPI.getAllBalances(),
      ])

      const data = partenairesRes.status === 'fulfilled' ? partenairesRes.value?.data : null
      const balancesList = balancesRes.status === 'fulfilled' ? balancesRes.value?.data?.data || [] : []

      const balanceMap = {}
      balancesList.forEach((b) => {
        balanceMap[b.partenaireId] = b
      })
      setBalances(balanceMap)

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const rawList = data.data || []
        setPartenaires(
          rawList.map((p) => ({
            ...p,
            dateInscription: p.dateCreation,
            statut: !p.isValidated ? 'EN_ATTENTE' : p.isActive ? 'ACTIF' : 'SUSPENDU',
            nbOffres: p.nbOffres ?? (p.offres?.length ?? 0),
            totalVentes: p.totalVentes ?? 0,
            revenu: p.revenu ?? 0,
            tauxCommission: p.tauxCommission ?? 10,
            commissionActive: p.commissionActive !== false,
          }))
        )
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || rawList.length)
      } else {
        const rawList = Array.isArray(data) ? data : []
        setPartenaires(
          rawList.map((p) => ({
            ...p,
            dateInscription: p.dateCreation,
            statut: !p.isValidated ? 'EN_ATTENTE' : p.isActive ? 'ACTIF' : 'SUSPENDU',
            nbOffres: p.nbOffres ?? (p.offres?.length ?? 0),
            totalVentes: p.totalVentes ?? 0,
            revenu: p.revenu ?? 0,
            tauxCommission: p.tauxCommission ?? 10,
            commissionActive: p.commissionActive !== false,
          }))
        )
        setTotal(rawList.length)
      }
    } catch (error) {
      console.error('Erreur chargement partenaires:', error)
      if (!isBackground) toast.error('Impossible de charger les partenaires')
      setPartenaires([])
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [recherche, filtreStatut, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPartenaires()
    }, 200)
    return () => clearTimeout(timer)
  }, [loadPartenaires])

  // Écoute WebSocket en temps réel
  useEffect(() => {
    const unsubRev = onSocketEvent('nouveau_reversement', () => {
      loadPartenaires(true)
    })
    const unsubDel = onSocketEvent('commande_livree', () => {
      loadPartenaires(true)
    })
    const unsubStats = onSocketEvent('stats_updated', () => {
      loadPartenaires(true)
    })

    return () => {
      unsubRev()
      unsubDel()
      unsubStats()
    }
  }, [loadPartenaires])

  useEffect(() => {
    if (detailPartenaire) {
      setCommissionInput(detailPartenaire.tauxCommission ?? 10)
      setCommissionActive(detailPartenaire.commissionActive !== false)
    }
  }, [detailPartenaire])

  const handleValider = async (id) => {
    try {
      await partenairesAPI.validate(id)
      toast.success('Partenaire validé avec succès')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleVoirPartenaire = async (id) => {
    setDetailPartenaire(null)
    setDetailLoading(true)
    try {
      const [{ data: pData }, { data: bData }] = await Promise.all([
        partenairesAPI.getOne(id),
        reversementsAPI.getPartenaireBalance(id),
      ])
      setDetailPartenaire(pData)
      setDetailBalance(bData)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSuspendre = async (id) => {
    try {
      await partenairesAPI.toggleActive(id)
      toast.success('Statut du partenaire modifié')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la suspension')
    }
  }

  const handleUpdateCommission = async (id, newCommission, active) => {
    try {
      await partenairesAPI.updateCommission(id, Number(newCommission), active)
      toast.success('Commission mise à jour avec succès')
      loadPartenaires()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commission:', error)
      toast.error('Impossible de mettre à jour la commission')
    }
  }

  const openPayoutModal = (partner) => {
    const bal = balances[partner.id]
    setPayoutPartenaire(partner)
    setPayoutAmount(bal ? String(bal.soldeRestantAReverser || 0) : '')
    setPayoutMode('MOBILE_MONEY')
    setPayoutRef('')
    setPayoutNotes('')
    setPayoutModalOpen(true)
  }

  const handleSubmitPayout = async (e) => {
    e.preventDefault()
    if (!payoutPartenaire) return
    const montant = Number(payoutAmount)
    if (isNaN(montant) || montant <= 0) {
      toast.error('Veuillez entrer un montant valide supérieur à 0')
      return
    }

    setSubmittingPayout(true)
    try {
      await reversementsAPI.create(payoutPartenaire.id, {
        montant,
        modePaiement: payoutMode,
        referenceTransaction: payoutRef || undefined,
        notes: payoutNotes || undefined,
      })
      toast.success(`Reversement de ${formatFCFA(montant)} enregistré avec succès !`)
      setPayoutModalOpen(false)
      loadPartenaires()
    } catch (error) {
      console.error('Erreur reversement:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du versement')
    } finally {
      setSubmittingPayout(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryModalOpen(true)
    try {
      const { data } = await reversementsAPI.getAll({ limit: 50 })
      setReversementsHistory(Array.isArray(data) ? data : data?.data || [])
    } catch (error) {
      console.error('Erreur historique:', error)
      toast.error('Impossible de charger l’historique')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleCancelReversement = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce reversement ?')) return
    try {
      await reversementsAPI.cancel(id)
      toast.success('Reversement annulé')
      loadHistory()
      loadPartenaires()
    } catch {
      toast.error('Impossible d’annuler ce reversement')
    }
  }

  if (loading && partenaires.length === 0) return <LoadingState label="Chargement des partenaires..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête avec bouton Historique Reversements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Partenaires & Versements"
          description={`${total} partenaire(s). Gérez les commissions et les reversements sur commandes livrées.`}
        />
        <Button
          onClick={loadHistory}
          variant="outline"
          className="gap-2 self-start sm:self-center rounded-xl border-slate-200 shadow-xs font-bold text-xs"
        >
          <History className="h-4 w-4 text-slate-500" />
          Historique des versements
        </Button>
      </div>

      {/* Barre de recherche et filtrage */}
      <Card className="p-4 shadow-sm border border-border bg-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl"
              placeholder="Rechercher par nom, boutique ou email..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
            />
          </label>
          <Select
            value={filtreStatut}
            onChange={(e) => {
              setFiltreStatut(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-56 rounded-xl border-input bg-card text-sm"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="SUSPENDU">Suspendus</option>
          </Select>
        </div>
      </Card>

      {/* Tableau des partenaires */}
      <Card className="p-1 border border-border bg-card shadow-sm overflow-hidden">
        <DataTable
          data={partenaires}
          emptyLabel="Aucun partenaire trouvé"
          columns={[
            {
              key: 'partenaire',
              label: 'Partenaire / Boutique',
              render: (p) => (
                <div className="flex items-center gap-3">
                  <ServiceLogo name={p.nomBoutique || p.nom} size="sm" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.nomBoutique || p.nom}</div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {[p.prenoms, p.nom].filter(Boolean).join(' ')} • {p.ville || '-'}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'caTotal',
              label: 'CA Brut',
              render: (p) => {
                const bal = balances[p.id]
                return <span className="font-bold text-sm text-slate-900">{formatFCFA(bal?.caTotalPaye ?? p.revenu ?? 0)}</span>
              },
            },
            {
              key: 'commission',
              label: 'Commission',
              render: (p) => {
                const bal = balances[p.id]
                return (
                  <div>
                    <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {p.commissionActive === false ? '0%' : `${p.tauxCommission ?? 10}%`}
                    </span>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{formatFCFA(bal?.commissionTotale ?? 0)}</div>
                  </div>
                )
              },
            },
            {
              key: 'montantEligible',
              label: 'Éligible (Livrées)',
              render: (p) => {
                const bal = balances[p.id]
                return (
                  <div>
                    <span className="font-extrabold text-sm text-emerald-700">{formatFCFA(bal?.montantEligible ?? 0)}</span>
                    {bal?.montantEnAttenteLivraison > 0 && (
                      <div className="text-[10px] text-amber-600 font-bold mt-0.5" title="En attente de livraison des identifiants">
                        +{formatFCFA(bal.montantEnAttenteLivraison)} séquestre
                      </div>
                    )}
                  </div>
                )
              },
            },
            {
              key: 'dejaReverse',
              label: 'Déjà Reversé',
              render: (p) => {
                const bal = balances[p.id]
                return <span className="font-semibold text-xs text-slate-600 font-mono">{formatFCFA(bal?.totalDejaReverse ?? 0)}</span>
              },
            },
            {
              key: 'soldeDu',
              label: 'Solde Dû',
              render: (p) => {
                const bal = balances[p.id]
                const solde = bal?.soldeRestantAReverser ?? 0
                return (
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-extrabold text-sm ${solde > 0 ? 'text-purple-700' : 'text-slate-400'}`}>
                      {formatFCFA(solde)}
                    </span>
                    {p.statut === 'ACTIF' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPayoutModal(p)}
                        className="h-7 px-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg gap-1"
                        title="Reverser au partenaire"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Payer
                      </Button>
                    )}
                  </div>
                )
              },
            },
            { key: 'statut', label: 'Statut', render: (p) => <StatusBadge status={p.statut} /> },
            {
              key: 'actions',
              label: '',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (p) => (
                <div className="flex justify-end gap-1">
                  {p.statut === 'EN_ATTENTE' && (
                    <Button size="icon" variant="ghost" className="hover:bg-slate-100 text-emerald-600" onClick={() => handleValider(p.id)} title="Valider le partenaire">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-slate-100 text-slate-500"
                    onClick={() => {
                      handleVoirPartenaire(p.id)
                    }}
                    title="Voir les détails & commission"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {p.statut === 'ACTIF' && (
                    <Button size="icon" variant="ghost" className="hover:bg-destructive/5 text-destructive" onClick={() => handleSuspendre(p.id)} title="Suspendre">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-700">{page}</span> sur <span className="font-bold text-slate-700">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-2 text-xs border-slate-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-2 text-xs border-slate-200"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Détails Partenaire & Commission */}
      <ModalDetail
        open={!!detailPartenaire || detailLoading}
        onClose={() => {
          setDetailPartenaire(null)
          setDetailBalance(null)
          setDetailLoading(false)
        }}
        title="Détails du partenaire"
        loading={detailLoading}
      >
        {detailPartenaire && (
          <div className="space-y-6">
            {/* Badge d'en-tête */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <ServiceLogo name={detailPartenaire.nomBoutique || detailPartenaire.nom} />
                <div>
                  <p className="font-extrabold text-slate-900 tracking-tight">
                    {[detailPartenaire.prenoms, detailPartenaire.nom].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{detailPartenaire.nomBoutique || 'Boutique non renseignée'}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  openPayoutModal(detailPartenaire)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs"
              >
                <Wallet className="h-3.5 w-3.5" />
                Effectuer un versement
              </Button>
            </div>

            {/* Récapitulatif Financier du Partenaire */}
            {detailBalance && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CA Total Ventes</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{formatFCFA(detailBalance.caTotalPaye)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Commissions</span>
                  <p className="font-extrabold text-emerald-700 text-sm mt-0.5">{formatFCFA(detailBalance.commissionTotale)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Déjà Reversé</span>
                  <p className="font-extrabold text-slate-700 text-sm mt-0.5">{formatFCFA(detailBalance.totalDejaReverse)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Solde Dû Restant</span>
                  <p className="font-extrabold text-purple-700 text-sm mt-0.5">{formatFCFA(detailBalance.soldeRestantAReverser)}</p>
                </div>
              </div>
            )}

            {/* MODULE : Configuration de la commission */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" /> Taux de commission plateforme
                </h4>
                <p className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">
                  Pourcentage prélevé sur chaque vente de ce partenaire. Si désactivé, le partenaire reçoit 100% de ses ventes.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-card px-3 py-2 text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={commissionActive}
                    onChange={(e) => setCommissionActive(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Active
                </label>
                <div className="relative flex-1 max-w-[160px]">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!commissionActive}
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 text-sm font-mono font-bold text-slate-900 border border-emerald-200 bg-card rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">%</span>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs gap-1.5 h-auto px-4"
                  disabled={updatingCommission}
                  onClick={async () => {
                    setUpdatingCommission(true)
                    await handleUpdateCommission(detailPartenaire.id, commissionInput, commissionActive)
                    await new Promise((r) => setTimeout(r, 600))
                    setUpdatingCommission(false)
                  }}
                >
                  {updatingCommission ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Mettre à jour
                </Button>
              </div>
            </div>

            {/* Grille d'informations secondaires */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {[
                ['Email professionnel', detailPartenaire.email],
                ['Téléphone', detailPartenaire.telephone],
                ['Ville de résidence', detailPartenaire.ville],
                ['Pays', detailPartenaire.pays || '-'],
                ['Adresse complète', detailPartenaire.adresse || '-'],
                ['Nombre d’offres en stock', detailPartenaire.offres?.length ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
                  <p className="font-semibold text-slate-900 text-sm bg-slate-50 border border-slate-100/50 px-3 py-2 rounded-xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalDetail>

      {/* Modal Effectuer un Reversement */}
      {payoutModalOpen && payoutPartenaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Effectuer un versement</h3>
                  <p className="text-xs text-muted-foreground">{payoutPartenaire.nomBoutique || payoutPartenaire.nom}</p>
                </div>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayout} className="p-5 space-y-4">
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-800 font-semibold">Solde dû éligible (ventes livrées) :</span>
                  <span className="font-extrabold font-mono text-purple-900 text-sm">
                    {formatFCFA(balances[payoutPartenaire.id]?.soldeRestantAReverser || 0)}
                  </span>
                </div>
                {balances[payoutPartenaire.id]?.montantEnAttenteLivraison > 0 && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    ⚠️ {formatFCFA(balances[payoutPartenaire.id].montantEnAttenteLivraison)} sont en séquestre (commandes non encore livrées).
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Montant à reverser (FCFA) *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 50000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="font-mono font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Mode de paiement *</label>
                  <Select value={payoutMode} onChange={(e) => setPayoutMode(e.target.value)}>
                    {MODES_PAIEMENT.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Référence transaction</label>
                  <Input
                    placeholder="Ex: TXN-WAVE-8921"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Justificatif</label>
                <Input
                  placeholder="Notes facultatives pour ce versement..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setPayoutModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPayout}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5"
                >
                  {submittingPayout ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                  Valider le versement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historique des Reversements */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Historique des reversements</h3>
                  <p className="text-xs text-muted-foreground">Liste des versements effectués aux partenaires.</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {historyLoading ? (
                <LoadingState label="Chargement de l'historique..." />
              ) : reversementsHistory.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Aucun versement enregistré pour le moment.</div>
              ) : (
                <DataTable
                  data={reversementsHistory}
                  columns={[
                    {
                      key: 'ref',
                      label: 'Référence',
                      render: (r) => (
                        <div>
                          <span className="font-mono font-bold text-xs text-foreground">{r.reference}</span>
                          <div className="text-[11px] text-muted-foreground">
                            {r.dateCreation ? new Date(r.dateCreation).toLocaleDateString('fr-FR') : '-'}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'partenaire',
                      label: 'Partenaire',
                      render: (r) => (
                        <div className="font-semibold text-sm text-foreground">
                          {r.partenaire?.nomBoutique || r.partenaire?.nom || 'Partenaire'}
                        </div>
                      ),
                    },
                    {
                      key: 'montant',
                      label: 'Montant',
                      render: (r) => <span className="font-mono font-extrabold text-sm text-purple-700">{formatFCFA(r.montant)}</span>,
                    },
                    {
                      key: 'mode',
                      label: 'Mode & Transaction',
                      render: (r) => (
                        <div>
                          <span className="text-xs font-semibold text-slate-800">{r.modePaiement || 'MOBILE_MONEY'}</span>
                          {r.referenceTransaction && (
                            <div className="font-mono text-[10px] text-slate-400">Réf: {r.referenceTransaction}</div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'statut',
                      label: 'Statut',
                      render: (r) => <StatusBadge status={r.statut} />,
                    },
                    {
                      key: 'actions',
                      label: '',
                      className: 'text-right',
                      render: (r) =>
                        r.statut === 'VALIDE' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelReversement(r.id)}
                            className="text-destructive hover:bg-destructive/10 text-xs font-bold h-7 px-2"
                          >
                            Annuler
                          </Button>
                        ) : null,
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
