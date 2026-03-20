import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Shield, CreditCard, RefreshCw, Lock, Mail, Phone } from 'lucide-react'

export default function Conditions() {
  const [openSection, setOpenSection] = useState(0)

  const sections = [
    {
      id: 0,
      title: '1. Introduction et Acceptation',
      icon: FileText,
      content: `En accédant et en utilisant la plateforme Richesses Streaming, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

Notre plateforme met en relation des clients avec des partenaires proposant des abonnements de streaming (Netflix, Spotify, Disney+, etc.) à prix réduits.`
    },
    {
      id: 1,
      title: '2. Services Proposés',
      icon: Shield,
      content: `Richesses Streaming est une plateforme de mise en relation permettant :
      
• La consultation d'offres d'abonnements streaming proposées par nos partenaires
• La comparaison des prix et des formules
• La souscription en ligne avec paiement sécurisé
• L'accès aux identifiants d'abonnement après paiement
• Le suivi de vos abonnements actifs

Nous agissons en tant qu'intermédiaire et ne sommes pas responsables du contenu des services de streaming tiers.`
    },
    {
      id: 2,
      title: '3. Paiement et Facturation',
      icon: CreditCard,
      content: `Modes de paiement acceptés :
      
• Carte bancaire (Visa, Mastercard) via Stripe
• Mobile Money (Orange Money, MTN, Moov, Wave) via CinetPay

Après validation du paiement :
• Vous recevez vos identifiants par email sous 5 minutes maximum
• Votre abonnement est activé immédiatement
• Vous pouvez accéder à vos identifiants depuis votre compte

Toutes les transactions sont sécurisées et cryptées selon les standards PCI-DSS.`
    },
    {
      id: 3,
      title: '4. Politique de Remboursement',
      icon: RefreshCw,
      content: `Conditions de remboursement :

✅ Remboursement possible dans les 24h suivant l'achat SI :
• Les identifiants fournis ne fonctionnent pas
• Le service n'est pas conforme à la description
• L'abonnement n'a pas été activé

❌ Aucun remboursement après :
• Utilisation des identifiants pendant plus de 24h
• Modification des identifiants par le client
• Partage non autorisé des identifiants

Pour demander un remboursement, contactez notre support avec votre référence de commande.`
    },
    {
      id: 4,
      title: '5. Protection des Données',
      icon: Lock,
      content: `Nous nous engageons à protéger vos données personnelles conformément au RGPD :

Données collectées :
• Email
• Numéro de téléphone
• Historique des transactions
• Préférences d'abonnement

Utilisation :
• Traitement de vos commandes
• Communication sur vos abonnements
• Amélioration de nos services

Vos données ne sont JAMAIS vendues à des tiers. Vous pouvez demander leur suppression à tout moment.`
    },
    {
      id: 5,
      title: '6. Politique de Cookies',
      icon: Shield,
      content: `Nous utilisons des cookies pour :

✓ Mémoriser vos préférences
✓ Analyser le trafic du site  
✓ Personnaliser votre expérience
✓ Sécuriser votre session

Types de cookies :
• Cookies essentiels (nécessaires au fonctionnement)
• Cookies analytiques (Google Analytics)
• Cookies de préférence

Vous pouvez désactiver les cookies non essentiels depuis les paramètres de votre navigateur.`
    },
    {
      id: 6,
      title: '7. Responsabilités',
      icon: Shield,
      content: `Vos responsabilités :
• Fournir des informations exactes
• Protéger vos identifiants
• Ne pas partager vos accès
• Signaler tout problème rapidement

Nos responsabilités :
• Fournir des identifiants valides
• Assurer la sécurité des paiements
• Traiter les réclamations sous 48h
• Respecter la confidentialité de vos données

Nous ne sommes pas responsables des interruptions de service causées par les plateformes de streaming tierces.`
    },
    {
      id: 7,
      title: '8. Modification des Conditions',
      icon: RefreshCw,
      content: `Nous nous réservons le droit de modifier ces conditions à tout moment.

En cas de modification :
• Vous serez informé par email
• Les changements prendront effet 7 jours après notification
• Continuer à utiliser le service implique l'acceptation des nouvelles conditions

Date de dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`
    }
  ]

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Message important */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                Votre confiance est notre priorité
              </h3>
              <p className="text-sm text-blue-800">
                Nous vous recommandons de lire attentivement ces conditions. Elles décrivent vos droits et obligations lors de l'utilisation de notre plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Sections en accordéon */}
        <div className="space-y-4 mb-12">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-all"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                {openSection === section.id ? (
                  <ChevronUp className="h-6 w-6 text-blue-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                )}
              </button>

              {openSection === section.id && (
                <div className="px-6 pb-6 animate-fadeIn">
                  <div className="pl-16 text-gray-700 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Des questions ?</h3>
          <p className="text-blue-100 mb-6">
            Notre équipe support est là pour vous aider
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Email</div>
                <div className="font-semibold">support@richesses.ci</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Téléphone</div>
                <div className="font-semibold">+225 XX XX XX XX XX</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} Richesses Streaming. Tous droits réservés.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
