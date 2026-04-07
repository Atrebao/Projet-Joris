import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, identifiantsStockAPI } from '../../lib/api'

export default function IdentifiantsStockPage() {
  const partenaireId = getPartenaireId()
  const [offres, setOffres] = useState([])
  const [offreId, setOffreId] = useState('')
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ login: '', password: '', instructions: '' })
  const [bulk, setBulk] = useState('')

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
    const loadStock = async () => {
      if (!offreId) return
      setLoading(true)
      try {
        const { data } = await identifiantsStockAPI.listByOffre(Number(offreId))
        setStocks(Array.isArray(data) ? data : [])
      } catch {
        setStocks([])
      } finally {
        setLoading(false)
      }
    }
    loadStock()
  }, [offreId])

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
      toast.success('Identifiant ajouté au stock')
      setForm({ login: '', password: '', instructions: '' })
      const { data } = await identifiantsStockAPI.listByOffre(Number(offreId))
      setStocks(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur ajout identifiant')
    }
  }

  const onAddBulk = async () => {
    if (!offreId || !bulk.trim()) return
    const lines = bulk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

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
    toast.success(`${success} identifiant(s) ajouté(s)`)
    setBulk('')
    const { data } = await identifiantsStockAPI.listByOffre(Number(offreId))
    setStocks(Array.isArray(data) ? data : [])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Stock d'identifiants</h1>
        <p className="text-gray-600 mb-6">
          Le stock sera utilisé automatiquement après paiement réussi. Livraison manuelle reste possible.
        </p>

        <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap items-center gap-4">
          <label className="font-semibold">Offre</label>
          <select
            value={offreId}
            onChange={(e) => setOffreId(e.target.value)}
            className="px-3 py-2 border rounded-lg min-w-64"
          >
            {offres.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nomService || o.nom}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">Total: {stats.total}</div>
          <div className="text-sm text-green-700">Disponibles: {stats.disponibles}</div>
          <div className="text-sm text-orange-700">Utilisés: {stats.utilises}</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <form onSubmit={onAddOne} className="bg-white rounded-xl border p-4 space-y-3">
            <h2 className="font-bold">Ajouter un identifiant</h2>
            <input
              value={form.login}
              onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))}
              placeholder="Login / email"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder="Mot de passe"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
              placeholder="Instructions (optionnel)"
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg">Ajouter</button>
          </form>

          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h2 className="font-bold">Import en lot</h2>
            <p className="text-sm text-gray-600">Format: `login;password;instructions` (une ligne par identifiant)</p>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder="exemple@site.com;Pass123;Profil 1 uniquement"
              className="w-full px-3 py-2 border rounded-lg"
              rows={7}
            />
            <button onClick={onAddBulk} className="px-4 py-2 bg-slate-700 text-white rounded-lg">
              Importer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">Login</th>
                <th className="text-left py-3 px-4">Instructions</th>
                <th className="text-left py-3 px-4">Statut</th>
                <th className="text-left py-3 px-4">Souscription</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading &&
                stocks.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4">{s.login}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{s.instructions || '-'}</td>
                    <td className="py-3 px-4">
                      {s.isUsed ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Utilisé</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Disponible</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{s?.souscription?.reference || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && stocks.length === 0 && <div className="p-6 text-gray-500 text-sm">Aucun identifiant en stock</div>}
        </div>
      </div>
    </div>
  )
}
