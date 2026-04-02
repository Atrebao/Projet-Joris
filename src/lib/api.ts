import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
//const API_URL = import.meta.env.VITE_API_URL || 'https://projet-joris-api.onrender.com/'


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('partenaire')
      localStorage.removeItem('infoUser')
      const isHashRouter = window.location.href.includes('#')
      const loginPath = isHashRouter ? '/#/backoffice/login' : '/backoffice/login'
      if (!window.location.pathname.includes('login')) window.location.href = loginPath
    }
    return Promise.reject(error)
  }
)

const withData = async (promise, mapper) => {
  const res = await promise
  return { ...res, data: mapper(res.data) }
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeOffre = (offre = {}) => {
  const forfaitsFromRelations = Array.isArray(offre.forfaitOffres)
    ? offre.forfaitOffres
        .map((fo) => fo?.forfait)
        .filter(Boolean)
        .map((f) => ({
          ...f,
          id: f.id,
          prix: toNumber(f.prix),
          duree: toNumber(f.duree, 1),
        }))
    : []

  const fallbackForfait = {
    id: `offre-${offre.id || Math.random()}`,
    plan: offre.typeCompte || 'Standard',
    prix: 0,
    duree: toNumber(offre.duree, 1),
    periode: 'MOIS',
  }

  const forfaits =
    Array.isArray(offre.forfaits) && offre.forfaits.length > 0
      ? offre.forfaits
      : forfaitsFromRelations.length > 0
        ? forfaitsFromRelations
        : [fallbackForfait]

  return {
    ...offre,
    nom: offre.nom ?? offre.nomService ?? '',
    nomService: offre.nomService ?? offre.nom ?? '',
    image: offre.image ?? offre.imageService ?? '',
    imageService: offre.imageService ?? offre.image ?? '',
    stock: offre.stock ?? offre.quantiteDisponible ?? 0,
    quantiteDisponible: offre.quantiteDisponible ?? offre.stock ?? 0,
    isDeleted: offre.isDeleted ?? false,
    forfaits,
  }
}

const normalizePromotion = (promotion = {}) => ({
  ...promotion,
  abonnementId: promotion.abonnementId ?? promotion.offreId ?? null,
  offreId: promotion.offreId ?? promotion.abonnementId ?? null,
})

const normalizeSouscription = (souscription = {}) => {
  const offrePartenaire = normalizeOffre(
    souscription.offrePartenaire || souscription.abonnement || souscription.offre || {}
  )

  const client = souscription.client || souscription.user || null
  const userAlias = client
    ? {
        id: client.id,
        nom: client.nom,
        prenoms: client.prenoms,
        email: client.email,
        numero: client.telephone || client.numero,
      }
    : undefined

  return {
    ...souscription,
    offrePartenaire,
    abonnement: {
      ...offrePartenaire,
      nom: offrePartenaire.nom,
      partenaire: offrePartenaire.partenaire,
    },
    client,
    user: souscription.user || userAlias,
  }
}

// API Auth
export const authAPI = {
  loginAdmin: (credentials) => api.post('/auth/admin/login', credentials),
  loginPartenaire: (credentials) => api.post('/auth/partenaire/login', credentials),
  registerPartenaire: (data) => api.post('/auth/partenaire/register', data),
  me: () => api.get('/auth/me'),
}

// API Partenaires
export const partenairesAPI = {
  getAll: () => api.get('/partenaires'),
  getOne: (id) => api.get(`/partenaires/${id}`),
  create: (data) => api.post('/partenaires/inscription', data),
  update: (id, data) => api.patch(`/partenaires/${id}`, data),
  validate: (id) => api.patch(`/partenaires/${id}/valider`),
  toggleActive: (id) => api.patch(`/partenaires/${id}/toggle-active`),
  getStats: (id) => api.get(`/partenaires/${id}/stats`),
}

// API Offres
export const offresAPI = {
  getAll: () => withData(api.get('/offres'), (data) => (Array.isArray(data) ? data.map(normalizeOffre) : [])),
  getOne: (id) => withData(api.get(`/offres/${id}`), normalizeOffre),
  getByPartenaire: (partenaireId) =>
    withData(api.get(`/offres/partenaire/${partenaireId}`), (data) => (Array.isArray(data) ? data.map(normalizeOffre) : [])),
  getByCategorie: (categorie) =>
    withData(api.get(`/offres/categorie/${categorie}`), (data) => (Array.isArray(data) ? data.map(normalizeOffre) : [])),
  search: (query) => withData(api.get(`/offres/search?q=${query}`), (data) => (Array.isArray(data) ? data.map(normalizeOffre) : [])),
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/offres/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  create: (data) => api.post('/offres', data),
  update: (id, data) => api.patch(`/offres/${id}`, data),
  toggleActive: (id) => api.patch(`/offres/${id}/toggle-active`),
  delete: (id) => api.delete(`/offres/${id}`),
}

export const forfaitsAPI = {
  getAll: (categorie) =>
    api.get('/forfaits/rechercher-forfaits', {
      params: categorie ? { categorie } : {},
    }),
  getOne: (id) => api.get(`/forfaits/rechercher-forfait/${id}`),
  create: (data) => api.post('/forfaits/enregistrer', data),
  update: (id, data) => api.post(`/forfaits/modifier/${id}`, data),
}

// API Codes promo
export const codesPromoAPI = {
  valider: (data) => api.post('/codes-promo/valider', data),
  create: (data) => api.post('/codes-promo/enregistrer', data),
  getByPromotion: (promotionId) => api.get(`/codes-promo/promotion/${promotionId}`),
  desactiver: (id) => api.post(`/codes-promo/desactiver/${id}`),
}

// API Promotions
export const promotionsAPI = {
  activesParAbonnement: (abonnementId) =>
    withData(api.get(`/promotions/actives/abonnement/${abonnementId}`), (data) =>
      Array.isArray(data) ? data.map(normalizePromotion) : []
    ),
  create: (data) => api.post('/promotions/enregistrer', data),
  update: (id, data) => api.post(`/promotions/modifier/${id}`, data),
  getByPartenaire: (partenaireId) =>
    withData(api.get(`/promotions/partenaire/${partenaireId}`), (data) =>
      Array.isArray(data) ? data.map(normalizePromotion) : []
    ),
  activer: (id) => api.post(`/promotions/activer/${id}`),
  desactiver: (id) => api.post(`/promotions/desactiver/${id}`),
  supprimer: (id) => api.delete(`/promotions/supprimer/${id}`),
}

// API Paiements BillMap (Unifiée)
// Tous les paiements passent par BillMap: MTN, Moov, Orange, Wave
export const billmapAPI = {
  debitMTN: (data) => api.post('/billmap/mtn', data),
  debitMoov: (data) => api.post('/billmap/moov', data),
  debitOrange: (data) => api.post('/billmap/orange', data),
  debitWave: (data) => api.post('/billmap/wave', data),
}

// API Paiements (alias pour retrocompatibilité)
export const paymentsAPI = {
  billmap: {
    debitMTN: (data) => api.post('/billmap/mtn', data),
    debitMoov: (data) => api.post('/billmap/moov', data),
    debitOrange: (data) => api.post('/billmap/orange', data),
    debitWave: (data) => api.post('/billmap/wave', data),
  },
}

// API Souscriptions
export const souscriptionsAPI = {
  getAll: (params) =>
    withData(api.get('/souscription/all', { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getByPartenaire: (partenaireId, params) =>
    withData(api.get(`/souscription/partenaire/${partenaireId}`, { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getOne: (id) => withData(api.get(`/souscription/rechercher-souscription/${id}`), normalizeSouscription),
  getALivrer: () => withData(api.get('/souscription/a-livrer'), (data) => (Array.isArray(data) ? data.map(normalizeSouscription) : [])),
  getAllByPartenaire: (partenaireId) =>
    withData(api.get(`/souscription/partenaire/${partenaireId}`), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getByEmail: (email) =>
    withData(api.get(`/souscription/by-email?${encodeURIComponent(email)}`), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getByReference: (reference) =>
    withData(api.get(`/souscription/reference/${encodeURIComponent(reference)}`), normalizeSouscription),
  livrer: (id, data) => api.patch(`/souscription/livrer/${id}`, data),
  create: (data) => api.post('/souscription/souscrire', data),
  creerDepuisPaiement: (data) => api.post('/souscription/creer-depuis-paiement', data),
  initierPaiement: (data) => api.post('/souscription/initier-paiement', data),
  updateEtat: (id, etat) => api.post(`/souscription/modifier-etat/${id}`, { etat }),
}

// API Abonnements (compatibilité front legacy vers /offres)
export const abonnementsAPI = {
  getAll: () => offresAPI.getAll(),
  getPublic: () => offresAPI.getAll(),
  getPopulaires: async () => {
    const res = await offresAPI.getAll()
    const sorted = [...(res.data || [])].sort((a, b) => {
      const da = new Date(a.dateCreation || 0).getTime()
      const db = new Date(b.dateCreation || 0).getTime()
      return db - da
    })
    return { ...res, data: sorted.slice(0, 8) }
  },
  getOne: (id) => offresAPI.getOne(id),
  getDetails: (id) => offresAPI.getOne(id),
  getByPartenaire: (partenaireId) => offresAPI.getByPartenaire(partenaireId),
  create: (data) => offresAPI.create(data),
  update: (id, data) => offresAPI.update(id, data),
  toggleActive: (id) => offresAPI.toggleActive(id),
  delete: (id) => offresAPI.delete(id),
}

// API Users/Clients
export const usersAPI = {
  getClients: (params) => api.get('/users/clients', { params }),
  getClient: (id) => api.get(`/users/clients/${id}`),
  getClientSouscriptions: (id) => api.get(`/users/clients/${id}/souscriptions`),
  getUsers: () => api.get('/users/rechercher-users'),
  createUser: (data) => api.post('/users/enregistrer', data),
  updateCredentials: (data) => api.post('/users/modifier-identifiants', data),
  deactivate: (userId) => api.post(`/users/desactiver/${userId}`),
}

export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getOne: (id) => api.get(`/clients/${id}`),
  getSouscriptions: (id) => api.get(`/clients/${id}/souscriptions`),
  getByEmail: (email) => api.post('/clients/get-by-email', { email }),
}

// API Stats
export const statsAPI = {
  adminDashboard: () => api.get('/stats/admin/dashboard'),
  topOffres: (limit) => api.get('/stats/admin/top-offres', { params: limit ? { limit } : {} }),
  partenaireDashboard: (id) => api.get(`/stats/partenaire/${id}/dashboard`),
  ca: (params) => api.get('/stats/ca', { params }),
  grapheCA: (params) => api.get('/stats/graphe-ca', { params }),
  global: () => api.get('/stats/admin/dashboard'),
  partenaire: (partenaireId) => api.get(`/stats/partenaire/${partenaireId}/dashboard`),
}

export default api
