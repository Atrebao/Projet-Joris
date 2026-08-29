import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Boxes,
  CheckCircle2,
  KeyRound,
  Plus,
  Upload,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Search,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Trash2,
  Clock,
  User,
  Lock,
  Smartphone,
  Users,
  PlusCircle,
  MinusCircle,
  Edit3,
  X,
  Save,
  RotateCcw,
} from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, identifiantsStockAPI, forfaitsAPI } from '../../lib/api'
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
  ServiceLogo,
} from '../../components/saas/SaasPrimitives'

// Détection automatique du nombre de profils par défaut selon la plateforme
const getDefaultProfilesCountForService = (serviceName = '') => {
  const s = String(serviceName).toLowerCase()
  if (s.includes('prime')) return 6
  if (s.includes('disney')) return 4
  if (s.includes('spotify') || s.includes('deezer') || s.includes('apple')) return 6
  if (s.includes('netflix')) return 5
  if (s.includes('crunchyroll')) return 4
  if (s.includes('canal')) return 2
  return 5
}

export default function IdentifiantsStockPage() {
  const partenaireId = getPartenaireId()
  const [offres, setOffres] = useState([])
  const [offreId, setOffreId] = useState('')
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL') // 'ALL' | 'AVAILABLE' | 'USED'

  // Modal d'édition de profil
  const [editingItem, setEditingItem] = useState(null)

  // Modal de confirmation de suppression moderne
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null,
    submitting: false,
  })

  // Modes d'ajout : 'account' (Comptes & Profils) | 'single' (Unitaire) | 'bulk' (Masse)
  const [addMode, setAddMode] = useState('account')

  // Formulaire Compte & Profils Multi-Durées Dynamique (initialisé dynamiquement selon l'offre)
  const [accountForm, setAccountForm] = useState({
    login: '',
    password: '',
    numeroCompte: 1,
    instructionsGenerales: '',
    profils: [],
  })

  const [singleForm, setSingleForm] = useState({ login: '', password: '', instructions: '', dureeForfaitMois: 1 })
  const [bulk, setBulk] = useState('')

  const loadStock = async (id = offreId) => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await identifiantsStockAPI.listByOffre(Number(id))
      setStocks(Array.isArray(data) ? data : [])
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadOffres = async () => {
      if (!partenaireId) return
      try {
        const { data } = await offresAPI.getByPartenaire(partenaireId)
        const items = Array.isArray(data) ? data : []
        setOffres(items)
        if (items[0]?.id) {
          const initialId = String(items[0].id)
          setOffreId(initialId)
          initAccountFormForOffer(items[0])
        }
      } catch {
        setOffres([])
      }
    }
    loadOffres()
  }, [partenaireId])

  useEffect(() => {
    if (offreId) {
      loadStock(offreId)
      const currentOffre = offres.find((o) => String(o.id) === String(offreId))
      if (currentOffre) {
        initAccountFormForOffer(currentOffre)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId])

  const selectedOffre = offres.find((o) => String(o.id) === String(offreId))

  // Forfaits réels configurés EXCLUSIVEMENT pour cette offre par le partenaire (100% dynamique et sans doublons)
  const offerForfaits = useMemo(() => {
    if (!selectedOffre) return []
    const list = selectedOffre.forfaits || selectedOffre.forfaitOffres || []

    const mapped = list
      .map((f) => {
        const raw = f.forfait || f
        const rawDuree = Number(raw.duree || 1)
        const periode = String(raw.periode || 'MOIS').toUpperCase()
        const isAnnee = periode.startsWith('AN')
        // Si c'est en années et pas encore converti en mois (< 12 mois)
        const duree = isAnnee && rawDuree < 12 ? rawDuree * 12 : rawDuree

        let plan = raw.plan
        if (!plan || plan.includes('undefined')) {
          plan = duree >= 12 && duree % 12 === 0
            ? `Forfait ${duree / 12} An${duree / 12 > 1 ? 's' : ''}`
            : `Forfait ${duree} Mois`
        }

        return {
          id: raw.id || duree,
          duree,
          periode: isAnnee ? 'ANNEE' : 'MOIS',
          plan,
        }
      })
      .filter(Boolean)

    // Dédoublonnage strict par durée en mois (ex: 1 mois, 12 mois)
    const unique = mapped.filter((f, idx, arr) => arr.findIndex((x) => Number(x.duree) === Number(f.duree)) === idx)
    unique.sort((a, b) => a.duree - b.duree)

    if (unique.length > 0) return unique

    const fallbackDuree = Number(selectedOffre.duree || 1)
    return [
      {
        id: selectedOffre.id || 0,
        duree: fallbackDuree,
        periode: 'MOIS',
        plan: `Forfait ${fallbackDuree} Mois`,
      },
    ]
  }, [selectedOffre])

  // Initialise les profils en fonction de l'offre choisie et de ses forfaits réels configurés
  const initAccountFormForOffer = (offre) => {
    if (!offre) return
    const defaultCount = getDefaultProfilesCountForService(offre.nomService || offre.nom || '')
    const list = offre.forfaits || offre.forfaitOffres || []
    const firstForfait = list[0]?.forfait || list[0]
    const defaultDuree = Number(firstForfait?.duree || offre.duree || 1)

    const initialProfils = []
    for (let i = 0; i < defaultCount; i++) {
      initialProfils.push({
        nomProfil: `Profil ${i + 1}`,
        dureeForfaitMois: defaultDuree,
        capaciteMax: 1,
        nbAppareilsMax: 1,
        codePin: '',
        typeAbonnement: 'PARTAGE',
      })
    }

    setAccountForm((prev) => ({
      ...prev,
      profils: initialProfils,
    }))
    setSingleForm((prev) => ({
      ...prev,
      dureeForfaitMois: defaultDuree,
    }))
  }

  const stats = useMemo(() => {
    const total = stocks.length
    const disponibles = stocks.filter((x) => !x.isUsed && x.placesOccupees < x.capaciteMax).length
    const utilises = stocks.filter((x) => x.isUsed || x.placesOccupees >= x.capaciteMax).length
    return { total, disponibles, utilises }
  }, [stocks])

  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        (item.login && item.login.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.nomProfil && item.nomProfil.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.instructions && item.instructions.toLowerCase().includes(searchQuery.toLowerCase()))

      const isDispo = !item.isUsed && item.placesOccupees < item.capaciteMax
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'AVAILABLE' && isDispo) ||
        (filterStatus === 'USED' && !isDispo)

      return matchSearch && matchStatus
    })
  }, [stocks, searchQuery, filterStatus])

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text, label = 'Identifiant') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié dans le presse-papier !`)
  }

  const openDeleteModal = (item) => {
    setDeleteModal({
      open: true,
      item,
      submitting: false,
    })
  }

  const confirmDeleteStock = async () => {
    if (!deleteModal.item) return
    const isOccupied = (deleteModal.item.placesOccupees || 0) > 0
    if (isOccupied) {
      toast.error("Impossible de supprimer un profil actif occupé par un client.")
      return
    }
    setDeleteModal((prev) => ({ ...prev, submitting: true }))
    try {
      await identifiantsStockAPI.delete(deleteModal.item.id)
      toast.success('Profil supprimé du stock avec succès ! 🎉')
      setDeleteModal({ open: false, item: null, submitting: false })
      await loadStock(offreId)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression')
      setDeleteModal((prev) => ({ ...prev, submitting: false }))
    }
  }

  // Ajouter un profil dynamiquement
  const handleAddProfil = () => {
    const currentLength = accountForm.profils.length
    const firstDuration = offerForfaits[0]?.duree || 1
    const newProfil = {
      nomProfil: `Profil ${currentLength + 1}`,
      dureeForfaitMois: firstDuration,
      capaciteMax: 1,
      nbAppareilsMax: 1,
      codePin: '',
      typeAbonnement: 'PARTAGE',
    }
    setAccountForm((prev) => ({ ...prev, profils: [...prev.profils, newProfil] }))
  }

  // Supprimer un profil dynamiquement
  const handleRemoveProfil = (index) => {
    if (accountForm.profils.length <= 1) {
      toast.error('Un compte doit comporter au moins 1 profil.')
      return
    }
    setAccountForm((prev) => ({
      ...prev,
      profils: prev.profils.filter((_, i) => i !== index),
    }))
  }

  const handleProfilFieldChange = (index, field, value) => {
    setAccountForm((prev) => {
      const copy = [...prev.profils]
      copy[index] = { ...copy[index], [field]: value }
      return { ...prev, profils: copy }
    })
  }

  // Envoi Formulaire Compte & Profils
  const onAddAccountWithProfiles = async (e) => {
    e.preventDefault()
    if (!offreId) {
      toast.error('Veuillez sélectionner une offre.')
      return
    }
    if (!accountForm.login.trim() || !accountForm.password.trim()) {
      toast.error('Veuillez renseigner le login et mot de passe du compte maître')
      return
    }
    if (accountForm.profils.length === 0) {
      toast.error('Veuillez configurer au moins un profil pour ce compte')
      return
    }

    setSubmitting(true)
    try {
      await identifiantsStockAPI.createAccountWithProfiles(Number(offreId), {
        login: accountForm.login.trim(),
        password: accountForm.password.trim(),
        numeroCompte: Number(accountForm.numeroCompte) || 1,
        instructionsGenerales: accountForm.instructionsGenerales.trim(),
        profils: accountForm.profils,
      })
      toast.success(`Compte maître #${accountForm.numeroCompte} & ses ${accountForm.profils.length} profils ajoutés avec succès ! 🎉`)
      setAccountForm((prev) => ({
        ...prev,
        login: '',
        password: '',
        numeroCompte: (Number(prev.numeroCompte) || 1) + 1,
      }))
      await loadStock(offreId)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'ajout du compte")
    } finally {
      setSubmitting(false)
    }
  }

  const onAddSingle = async (e) => {
    e.preventDefault()
    if (!offreId) {
      toast.error('Veuillez sélectionner une offre.')
      return
    }
    setSubmitting(true)
    try {
      await identifiantsStockAPI.createForOffre(Number(offreId), singleForm)
      toast.success('Identifiant ajouté au stock avec succès !')
      setSingleForm({ login: '', password: '', instructions: '', dureeForfaitMois: 1 })
      await loadStock(offreId)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'ajout de l'identifiant")
    } finally {
      setSubmitting(false)
    }
  }

  const onAddBulk = async (e) => {
    e.preventDefault()
    if (!offreId || !bulk.trim()) {
      toast.error('Veuillez saisir au moins une ligne au format email;motdepasse')
      return
    }
    setSubmitting(true)
    const lines = bulk.split('\n').map((l) => l.trim()).filter(Boolean)

    let successCount = 0
    for (const line of lines) {
      const [login, password, instructions] = line.split(';')
      if (!login || !password) continue
      try {
        await identifiantsStockAPI.createForOffre(Number(offreId), {
          login: login.trim(),
          password: password.trim(),
          instructions: instructions?.trim() || '',
        })
        successCount += 1
      } catch {}
    }

    if (successCount > 0) {
      toast.success(`${successCount} identifiant(s) ajouté(s) au stock avec succès !`)
      setBulk('')
      await loadStock(offreId)
    } else {
      toast.error('Aucun identifiant valide trouvé. Format attendu : login;motdepasse;instructions')
    }
    setSubmitting(false)
  }

  // Modification d'un profil individuel
  const handleUpdateStock = async (e) => {
    e.preventDefault()
    if (!editingItem) return
    setSubmitting(true)
    try {
      await identifiantsStockAPI.update(editingItem.id, {
        login: editingItem.login,
        password: editingItem.password,
        numeroCompte: Number(editingItem.numeroCompte) || 1,
        nomProfil: editingItem.nomProfil,
        codePin: editingItem.codePin,
        dureeForfaitMois: Number(editingItem.dureeForfaitMois) || 1,
        capaciteMax: Number(editingItem.capaciteMax) || 1,
        nbAppareilsMax: Number(editingItem.nbAppareilsMax) || 1,
        typeAbonnement: editingItem.typeAbonnement,
        instructions: editingItem.instructions,
        placesOccupees: Number(editingItem.placesOccupees) || 0,
        isUsed: Boolean(editingItem.isUsed),
      })
      toast.success('Profil mis à jour avec succès ! 🎉')
      setEditingItem(null)
      await loadStock(offreId)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Erreur lors de la modification du profil")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestion des Stocks & Multi-Comptes"
        description="Configurez vos comptes maîtres streaming, définissez librement les noms de profils, le nombre de personnes par profil partagé et le nombre d'appareils par profil privé."
        action={
          <Button
            variant="outline"
            onClick={() => loadStock(offreId)}
            className="text-xs font-semibold rounded-lg gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
        }
      />

      {/* Sélecteur Dynamique d'Offre */}
      <Card className="p-5 border border-border bg-card shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ServiceLogo name={selectedOffre?.nom || selectedOffre?.nomService || 'Offre'} image={selectedOffre?.image} size="md" />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                Offre active à configurer
              </span>
              <h2 className="text-base font-black text-foreground truncate">
                {selectedOffre?.titreOffre || selectedOffre?.nomService || selectedOffre?.nom || 'Sélectionnez une offre'}
              </h2>
            </div>
          </div>

          <div className="w-full md:w-80">
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
              Changer d'offre :
            </label>
            <select
              value={offreId}
              onChange={(e) => setOffreId(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none shadow-xs"
            >
              {offres.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titreOffre || o.nomService || o.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* KPIs de Stock */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Stock Total (Profils)" value={stats.total} icon={Boxes} color="primary" />
        <KpiCard title="Profils Disponibles" value={stats.disponibles} icon={CheckCircle2} color="emerald" />
        <KpiCard title="Profils Livrés / Occupés" value={stats.utilises} icon={XCircle} color="slate" />
      </div>

      {/* Formulaire d'Ajout de Stock */}
      <Card className="p-6 border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-5 gap-3">
          <div>
            <h3 className="text-base font-black text-foreground">
              Ajouter un Compte pour <span className="text-primary">{selectedOffre?.nom || selectedOffre?.nomService || 'cette offre'}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Renseignez les accès du compte maître et personnalisez chaque profil (nom, durée, personnes, appareils).
            </p>
          </div>

          {/* Onglets de modes */}
          <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setAddMode('account')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                addMode === 'account' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Compte Maître & Profils
            </button>
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                addMode === 'single' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unitaire Simple
            </button>
            <button
              type="button"
              onClick={() => setAddMode('bulk')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                addMode === 'bulk' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Import en Masse
            </button>
          </div>
        </div>

        {/* MODE 1 : COMPTE & PROFILS MULTI-DURÉES */}
        {addMode === 'account' && (
          <form onSubmit={onAddAccountWithProfiles} className="space-y-5">
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-foreground font-medium">
                <strong>Attribution automatique intelligente :</strong> Lors d'une commande pour {selectedOffre?.nom || 'ce service'}, le système sélectionnera automatiquement un profil disponible du <strong>Compte #{accountForm.numeroCompte}</strong> correspondant à la durée et au type choisi par le client. Quand ce compte sera complet, il passera automatiquement au compte suivant.
              </p>
            </div>

            {/* Infos du Compte Maître */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-foreground block">Email / Login du Compte Maître</label>
                <Input
                  required
                  placeholder={`ex: ${selectedOffre?.nomService ? selectedOffre.nomService.toLowerCase().replace(/\s/g, '') : 'compte'}1@gmail.com`}
                  value={accountForm.login}
                  onChange={(e) => setAccountForm({ ...accountForm, login: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-foreground block">Mot de passe du Compte Maître</label>
                <Input
                  required
                  type="text"
                  placeholder="ex: PassStreaming2026!"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-foreground block">N° de Compte</label>
                <Input
                  type="number"
                  min="1"
                  value={accountForm.numeroCompte}
                  onChange={(e) => setAccountForm({ ...accountForm, numeroCompte: e.target.value })}
                />
              </div>
            </div>

            {/* Configuration individuelle des profils */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Profils configurés sur ce Compte ({accountForm.profils.length}) :
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Personnalisez le nom, la durée, le type et le nombre de personnes ou d'appareils autorisés.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProfil}
                  className="text-xs font-bold gap-1.5 border-primary text-primary hover:bg-primary/10"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Ajouter un Profil
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {accountForm.profils.map((p, idx) => {
                  const isPrive = p.typeAbonnement === 'PRIVE'

                  return (
                    <div key={idx} className="p-4 bg-muted/40 border border-border rounded-2xl space-y-3 relative group">
                      {/* En-tête profil : Nom modifiable */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          <input
                            type="text"
                            required
                            placeholder="Nom du profil (ex: Kids, VIP...)"
                            value={p.nomProfil}
                            onChange={(e) => handleProfilFieldChange(idx, 'nomProfil', e.target.value)}
                            className="bg-card border border-border rounded-lg px-2 py-1 text-xs font-black text-foreground w-full outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        {accountForm.profils.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProfil(idx)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md transition"
                            title="Supprimer ce profil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Forfait associé (depuis la liste des forfaits de l'offre) */}
                      {offerForfaits?.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                            📦 Forfait associé
                          </label>
                          <select
                            value={p.dureeForfaitMois || offerForfaits[0]?.duree || 1}
                            onChange={(e) => handleProfilFieldChange(idx, 'dureeForfaitMois', Number(e.target.value))}
                            className="w-full h-8 rounded-lg bg-card border border-input px-2 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                          >
                            {offerForfaits.map((f, fIdx) => (
                              <option key={fIdx} value={f.duree}>
                                {f.plan || `${f.duree} ${f.periode || 'Mois'}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Type d'Accès */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                          Type d'Accès
                        </label>
                        <select
                          value={p.typeAbonnement}
                          onChange={(e) => handleProfilFieldChange(idx, 'typeAbonnement', e.target.value)}
                          className="w-full h-8 rounded-lg bg-card border border-input px-2 text-xs font-bold text-foreground outline-none"
                        >
                          <option value="PARTAGE">👥 Profil Partagé</option>
                          <option value="PRIVE">👑 Profil Privé (Dédié)</option>
                        </select>
                      </div>

                      {/* Capacité saisie manuelle & Code PIN */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          {isPrive ? (
                            <div>
                              <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Appareils max
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={p.nbAppareilsMax || 1}
                                onChange={(e) => handleProfilFieldChange(idx, 'nbAppareilsMax', Math.max(1, Number(e.target.value)))}
                                className="w-full h-8 rounded-lg border border-amber-500/40 bg-amber-500/5 px-2 text-xs font-black text-amber-700 dark:text-amber-300 outline-none focus:ring-1 focus:ring-amber-400"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="text-[10px] font-bold text-primary block flex items-center gap-1">
                                <Users className="w-3 h-3" /> Nb personnes
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={p.capaciteMax || 1}
                                onChange={(e) => handleProfilFieldChange(idx, 'capaciteMax', Math.max(1, Number(e.target.value)))}
                                className="w-full h-8 rounded-lg border border-primary/40 bg-primary/5 px-2 text-xs font-black text-primary outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block">Code PIN (optionnel)</label>
                          <Input
                            placeholder="ex: 1234"
                            maxLength={6}
                            value={p.codePin}
                            onChange={(e) => handleProfilFieldChange(idx, 'codePin', e.target.value)}
                            className="h-8 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full py-3 font-black text-xs">
              {submitting ? 'Enregistrement du compte...' : `Enregistrer le Compte #${accountForm.numeroCompte} & ses ${accountForm.profils.length} Profils`}
            </Button>
          </form>
        )}

        {/* MODE 2 : UNITAIRE SIMPLE */}
        {addMode === 'single' && (
          <form onSubmit={onAddSingle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                required
                placeholder="Login / Email"
                value={singleForm.login}
                onChange={(e) => setSingleForm({ ...singleForm, login: e.target.value })}
              />
              <Input
                required
                placeholder="Mot de passe"
                value={singleForm.password}
                onChange={(e) => setSingleForm({ ...singleForm, password: e.target.value })}
              />
            </div>
            <Input
              placeholder="Instructions de connexion (optionnel)"
              value={singleForm.instructions}
              onChange={(e) => setSingleForm({ ...singleForm, instructions: e.target.value })}
            />
            <Button type="submit" disabled={submitting} className="w-full">
              Ajouter au stock
            </Button>
          </form>
        )}

        {/* MODE 3 : IMPORT EN MASSE */}
        {addMode === 'bulk' && (
          <form onSubmit={onAddBulk} className="space-y-4">
            <textarea
              rows={4}
              placeholder="email1@test.com;pass123;instructions&#10;email2@test.com;pass456;instructions"
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              className="w-full p-3 rounded-2xl border border-input bg-card text-xs font-mono outline-none"
            />
            <Button type="submit" disabled={submitting} className="w-full">
              Importer la liste en masse
            </Button>
          </form>
        )}
      </Card>

      {/* Tableau des Profils & Comptes en Stock */}
      <Card className="p-6 border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-base font-black text-foreground">Inventaire des Profils & Comptes</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Rechercher login, profil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs font-bold text-foreground"
            >
              <option value="ALL">Tous</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="USED">Occupés / Livrés</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Chargement des stocks..." />
        ) : filteredStocks.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Aucun profil en stock"
            description="Ajoutez votre premier compte ci-dessus pour activer la livraison automatique."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-black uppercase text-[10px]">
                  <th className="py-3 px-3">Compte</th>
                  <th className="py-3 px-3">Nom Profil & PIN</th>
                  <th className="py-3 px-3">Type & Capacité</th>
                  <th className="py-3 px-3">Durée Forfait</th>
                  <th className="py-3 px-3">Identifiants Maître</th>
                  <th className="py-3 px-3">Occupation / Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStocks.map((item) => {
                  const isPrive = item.typeAbonnement === 'PRIVE'
                  const isAvailable = !item.isUsed && (item.placesOccupees || 0) < (item.capaciteMax || 1)
                  const isPassVisible = visiblePasswords[item.id]

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3 font-extrabold text-foreground">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-black">
                          Compte #{item.numeroCompte || 1}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">
                          {item.nomProfil || 'Compte Simple'}
                          {item.codePin && (
                            <span className="ml-1.5 text-muted-foreground font-mono text-[11px]">
                              PIN: {item.codePin}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isPrive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                            <Sparkles className="w-3 h-3" /> Privé ({item.nbAppareilsMax || 1} appareil{(item.nbAppareilsMax || 1) > 1 ? 's' : ''})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px]">
                            <Users className="w-3 h-3" /> Partagé ({item.capaciteMax || 1} pers.)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-bold">
                          <Clock className="w-3 h-3" /> {item.dureeForfaitMois || 1} Mois
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>{item.login}</div>
                        <div className="text-muted-foreground">
                          {isPassVisible ? item.password : '••••••••'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-extrabold text-[10px]">
                              <XCircle className="w-3 h-3" /> Complet / Occupé
                            </span>
                          )}
                          {!isPrive && (
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {item.placesOccupees || 0}/{item.capaciteMax || 1} place occupée
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Bouton Modifier le profil */}
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...item })}
                            className="p-1.5 text-primary hover:text-primary-focus rounded-lg hover:bg-primary/10 transition"
                            title="Modifier ce profil / compte"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                            title="Afficher/Masquer le mot de passe"
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${item.login} | ${item.password}`)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                            title="Copier les identifiants"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-500/10 cursor-pointer transition"
                            title="Supprimer ce profil du stock"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Modification d'un Profil / Compte */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                Édition de Profil / Compte
              </span>
              <h3 className="text-lg font-black text-foreground">
                Modifier {editingItem.nomProfil || `Compte #${editingItem.numeroCompte}`}
              </h3>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Email / Login</label>
                  <Input
                    required
                    value={editingItem.login || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, login: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Mot de passe</label>
                  <Input
                    required
                    type="text"
                    value={editingItem.password || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">N° de Compte</label>
                  <Input
                    type="number"
                    min="1"
                    value={editingItem.numeroCompte || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, numeroCompte: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Nom du Profil</label>
                  <Input
                    required
                    placeholder="ex: VIP, Kids..."
                    value={editingItem.nomProfil || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, nomProfil: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Code PIN</label>
                  <Input
                    placeholder="ex: 1234"
                    maxLength={6}
                    value={editingItem.codePin || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, codePin: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Type d'Accès</label>
                  <select
                    value={editingItem.typeAbonnement || 'PARTAGE'}
                    onChange={(e) => setEditingItem({ ...editingItem, typeAbonnement: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-2.5 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="PARTAGE">👥 Profil Partagé</option>
                    <option value="PRIVE">👑 Profil Privé</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Forfait / Durée</label>
                  <select
                    value={editingItem.dureeForfaitMois || offerForfaits[0]?.duree || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, dureeForfaitMois: Number(e.target.value) })}
                    className="w-full h-10 rounded-xl border border-input bg-card px-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {offerForfaits.map((of, fIdx) => (
                      <option key={fIdx} value={of.duree}>
                        📦 {of.plan} ({of.duree} Mois)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  {editingItem.typeAbonnement === 'PRIVE' ? (
                    <div>
                      <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                        Appareils max
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editingItem.nbAppareilsMax || 1}
                        onChange={(e) => setEditingItem({ ...editingItem, nbAppareilsMax: Math.max(1, Number(e.target.value)) })}
                        className="w-full h-10 rounded-xl border border-amber-500/40 bg-amber-500/5 px-2.5 text-xs font-black text-amber-700 dark:text-amber-300 outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-primary block">
                        Nb de Personnes
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editingItem.capaciteMax || 1}
                        onChange={(e) => setEditingItem({ ...editingItem, capaciteMax: Math.max(1, Number(e.target.value)) })}
                        className="w-full h-10 rounded-xl border border-primary/40 bg-primary/5 px-2.5 text-xs font-black text-primary outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gestion des Places Occupées / Disponibilité */}
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Gestion de l'Occupation :</span>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, placesOccupees: 0, isUsed: false })}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Réinitialiser à 0 place occupée
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-muted-foreground block">Places actuellement occupées</label>
                    <Input
                      type="number"
                      min="0"
                      value={editingItem.placesOccupees || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, placesOccupees: Number(e.target.value) })}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block">Statut Forcé</label>
                    <select
                      value={editingItem.isUsed ? 'USED' : 'AVAILABLE'}
                      onChange={(e) => setEditingItem({ ...editingItem, isUsed: e.target.value === 'USED' })}
                      className="w-full h-8 rounded-lg border border-input bg-card px-2 text-xs font-bold text-foreground"
                    >
                      <option value="AVAILABLE">Disponible</option>
                      <option value="USED">Complet / Occupé</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Instructions particulières (optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="Notes de connexion spécifiques..."
                  value={editingItem.instructions || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, instructions: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingItem(null)}
                  className="w-1/3 text-xs"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting} className="w-2/3 text-xs font-black">
                  {submitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de Suppression de Profil */}
      {deleteModal.open && deleteModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            {/* Icône & Titre */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                (deleteModal.item.placesOccupees || 0) > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">
                  {(deleteModal.item.placesOccupees || 0) > 0 ? 'Suppression Impossible' : 'Supprimer ce Profil ?'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compte #{deleteModal.item.numeroCompte} &bull; {deleteModal.item.nomProfil || `Profil #${deleteModal.item.id}`}
                </p>
              </div>
            </div>

            {/* Corps conditionnel : Occupé vs Libre */}
            {(deleteModal.item.placesOccupees || 0) > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <p className="font-extrabold flex items-center gap-1.5">
                  ⚠️ Profil Actuellement Occupé par un Client ({deleteModal.item.placesOccupees} place(s))
                </p>
                <p className="leading-relaxed text-[11.5px]">
                  Ce profil est actuellement attribué à un ou plusieurs clients dont l'abonnement est actif. Pour protéger l'accès de vos clients, vous ne pouvez pas supprimer un profil en cours d'utilisation.
                </p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  💡 Conseil : Rendez-vous dans <strong>Affectations</strong> pour déplacer le client vers un autre profil avant de supprimer celui-ci.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Êtes-vous sûr de vouloir supprimer définitivement le profil <strong>{deleteModal.item.nomProfil}</strong> (Login : <span className="font-mono text-foreground">{deleteModal.item.login}</span>) ?
                </p>
                <p className="text-rose-500 font-semibold text-[11px]">
                  Cette action est irréversible et retirera ce profil du stock disponible.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteModal({ open: false, item: null, submitting: false })}
                className="flex-1 text-xs"
              >
                {(deleteModal.item.placesOccupees || 0) > 0 ? 'Fermer' : 'Annuler'}
              </Button>

              {(deleteModal.item.placesOccupees || 0) === 0 && (
                <button
                  type="button"
                  disabled={deleteModal.submitting}
                  onClick={confirmDeleteStock}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleteModal.submitting ? 'Suppression...' : 'Supprimer définitivement'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
