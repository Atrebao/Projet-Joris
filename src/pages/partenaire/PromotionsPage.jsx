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
} from 'lucide-react'
import { promotionsAPI, codesPromoAPI, offresAPI } from '../../lib/api'
import { getPartenaireId } from '../../Utils/Utils'

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

  const [expandedPromotionId, setExpandedPromotionId] = useState(null)
  const [codesByPromotion, setCodesByPromotion] = useState({})
  const [codesLoadingFor, setCodesLoadingFor] = useState(null)

  const emptyPromotionForm = useMemo(
    () => ({
      id: null,
      nom: '',
      description: '',
      type: 'POURCENTAGE',
      valeur: '',
      dateDebut: '',
      dateFin: '',
      abonnementId: '',
    }),
    []
  )

  const [promoForm, setPromoForm] = useState(emptyPromotionForm)
  const [promoSubmitting, setPromoSubmitting] = useState(false)

  const [codeForm, setCodeForm] = useState({
    code: '',
    nbUtilisationsMax: -1,
    dateExpiration: '',
  })

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const load = async () => {
    setLoading(true)
    try {
      const [offresRes, promosRes] = await Promise.all([
        offresAPI.getByPartenaire(partenaireId),
        promotionsAPI.getByPartenaire(partenaireId),
      ])

      setOffres(Array.isArray(offresRes.data) ? offresRes.data : [])
      setPromotions(Array.isArray(promosRes.data) ? promosRes.data : [])
    } catch (e) {
      console.error(e)
      toast.error('Impossible de charger les promotions')
    } finally {
      setLoading(false)
    }
  }

  const offreLabelById = (id) => offres.find((o) => Number(o.id) === Number(id))?.nom || 'Toutes offres'

  const submitPromotion = async (e) => {
    e.preventDefault()
    setPromoSubmitting(true)
    try {
      const payload = {
        nom: promoForm.nom.trim(),
        description: promoForm.description || undefined,
        type: promoForm.type,
        valeur: Number(promoForm.valeur),
        dateDebut: promoForm.dateDebut ? new Date(promoForm.dateDebut) : undefined,
        dateFin: promoForm.dateFin ? new Date(promoForm.dateFin) : undefined,
        partenaireId,
        abonnementId: promoForm.abonnementId ? Number(promoForm.abonnementId) : undefined,
      }

      if (promoForm.id) {
        await promotionsAPI.update(promoForm.id, payload)
        toast.success('Promotion mise à jour')
      } else {
        await promotionsAPI.create(payload)
        toast.success('Promotion créée')
      }

      setPromoForm(emptyPromotionForm)
      await load()
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || "Erreur lors de l'enregistrement de la promotion")
    } finally {
      setPromoSubmitting(false)
    }
  }

  const editPromotion = (p) => {
    setPromoForm({
      id: p.id,
      nom: p.nom || '',
      description: p.description || '',
      type: p.type || 'POURCENTAGE',
      valeur: String(p.valeur ?? ''),
      dateDebut: toDateInput(p.dateDebut),
      dateFin: toDateInput(p.dateFin),
      abonnementId: p.abonnementId ? String(p.abonnementId) : '',
    })
    setExpandedPromotionId(null)
  }

  const cancelEdit = () => {
    setPromoForm(emptyPromotionForm)
    setExpandedPromotionId(null)
  }

  const togglePromoActive = async (p, active) => {
    try {
      if (active) {
        await promotionsAPI.activer(p.id)
      } else {
        await promotionsAPI.desactiver(p.id)
      }
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const deletePromotion = async (p) => {
    if (!confirm('Supprimer cette promotion ?')) return
    try {
      await promotionsAPI.supprimer(p.id)
      toast.success('Promotion supprimée')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Erreur suppression promotion')
    }
  }

  const loadCodesFor = async (promotionId) => {
    setCodesLoadingFor(promotionId)
    try {
      const res = await codesPromoAPI.getByPromotion(promotionId)
      setCodesByPromotion((prev) => ({
        ...prev,
        [promotionId]: Array.isArray(res.data) ? res.data : [],
      }))
    } catch (e) {
      console.error(e)
      toast.error('Impossible de charger les codes promo')
    } finally {
      setCodesLoadingFor(null)
    }
  }

  const toggleExpanded = async (promotionId) => {
    setExpandedPromotionId((prev) => (prev === promotionId ? null : promotionId))
    if (expandedPromotionId !== promotionId && !codesByPromotion[promotionId]) {
      await loadCodesFor(promotionId)
    }
  }

  const submitCode = async (promotionId) => {
    try {
      const code = codeForm.code.trim()
      if (!code) {
        toast.error('Code promo requis')
        return
      }

      await codesPromoAPI.create({
        code,
        promotionId,
        nbUtilisationsMax: Number(codeForm.nbUtilisationsMax ?? -1),
        dateExpiration: codeForm.dateExpiration ? new Date(codeForm.dateExpiration) : undefined,
      })

      toast.success('Code promo créé')
      await loadCodesFor(promotionId)
      setCodeForm({ code: '', nbUtilisationsMax: -1, dateExpiration: '' })
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || 'Erreur création code promo')
    }
  }

  const disableCode = async (codePromo) => {
    try {
      await codesPromoAPI.desactiver(codePromo.id)
      toast.success('Code promo désactivé')
      await loadCodesFor(codePromo.promotionId)
    } catch (e) {
      console.error(e)
      toast.error('Erreur désactivation code')
    }
  }

  const codesOfExpanded = expandedPromotionId ? codesByPromotion[expandedPromotionId] || [] : []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Tags className="h-8 w-8 text-slate-700" />
            Promotions & Codes promo
          </h1>
          <p className="text-gray-600">Gérez les réductions de vos offres (optionnellement liées à une offre précise).</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            Chargement...
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{promoForm.id ? 'Modifier promotion' : 'Créer promotion'}</h2>
                {promoForm.id ? (
                  <button onClick={cancelEdit} className="text-sm text-slate-600 hover:text-slate-900">
                    Annuler
                  </button>
                ) : null}
              </div>

              <form onSubmit={submitPromotion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                    value={promoForm.nom}
                    onChange={(e) => setPromoForm((s) => ({ ...s, nom: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm((s) => ({ ...s, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                      value={promoForm.type}
                      onChange={(e) => setPromoForm((s) => ({ ...s, type: e.target.value }))}
                    >
                      <option value="POURCENTAGE">Pourcentage</option>
                      <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valeur *</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                      value={promoForm.valeur}
                      onChange={(e) => setPromoForm((s) => ({ ...s, valeur: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date début *</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                      value={promoForm.dateDebut}
                      onChange={(e) => setPromoForm((s) => ({ ...s, dateDebut: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date fin *</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                      value={promoForm.dateFin}
                      onChange={(e) => setPromoForm((s) => ({ ...s, dateFin: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offre concernée (optionnel)
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                    value={promoForm.abonnementId}
                    onChange={(e) => setPromoForm((s) => ({ ...s, abonnementId: e.target.value }))}
                  >
                    <option value="">Toutes offres</option>
                    {offres.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={promoSubmitting}
                  type="submit"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {promoSubmitting ? '...' : promoForm.id ? 'Enregistrer' : 'Créer'}
                </button>
              </form>
            </div>

            {/* Liste promotions */}
            <div className="space-y-4">
              {promotions.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center text-gray-600">
                  Aucune promotion pour le moment.
                </div>
              ) : (
                promotions.map((p) => {
                  const connectedOffre = p.abonnementId ? offreLabelById(p.abonnementId) : 'Toutes offres'
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg truncate">{p.nom}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {p.enabled ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {p.type === 'POURCENTAGE'
                              ? `-${Number(p.valeur) || 0}%`
                              : `-${Number(p.valeur) || 0} FCFA`}
                            {' '}• {connectedOffre}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '-'} -{' '}
                            {p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : '-'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editPromotion(p)}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="h-5 w-5 text-slate-700" />
                          </button>
                          <button
                            onClick={() => togglePromoActive(p, !p.enabled)}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                            title={p.enabled ? 'Désactiver' : 'Activer'}
                          >
                            {p.enabled ? <XCircle className="h-5 w-5 text-orange-600" /> : <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          </button>
                          <button
                            onClick={() => deletePromotion(p)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(p.id)}
                          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold"
                        >
                          <Code className="h-4 w-4" />
                          {expandedPromotionId === p.id ? 'Masquer codes' : 'Gérer codes'}
                        </button>
                        <div className="text-xs text-gray-500">
                          {p.abonnementId ? `Offre ${p.abonnementId}` : 'Non lié'}
                        </div>
                      </div>

                      {expandedPromotionId === p.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {codesLoadingFor === p.id ? (
                            <div className="text-sm text-gray-600">Chargement des codes...</div>
                          ) : (
                            <>
                              {/* Form code */}
                              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                <input
                                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                                  placeholder="Code (ex: SAVE20)"
                                  value={codeForm.code}
                                  onChange={(e) => setCodeForm((s) => ({ ...s, code: e.target.value }))}
                                />
                                <input
                                  type="number"
                                  className="w-full sm:w-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                                  value={codeForm.nbUtilisationsMax}
                                  onChange={(e) => setCodeForm((s) => ({ ...s, nbUtilisationsMax: e.target.value }))}
                                  title="Limite d'utilisations (-1 = illimité)"
                                />
                                <input
                                  type="date"
                                  className="w-full sm:w-44 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                                  value={codeForm.dateExpiration}
                                  onChange={(e) => setCodeForm((s) => ({ ...s, dateExpiration: e.target.value }))}
                                />
                                <button
                                  type="button"
                                  onClick={() => submitCode(p.id)}
                                  className="px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Ajouter
                                </button>
                              </div>

                              {/* Codes */}
                              <div className="space-y-2">
                                {(codesByPromotion[p.id] || []).length === 0 ? (
                                  <div className="text-sm text-gray-600">Aucun code pour cette promotion.</div>
                                ) : (
                                  (codesByPromotion[p.id] || []).map((cp) => (
                                    <div key={cp.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="min-w-0">
                                        <div className="font-semibold truncate">{cp.code}</div>
                                        <div className="text-xs text-gray-500">
                                          Utilisations: {cp.nbUtilisations}{' '}
                                          {cp.nbUtilisationsMax === -1 ? '(illimité)' : `/ ${cp.nbUtilisationsMax}`}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Exp: {cp.dateExpiration ? new Date(cp.dateExpiration).toLocaleDateString('fr-FR') : '-'}
                                        </div>
                                        <div className="text-xs mt-1">
                                          <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${cp.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {cp.enabled ? 'Actif' : 'Inactif'}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => disableCode(cp)}
                                        disabled={!cp.enabled}
                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 transition-all"
                                      >
                                        <span className="text-red-600">Désactiver</span>
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

