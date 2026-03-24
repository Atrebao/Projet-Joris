import axiosInstance from './axios';

/**
 * Service pour les paiements BillMap (OpenAPI, Moov)
 * Correspond à POST /billmap/debit/openapi et POST /billmap/debit/moov
 */
const BillMapService = {
  /**
   * Débit via BillMap OpenAPI (compte RICHSTREAM)
   * @param {Object} data - { montant, numeroTelephone, reference, description?, devise? }
   * @param {string} env - 'uat' | 'production'
   */
  debitOpenApi: async (data, env = 'uat') => {
    const response = await axiosInstance.post('/billmap/debit/openapi', {
      montant: data.montant,
      numeroTelephone: data.numeroTelephone,
      reference: data.reference,
      description: data.description,
      devise: data.devise || 'XOF',
    }, {
      params: { env },
    });
    return response.data;
  },

  /**
   * Débit via BillMap Moov (compte RICHSTREAM_MOOV)
   * @param {Object} data - { montant, numeroTelephone, reference, description?, devise? }
   * @param {string} env - 'uat' | 'production'
   */
  debitMoov: async (data, env = 'uat') => {
    const response = await axiosInstance.post('/billmap/debit/moov', {
      montant: data.montant,
      numeroTelephone: data.numeroTelephone,
      reference: data.reference,
      description: data.description,
      devise: data.devise || 'XOF',
    }, {
      params: { env },
    });
    return response.data;
  },

  /**
   * Débit unifié (provider: 'openapi' | 'moov')
   */
  debit: async (data, provider = 'openapi', env = 'uat') => {
    const response = await axiosInstance.post('/billmap/debit', {
      montant: data.montant,
      numeroTelephone: data.numeroTelephone,
      reference: data.reference,
      description: data.description,
      devise: data.devise || 'XOF',
    }, {
      params: { provider, env },
    });
    return response.data;
  },
};

export default BillMapService;
