import React from 'react'
import { NavLink } from 'react-router-dom'


export default function Conditions() {
  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='max-w-4xl mx-auto px-4 py-28 md:py-[100px]'>
        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Conditions Générales d'Utilisation
        </h1>

        {/* Introduction */}
        <p className="text-sm md:text-base text-gray-700 mb-6">
          Bienvenue et merci d'utiliser notre service de streaming. En accédant ou en utilisant nos services, vous acceptez de respecter les conditions générales d'utilisation détaillées ci-dessous. 
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              1. Utilisation du Code d'Abonnement
            </h2>
            <p className="text-sm md:text-base text-gray-700">
              Après avoir effectué le paiement, vous recevrez un code d'abonnement unique. Ce code ne peut être utilisé que sur un seul appareil. 
              Une fois connecté, vous ne pourrez pas vous déconnecter pour vous connecter sur un autre appareil. Veuillez donc bien choisir l'appareil que vous souhaitez utiliser pour accéder au service. 
              <strong> Si vous souhaitez utiliser le service sur plusieurs appareils, comme un téléphone et un ordinateur, vous devrez souscrire à deux abonnements distincts.</strong>
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              2. Restrictions du Profil Utilisateur
            </h2>
            <p className="text-sm md:text-base text-gray-700">
              Vous n'avez pas le droit de modifier le mot de passe de votre compte, ni le nom ou les informations de votre profil. Vous n'êtes pas autorisé non plus à supprimer un profil existant.
              Ces mesures sont en place pour garantir la sécurité et la stabilité de nos services.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              3. Renouvellement de l'Abonnement
            </h2>
            <p className="text-sm md:text-base text-gray-700">
              Pour éviter toute interruption de service, nous vous recommandons de renouveler votre abonnement avant son expiration. En cas de non-renouvellement, vous risquez d'être automatiquement déconnecté de votre appareil.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              4. Acceptation des Conditions d'Utilisation
            </h2>
            <p className="text-sm md:text-base text-gray-700">
              En utilisant nos services, vous reconnaissez avoir lu et accepté ces conditions d'utilisation. Vous consentez également à ce que votre abonnement puisse être annulé sans remboursement en cas de non-respect de ces règles.
            </p>
          </section>
        </div>

        {/* Note de bas de page */}
        <p className="text-xs md:text-sm text-gray-500 italic mt-8">
          Ces conditions générales peuvent être mises à jour de temps à autre. Nous vous encourageons à consulter cette page régulièrement pour rester informé de nos conditions d'utilisation actuelles.
        </p>
      </div>
    </div>
  )
}
