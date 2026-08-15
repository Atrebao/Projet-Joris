import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  Tags,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Code,
  Sparkles,
  Copy,
  Check,
  Percent,
  Calendar,
  Layers,
  Users,
  Eye,
  EyeOff,
  Wand2,
  Radio,
  Zap,
} from 'lucide-react'
import { promotionsAPI, codesPromoAPI, offresAPI } from '../../lib/api'
import { getPartenaireId } from '../../Utils/Utils'
import {
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

const toDateInput = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

export default function PromotionsPage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()

  const [loading, setLoading] = useState(true)
  const [offres, setOffres] = useState([])
  const [promotions, setPromotions] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)

  // Mode de création de promotion : 'DIRECT' (Promotion directe sans code) ou 'CODE' (Avec code promo)
  const [promoKind, setPromoKind] = useState('DIRECT') // 'DIRECT' | 'CODE'

  const emptyPromotionForm = useMemo(
    () => ({
      id: null,
      nom: '',
      description: '',
      type: 'POURCENTAGE',
      valeur: '',
      isDirecte: true,
      nbUtilisationsMax: -1, // -1 = illimité
      maxUtilisationsParClient: -1, // -1 = illimité
      dateDebut: '',
      dateFin: '',
      offreId: '',
      // Si création avec code promo direct
      initialCode: '',
    }),
    []
  )

  const [promoForm, setPromoForm] = useState(emptyPromotionForm)
  const [promoSubmitting, setPromoSubmitting] = useState(false)

  // Formulaire pour ajouter un code supplémentaire à une promotion existante
  const [expandedPromotionId, setExpandedPromotionId] = useState(null)
  const [newCodeInput, setNewCodeInput] = useState({
    code: '',
    nbUtilisationsMax: -1,
    maxUtilisationsParClient: 1,
    dateExpiration: '',
  })
  const [codeSubmitting, setCodeSubmitting] = useState(false)

  const load = async () => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }

    setLoading(true)
    try {
      const [offresRes, promosRes] = await Promise.all([
        offresAPI.getByPartenaire(partenaireId),
        promotionsAPI.getByPartenaire(partenaireId),
      ])

      setOffres(Array.isArray(offresRes?.data) ? offresRes.data : [])
      setPromotions(Array.isArray(promosRes?.data) ? promosRes.data : [])
    } catch (e) {
      console.error(e)
      toast.error('Impossible de charger les promotions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const generateRandomCode = () => {
    const prefixes = ['PROMO', 'STREAM', 'VIP', 'OFFRE', 'BONUS', 'DEAL']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}${randomNum}`
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Code ${code} copié !`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const submitPromotion = async (e) => {
    e.preventDefault()
    setPromoSubmitting(true)
    try {
      const isDirect = promoKind === 'DIRECT'

      const payload = {
        nom: promoForm.nom.trim(),
        description: promoForm.description?.trim() || undefined,
        type: promoForm.type,
        valeur: Number(promoForm.valeur),
        isDirecte: isDirect,
        nbUtilisationsMax:
          promoForm.nbUtilisationsMax === '' || Number(promoForm.nbUtilisationsMax) <= 0
            ? -1
            : Number(promoForm.nbUtilisationsMax),
        maxUtilisationsParClient:
          promoForm.maxUtilisationsParClient === '' || Number(promoForm.maxUtilisationsParClient) <= 0
            ? -1
            : Number(promoForm.maxUtilisationsParClient),
        dateDebut: promoForm.dateDebut ? new Date(promoForm.dateDebut) : undefined,
        dateFin: promoForm.dateFin ? new Date(promoForm.dateFin) : undefined,
        partenaireId,
        offreId: promoForm.offreId ? Number(promoForm.offreId) : undefined,
        abonnementId: promoForm.offreId ? Number(promoForm.offreId) : undefined,
      }

      let createdPromo = null
      if (promoForm.id) {
        await promotionsAPI.update(promoForm.id, payload)
        toast.success('Promotion modifiée avec succès')
      } else {
        const { data } = await promotionsAPI.create(payload)
        createdPromo = data
        toast.success(
          isDirect
            ? 'Promotion directe créée ! Elle est désormais visible publiquement sur vos offres.'
            : 'Promotion créée !'
        )

        // Si l'utilisateur a saisi ou généré un code promo initial
        if (!isDirect && promoForm.initialCode.trim() && createdPromo?.id) {
          try {
            await codesPromoAPI.create({
              code: promoForm.initialCode.trim().toUpperCase(),
              promotionId: createdPromo.id,
              nbUtilisationsMax: payload.nbUtilisationsMax,
              maxUtilisationsParClient: payload.maxUtilisationsParClient === -1 ? 1 : payload.maxUtilisationsParClient,
              dateExpiration: payload.dateFin,
              partenaireId,
            })
            toast.success(`Code promo "${promoForm.initialCode.trim().toUpperCase()}" généré !`)
          } catch (codeErr) {
            console.error('Erreur création code promo initial:', codeErr)
          }
        }
      }

      setPromoForm(emptyPromotionForm)
      await load()
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || 'Erreur lors de l’enregistrement de la promotion')
    } finally {
      setPromoSubmitting(false)
    }
  }

  const handleAddCodeToPromo = async (promotionId) => {
    if (!newCodeInput.code.trim()) {
      toast.error('Veuillez saisir ou générer un code promo')
      return
    }

    setCodeSubmitting(true)
    try {
      await codesPromoAPI.create({
        code: newCodeInput.code.trim().toUpperCase(),
        promotionId,
        nbUtilisationsMax:
          newCodeInput.nbUtilisationsMax === '' || Number(newCodeInput.nbUtilisationsMax) <= 0
            ? -1
            : Number(newCodeInput.nbUtilisationsMax),
        maxUtilisationsParClient:
          newCodeInput.maxUtilisationsParClient === '' || Number(newCodeInput.maxUtilisationsParClient) <= 0
            ? 1
            : Number(newCodeInput.maxUtilisationsParClient),
        dateExpiration: newCodeInput.dateExpiration ? new Date(newCodeInput.dateExpiration) : undefined,
        partenaireId,
      })

      toast.success(`Code "${newCodeInput.code.trim().toUpperCase()}" ajouté avec succès`)
      setNewCodeInput({
        code: '',
        nbUtilisationsMax: -1,
        maxUtilisationsParClient: 1,
        dateExpiration: '',
      })
      await load()
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Erreur lors de l’ajout du code promo')
    } finally {
      setCodeSubmitting(false)
    }
  }

  const handleTogglePromo = async (promo) => {
    try {
      if (promo.enabled) {
        await promotionsAPI.desactiver(promo.id)
        toast.success('Promotion désactivée')
      } else {
        await promotionsAPI.activer(promo.id)
        toast.success('Promotion activée')
      }
      await load()
    } catch {
      toast.error('Erreur lors du changement de statut')
    }
  }

  const handleDeletePromo = async (promoId, promoNom) => {
    if (!window.confirm(`Supprimer définitivement la promotion "${promoNom}" ?`)) return
    try {
      await promotionsAPI.supprimer(promoId)
      toast.success('Promotion supprimée')
      await load()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const startEdit = (promo) => {
    setPromoKind(promo.isDirecte !== false ? 'DIRECT' : 'CODE')
    setPromoForm({
      id: promo.id,
      nom: promo.nom || '',
      description: promo.description || '',
      type: promo.type || 'POURCENTAGE',
      valeur: String(promo.valeur || ''),
      isDirecte: promo.isDirecte !== false,
      nbUtilisationsMax: promo.nbUtilisationsMax ?? -1,
      maxUtilisationsParClient: promo.maxUtilisationsParClient ?? -1,
      dateDebut: toDateInput(promo.dateDebut),
      dateFin: toDateInput(promo.dateFin),
      offreId: promo.offreId ? String(promo.offreId) : '',
      initialCode: '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Statistiques
  const stats = useMemo(() => {
    const total = promotions.length
    const directes = promotions.filter((p) => p.isDirecte !== false && (!p.codePromos || p.codePromos.length === 0)).length
    const codes = promotions.filter((p) => p.isDirecte === false || (p.codePromos && p.codePromos.length > 0)).length
    const actives = promotions.filter((p) => p.enabled).length
    return { total, directes, codes, actives }
  }, [promotions])

  if (loading && promotions.length === 0) return <LoadingState label="Chargement des promotions..." />

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Promotions & Codes Réduction"
        description="Créez des remises automatiques visibles sur vos offres ou générez des codes promo privés à partager à vos clients."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Promotions" value={stats.total} subtext={`${stats.actives} active(s)`} icon={Tags} />
        <KpiCard
          title="Promotions Directes"
          value={stats.directes}
          subtext="Visibles publiquement sur les offres"
          icon={Eye}
        />
        <KpiCard
          title="Promotions avec Code"
          value={stats.codes}
          subtext="Exigent la saisie d'un code"
          icon={Code}
        />
        <KpiCard
          title="Taux de Remise Moyen"
          value={
            promotions.length > 0
              ? `${Math.round(
                  promotions.reduce((acc, p) => acc + Number(p.valeur || 0), 0) / promotions.length
                )}%`
              : '0%'
          }
          subtext="Sur l'ensemble du catalogue"
          icon={Percent}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Colonne Gauche : Formulaire de Création / Modification (5 colonnes) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border border-border shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {promoForm.id ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    {promoForm.id ? 'Modifier la Promotion' : 'Créer une Promotion'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Paramétrez votre offre promotionnelle</p>
                </div>
              </div>
              {promoForm.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPromoForm(emptyPromotionForm)}
                  className="text-xs text-muted-foreground"
                >
                  Annuler
                </Button>
              )}
            </div>

            {/* Sélecteur du Type de Promotion : DIRECTE vs CODE PROMO */}
            <div className="mb-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Type de Réduction *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setPromoKind('DIRECT')
                    setPromoForm((prev) => ({ ...prev, isDirecte: true }))
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all cursor-pointer ${
                    promoKind === 'DIRECT'
                      ? 'bg-card text-foreground font-black shadow-sm border border-border/80'
                      : 'text-muted-foreground font-semibold hover:text-foreground'
                  }`}
                >
                  <Eye className="h-4 w-4 mb-1 text-emerald-600" />
                  <span className="text-xs">Promotion Directe</span>
                  <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                    Prix barré public
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPromoKind('CODE')
                    setPromoForm((prev) => ({
                      ...prev,
                      isDirecte: false,
                      initialCode: prev.initialCode || generateRandomCode(),
                    }))
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all cursor-pointer ${
                    promoKind === 'CODE'
                      ? 'bg-card text-foreground font-black shadow-sm border border-border/80'
                      : 'text-muted-foreground font-semibold hover:text-foreground'
                  }`}
                >
                  <Code className="h-4 w-4 mb-1 text-primary" />
                  <span className="text-xs">Code Promo Requis</span>
                  <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                    Saisi au paiement
                  </span>
                </button>
              </div>

              {/* Message d'explication dynamique */}
              <div className="p-3 rounded-xl text-xs bg-muted/30 border border-border/60 text-muted-foreground flex items-start gap-2">
                {promoKind === 'DIRECT' ? (
                  <>
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Promotion directe :</strong> La réduction s&apos;applique automatiquement à tous les clients. Le prix d&apos;origine sera barré avec un badge sur votre boutique.
                    </span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Code Promo :</strong> Le prix normal reste affiché publiquement. Le client doit obligatoirement entrer le code promo au panier pour débloquer la remise.
                    </span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={submitPromotion} className="space-y-4">
              {/* Titre / Nom */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Nom de la promotion *
                </label>
                <Input
                  required
                  placeholder={promoKind === 'DIRECT' ? 'Ex: Promo Rentrée -20%' : 'Ex: Remise Privilège VIP'}
                  value={promoForm.nom}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, nom: e.target.value }))}
                />
              </div>

              {/* Offre ciblée */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Offre concernée
                </label>
                <select
                  value={promoForm.offreId}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, offreId: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
                >
                  <option value="">Toutes mes offres (Offre globale)</option>
                  {offres.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.titreOffre || o.nom || o.nomService} ({formatFCFA(o.prixVente || o.prixOriginal || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de remise & Valeur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Type de remise *
                  </label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
                  >
                    <option value="POURCENTAGE">Pourcentage (%)</option>
                    <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Valeur de remise *
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    placeholder={promoForm.type === 'POURCENTAGE' ? 'Ex: 20 (%)' : 'Ex: 1000 (FCFA)'}
                    value={promoForm.valeur}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, valeur: e.target.value }))}
                  />
                </div>
              </div>

              {/* Code Promo Initial si mode CODE */}
              {promoKind === 'CODE' && !promoForm.id && (
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Code Promo à diffuser *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPromoForm((prev) => ({ ...prev, initialCode: generateRandomCode() }))
                      }
                      className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3" /> Générer
                    </button>
                  </div>
                  <Input
                    required
                    placeholder="Ex: SUMMER2026"
                    value={promoForm.initialCode}
                    onChange={(e) =>
                      setPromoForm((prev) => ({
                        ...prev,
                        initialCode: e.target.value.toUpperCase().replace(/\s/g, ''),
                      }))
                    }
                    className="font-mono font-bold tracking-wider uppercase text-sm"
                  />
                </div>
              )}

              {/* Quotas & Limites d'utilisation (Optionnels) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/80">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Quota total utilisations
                  </label>
                  <Input
                    type="number"
                    min="-1"
                    placeholder="Illimité (-1)"
                    value={promoForm.nbUtilisationsMax === -1 ? '' : promoForm.nbUtilisationsMax}
                    onChange={(e) =>
                      setPromoForm((prev) => ({
                        ...prev,
                        nbUtilisationsMax: e.target.value === '' ? -1 : Number(e.target.value),
                      }))
                    }
                  />
                  <span className="text-[10px] text-muted-foreground">Laisser vide = illimité</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Max fois par client
                  </label>
                  <Input
                    type="number"
                    min="-1"
                    placeholder="1 fois par client"
                    value={
                      promoForm.maxUtilisationsParClient === -1 ? '' : promoForm.maxUtilisationsParClient
                    }
                    onChange={(e) =>
                      setPromoForm((prev) => ({
                        ...prev,
                        maxUtilisationsParClient: e.target.value === '' ? -1 : Number(e.target.value),
                      }))
                    }
                  />
                  <span className="text-[10px] text-muted-foreground">1 par défaut ou illimité (-1)</span>
                </div>
              </div>

              {/* Dates Optionnelles (Début & Fin) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/80">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Date début (optionnelle)
                  </label>
                  <Input
                    type="date"
                    value={promoForm.dateDebut}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, dateDebut: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Date fin (optionnelle)
                  </label>
                  <Input
                    type="date"
                    value={promoForm.dateFin}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, dateFin: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={promoSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-xl py-2.5 h-auto"
                >
                  {promoSubmitting ? 'Enregistrement...' : promoForm.id ? 'Mettre à jour' : 'Créer la promotion'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Colonne Droite : Liste des Promotions & Gestion des Codes (7 colonnes) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-foreground text-base">
              Promotions Actives & Historique ({promotions.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              {stats.directes} directe(s) • {stats.codes} avec code
            </span>
          </div>

          {promotions.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Tags}
                title="Aucune promotion pour le moment"
                description="Créez votre première réduction directe ou générez un code promo pour stimuler vos ventes."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {promotions.map((p) => {
                const isDirect = p.isDirecte !== false && (!p.codePromos || p.codePromos.length === 0)
                const isExpanded = expandedPromotionId === p.id
                const targetedOffer = offres.find((o) => Number(o.id) === Number(p.offreId))

                return (
                  <Card
                    key={p.id}
                    className={`p-5 border transition-all duration-200 ${
                      !p.enabled ? 'opacity-60 bg-muted/20 border-dashed' : 'border-border bg-card shadow-2xs'
                    }`}
                  >
                    {/* Ligne 1 : Titre + Badge Type + Toggle Statut */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-foreground text-base">{p.nom}</h4>

                          {isDirect ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                              <Eye className="h-3 w-3" /> DIRECTE (VISIBLE)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
                              <Code className="h-3 w-3" /> CODE PROMO REQUIS
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-black text-rose-600">
                            -{p.valeur}
                            {p.type === 'POURCENTAGE' ? '%' : ' FCFA'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Cible :{' '}
                          <strong className="text-foreground">
                            {targetedOffer ? (targetedOffer.titreOffre || targetedOffer.nom) : 'Toutes vos offres'}
                          </strong>
                        </p>
                      </div>

                      {/* Statut & Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePromo(p)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            p.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={p.enabled ? 'Désactiver' : 'Activer'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              p.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(p)}
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePromo(p.id, p.nom)}
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Ligne 2 : Quotas & Validité */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Utilisations
                        </span>
                        <span className="font-semibold text-foreground">
                          {p.nbUtilisations || 0} /{' '}
                          {p.nbUtilisationsMax === -1 ? 'Illimité' : p.nbUtilisationsMax}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Max / client
                        </span>
                        <span className="font-semibold text-foreground">
                          {p.maxUtilisationsParClient === -1
                            ? 'Illimité'
                            : `${p.maxUtilisationsParClient} fois`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Période
                        </span>
                        <span className="font-semibold text-foreground">
                          {p.dateDebut || p.dateFin
                            ? `${p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '—'} au ${
                                p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : '—'
                              }`
                            : 'Permanente'}
                        </span>
                      </div>
                    </div>

                    {/* Section Codes Promo Associés si non directe ou si des codes existent */}
                    {(!isDirect || (p.codePromos && p.codePromos.length > 0)) && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-primary" />
                            Codes Promo Associés ({p.codePromos?.length || 0})
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPromotionId((prev) => (prev === p.id ? null : p.id))
                            }
                            className="text-xs text-primary font-bold hover:underline cursor-pointer"
                          >
                            {isExpanded ? 'Fermer la gestion' : '+ Ajouter un code'}
                          </button>
                        </div>

                        {/* Liste des codes */}
                        {p.codePromos && p.codePromos.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {p.codePromos.map((cp) => (
                              <div
                                key={cp.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-mono font-bold"
                              >
                                <span>{cp.code}</span>
                                <span className="text-[10px] font-sans text-muted-foreground font-normal">
                                  ({cp.nbUtilisations || 0}
                                  {cp.nbUtilisationsMax !== -1 ? `/${cp.nbUtilisationsMax}` : ''})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(cp.code)}
                                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Copier le code"
                                >
                                  {copiedCode === cp.code ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            Aucun code promo créé pour cette promotion.
                          </p>
                        )}

                        {/* Formulaire dépliable pour ajouter un code à cette promotion */}
                        {isExpanded && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-muted/40 border border-border space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">
                                Ajouter un code pour &quot;{p.nom}&quot;
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewCodeInput((prev) => ({
                                    ...prev,
                                    code: generateRandomCode(),
                                  }))
                                }
                                className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Wand2 className="h-3 w-3" /> Générer
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input
                                placeholder="Ex: SUMMER2026"
                                value={newCodeInput.code}
                                onChange={(e) =>
                                  setNewCodeInput((prev) => ({
                                    ...prev,
                                    code: e.target.value.toUpperCase().replace(/\s/g, ''),
                                  }))
                                }
                                className="font-mono text-xs uppercase font-bold"
                              />
                              <Input
                                type="number"
                                min="-1"
                                placeholder="Quota (-1 = illimité)"
                                value={
                                  newCodeInput.nbUtilisationsMax === -1
                                    ? ''
                                    : newCodeInput.nbUtilisationsMax
                                }
                                onChange={(e) =>
                                  setNewCodeInput((prev) => ({
                                    ...prev,
                                    nbUtilisationsMax:
                                      e.target.value === '' ? -1 : Number(e.target.value),
                                  }))
                                }
                                className="text-xs"
                              />
                              <Button
                                size="sm"
                                disabled={codeSubmitting}
                                onClick={() => handleAddCodeToPromo(p.id)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl"
                              >
                                {codeSubmitting ? 'Ajout...' : 'Valider le code'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
