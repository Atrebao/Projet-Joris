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

  // Onglet d'ajout : 'single' | 'bulk'
  const [addMode, setAddMode] = useState('single')
  const [form, setForm] = useState({ login: '', password: '', instructions: '' })
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
        if (items[0]?.id) setOffreId(String(items[0].id))
      } catch {
        setOffres([])
      }
    }
    loadOffres()
  }, [partenaireId])

  useEffect(() => {
    if (offreId) {
      loadStock(offreId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId])

  const selectedOffre = offres.find((o) => String(o.id) === String(offreId))

  const stats = useMemo(() => {
    const total = stocks.length
    const disponibles = stocks.filter((x) => !x.isUsed).length
    const utilises = total - disponibles
    return { total, disponibles, utilises }
  }, [stocks])

  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        (item.login && item.login.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.instructions && item.instructions.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'AVAILABLE' && !item.isUsed) ||
        (filterStatus === 'USED' && item.isUsed)

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

  const onAddOne = async (e) => {
    e.preventDefault()
    if (!offreId) {
      toast.error('Veuillez sélectionner une offre.')
      return
    }
    setSubmitting(true)
    try {
      await identifiantsStockAPI.createForOffre(Number(offreId), form)
      toast.success('Identifiant ajouté au stock avec succès !')
      setForm({ login: '', password: '', instructions: '' })
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

    let success = 0
    for (const line of lines) {
      const [login, password, instructions] = line.split(';')
      if (!login || !password) continue
      try {
        await identifiantsStockAPI.createForOffre(Number(offreId), {
          login: login.trim(),
          password: password.trim(),
          instructions: instructions?.trim() || '',
        })
        success += 1
      } catch {}
    }

    if (success > 0) {
      toast.success(`${success} identifiant(s) ajouté(s) au stock avec succès !`)
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
        title="Gestion des Stocks & Identifiants"
        description="Gérez les identifiants de comptes streaming qui seront livrés automatiquement aux clients lors de leurs achats."
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

      {/* Sélecteur d'Offre Associée */}
      <Card className="p-5 border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ServiceLogo name={selectedOffre?.nom || selectedOffre?.nomService || 'Offre'} image={selectedOffre?.image} size="md" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Offre sélectionnée
              </span>
              <h2 className="text-base font-bold text-slate-900 truncate">
                {selectedOffre?.titreOffre || selectedOffre?.nomService || selectedOffre?.nom || 'Sélectionnez une offre'}
              </h2>
            </div>
          </div>

          <div className="w-full md:w-80">
            <select
              value={offreId}
              onChange={(e) => setOffreId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none shadow-2xs"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Identifiants"
          value={stats.total}
          subtext="Comptes enregistrés"
          icon={Boxes}
        />
        <KpiCard
          title="Prêts à Livrer"
          value={stats.disponibles}
          subtext="Disponibles pour vente"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Déjà Attribués"
          value={stats.utilises}
          subtext="Livrés aux clients"
          icon={KeyRound}
        />
        <KpiCard
          title="Statut Réserve"
          value={stats.disponibles === 0 ? 'Rupture' : stats.disponibles <= 3 ? 'Critique' : 'Optimal'}
          subtext={stats.disponibles <= 3 ? 'Réapprovisionner' : 'Stock suffisant'}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Formulaire d'Ajout (5 colonnes) */}
        <Card className="lg:col-span-5 p-6 border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Ajouter des Comptes en Stock
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ces comptes seront automatiquement attribués lors des commandes
            </p>
          </div>

          {/* Onglets Unitaire vs En Masse */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 gap-1">
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addMode === 'single'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ajout Unitaire
            </button>
            <button
              type="button"
              onClick={() => setAddMode('bulk')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                addMode === 'bulk'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Import en Bloc (CSV / Multi-lignes)
            </button>
          </div>

          {addMode === 'single' ? (
            <form onSubmit={onAddOne} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Identifiant / Email / Numéro de compte *
                </label>
                <Input
                  required
                  placeholder="Ex: streaming.premium@gmail.com"
                  value={form.login}
                  onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Mot de passe du compte *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ex: SecretPass2026!"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Instructions ou PIN de profil (optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Profil 3 - Code PIN 4920. Ne pas modifier le mot de passe."
                  value={form.instructions}
                  onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg h-9 gap-1.5 shadow-2xs mt-2"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Ajout...' : 'Ajouter au Stock'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onAddBulk} className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                Collez vos lignes au format :<br />
                <code className="font-mono font-bold text-slate-900 bg-slate-200 px-1 py-0.5 rounded">
                  email;motdepasse;instructions
                </code>
              </div>

              <div>
                <textarea
                  required
                  rows={5}
                  placeholder="client1@gmail.com;pass123;Profil 1&#10;client2@gmail.com;pass456;Profil 2"
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg h-9 gap-1.5 shadow-2xs"
              >
                <Upload className="h-4 w-4" />
                {submitting ? 'Importation...' : 'Importer les Comptes'}
              </Button>
            </form>
          )}
        </Card>

        {/* Liste des Identifiants en Stock (7 colonnes) */}
        <Card className="lg:col-span-7 p-6 border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Inventaire des Comptes ({filteredStocks.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisez et sécurisez vos identifiants
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="AVAILABLE">Disponibles</option>
                  <option value="USED">Déjà livrés</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Chargement des identifiants...
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Aucun identifiant trouvé pour cette offre.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredStocks.map((item) => {
                  const isVisible = visiblePasswords[item.id]
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isUsed
                          ? 'border-slate-200 bg-slate-50 opacity-75'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono truncate">
                            {item.login}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.login, 'Login')}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title="Copier le login"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                          <span>Mot de passe :</span>
                          <strong className="text-slate-800">
                            {isVisible ? item.password : '••••••••••••'}
                          </strong>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title={isVisible ? 'Masquer' : 'Afficher'}
                          >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.password, 'Mot de passe')}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title="Copier le mot de passe"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Note : {item.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isUsed
                              ? 'bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.isUsed ? 'Livré au client' : 'Prêt à livrer'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
