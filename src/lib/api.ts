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
      window.location.href = '/login'
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

// API Offres
export const offresAPI = {
  getAll: () => api.get('/offres'),
  getOne: (id: number) => api.get(`/offres/${id}`),
  getByPartenaire: (partenaireId: number) =>
    api.get(`/offres/partenaire/${partenaireId}`),
  getByCategorie: (categorie: string) =>
    api.get(`/offres/categorie/${categorie}`),
  search: (query: string) => api.get(`/offres/search?q=${query}`),
  create: (data: any) => api.post('/offres', data),
  update: (id: number, data: any) => api.patch(`/offres/${id}`, data),
  toggleActive: (id: number) => api.patch(`/offres/${id}/toggle-active`),
  delete: (id: number) => api.delete(`/offres/${id}`),
}

// API CinetPay
export const cinetpayAPI = {
  initiate: (data: any) => api.post('/cinetpay/initiate', data),
  verify: (transactionId: string) =>
    api.get(`/cinetpay/verify?transaction_id=${transactionId}`),
}

// API Souscriptions (à implémenter côté backend)
export const souscriptionsAPI = {
  getAll: () => api.get('/souscriptions'),
  getByPartenaire: (partenaireId: number) =>
    api.get(`/souscriptions/partenaire/${partenaireId}`),
  getOne: (id: number) => api.get(`/souscriptions/${id}`),
  create: (data: any) => api.post('/souscriptions', data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/souscriptions/${id}/status`, { status }),
}

// API Abonnements
export const abonnementsAPI = {
  getAll: () => api.get('/abonnements/rechercher-abonnements'),
  getPublic: () => api.get('/abonnements/public'),
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
  partenaireDashboard: (id: number) => api.get(`/stats/partenaire/${id}/dashboard`),
  ca: (params?: { dateDebut?: string; dateFin?: string; partenaireId?: number }) => api.get('/stats/ca', { params }),
  grapheCA: (params?: { periode?: string; annee?: number; mois?: number; dateDebut?: string; dateFin?: string }) => api.get('/stats/graphe-ca', { params }),
  global: () => api.get('/stats/admin/dashboard'),
  partenaire: (partenaireId: number) => api.get(`/stats/partenaire/${partenaireId}/dashboard`),
}

export default api
