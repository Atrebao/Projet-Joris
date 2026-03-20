import axiosInstance from './axios';

/**
 * Service pour gérer les configurations de la plateforme
 */
const ConfigurationService = {
    /**
     * Récupérer toutes les configurations
     */
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/configuration');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer une configuration par sa clé
     */
    getByKey: async (cle) => {
        try {
            const response = await axiosInstance.get(`/configuration/${cle}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer la valeur d'une configuration
     */
    getValue: async (cle) => {
        try {
            const config = await ConfigurationService.getByKey(cle);
            return config.valeur;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Créer une nouvelle configuration (Admin)
     */
    create: async (configData) => {
        try {
            const response = await axiosInstance.post('/configuration', configData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mettre à jour une configuration (Admin)
     */
    update: async (cle, configData) => {
        try {
            const response = await axiosInstance.patch(`/configuration/${cle}`, configData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Supprimer une configuration (Admin)
     */
    delete: async (cle) => {
        try {
            const response = await axiosInstance.delete(`/configuration/${cle}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Initialiser les configurations par défaut
     */
    initDefaults: async () => {
        try {
            const response = await axiosInstance.post('/configuration/init/defaults');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default ConfigurationService;
