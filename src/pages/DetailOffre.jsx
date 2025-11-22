import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Shield, Zap, Users } from 'lucide-react'

export default function DetailOffre() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [offre, setOffre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')

  // Charger l'offre (simulation)
  useEffect(() => {
    const loadOffre = async () => {
      setLoading(true)
      
      // Simulation de données (à remplacer par votre API)
      const mockOffres = {
        1: {
          id: 1,
          nom: 'Netflix Premium',
          categorie: 'FILMS_SERIES',
          description: 'Abonnement Netflix Premium avec 4 écrans simultanés. Profitez de tout le catalogue Netflix en Ultra HD avec le meilleur son.',
          prixMensuel: 7000,
          duree: 1,
          partenaire: { nom: 'StreamPro', ville: 'Abidjan', note: 4.8, ventes: 245 },
          image: 'https://via.placeholder.com/800x450/dc2626/ffffff?text=Netflix+Premium',
          rating: 4.8,
          stock: 15,
          caracteristiques: [
            '4 écrans simultanés',
            'Qualité Ultra HD (4K)',
            'Téléchargement illimité',
            'Son surround disponible',
            'Accessible sur tous vos appareils'
          ],
          modeEmploi: [
            'Vous recevrez vos identifiants par email',
            'Connectez-vous sur netflix.com',
            'Profitez de votre abonnement immédiatement',
            'Support disponible 24/7'
          ]
        },
        2: {
          id: 2,
          nom: 'Spotify Family',
          categorie: 'MUSIQUE',
          description: 'Spotify Premium Family pour 6 comptes. Écoute illimitée sans pub avec téléchargements offline.',
          prixMensuel: 5000,
          duree: 1,
          partenaire: { nom: 'MusicHub', ville: 'Cocody', note: 4.9, ventes: 189 },
          image: 'https://via.placeholder.com/800x450/10b981/ffffff?text=Spotify+Family',
          rating: 4.9,
          stock: 20,
          caracteristiques: [
            '6 comptes Premium',
            'Écoute sans publicité',
            'Mode hors ligne',
            'Son haute qualité',
            'Playlists personnalisées'
          ],
          modeEmploi: [
            'Invitations envoyées par email',
            'Chaque membre crée son compte',
            'Activation instantanée',
            'Renouvelable chaque mois'
          ]
        },
        3: {
          id: 3,
          nom: 'Disney+ Premium',
          categorie: 'FILMS_SERIES',
          description: 'Disney+ avec tout le catalogue Marvel, Star Wars, Pixar et plus encore.',
          prixMensuel: 6500,
          duree: 1,
          partenaire: { nom: 'StreamPro', ville: 'Abidjan', note: 4.8, ventes: 245 },
          image: 'https://via.placeholder.com/800x450/3b82f6/ffffff?text=Disney+Plus',
          rating: 4.7,
          stock: 10,
          caracteristiques: [
            'Tout le catalogue Disney+',
            'Marvel, Star Wars, Pixar',
            '4 écrans simultanés',
            'Qualité 4K HDR',
            'Téléchargements illimités'
          ],
          modeEmploi: [
            'Identifiants par SMS et email',
            'Compatible tous appareils',
            'Support client réactif',
            'Accès immédiat'
          ]
        },
        4: {
          id: 4,
          nom: 'PlayStation Plus',
          categorie: 'GAMING',
          description: 'PS Plus Essential avec jeux mensuels gratuits et multijoueur en ligne.',
          prixMensuel: 8000,
          duree: 3,
          partenaire: { nom: 'GameStore', ville: 'Yopougon', note: 4.6, ventes: 156 },
          image: 'https://via.placeholder.com/800x450/8b5cf6/ffffff?text=PS+Plus',
          rating: 4.6,
          stock: 8,
          caracteristiques: [
            '2-3 jeux gratuits/mois',
            'Multijoueur en ligne',
            'Stockage cloud',
            'Réductions exclusives',
            'Abonnement 3 mois'
          ],
          modeEmploi: [
            'Code envoyé par email',
            'Activation sur PlayStation Store',
            'Jeux ajoutés automatiquement',
            'Valable 3 mois'
          ]
        },
        5: {
          id: 5,
          nom: 'Amazon Prime Video',
          categorie: 'FILMS_SERIES',
          description: 'Prime Video + livraison gratuite Amazon',
          prixMensuel: 4500,
          duree: 1,
          partenaire: { nom: 'StreamPro', ville: 'Abidjan', note: 4.8, ventes: 245 },
          image: 'https://via.placeholder.com/800x450/f59e0b/ffffff?text=Prime+Video',
          rating: 4.5,
          stock: 25,
          caracteristiques: [
            'Catalogue Prime Video complet',
            'Films et séries exclusifs',
            'Qualité HD/4K',
            'Livraison Prime gratuite',
            '2 écrans simultanés'
          ],
          modeEmploi: [
            'Compte Amazon fourni',
            'Accès Prime Video + Shopping',
            'Activation immédiate',
            'Support 24/7'
          ]
        },
        6: {
          id: 6,
          nom: 'Apple Music',
          categorie: 'MUSIQUE',
          description: 'Apple Music - Écoute illimitée de millions de titres',
          prixMensuel: 4000,
          duree: 1,
          partenaire: { nom: 'MusicHub', ville: 'Cocody', note: 4.9, ventes: 189 },
          image: 'https://via.placeholder.com/800x450/ec4899/ffffff?text=Apple+Music',
          rating: 4.8,
          stock: 30,
          caracteristiques: [
            '100+ millions de chansons',
            'Son spatial Dolby Atmos',
            'Mode hors ligne',
            'Sans publicité',
            'Radio en direct'
          ],
          modeEmploi: [
            'Compte Apple Music créé',
            'Identifiants par email',
            'Compatible tous appareils',
            'Accès immédiat'
          ]
        },
      }

      // Simulation délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setOffre(mockOffres[id])
      setLoading(false)
    }

    loadOffre()
  }, [id])

  const handleSouscrire = (e) => {
    e.preventDefault()
    
    // Validation basique
    if (!email || !telephone) {
      alert('Veuillez remplir tous les champs')
      return
    }

    // Calculer le montant total
    const montantTotal = offre.prixMensuel * quantity

    // Rediriger vers la page de paiement avec les données
    navigate('/paiement', {
      state: {
        offre: offre,
        quantity: quantity,
        montantTotal: montantTotal,
        email: email,
        telephone: telephone
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Offre introuvable</h2>
          <button
            onClick={() => navigate('/catalogue')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  const montantTotal = offre.prixMensuel * quantity

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/catalogue')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au catalogue
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Image et détails */}
          <div>
            {/* Image principale */}
            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img
                src={offre.image}
                alt={offre.nom}
                className="w-full h-96 object-cover"
              />
              {offre.stock < 10 && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-full">
                  ⚠️ Plus que {offre.stock} en stock !
                </div>
              )}
            </div>

            {/* Informations partenaire */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
              <h3 className="font-semibold mb-4">À propos du partenaire</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span>{offre.partenaire.nom}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{offre.partenaire.note}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{offre.partenaire.ville}</span>
                </div>
                <div className="text-sm text-gray-600">
                  ✅ {offre.partenaire.ventes}+ ventes réussies
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
              <h3 className="font-semibold mb-4">✨ Caractéristiques</h3>
              <ul className="space-y-3">
                {offre.caracteristiques.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mode d'emploi */}
            <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Mode d'emploi
              </h3>
              <ol className="space-y-3">
                {offre.modeEmploi.map((etape, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{etape}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Colonne droite - Formulaire souscription */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 sticky top-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{offre.nom}</h1>
                <p className="text-gray-600">{offre.description}</p>
              </div>

              {/* Rating et durée */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{offre.rating}</span>
                  <span className="text-gray-500 text-sm">(128 avis)</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{offre.duree} mois</span>
                </div>
              </div>

              {/* Prix */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {offre.prixMensuel.toLocaleString()} F
                </div>
                <div className="text-gray-500">
                  {(offre.prixMensuel / offre.duree).toLocaleString()} F / mois
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSouscrire} className="space-y-6">
                {/* Quantité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vos identifiants seront envoyés à cette adresse
                  </p>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+225 XX XX XX XX XX"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour la confirmation de paiement Mobile Money
                  </p>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total à payer</span>
                    <span className="text-2xl text-indigo-600">
                      {montantTotal.toLocaleString()} F
                    </span>
                  </div>
                  {quantity > 1 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {quantity} x {offre.prixMensuel.toLocaleString()} F
                    </p>
                  )}
                </div>

                {/* Bouton souscription */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105"
                >
                  Souscrire maintenant 🚀
                </button>

                {/* Garanties */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Identifiants envoyés immédiatement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span>Activation en moins de 5 minutes</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
