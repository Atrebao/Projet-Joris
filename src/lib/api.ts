import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
  if (res.data && Array.isArray(res.data.data)) {
    return {
      ...res,
      data: {
        ...res.data,
        data: mapper(res.data.data),
      },
    }
  }
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
          duree: toNumber(f.duree, 1),
        }))
    : []

  const fallbackForfait = {
    id: `offre-${offre.id || Math.random()}`,
    plan: offre.typeCompte || 'Standard',
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
    service: offre.service ?? offre.nomService ?? offre.nom ?? '',
    titreOffre: offre.titreOffre ?? offre.nom ?? offre.nomService ?? '',
    image: offre.image ?? offre.imageService ?? '',
    imageService: offre.imageService ?? offre.image ?? '',
    prix: toNumber(offre.prixVente ?? offre.prixOriginal ?? offre.prix, 0),
    prixVente: toNumber(offre.prixVente ?? offre.prixOriginal ?? offre.prix, 0),
    prixOriginal: toNumber(offre.prixOriginal ?? offre.prixVente ?? offre.prix, 0),
    stock: offre.stock ?? offre.quantiteDisponible ?? 0,
    quantiteDisponible: offre.quantiteDisponible ?? offre.stock ?? 0,
    isDeleted: offre.isDeleted ?? false,
    forfaits,
    ventes: toNumber(offre.ventes, 0),
    revenu: toNumber(offre.revenu, 0),
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
  forgotPasswordPartenaire: (email) => api.post('/partenaires/forgot-password', { email }),
  me: () => api.get('/auth/me'),
}

// API Partenaires
export const partenairesAPI = {
  getAll: (params) => api.get('/partenaires', { params }),
  getOne: (id) => api.get(`/partenaires/${id}`),
  getById: (id) => api.get(`/partenaires/${id}`),
  create: (data) => api.post('/partenaires/inscription', data),
  update: (id, data) => api.patch(`/partenaires/${id}`, data),
  valider: (id) => api.patch(`/partenaires/${id}/valider`),
  validate: (id) => api.patch(`/partenaires/${id}/valider`),
  toggleActive: (id) => api.patch(`/partenaires/${id}/toggle-active`),
  getStats: (id) => api.get(`/partenaires/${id}/stats`),
  updateCommission: (id, newCommission, commissionActive = true) => {
    if (typeof newCommission === 'object' && newCommission !== null) {
      return api.patch(`/partenaires/${id}/update-commission`, {
        newCommission: newCommission.tauxCommission ?? newCommission.newCommission,
        commissionActive: newCommission.isCommissionActive ?? newCommission.commissionActive ?? true,
      })
    }
    return api.patch(`/partenaires/${id}/update-commission`, { newCommission, commissionActive })
  },
  modifyPassword: (id, newPassword, confirmPassword) =>
    api.patch(`/partenaires/${id}/modify-password`, { newPassword, confirmPassword }),
}

