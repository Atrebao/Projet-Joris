import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Boxes, CheckCircle2, KeyRound, Plus, Upload, XCircle } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, identifiantsStockAPI } from '../../lib/api'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  KpiCard,
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
    loadStock(offreId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offreId])

  const selectedOffre = offres.find((o) => String(o.id) === String(offreId))

  const stats = useMemo(() => {
    const total = stocks.length
    const disponibles = stocks.filter((x) => !x.isUsed).length
    const utilises = total - disponibles
    return { total, disponibles, utilises }
  }, [stocks])

  const onAddOne = async (e) => {
    e.preventDefault()
    if (!offreId) return
    try {
      await identifiantsStockAPI.createForOffre(Number(offreId), form)
      toast.success('Identifiant ajoute au stock')
      setForm({ login: '', password: '', instructions: '' })
      await loadStock(offreId)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur ajout identifiant')
    }
  }

  const onAddBulk = async () => {
    if (!offreId || !bulk.trim()) return
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
    toast.success(`${success} identifiant(s) ajoute(s)`)
    setBulk('')
    await loadStock(offreId)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stocks & Identifiants"
        description="Ajoutez les comptes qui seront livres automatiquement apres paiement."
        action={<Button variant="secondary" onClick={() => loadStock(offreId)}>Actualiser</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ServiceLogo name={selectedOffre?.nom || 'Offre'} image={selectedOffre?.image} />
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedOffre?.nom || 'Selectionnez une offre'}</p>
              <p className="text-xs text-muted-foreground">Stock de livraison associe a une offre partenaire.</p>
            </div>
          </div>
          <Select value={offreId} onChange={(e) => setOffreId(e.target.value)} className="w-full lg:w-80">
            {offres.map((o) => (
              <option key={o.id} value={o.id}>{o.nomService || o.nom}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Identifiants total" value={String(stats.total)} icon={Boxes} />
        <KpiCard label="Disponibles" value={String(stats.disponibles)} icon={CheckCircle2} accent="chart3" />
        <KpiCard label="Utilises" value={String(stats.utilises)} icon={XCircle} accent="chart4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Ajouter un identifiant</h2>
            <p className="text-sm text-muted-foreground">Un compte pret a etre livre au client.</p>
          </div>
          <form onSubmit={onAddOne} className="space-y-3">
            <Input value={form.login} onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))} placeholder="Login / email" required />
            <Input value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Mot de passe" required />
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
              placeholder="Instructions optionnelles"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
              rows={4}
            />
            <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Ajouter au stock</Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Import en lot</h2>
            <p className="text-sm text-muted-foreground">Format: login;password;instructions, une ligne par identifiant.</p>
          </div>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="exemple@site.com;Pass123;Profil 1 uniquement"
            className="h-40 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
          />
          <Button type="button" onClick={onAddBulk} className="mt-3 w-full"><Upload className="h-4 w-4" /> Importer</Button>
        </Card>
      </div>

      {stocks.length === 0 && !loading ? (
        <EmptyState icon={KeyRound} title="Aucun identifiant en stock" description="Ajoutez des identifiants pour automatiser les livraisons." />
      ) : (
        <DataTable
          data={stocks}
          emptyLabel={loading ? 'Chargement...' : 'Aucun identifiant en stock'}
          columns={[
            { key: 'login', label: 'Login', render: (stock) => <span className="font-medium text-foreground">{stock.login}</span> },
            { key: 'instructions', label: 'Instructions', render: (stock) => <span className="text-muted-foreground">{stock.instructions || '-'}</span> },
            {
              key: 'statut',
              label: 'Statut',
              render: (stock) => stock.isUsed ? <Badge tone="warning">Utilise</Badge> : <Badge tone="success">Disponible</Badge>,
            },
            { key: 'souscription', label: 'Souscription', render: (stock) => stock?.souscription?.reference || '-' },
          ]}
        />
      )}
    </div>
  )
}
