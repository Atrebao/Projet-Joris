import React,{useState} from 'react'

const PaymentPage = ({ formData }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const paymentMethods = [
      {
        id: 'wave',
        name: 'Wave',
        icon: '', // Vous pouvez remplacer par une vraie image
        color: 'bg-blue-500'
      },
      {
        id: 'orange',
        name: 'Orange Money',
        icon: '',
        color: 'bg-orange-500'
      },
      {
        id: 'mtn',
        name: 'MTN Money',
        icon: '',
        color: 'bg-yellow-500'
      },
      {
        id: 'visa',
        name: 'Carte Visa',
        icon: '',
        color: 'bg-indigo-500'
      }
    ];
  
    const handlePayment = async (method) => {
      setIsLoading(true);
      // Simuler un traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      // Ici, ajoutez votre logique de paiement
    };
  
    return (
      <div className="min-h-screen py-[65px] bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Récapitulatif de la commande */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-gray-600">
              <p>Nom: {formData.nomPrenoms}</p>
              <p>Abonnement: {formData.typeAbonnement}</p>
              <p>Montant: {/* Montant calculé */} FCFA</p>
            </div>
          </div>
  
          {/* Méthodes de paiement */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Choisissez votre moyen de paiement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between
                    ${selectedMethod === method.id 
                      ? `border-${method.color} bg-${method.color}/10` 
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </div>
                  {/* {selectedMethod === method.id && (
                    <Check className="h-5 w-5 text-green-500" />
                  )} */}
                </button>
              ))}
            </div>
  
            {/* Instructions de paiement */}
            {selectedMethod && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal ml-4 space-y-1 text-gray-600">
                  <li>Ouvrez votre application {selectedMethod === 'wave' ? 'Wave' : selectedMethod === 'orange' ? 'Orange Money' : 'MTN Money'}</li>
                  <li>Envoyez le montant au numéro: +225 07 58 28 48 83</li>
                  <li>Dans la description, mentionnez votre nom</li>
                  <li>Cliquez sur confirmer ci-dessous une fois le paiement effectué</li>
                </ol>
              </div>
            )}
  
            {/* Bouton de confirmation */}
            <button
              onClick={() => handlePayment(selectedMethod)}
              disabled={!selectedMethod || isLoading}
              className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition-colors
                ${selectedMethod 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement en cours...
                </span>
              ) : (
                'Confirmer le paiement'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default PaymentPage;