// API Offres
export const offresAPI = {
  getAll: (params) =>
    withData(api.get('/offres', { params }), (data) => (Array.isArray(data) ? data.map(normalizeOffre) : [])),
  getOne: (id) => withData(api.get(`/offres/${id}`), normalizeOffre),
  getByPartenaire: (partenaireId, params) =>
    withData(api.get(`/offres/partenaire/${partenaireId}`, { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeOffre) : []
    ),
  getByCategorie: (categorie, params) =>
    withData(api.get(`/offres/categorie/${categorie}`, { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeOffre) : []
    ),
  search: (query, params) =>
    withData(api.get(`/offres/search`, { params: { q: query, ...params } }), (data) =>
      Array.isArray(data) ? data.map(normalizeOffre) : []
    ),
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
  getAll: (partenaireId) =>
    api.get('/forfaits/rechercher-forfaits', {
      params: {
        ...(partenaireId ? { partenaireId } : {}),
      },
    }),
  getOne: (id, partenaireId) =>
    api.get(`/forfaits/rechercher-forfait/${id}`, {
      params: partenaireId ? { partenaireId } : {},
    }),
  create: (data) => api.post('/forfaits/enregistrer', data),
  update: (id, data) => api.post(`/forfaits/modifier/${id}`, data),
  delete: (id) => api.post(`/forfaits/supprimer/${id}`),
  supprimer: (id) => api.post(`/forfaits/supprimer/${id}`),
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
export const billmapAPI = {
  debit: (data) => api.post('/billmap/debit', data),
  debitMTN: (data) => api.post('/billmap/mtn', data),
  debitMoov: (data) => api.post('/billmap/moov', data),
  debitOrange: (data) => api.post('/billmap/orange', data),
  debitWave: (data) => api.post('/billmap/wave', data),
}

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
  getSouscriptionsByPartenaire: (partenaireId, params) =>
    withData(api.get(`/souscription/partenaire/${partenaireId}/souscriptions`, { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getOne: (id) => withData(api.get(`/souscription/rechercher-souscription/${id}`), normalizeSouscription),
  getALivrer: () =>
    withData(api.get('/souscription/a-livrer'), (data) => (Array.isArray(data) ? data.map(normalizeSouscription) : [])),
  getAllByPartenaire: (partenaireId, params) =>
    withData(api.get(`/souscription/partenaire/${partenaireId}`, { params }), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getByEmail: (email) =>
    withData(api.post('/souscription/by-email', { email }), (data) => (Array.isArray(data) ? data.map(normalizeSouscription) : [])),
  getByClientId: (clientId) =>
    withData(api.get(`/souscription/by-client/${clientId}`), (data) => (Array.isArray(data) ? data.map(normalizeSouscription) : [])),
  getByReference: (reference) =>
    withData(api.get(`/souscription/reference/${encodeURIComponent(reference)}`), normalizeSouscription),
  livrer: (id, data) => api.patch(`/souscription/livrer/${id}`, data),
  create: (data) => api.post('/souscription/souscrire', data),
  creerDepuisPaiement: (data) => api.post('/souscription/creer-depuis-paiement', data),
  initierPaiement: (data) => api.post('/souscription/initier-paiement', data),
  updateEtat: (id, etat) => api.post(`/souscription/modifier-etat/${id}`, { etat }),
  transfererProfil: (id, targetStockId, notifyClient = true) =>
    api.post(`/souscription/${id}/transferer-profil`, { targetStockId, notifyClient }),
  getActivesByPartenaire: (partenaireId) =>
    withData(api.get(`/souscription/partenaire/${partenaireId}/actives`), (data) =>
      Array.isArray(data) ? data.map(normalizeSouscription) : []
    ),
  getByPseudoAndNumero: (data) =>
    withData(api.post('/souscription/by-pseudo-and-numero', data), (data) => (Array.isArray(data) ? data.map(normalizeSouscription) : [])),
}

// API Abonnements (compatibilité front legacy vers /offres)
export const abonnementsAPI = {
  getAll: (params) => offresAPI.getAll(params),
  getPublic: (params) => offresAPI.getAll(params),
  getPopulaires: async () => {
    const res = await offresAPI.getAll({ limit: 8 })
    const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    return { ...res, data: list }
  },
  getOne: (id) => offresAPI.getOne(id),
  getDetails: (id) => offresAPI.getOne(id),
  getByPartenaire: (partenaireId, params) => offresAPI.getByPartenaire(partenaireId, params),
  create: (data) => offresAPI.create(data),
  update: (id, data) => offresAPI.update(id, data),
  toggleActive: (id) => offresAPI.toggleActive(id),
  delete: (id) => offresAPI.delete(id),
}

// API Users/Clients
export const usersAPI = {
  getClients: (params) => api.get('/users/clients', { params }),
  getClientsWithSouscriptions: (params) => api.get('/clients/liste-avec-souscriptions', { params }),
  getClient: (id) => api.get(`/users/clients/${id}`),
  getClientSouscriptions: (id) => api.get(`/users/clients/${id}/souscriptions`),
  getUsers: () => api.get('/users/rechercher-users'),
  createUser: (data) => api.post('/users/enregistrer', data),
  updateCredentials: (data) => api.post('/users/modifier-identifiants', data),
  deactivate: (userId) => api.post(`/users/desactiver/${userId}`),
}

export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  getSouscriptions: (id) => api.get(`/clients/${id}/souscriptions`),
  getByEmail: (email) => api.post('/clients/get-by-email', { email }),
  getByPseudoAndNumero: (data) => api.post('/clients/find-by-pseudo-and-numero', data),
  create: (data) => api.post('/clients/enregistrer', data),
  register: (data) => api.post('/clients/register', data),
  login: (data) => api.post('/clients/login', data),
  resetPassword: (data) => api.post('/clients/reset-password', data),
}

export const identifiantsStockAPI = {
  createForOffre: (offreId, data) => api.post(`/identifiants-stock/offre/${offreId}`, data),
  createAccountWithProfiles: (offreId, data) => api.post(`/identifiants-stock/offre/${offreId}/compte-complet`, data),
  listByOffre: (offreId) => api.get(`/identifiants-stock/offre/${offreId}`),
  listByPartenaire: (partenaireId) => api.get(`/identifiants-stock/partenaire/${partenaireId}`),
  update: (id, data) => api.post(`/identifiants-stock/${id}/modifier`, data),
  delete: (id) => api.post(`/identifiants-stock/${id}/supprimer`),
}

export const precommandesAPI = {
  create: (data) => api.post('/precommandes', data),
  list: (params) => api.get('/precommandes', { params }),
  updateStatut: (id, statut) => api.post(`/precommandes/${id}/statut`, { statut }),
}

// API Reversements (Payouts)
export const reversementsAPI = {
  getAll: (params) => api.get('/reversements', { params }),
  getOne: (id) => api.get(`/reversements/${id}`),
  getAllBalances: (params) => api.get('/reversements/partenaires/balances', { params }),
  getBalance: (partenaireId) => api.get(`/reversements/partenaire/${partenaireId}/balance`),
  getPartenaireBalance: (partenaireId) => api.get(`/reversements/partenaire/${partenaireId}/balance`),
  getByPartenaire: (partenaireId, params) => api.get(`/reversements/partenaire/${partenaireId}`, { params }),
  create: (arg1, arg2) => {
    if (typeof arg1 === 'object' && arg1 !== null) {
      const pId = arg1.partenaireId
      return api.post(`/reversements/partenaire/${pId}`, arg1)
    }
    return api.post(`/reversements/partenaire/${arg1}`, arg2)
  },
  cancel: (id) => api.patch(`/reversements/${id}/annuler`),
}

// API Stats
export const statsAPI = {
  adminDashboard: () => api.get('/stats/admin/dashboard'),
  topOffres: (limit) => api.get('/stats/admin/top-offres', { params: limit ? { limit } : {} }),
  partenaireDashboard: (id) => api.get(`/stats/partenaire/${id}/dashboard`),
  partenaireDetailedStats: (id) => api.get(`/stats/partenaire/${id}/stats-detaillees`),
  ca: (params) => api.get('/stats/ca', { params }),
  grapheCA: (params) => api.get('/stats/graphe-ca', { params }),
  global: () => api.get('/stats/admin/dashboard'),
  partenaire: (partenaireId) => api.get(`/stats/partenaire/${partenaireId}/dashboard`),
}

// API WhatsApp (Baileys / Multi-Sessions Admin & Partenaires)
export const whatsappAPI = {
  // Endpoints Admin (Session plateforme / Notifications d'activation partenaires)
  getAdminStatus: () => api.get('/whatsapp/admin/status'),
  connectAdmin: () => api.post('/whatsapp/admin/connect'),
  disconnectAdmin: () => api.post('/whatsapp/admin/disconnect'),
  setAutoSendAdmin: (enabled) => api.post('/whatsapp/admin/auto-send', { enabled }),
  sendAdminTest: (to, message) => api.post('/whatsapp/admin/test', { to, message }),

  // Endpoints universels (Admin si pas de partenaireId, Partenaire sinon)
  getStatus: (partenaireId) =>
    partenaireId ? api.get(`/whatsapp/partenaire/${partenaireId}/status`) : api.get('/whatsapp/admin/status'),
  connect: (partenaireId) =>
    partenaireId ? api.post(`/whatsapp/partenaire/${partenaireId}/connect`) : api.post('/whatsapp/admin/connect'),
  disconnect: (partenaireId) =>
    partenaireId ? api.post(`/whatsapp/partenaire/${partenaireId}/disconnect`) : api.post('/whatsapp/admin/disconnect'),
  setAutoSend: (arg1, arg2) => {
    if (typeof arg1 === 'boolean') {
      return api.post('/whatsapp/admin/auto-send', { enabled: arg1 })
    }
    return api.post(`/whatsapp/partenaire/${arg1}/auto-send`, { enabled: arg2 })
  },
  sendTest: (arg1, arg2, arg3) => {
    if (typeof arg1 === 'string') {
      return api.post('/whatsapp/admin/test', { to: arg1, message: arg2 })
    }
    return api.post(`/whatsapp/partenaire/${arg1}/test`, { to: arg2, message: arg3 })
  },
}

export default api
