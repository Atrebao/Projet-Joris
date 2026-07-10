import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Edit3, Layers, Plus, Save, Tag, X } from 'lucide-react'
import { forfaitsAPI } from '../../lib/api'
import { Button, Card, DataTable, EmptyState, Input, KpiCard, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

const CATEGORIES = [
  { value: 'FILMS_SERIES', label: 'Films & Series' },
  { value: 'MUSIQUE', label: 'Musique' },
  { value: 'GAMING', label: 'Gaming' },
  { value: 'EBOOKS', label: 'Ebooks' },
  { value: 'SPORT', label: 'Sport' },
]

const PERIODES = [
  { value: 'MOIS', label: 'Mois' },
  { value: 'ANNEE', label: 'Annee' },
  { value: 'JOUR', label: 'Jour' },
]

const initialForm = {
  id: null,
  plan: '',
  prix: '',
  description: '',
  duree: '1',
  categorie: 'FILMS_SERIES',
  periode: 'MOIS',
}

export default function ForfaitsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [forfaits, setForfaits] = useState([])
  const [categorieFiltre, setCategorieFiltre] = useState('FILMS_SERIES')
  const [form, setForm] = useState(initialForm)

  const loadForfaits = async (categorie = categorieFiltre) => {
    setLoading(true)
    try {
      const { data } = await forfaitsAPI.getAll(categorie)
      setForfaits(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Impossible de charger les forfaits')
      setForfaits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForfaits(categorieFiltre)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieFiltre])

  const sortedForfaits = useMemo(
    () => [...forfaits].sort((a, b) => Number(a.prix || 0) - Number(b.prix || 0)),
    [forfaits],
  )

  const stats = useMemo(() => {
    const prix = sortedForfaits.map((f) => Number(f.prix || 0)).filter(Boolean)
    return {
      total: sortedForfaits.length,
      min: prix.length ? Math.min(...prix) : 0,
      max: prix.length ? Math.max(...prix) : 0,
    }
  }, [sortedForfaits])

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const resetForm = () => {
    setForm({ ...initialForm, categorie: categorieFiltre })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        plan: form.plan,
        prix: Number(form.prix),
        description: form.description,
        duree: Number(form.duree),
        // categorie: form.categorie,
        periode: form.periode,
      }

      if (form.id) {
        await forfaitsAPI.update(form.id, payload)
        toast.success('Forfait modifie')
      } else {
        await forfaitsAPI.create(payload)
        toast.success('Forfait cree')
      }

      resetForm()
      setCategorieFiltre(form.categorie)
      await loadForfaits(form.categorie)
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Erreur lors de l'enregistrement du forfait")
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (f) => {
    setForm({
      id: f.id,
      plan: f.plan || '',
      prix: String(f.prix ?? ''),
      description: f.description || '',
      duree: String(f.duree ?? '1'),
      // categorie: f.categorie || categorieFiltre,
      periode: f.periode || 'MOIS',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forfaits"
        description="Creez les plans que vous pourrez lier a vos offres."
        action={
          form.id ? (
            <Button variant="secondary" onClick={resetForm}><X className="h-4 w-4" /> Annuler</Button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Forfaits dans la categorie" value={String(stats.total)} icon={Layers} />
        <KpiCard label="Prix minimum" value={formatFCFA(stats.min)} icon={Tag} accent="chart3" />
        <KpiCard label="Prix maximum" value={formatFCFA(stats.max)} icon={Tag} accent="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">{form.id ? 'Modifier un forfait' : 'Nouveau forfait'}</h2>
            <p className="text-sm text-muted-foreground">Nom, prix, duree et categorie du plan.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
          
            {/* <div>
              <label className="text-sm font-medium text-foreground">Categorie</label>
              <Select name="categorie" value={form.categorie} onChange={onChange} className="mt-1 w-full">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div> */}

            <div>
              <label className="text-sm font-medium text-foreground">Nom du plan</label>
              <Input name="plan" value={form.plan} onChange={onChange} required className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Prix FCFA</label>
                <Input type="number" name="prix" value={form.prix} onChange={onChange} required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Duree</label>
                <Input type="number" name="duree" value={form.duree} onChange={onChange} required className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Periode</label>
              <Select name="periode" value={form.periode} onChange={onChange} className="mt-1 w-full">
                {PERIODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {form.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {submitting ? 'Enregistrement...' : form.id ? 'Mettre a jour' : 'Creer le forfait'}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Forfaits disponibles</h2>
              <p className="text-sm text-muted-foreground">Classement par prix croissant.</p>
            </div>
            {/* <Select value={categorieFiltre} onChange={(e) => setCategorieFiltre(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select> */}
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : sortedForfaits.length === 0 ? (
            <EmptyState icon={Layers} title="Aucun forfait" description="Creez un forfait pour cette categorie." />
          ) : (
            <DataTable
              data={sortedForfaits}
              columns={[
                { key: 'plan', label: 'Plan', render: (f) => <span className="font-medium text-foreground">{f.plan}</span> },
                { key: 'prix', label: 'Prix', render: (f) => <span className="font-semibold">{formatFCFA(f.prix)}</span> },
                { key: 'duree', label: 'Duree', render: (f) => `${f.duree} ${f.periode || 'MOIS'}` },
                { key: 'description', label: 'Description', render: (f) => <span className="text-muted-foreground">{f.description || '-'}</span> },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (f) => <Button size="sm" variant="secondary" onClick={() => startEdit(f)}><Edit3 className="h-4 w-4" /> Modifier</Button>,
                },
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
