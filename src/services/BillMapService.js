import axiosInstance from './axios';

/**
 * Service pour tous les paiements BillMap
 * Supporte les modes de paiement: MTN, Moov, Orange, Wave
 */
const BillMapService = {
  /**
   * Débit via MTN Mobile Money (via OpenAPI)
   * @param {Object} data - { montant, numeroTelephone, reference, description? }
   */
  debitMTN: async (data) => {
    try {
      const response = await axiosInstance.post('/billmap/mtn', {
        montant: data.montant,
        numeroTelephone: data.numeroTelephone,
        reference: data.reference,
        description: data.description || `Paiement ${data.reference}`,
        operateur : data.operateur ,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur débit MTN:', error);
      throw error;
    }
  },

  /**
   * Débit via Moov Money
   * @param {Object} data - { montant, numeroTelephone, reference, description? }
   */
  debitMoov: async (data) => {
    try {
      const response = await axiosInstance.post('/billmap/moov', {
        montant: data.montant,
        numeroTelephone: data.numeroTelephone,
        reference: data.reference,
        description: data.description || `Paiement ${data.reference}`,
        operateur : data.operateur ,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur débit Moov:', error);
      throw error;
    }
  },

  /**
   * Débit via Orange Money
   * @param {Object} data - { montant, numeroTelephone, reference, description?, otp? }
   * OTP peut être optionnel selon le processus BillMap
   */
  debitOrange: async (data) => {
    try {
      const response = await axiosInstance.post('/billmap/orange', {
        montant: data.montant,
        numeroTelephone: data.numeroTelephone,
        reference: data.reference,
        description: data.description || `Paiement ${data.reference}`,
        otp: data.otp,
        operateur : data.operateur ,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur débit Orange:', error);
      throw error;
    }
  },

  /**
   * Débit via Wave Money
   * @param {Object} data - { montant, numeroTelephone, reference, description? }
   */
  debitWave: async (data) => {
    try {
      const response = await axiosInstance.post('/billmap/wave', {
        montant: data.montant,
        numeroTelephone: data.numeroTelephone,
        reference: data.reference,
        description: data.description || `Paiement ${data.reference}`,
        operateur : data.operateur ,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur débit Wave:', error);
      throw error;
    }
  },

  /**
   * Débit unifié - sélectionne automatiquement le provider selon l'ID du mode de paiement
   * @param {Object} data - { montant, numeroTelephone, reference, description?, paymentMethod? }
   * @param {string} paymentMethod - 'mtn' | 'moov' | 'orange' | 'wave'
   */
  debit: async (data, paymentMethod = 'moov') => {
    try {
      const paymentMethodLower = paymentMethod?.toLowerCase() || 'moov';
      
      const requestData = {
        montant: data.montant,
        numeroTelephone: data.numeroTelephone,
        reference: data.reference,
        description: data.description || `Paiement ${data.reference}`,
        operateur : data.operateur ,
      };

      // Inclure OTP pour Orange si fourni
      if (paymentMethodLower === 'orange' && data.otp) {
        requestData.otp = data.otp;
      }

      const response = await axiosInstance.post(`/billmap/${paymentMethodLower}`, requestData);
      return response.data;
    } catch (error) {
      console.error(`Erreur débit ${paymentMethod}:`, error);
      throw error;
    }
  },
};

export default BillMapService;
