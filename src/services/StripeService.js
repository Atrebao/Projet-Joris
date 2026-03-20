import axiosInstance from './axios';

/**
 * Service pour gérer les paiements Stripe
 */
const StripeService = {
    /**
     * Créer une session de paiement Stripe
     */
    createSession: async (data) => {
        try {
            const response = await axiosInstance.post('/stripe/create-session', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Vérifier le statut d'une session
     */
    getSessionStatus: async (sessionId) => {
        try {
            const response = await axiosInstance.get(`/stripe/session/${sessionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Créer un lien de paiement
     */
    createPaymentLink: async (data) => {
        try {
            const response = await axiosInstance.post('/stripe/create-payment-link', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Demander un remboursement
     */
    refund: async (paymentIntentId, montant) => {
        try {
            const response = await axiosInstance.post('/stripe/refund', {
                paymentIntentId,
                montant,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default StripeService;
