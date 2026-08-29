import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  DollarSign,
  Percent,
  Wallet,
  ShieldCheck,
  Info,
  Layers,
  HelpCircle,
  Tv,
  Check,
  Users,
  Smartphone,
  EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES, SERVICES_MARKETPLACE, getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { forfaitsAPI, offresAPI, partenairesAPI } from '../../lib/api'
import { Button, Card, Input, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

// Suggestions de placeholders cohérents selon la durée
const getDurationPlaceholders = (duree = 1, periode = 'MOIS') => {
  const p = (periode || 'MOIS').toUpperCase()
  const d = Number(duree || 1)

  if (p.startsWith('AN') || d >= 12) {
    return { partage: '14000', prive: '40000' }
  }
  if (d === 6) {
    return { partage: '7500', prive: '22000' }
  }
  if (d === 3) {
    return { partage: '4000', prive: '12000' }
  }
  return { partage: '1500', prive: '4500' }
}

export default function NouvelleOffrePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(false)
  const [loadingForfaits, setLoadingForfaits] = useState(false)
  const [forfaitsDisponibles, setForfaitsDisponibles] = useState([])

  // Commission partenaire
  const [partenaireData, setPartenaireData] = useState(null)

  const [formData, setFormData] = useState({
    categorie: 'streaming',
    service: 'netflix',
    titreOffre: 'Netflix Premium Ultra HD 4K',
    description: '',
  })

  // Grille Tarifaire Multi-Durées & Multi-Accès (Fiche Unique)
  const [grilleTarifs, setGrilleTarifs] = useState({})

  useEffect(() => {
    if (!partenaireId) navigate('/backoffice/login')
  }, [partenaireId, navigate])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingForfaits(true)
        const [forfaitsRes, partRes] = await Promise.allSettled([
          forfaitsAPI.getAll(partenaireId),
          partenairesAPI.getOne(partenaireId),
        ])

        if (forfaitsRes.status === 'fulfilled') {
          const items = Array.isArray(forfaitsRes.value.data) ? forfaitsRes.value.data : []
          setForfaitsDisponibles(items)

          // Initialiser la grille tarifaire (champs de prix vides avec placeholders)
          const initialGrille = {}
          items.forEach((f, idx) => {
            const placeholders = getDurationPlaceholders(f.duree, f.periode)
            initialGrille[f.id] = {
              selected: true,
              forfaitId: f.id,
              plan: f.plan,
              duree: f.duree,
              periode: f.periode,
              prixPartage: '',
              isPartageActive: true,
              prixPrive: '',
              isPriveActive: true,
              placeholderPartage: placeholders.partage,
              placeholderPrive: placeholders.prive,
            }
          })
          setGrilleTarifs(initialGrille)
        }

        if (partRes.status === 'fulfilled') {
          setPartenaireData(partRes.value.data)
        }
      } catch {
        setForfaitsDisponibles([])
      } finally {
        setLoadingForfaits(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const selectedServiceMeta = getServiceMeta(formData.service)
  const tauxCommission = partenaireData?.commissionActive !== false ? Number(partenaireData?.tauxCommission || 0) : 0
  const isCommissionActive = partenaireData?.commissionActive !== false && tauxCommission > 0

  const handleServiceChange = (e) => {
    const serviceVal = e.target.value
    const meta = getServiceMeta(serviceVal)
    setFormData((prev) => ({
      ...prev,
      service: serviceVal,
      categorie: meta.category || prev.categorie,
      titreOffre: `${meta.label} Abonnement`,
    }))
  }

  const handleChange = (e) => {
    setFormData((state) => ({ ...state, [e.target.name]: e.target.value }))
  }

  const handleGrilleChange = (forfaitId, field, value) => {
    setGrilleTarifs((prev) => {
      const current = prev[forfaitId] || {}
      const updated = {
        ...current,
        [field]: value,
      }
      if ((field === 'prixPartage' || field === 'prixPrive') && Number(value) > 0) {
        updated.selected = true
      }
      return {
        ...prev,
        [forfaitId]: updated,
      }
    })
  }

  const calculateNetGain = (prix) => {
    const p = Number(prix) || 0
    if (p <= 0 || !isCommissionActive) return p
    return Math.round(p * (1 - tauxCommission / 100))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partenaireId) return

    if (!formData.titreOffre.trim()) {
      toast.error("Veuillez renseigner le titre de l'offre.")
      return
    }

    // Récupérer les déclinaisons de tarifs activées
    const activeGrille = Object.values(grilleTarifs)
      .filter((g) => (g.selected || Number(g.prixPartage) > 0 || Number(g.prixPrive) > 0) && (g.isPartageActive || g.isPriveActive))
      .map((g) => {
        const pPartage = g.isPartageActive ? Number(g.prixPartage || 0) : 0
        const pPrive = g.isPriveActive ? Number(g.prixPrive || 0) : 0
        return {
          forfaitId: Number(g.forfaitId),
          prixPartage: pPartage,
          prixPrive: pPrive,
          isPartageActive: Boolean(g.isPartageActive && pPartage > 0),
          isPriveActive: Boolean(g.isPriveActive && pPrive > 0),
        }
      })
      .filter((g) => g.isPartageActive || g.isPriveActive)

    if (activeGrille.length === 0) {
      toast.error('Veuillez activer au moins un forfait et renseigner un prix de vente supérieur à 0 FCFA.')
      return
    }

    setLoading(true)
    try {
      const serviceMeta = getServiceMeta(formData.service)
      const firstActive = activeGrille[0]
      const defaultPrice = firstActive.prixPartage || firstActive.prixPrive || 1500

      await offresAPI.create({
        partenaireId: Number(partenaireId),
        categorie: formData.categorie,
        service: formData.service,
        nomService: serviceMeta.label || formData.service,
        titreOffre: formData.titreOffre.trim(),
        description: formData.description?.trim() || `${serviceMeta.label} - Abonnement Premium`,
        imageService: '',
        prixBase: defaultPrice,
        prixOriginal: defaultPrice,
        prixVente: defaultPrice,
        margePartenaire: defaultPrice,
        duree: 1,
        typeCompte: formData.titreOffre.trim(),
        grilleTarifs: activeGrille,
      })

      toast.success('Offre multi-durées créée et mise en ligne avec succès ! 🎉')
      navigate('/partenaire/offres')
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Erreur lors de la création de l'offre")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Créer une Nouvelle Offre (Fiche Unique)"
        description="Configurez votre offre en une seule fiche produit avec l'ensemble de vos forfaits (1 mois, 3 mois, 1 an...) et tarifs Partagé / Privé."
        action={
          <Button variant="outline" onClick={() => navigate('/partenaire/offres')} className="gap-2 text-xs font-semibold rounded-lg">
            <ArrowLeft className="h-4 w-4" /> Retour aux offres
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales & Choix du Service */}
        <Card className="p-6 border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              1. Plateforme & Service
            </h2>
            <span className="text-[11px] text-muted-foreground">Logo et marque officiels automatiques</span>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs shrink-0"
              style={{ backgroundColor: selectedServiceMeta.color || '#0ea5e9' }}
            >
              {selectedServiceMeta.initials || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-foreground">{selectedServiceMeta.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                  {formData.categorie}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Fiche produit marketplace unique pour tous vos forfaits de ce service.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Service de Streaming *</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none"
              >
                {SERVICES_MARKETPLACE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Titre Commercial de l&apos;Offre *</label>
              <Input
                name="titreOffre"
                required
                placeholder="Ex: Netflix Premium Ultra HD 4K"
                value={formData.titreOffre}
                onChange={handleChange}
                className="text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Description & Avantages (Optionnel)</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Ex: Qualité Ultra HD 4K, audio spatial, compatible tous appareils..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-input bg-card text-xs outline-none"
            />
          </div>
        </Card>

        {/* Section 2 : TARIFICATION MULTI-DURÉES & MULTI-ACCÈS (Fiche Unique) */}
        <Card className="p-6 border border-border bg-card shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                2. Grille Tarifaire Multi-Durées (Fiche Unique)
              </h2>
              <p className="text-xs text-muted-foreground">
                Activez les forfaits proposés pour cette offre et définissez les prix pour les profils <strong>Partagés</strong> et <strong>Privés</strong>.
              </p>
            </div>
            {isCommissionActive && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black">
                Commission Plateforme : {tauxCommission}%
              </span>
            )}
          </div>

          {loadingForfaits ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Chargement des forfaits...</div>
          ) : forfaitsDisponibles.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              Aucun forfait disponible. Créez d'abord des forfaits dans l'onglet Catalogue &gt; Forfaits.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-black uppercase text-[10px]">
                    <th className="py-3 px-3">Forfait / Durée</th>
                    <th className="py-3 px-3">👥 Prix Profil Partagé (FCFA)</th>
                    <th className="py-3 px-3">👑 Prix Profil Privé (FCFA)</th>
                    <th className="py-3 px-3 text-right">Statut Forfait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {forfaitsDisponibles.map((f) => {
                    const placeholders = getDurationPlaceholders(f.duree, f.periode)
                    const g = grilleTarifs[f.id] || {
                      selected: true,
                      prixPartage: '',
                      prixPrive: '',
                      isPartageActive: true,
                      isPriveActive: true,
                      placeholderPartage: placeholders.partage,
                      placeholderPrive: placeholders.prive,
                    }
                    const isSelected = g.selected
                    const hasAtLeastOneActive = isSelected && (g.isPartageActive || g.isPriveActive)

                    return (
                      <tr
                        key={f.id}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? 'bg-card'
                            : 'bg-muted/20 opacity-40'
                        }`}
                      >
                        {/* Forfait / Durée */}
                        <td className="py-3.5 px-3">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleGrilleChange(f.id, 'selected', e.target.checked)}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                            <div>
                              <span className={`font-extrabold block ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {f.plan}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {f.duree} {f.periode || 'MOIS'}
                              </span>
                            </div>
                          </label>
                        </td>

                        {/* Profil Partagé */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={!isSelected}
                                checked={isSelected && g.isPartageActive}
                                onChange={(e) => handleGrilleChange(f.id, 'isPartageActive', e.target.checked)}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                                title="Activer / Désactiver la vente en profil partagé"
                              />
                              <Input
                                type="number"
                                min="0"
                                disabled={!isSelected || !g.isPartageActive}
                                placeholder={`Ex: ${g.placeholderPartage || placeholders.partage}`}
                                value={g.prixPartage}
                                onChange={(e) => handleGrilleChange(f.id, 'prixPartage', e.target.value)}
                                className={`h-8 text-xs font-bold font-mono w-32 transition ${
                                  !isSelected || !g.isPartageActive ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''
                                }`}
                              />
                            </div>
                            {isCommissionActive && isSelected && g.isPartageActive && Number(g.prixPartage) > 0 && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pl-5">
                                Gain net : {formatFCFA(calculateNetGain(g.prixPartage))} (-{tauxCommission}%)
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Profil Privé */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={!isSelected}
                                checked={isSelected && g.isPriveActive}
                                onChange={(e) => handleGrilleChange(f.id, 'isPriveActive', e.target.checked)}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                                title="Activer / Désactiver la vente en profil privé"
                              />
                              <Input
                                type="number"
                                min="0"
                                disabled={!isSelected || !g.isPriveActive}
                                placeholder={`Ex: ${g.placeholderPrive || placeholders.prive}`}
                                value={g.prixPrive}
                                onChange={(e) => handleGrilleChange(f.id, 'prixPrive', e.target.value)}
                                className={`h-8 text-xs font-bold font-mono w-32 transition ${
                                  !isSelected || !g.isPriveActive ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''
                                }`}
                              />
                            </div>
                            {isCommissionActive && isSelected && g.isPriveActive && Number(g.prixPrive) > 0 && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pl-5">
                                Gain net : {formatFCFA(calculateNetGain(g.prixPrive))} (-{tauxCommission}%)
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-3 text-right">
                          {isSelected ? (
                            hasAtLeastOneActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                                <Check className="w-3 h-3" /> Proposé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                Incomplet
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold text-[10px]">
                              <EyeOff className="w-3 h-3" /> Masqué
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bannière Stock Automatique */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center gap-3 mt-3">
            <Boxes className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="text-xs font-bold text-foreground block">Stockage & Livraison Automatique</span>
              <p className="text-[11px] text-muted-foreground">
                Le stock est automatiquement alimenté dès que vous ajoutez des comptes maîtres dans <strong>Stock & Identifiants</strong>.
              </p>
            </div>
          </div>
        </Card>

        {/* Boutons d'Action */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/partenaire/offres')} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Publication...' : "Publier l'Offre Unique sur la Marketplace"}
          </Button>
        </div>
      </form>
    </div>
  )
}
