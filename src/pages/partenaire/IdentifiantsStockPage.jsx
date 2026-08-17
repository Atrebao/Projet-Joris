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
} from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, identifiantsStockAPI } from '../../lib/api'
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

  // Modes d'ajout : 'account' (Comptes & Profils) | 'single' (Unitaire) | 'bulk' (Masse)
  const [addMode, setAddMode] = useState('account')

  // Formulaire Compte & Profils Multi-Durées (Point 6)
  const [accountForm, setAccountForm] = useState({
    login: '',
    password: '',
    numeroCompte: 1,
    nbProfils: 5,
    instructionsGenerales: '',
    profils: [
      { nomProfil: 'Profil 1', dureeForfaitMois: 1, capaciteMax: 1, codePin: '', typeAbonnement: 'PARTAGE' },
      { nomProfil: 'Profil 2', dureeForfaitMois: 1, capaciteMax: 1, codePin: '', typeAbonnement: 'PARTAGE' },
      { nomProfil: 'Profil 3', dureeForfaitMois: 3, capaciteMax: 1, codePin: '', typeAbonnement: 'PARTAGE' },
      { nomProfil: 'Profil 4', dureeForfaitMois: 3, capaciteMax: 1, codePin: '', typeAbonnement: 'PARTAGE' },
      { nomProfil: 'Profil 5', dureeForfaitMois: 1, capaciteMax: 1, codePin: '', typeAbonnement: 'PRIVE' },
    ],
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

  // Forfaits réels liés à l'offre sélectionnée
  const offerForfaits = useMemo(() => {
    if (!selectedOffre?.forfaits || selectedOffre.forfaits.length === 0) {
      return [
        { duree: 1, periode: 'MOIS', plan: '1 Mois' },
        { duree: 3, periode: 'MOIS', plan: '3 Mois' },
        { duree: 6, periode: 'MOIS', plan: '6 Mois' },
        { duree: 12, periode: 'MOIS', plan: '12 Mois' },
      ]
    }
    return selectedOffre.forfaits.map((f) => ({
      duree: Number(f.duree || 1),
      periode: f.periode || 'MOIS',
      plan: f.plan || `${f.duree} ${f.periode || 'Mois'}`,
    }))
  }, [selectedOffre])

  // Initialise les profils en fonction de l'offre choisie
  const initAccountFormForOffer = (offre) => {
    if (!offre) return
    const defaultCount = getDefaultProfilesCountForService(offre.nomService || offre.nom || '')
    const forfaitsList = (offre.forfaits && offre.forfaits.length > 0)
      ? offre.forfaits.map((f) => Number(f.duree || 1))
      : [1, 3]

    const initialProfils = []
    for (let i = 0; i < defaultCount; i++) {
      const assignedDuration = forfaitsList[i % forfaitsList.length] || 1
      initialProfils.push({
        nomProfil: `Profil ${i + 1}`,
        dureeForfaitMois: assignedDuration,
        capaciteMax: 1,
        codePin: '',
        typeAbonnement: 'PARTAGE',
      })
    }

    setAccountForm((prev) => ({
      ...prev,
      nbProfils: defaultCount,
      profils: initialProfils,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet identifiant du stock ?')) return
    try {
      await identifiantsStockAPI.delete(id)
      toast.success('Identifiant supprimé')
      loadStock(offreId)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Ajuster le nombre de profils sans mention statique
  const handleNbProfilsChange = (n) => {
    const count = Math.max(1, Math.min(10, Number(n) || 1))
    const current = [...accountForm.profils]
    const updated = []
    const firstDuration = offerForfaits[0]?.duree || 1

    for (let i = 0; i < count; i++) {
      if (current[i]) {
        updated.push(current[i])
      } else {
        updated.push({
          nomProfil: `Profil ${i + 1}`,
          dureeForfaitMois: firstDuration,
          capaciteMax: 1,
          codePin: '',
          typeAbonnement: 'PARTAGE',
        })
      }
    }
    setAccountForm((prev) => ({ ...prev, nbProfils: count, profils: updated }))
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

    setSubmitting(true)
    try {
      await identifiantsStockAPI.createAccountWithProfiles(Number(offreId), {
        login: accountForm.login.trim(),
        password: accountForm.password.trim(),
        numeroCompte: Number(accountForm.numeroCompte) || 1,
        instructionsGenerales: accountForm.instructionsGenerales.trim(),
        profils: accountForm.profils,
      })
      toast.success(`Compte maître & ${accountForm.profils.length} profils ajoutés au stock ! 🎉`)
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestion des Stocks & Multi-Comptes"
        description="Configurez vos comptes maîtres streaming (Netflix, Prime...), attribuez les profils par durée et organisez la rotation automatique."
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
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div>
            <h3 className="text-base font-black text-foreground">
              Ajouter du Stock pour <span className="text-primary">{selectedOffre?.nom || selectedOffre?.nomService || 'cette offre'}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Renseignez un compte maître complet ou des identifiants unitaires.
            </p>
          </div>

          {/* Onglets de modes */}
          <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setAddMode('account')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition ${
                addMode === 'account' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Compte Maître & Profils
            </button>
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition ${
                addMode === 'single' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unitaire Simple
            </button>
            <button
              type="button"
              onClick={() => setAddMode('bulk')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition ${
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
                <strong>Attribution automatique intelligente :</strong> Lors d'une commande pour {selectedOffre?.nom || 'ce service'}, le système sélectionnera automatiquement un profil disponible du <strong>Compte #{accountForm.numeroCompte}</strong> correspondant à la durée choisie par le client. Quand ce compte sera plein, il passera automatiquement au compte suivant.
              </p>
            </div>

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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground block">N° de Compte</label>
                  <Input
                    type="number"
                    min="1"
                    value={accountForm.numeroCompte}
                    onChange={(e) => setAccountForm({ ...accountForm, numeroCompte: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-foreground block">Nombre de Profils</label>
                  <select
                    value={accountForm.nbProfils}
                    onChange={(e) => handleNbProfilsChange(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-card px-2.5 text-xs font-bold text-foreground outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Profil{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Configuration individuelle des profils */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Configuration des {accountForm.profils.length} Profils de ce Compte :
                </h4>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Attribuez la durée d'abonnement pour chaque profil
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accountForm.profils.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-muted/40 border border-border rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" /> {p.nomProfil}
                      </span>
                      <select
                        value={p.typeAbonnement}
                        onChange={(e) => handleProfilFieldChange(idx, 'typeAbonnement', e.target.value)}
                        className="text-[10px] font-extrabold rounded-lg bg-card border border-border px-2 py-0.5"
                      >
                        <option value="PARTAGE">Partagé</option>
                        <option value="PRIVE">Privé (Dédié)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Durée Forfait</label>
                        <select
                          value={p.dureeForfaitMois}
                          onChange={(e) => handleProfilFieldChange(idx, 'dureeForfaitMois', Number(e.target.value))}
                          className="w-full h-8 rounded-lg border border-input bg-card px-2 text-xs font-bold text-foreground"
                        >
                          {offerForfaits.map((of, fIdx) => (
                            <option key={fIdx} value={of.duree}>
                              {of.plan}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block">Code PIN (opt.)</label>
                        <Input
                          placeholder="ex: 1234"
                          maxLength={4}
                          value={p.codePin}
                          onChange={(e) => handleProfilFieldChange(idx, 'codePin', e.target.value)}
                          className="h-8 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  <th className="py-3 px-3">Profil & PIN</th>
                  <th className="py-3 px-3">Durée Forfait</th>
                  <th className="py-3 px-3">Capacité</th>
                  <th className="py-3 px-3">Identifiants</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStocks.map((item) => {
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
                          {item.codePin && <span className="ml-1.5 text-muted-foreground font-mono text-[11px]">PIN: {item.codePin}</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.typeAbonnement === 'PRIVE' ? '👑 Privé' : '👥 Partagé'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-bold">
                          <Clock className="w-3 h-3" /> {item.dureeForfaitMois || 1} Mois
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-muted-foreground">
                        {item.placesOccupees || 0} / {item.capaciteMax || 1} place
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>{item.login}</div>
                        <div className="text-muted-foreground">
                          {isPassVisible ? item.password : '••••••••'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-extrabold text-[10px]">
                            <XCircle className="w-3 h-3" /> Occupé / Livré
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-500/10"
                            title="Supprimer du stock"
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
    </div>
  )
}
