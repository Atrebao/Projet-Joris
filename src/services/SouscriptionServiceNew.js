import axiosInstance from './axios';

/**
 * Service pour gérer les souscriptions
 */
const SouscriptionServiceNew = {
    /**
     * Récupérer toutes les souscriptions avec filtres
     */
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.etat) params.append('etat', filters.etat);
            if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
            if (filters.dateFin) params.append('dateFin', filters.dateFin);
            if (filters.search) params.append('param', filters.search);

            const response = await axiosInstance.get(`/souscription?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer une souscription par son ID
     */
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/souscription/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Créer une nouvelle souscription
     */
    create: async (souscriptionData) => {
        try {
            const response = await axiosInstance.post('/souscription', souscriptionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Vérifier le statut de paiement par référence
     */
    checkPaymentStatus: async (reference) => {
        try {
            const response = await axiosInstance.get(`/souscription/payment-status/${reference}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les statistiques
     */
    getStats: async (periode = 'ANNEE', annee, mois, dateDebut, dateFin) => {
        try {
            const params = new URLSearchParams();
            params.append('periode', periode);
            if (annee) params.append('annee', annee);
            if (mois) params.append('mois', mois);
            if (dateDebut) params.append('dateDebut', dateDebut);
            if (dateFin) params.append('dateFin', dateFin);

            const response = await axiosInstance.get(`/souscription/stats?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer le graphe du chiffre d'affaires
     */
    getChartData: async (periode = 'ANNEE', annee, mois, dateDebut, dateFin) => {
        try {
            const params = new URLSearchParams();
            params.append('periode', periode);
            if (annee) params.append('annee', annee);
            if (mois) params.append('mois', mois);
            if (dateDebut) params.append('dateDebut', dateDebut);
            if (dateFin) params.append('dateFin', dateFin);

            const response = await axiosInstance.get(`/souscription/chart?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Modifier l'état d'une souscription
     */
    updateEtat: async (id, etat) => {
        try {
            const response = await axiosInstance.patch(`/souscription/${id}/etat`, { etat });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les souscriptions d'un utilisateur
     */
    getByUser: async (userId) => {
        try {
            const response = await axiosInstance.get(`/souscription/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les souscriptions actives expirant bientôt
     */
    getExpiringSoon: async (days = 7) => {
        try {
            const response = await axiosInstance.get(`/souscription/expiring-soon?days=${days}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default SouscriptionServiceNew;
