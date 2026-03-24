import axiosInstance from './axios';

/**
 * Service pour les paiements CinetPay (Orange, MTN, Wave)
 * Correspond à POST /cinetpay/initiate
 */
const CinetPayService = {
  /**
   * Initier un paiement Mobile Money via CinetPay
   * @param {Object} data - { reference, montant, description, clientNom, clientPrenom, clientEmail, clientTelephone }
   * @returns {Promise<{ success, paymentUrl?, paymentToken?, data?, message? }>}
   */
  initiate: async (data) => {
    const response = await axiosInstance.post('/cinetpay/initiate', {
      reference: data.reference,
      montant: data.montant,
      description: data.description,
      clientNom: data.clientNom || 'Client',
      clientPrenom: data.clientPrenom || '',
      clientEmail: data.clientEmail,
      clientTelephone: data.clientTelephone,
    });
    return response.data;
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {string} transactionId - Référence de la transaction
   */
  verify: async (transactionId) => {
    const response = await axiosInstance.get('/cinetpay/verify', {
      params: { transaction_id: transactionId },
    });
    return response.data;
  },
};

export default CinetPayService;
