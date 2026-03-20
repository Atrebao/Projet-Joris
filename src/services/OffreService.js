import axiosInstance from './axios';

/**
 * Service pour gérer les offres de streaming
 */
const OffreService = {
    /**
     * Récupérer toutes les offres avec filtres optionnels
     */
    getAllOffres: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.categorie) params.append('categorie', filters.categorie);
            if (filters.search) params.append('search', filters.search);
            if (filters.prixMin) params.append('prixMin', filters.prixMin);
            if (filters.prixMax) params.append('prixMax', filters.prixMax);
            if (filters.duree) params.append('duree', filters.duree);
            if (filters.partenaireId) params.append('partenaireId', filters.partenaireId);

            const response = await axiosInstance.get(`/offre-partenaire?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer une offre par son ID
     */
    getOffreById: async (id) => {
        try {
            const response = await axiosInstance.get(`/offre-partenaire/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Rechercher des offres par nom de service
     */
    searchOffres: async (query) => {
        try {
            const response = await axiosInstance.get(`/offre-partenaire/search?q=${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Filtrer les offres par catégorie
     */
    getOffresByCategorie: async (categorie) => {
        try {
            const response = await axiosInstance.get(`/offre-partenaire/categorie/${categorie}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Créer une nouvelle offre (Partenaire)
     */
    createOffre: async (offreData) => {
        try {
            const response = await axiosInstance.post('/offre-partenaire', offreData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mettre à jour une offre (Partenaire)
     */
    updateOffre: async (id, offreData) => {
        try {
            const response = await axiosInstance.patch(`/offre-partenaire/${id}`, offreData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Supprimer une offre (Partenaire)
     */
    deleteOffre: async (id) => {
        try {
            const response = await axiosInstance.delete(`/offre-partenaire/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Récupérer les offres d'un partenaire spécifique
     */
    getOffresByPartenaire: async (partenaireId) => {
        try {
            const response = await axiosInstance.get(`/offre-partenaire/partenaire/${partenaireId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default OffreService;
