import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Créer une instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête - Ajouter le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs globalement
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 (non autorisé) et pas déjà en train de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de refresh du token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/#/backoffice/login';
        return Promise.reject(refreshError);
      }
    }

    // Gestion des autres erreurs
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const message = error.response.data?.message || 'Une erreur est survenue';

      switch (error.response.status) {
        case 400:
          toast.error(`Erreur de validation : ${message}`);
          break;
        case 403:
          toast.error('Accès refusé');
          break;
        case 404:
          toast.error('Ressource introuvable');
          break;
        case 500:
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      toast.error('Impossible de contacter le serveur');
    } else {
      // Erreur lors de la configuration de la requête
      toast.error('Erreur lors de la requête');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
