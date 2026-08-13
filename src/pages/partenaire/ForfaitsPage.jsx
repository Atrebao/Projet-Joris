import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarDays, Clock, Edit3, Layers, Plus, Save, Sparkles, X } from 'lucide-react'
import { forfaitsAPI, offresAPI } from '../../lib/api'
import { getPartenaireId } from '../../Utils/Utils'
import { Button, Card, DataTable, EmptyState, Input, KpiCard, PageHeader, Select } from '../../components/saas/SaasPrimitives'

const PERIODES = [
  { value: 'JOUR', label: 'Jour(s)' },
  { value: 'MOIS', label: 'Mois' },
  { value: 'ANNEE', label: 'An(s)' },
]

const DURATION_PRESETS = [
  { label: '1 Mois', duree: '1', periode: 'MOIS' },
  { label: '3 Mois', duree: '3', periode: 'MOIS' },
  { label: '6 Mois', duree: '6', periode: 'MOIS' },
  { label: '1 An', duree: '1', periode: 'ANNEE' },
]

const initialForm = {
  id: null,
  plan: '',
  description: '',
  duree: '1',
  periode: 'MOIS',
}

export default function ForfaitsPage() {
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [forfaits, setForfaits] = useState([])
  const [offres, setOffres] = useState([])
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    setLoading(true)
    try {
      const [forfaitsRes, offresRes] = await Promise.all([
        forfaitsAPI.getAll(partenaireId),
        partenaireId ? offresAPI.getByPartenaire(partenaireId) : offresAPI.getAll(),
      ])
      setForfaits(Array.isArray(forfaitsRes?.data) ? forfaitsRes.data : [])
      setOffres(Array.isArray(offresRes?.data) ? offresRes.data : [])
    } catch {
      toast.error('Impossible de charger les forfaits')
      setForfaits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const sortedForfaits = useMemo(
    () => [...forfaits].sort((a, b) => Number(a.duree || 0) - Number(b.duree || 0)),
    [forfaits],
  )

  const stats = useMemo(() => {
    return {
      total: sortedForfaits.length,
      mois: sortedForfaits.filter((f) => f.periode === 'MOIS').length,
      annee: sortedForfaits.filter((f) => f.periode === 'ANNEE').length,
    }
  }, [sortedForfaits])

  const getOffersCountForForfait = (forfaitId) => {
    return offres.filter((o) => {
      const fId = o?.forfaitOffres?.[0]?.forfait?.id || o?.forfaits?.[0]?.id || o?.forfaitId
      return String(fId) === String(forfaitId)
    }).length
  }

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      plan: prev.plan || `Forfait ${preset.label}`,
      duree: preset.duree,
      periode: preset.periode,
    }))
  }

  const resetForm = () => setForm(initialForm)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        plan: form.plan.trim(),
        description: form.description?.trim() || '',
        duree: Number(form.duree),
        periode: form.periode,
        partenaireId,
      }

      if (form.id) {
        await forfaitsAPI.update(form.id, payload)
        toast.success('Forfait modifié avec succès')
      } else {
        await forfaitsAPI.create(payload)
        toast.success('Forfait créé avec succès')
      }

      resetForm()
      await loadData()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement du forfait")
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (f) => {
    setForm({
      id: f.id,
      plan: f.plan || '',
      description: f.description || '',
      duree: String(f.duree ?? '1'),
      periode: f.periode || 'MOIS',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forfaits & Modèles de Durée"
        description="Créez des modèles de durée réutilisables (1 mois, 3 mois, 1 an). Le prix est ensuite fixé librement dans chaque offre."
        action={
          form.id ? (
            <Button variant="secondary" onClick={resetForm}>
              <X className="h-4 w-4" /> Annuler la modification
            </Button>
          ) : null
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Modèles de forfaits" value={String(stats.total)} icon={Layers} accent="primary" />
        <KpiCard label="Forfaits mensuels" value={String(stats.mois)} icon={CalendarDays} accent="accent" />
        <KpiCard label="Forfaits annuels" value={String(stats.annee)} icon={Clock} accent="chart3" />
      </div>

      {/* Mes Forfaits - Grille Visuelle Moderne inspirée de saa-s-marketplace-app */}
      {sortedForfaits.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Mes Forfaits Réutilisables</h2>
              <p className="text-xs text-muted-foreground">Sélectionnables lors de la création de vos offres.</p>
            </div>
            <span className="text-xs font-semibold text-primary">{sortedForfaits.length} disponible(s)</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedForfaits.map((f) => {
              const count = getOffersCountForForfait(f.id)
              const isSelected = form.id === f.id
              return (
                <div
                  key={f.id}
                  onClick={() => startEdit(f)}
                  className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:border-primary hover:shadow-sm ${
                    isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </span>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {count} offre{count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="mt-3 truncate font-bold text-foreground group-hover:text-primary">{f.plan}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Durée : <span className="font-semibold text-foreground">{f.duree} {f.periode || 'MOIS'}</span>
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>{f.description ? f.description.slice(0, 25) + '...' : 'Aucune description'}</span>
                    <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Modifier
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Formulaire & Table détaillée */}
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-bold text-foreground">{form.id ? 'Modifier le forfait' : 'Créer un forfait'}</h2>
            <p className="text-xs text-muted-foreground">
              Définissez uniquement le nom, la durée et la période.
            </p>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground">Raccourcis de durée :</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Nom du forfait</label>
              <Input
                name="plan"
                value={form.plan}
                onChange={onChange}
                required
                className="mt-1"
                placeholder="Ex: Forfait 1 Mois Standard"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Valeur durée</label>
                <Input
                  type="number"
                  name="duree"
                  min="1"
                  value={form.duree}
                  onChange={onChange}
                  required
                  className="mt-1"
                  placeholder="1, 3, 6..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Période</label>
                <Select name="periode" value={form.periode} onChange={onChange} className="mt-1 w-full">
                  {PERIODES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Description (optionnelle)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                placeholder="Ex: Valable 30 jours, reconductible..."
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {form.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {submitting ? 'Enregistrement...' : form.id ? 'Mettre à jour le forfait' : 'Créer le forfait'}
            </Button>
          </form>
        </Card>

        {/* Tableau Récapitulatif */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-bold text-foreground">Liste des forfaits configurés</h2>
            <p className="text-xs text-muted-foreground">Tous les forfaits utilisables pour vos offres.</p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Chargement des forfaits...
            </div>
          ) : sortedForfaits.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Aucun forfait"
              description="Créez votre premier forfait pour commencer à publier des offres."
            />
          ) : (
            <DataTable
              data={sortedForfaits}
              columns={[
                {
                  key: 'plan',
                  label: 'Nom',
                  render: (f) => (
                    <div>
                      <span className="font-bold text-foreground">{f.plan}</span>
                      {f.description && <p className="line-clamp-1 text-xs text-muted-foreground">{f.description}</p>}
                    </div>
                  ),
                },
                {
                  key: 'duree',
                  label: 'Durée',
                  render: (f) => (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {f.duree} {f.periode || 'MOIS'}
                    </span>
                  ),
                },
                {
                  key: 'offres',
                  label: 'Offres liées',
                  render: (f) => {
                    const c = getOffersCountForForfait(f.id)
                    return <span className="text-xs font-medium text-muted-foreground">{c} offre{c > 1 ? 's' : ''}</span>
                  },
                },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (f) => (
                    <Button size="sm" variant="secondary" onClick={() => startEdit(f)}>
                      <Edit3 className="h-3.5 w-3.5" /> Modifier
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
