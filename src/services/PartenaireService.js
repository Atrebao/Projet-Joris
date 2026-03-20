import axiosInstance from './axios';

/**
 * Service pour gérer les partenaires
 */
const PartenaireService = {
    /**
     * Récupérer tous les partenaires
     */
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
            if (filters.isValidated !== undefined) params.append('isValidated', filters.isValidated);
            if (filters.ville) params.append('ville', filters.ville);

            const response = await axiosInstance.get(`/partenaire?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer un partenaire par son ID
     */
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/partenaire/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Créer un nouveau partenaire (inscription)
     */
    create: async (partenaireData) => {
        try {
            const response = await axiosInstance.post('/partenaire', partenaireData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mettre à jour un partenaire
     */
    update: async (id, partenaireData) => {
        try {
            const response = await axiosInstance.patch(`/partenaire/${id}`, partenaireData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Valider un partenaire (Admin)
     */
    validate: async (id) => {
        try {
            const response = await axiosInstance.patch(`/partenaire/${id}/validate`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Activer/désactiver un partenaire (Admin)
     */
    toggleActive: async (id, isActive) => {
        try {
            const response = await axiosInstance.patch(`/partenaire/${id}/toggle-active`, { isActive });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les statistiques d'un partenaire
     */
    getStats: async (partenaireId) => {
        try {
            const response = await axiosInstance.get(`/partenaire/${partenaireId}/stats`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les statistiques de revenus d'un partenaire
     */
    getStatsRevenus: async (partenaireId) => {
        try {
            const response = await axiosInstance.get(`/partenaire/${partenaireId}/stats-revenus`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Supprimer un partenaire (Admin)
     */
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/partenaire/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default PartenaireService;
