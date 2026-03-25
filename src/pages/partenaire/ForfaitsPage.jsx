import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit3, Save, X } from 'lucide-react'
import { forfaitsAPI } from '../../lib/api'

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
        categorie: form.categorie,
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
      await loadForfaits(form.categorie)
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Erreur lors de lenregistrement du forfait')
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
      categorie: f.categorie || categorieFiltre,
      periode: f.periode || 'MOIS',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes Forfaits</h1>
          <p className="text-gray-600">Cree et gere les forfaits que tu peux lier a tes offres.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{form.id ? 'Modifier un forfait' : 'Nouveau forfait'}</h2>
              {form.id ? (
                <button onClick={resetForm} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <X className="h-4 w-4" /> Annuler
                </button>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Categorie</label>
                <select
                  name="categorie"
                  value={form.categorie}
                  onChange={onChange}
                  className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Nom du plan</label>
                <input name="plan" value={form.plan} onChange={onChange} required className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Prix (FCFA)</label>
                  <input type="number" name="prix" value={form.prix} onChange={onChange} required className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Duree</label>
                  <input type="number" name="duree" value={form.duree} onChange={onChange} required className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Periode</label>
                <select
                  name="periode"
                  value={form.periode}
                  onChange={onChange}
                  className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                >
                  {PERIODES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={3} className="w-full mt-1 px-4 py-2 border-2 border-gray-200 rounded-lg" />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {form.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {submitting ? 'Enregistrement...' : form.id ? 'Mettre a jour' : 'Creer le forfait'}
              </button>
            </form>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Forfaits disponibles</h2>
              <select
                value={categorieFiltre}
                onChange={(e) => setCategorieFiltre(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-gray-500">Chargement...</div>
            ) : sortedForfaits.length === 0 ? (
              <div className="text-gray-500">Aucun forfait dans cette categorie.</div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-auto">
                {sortedForfaits.map((f) => (
                  <div key={f.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-semibold">{f.plan}</div>
                        <div className="text-sm text-gray-600">{Number(f.prix || 0).toLocaleString()} FCFA • {f.duree} {f.periode || 'MOIS'}</div>
                        <div className="text-xs text-gray-500 mt-1">{f.description || '-'}</div>
                      </div>
                      <button
                        onClick={() => startEdit(f)}
                        className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Edit3 className="h-4 w-4" /> Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
