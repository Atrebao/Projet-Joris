import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs
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

// API Auth
export const authAPI = {
  loginAdmin: (credentials: { email: string; password: string }) =>
    api.post('/auth/admin/login', credentials),

  loginPartenaire: (credentials: { email: string; password: string }) =>
    api.post('/auth/partenaire/login', credentials),

  registerPartenaire: (data: any) =>
    api.post('/auth/partenaire/register', data),

  me: () => api.get('/auth/me'),
}

// API Partenaires
export const partenairesAPI = {
  getAll: () => api.get('/partenaires'),
  getOne: (id: number) => api.get(`/partenaires/${id}`),
  create: (data: any) => api.post('/partenaires/inscription', data),
  update: (id: number, data: any) => api.patch(`/partenaires/${id}`, data),
  validate: (id: number) => api.patch(`/partenaires/${id}/valider`),
  toggleActive: (id: number) => api.patch(`/partenaires/${id}/toggle-active`),
  getStats: (id: number) => api.get(`/partenaires/${id}/stats`),
}

// API Offres (OffrePartenaire)
export const offresAPI = {
  getAll: () => api.get('/offres'),
  getOne: (id: number) => api.get(`/offres/${id}`),
  getByPartenaire: (partenaireId: number) =>
    api.get(`/offres/partenaire/${partenaireId}`),
  getByCategorie: (categorie: string) =>
    api.get(`/offres/categorie/${categorie}`),
  search: (query: string) => api.get(`/offres/search?q=${query}`),
  /** Upload image (JWT partenaire requis) — retourne { url: '/uploads/offres/...' } */
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/offres/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  create: (data: any) => api.post('/offres', data),
  update: (id: number, data: any) => api.patch(`/offres/${id}`, data),
  toggleActive: (id: number) => api.patch(`/offres/${id}/toggle-active`),
  delete: (id: number) => api.delete(`/offres/${id}`),
}

// API Codes promo
export const codesPromoAPI = {
  valider: (data: { code: string; partenaireId?: number; abonnementId?: number }) =>
    api.post('/codes-promo/valider', data),

  create: (data: { code: string; promotionId: number; nbUtilisationsMax?: number; dateExpiration?: Date }) =>
    api.post('/codes-promo/enregistrer', data),

  getByPromotion: (promotionId: number) =>
    api.get(`/codes-promo/promotion/${promotionId}`),

  desactiver: (id: number) =>
    api.post(`/codes-promo/desactiver/${id}`),
}

// API Promotions
export const promotionsAPI = {
  activesParAbonnement: (abonnementId: number) =>
    api.get(`/promotions/actives/abonnement/${abonnementId}`),

  create: (data: any) => api.post('/promotions/enregistrer', data),
  update: (id: number, data: any) => api.post(`/promotions/modifier/${id}`, data),
  getByPartenaire: (partenaireId: number) => api.get(`/promotions/partenaire/${partenaireId}`),
  activer: (id: number) => api.post(`/promotions/activer/${id}`),
  desactiver: (id: number) => api.post(`/promotions/desactiver/${id}`),
  supprimer: (id: number) => api.delete(`/promotions/supprimer/${id}`),
}

// API CinetPay
export const cinetpayAPI = {
  initiate: (data: any) => api.post('/cinetpay/initiate', data),
  verify: (transactionId: string) =>
    api.get(`/cinetpay/verify?transaction_id=${transactionId}`),
}

// API Souscriptions (backend: /souscription)
export const souscriptionsAPI = {
  getAll: (params?: { statut?: string; etat?: string; param?: string }) =>
    api.get('/souscription/rechercher-souscriptions', { params }),
  getByPartenaire: (partenaireId: number) =>
    api.get(`/souscription/rechercher-souscriptions`, { params: { partenaireId } }),
  getOne: (id: number) => api.get(`/souscription/rechercher-souscription/${id}`),
  getALivrer: () => api.get('/souscription/a-livrer'),
  getByEmail: (email: string) =>
    api.get(`/souscription/by-email/${encodeURIComponent(email)}`),
  getByReference: (reference: string) =>
    api.get(`/souscription/reference/${encodeURIComponent(reference)}`),
  livrer: (id: number, data: { login: string; password: string; instructions?: string }) =>
    api.patch(`/souscription/livrer/${id}`, data),
  create: (data: any) => api.post('/souscription/souscrire', data),
  creerDepuisPaiement: (data: {
    abonnementId: number
    forfaitId: number
    reference: string
    montant: number
    email: string
    telephone: string
    nom?: string
    prenoms?: string
    modePaiement?: string
    codePromo?: string
  }) => api.post('/souscription/creer-depuis-paiement', data),
  updateEtat: (id: number, etat: string) =>
    api.post(`/souscription/modifier-etat/${id}`, { etat }),
}

// API Abonnements
export const abonnementsAPI = {
  getAll: () => api.get('/abonnements/rechercher-abonnements'),
  getPublic: () => api.get('/abonnements/public'),
  getPopulaires: () => api.get('/abonnements/populaires'),
  getOne: (id: number) => api.get(`/abonnements/${id}`),
  getDetails: (id: number) => api.get(`/abonnements/rechercher-details/${id}`),
  getByPartenaire: (partenaireId: number) => api.get(`/abonnements/partenaire/${partenaireId}`),
  create: (data: any) => api.post('/abonnements/enregistrer', data),
  update: (id: number, data: any) => api.post(`/abonnements/modifier/${id}`, data),
  delete: (id: number) => api.delete(`/abonnements/supprimer/${id}`),
}

// API Users/Clients
export const usersAPI = {
  getClients: (params?: { search?: string; limit?: number }) => api.get('/users/clients', { params }),
  getClient: (id: number) => api.get(`/users/clients/${id}`),
  getClientSouscriptions: (id: number) => api.get(`/users/clients/${id}/souscriptions`),
  getUsers: () => api.get('/users/rechercher-users'),
  createUser: (data: any) => api.post('/users/enregistrer', data),
  updateCredentials: (data: any) => api.post('/users/modifier-identifiants', data),
  deactivate: (userId: number) => api.post(`/users/desactiver/${userId}`),
}

// API Clients (compatibilité)
export const clientsAPI = {
  getAll: (params?: any) => usersAPI.getClients(params),
  getByPartenaire: (partenaireId: number) => api.get(`/clients/partenaire/${partenaireId}`),
  getOne: (id: number) => usersAPI.getClient(id),
}

// API Stats
export const statsAPI = {
  adminDashboard: () => api.get('/stats/admin/dashboard'),
  topOffres: (limit?: number) => api.get('/stats/admin/top-offres', { params: limit ? { limit } : {} }),
  partenaireDashboard: (id: number) => api.get(`/stats/partenaire/${id}/dashboard`),
  ca: (params?: { dateDebut?: string; dateFin?: string; partenaireId?: number }) => api.get('/stats/ca', { params }),
  grapheCA: (params?: { periode?: string; annee?: number; mois?: number; dateDebut?: string; dateFin?: string }) => api.get('/stats/graphe-ca', { params }),
  global: () => api.get('/stats/admin/dashboard'),
  partenaire: (partenaireId: number) => api.get(`/stats/partenaire/${partenaireId}/dashboard`),
}

export default api
