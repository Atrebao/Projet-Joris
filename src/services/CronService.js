import axiosInstance from './axios';

/**
 * Service pour gérer le Cron et les tâches planifiées
 */
const CronService = {
    /**
     * Forcer une vérification manuelle des expirations
     */
    checkExpirations: async () => {
        try {
            const response = await axiosInstance.post('/cron/check-expirations');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default CronService;
