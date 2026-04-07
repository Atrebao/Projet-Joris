import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Shield, Zap, Users } from 'lucide-react'
import { abonnementsAPI, promotionsAPI } from '../lib/api'
import toast from 'react-hot-toast'

// Catégories (alignées avec Catalogue.jsx)
const categories = [
  { value: '', label: 'Toutes' },
  { value: 'FILMS_SERIES', label: '🎬 Films & Séries' },
  { value: 'MUSIQUE', label: '🎵 Musique' },
  { value: 'GAMING', label: '🎮 Gaming' },
  { value: 'EBOOKS', label: '📚 Ebooks' },
  { value: 'SPORT', label: '⚽ Sport' },
]

export default function DetailOffre() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [offre, setOffre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedForfait, setSelectedForfait] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [nom, setNom] = useState('')
  const [prenoms, setPrenoms] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [promotions, setPromotions] = useState([])

  // Formater le prix (aligné avec Catalogue.jsx)
  const formatPrix = (prix) => {
    if (!prix) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA'
  }

  // Charger l'offre depuis l'API (comme Catalogue.jsx)
  useEffect(() => {
    const parseStoredUser = (value) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }

    const user = parseStoredUser(localStorage.getItem('infoUser')) || parseStoredUser(localStorage.getItem('user'))

    if (user) {
      setNom(user.nom || user.lastName || '')
      setPrenoms(user.prenoms || user.firstName || '')
      setPseudo(user.pseudo || user.username || user.name || '')
      setEmail(user.email || '')
      setTelephone(user.telephone || user.phone || user.numero || '')
    }
  }, [])

  useEffect(() => {
    const loadOffre = async () => {
      setLoading(true)

      try {
        // getDetails pour les détails complets, fallback sur getOne
        let data
        try {
          const res = await abonnementsAPI.getDetails(Number(id))
          data = res.data
        } catch {
          const res = await abonnementsAPI.getOne(Number(id))
          data = res.data
        }

        // Mapper les données backend vers le format frontend (aligné Catalogue.jsx)
        const offreFormatted = {
          id: data.id,
          nom: data.nom,
          categorie: data.categorie,
          description: data.description || `Profitez de ${data.nom}`,
          image: data.image || `https://via.placeholder.com/800x450/6366f1/ffffff?text=${encodeURIComponent(data.nom)}`,
          icon: data.icon,
          forfaits: data.forfaits || [],
          prixMensuel: data.forfaits?.[0]?.prix || 0,
          duree: data.forfaits?.[0]?.duree || 1,
          partenaire: data.partenaire || { nom: 'RICHESSES', ville: 'Abidjan', note: 4.5, ventes: 0 },
          rating: data.rating || 4.5,
          avis: data.avis || 128,
          stock: data.stock,
          caracteristiques: data.caracteristiques || [],
          modeEmploi: data.modeEmploi || [
            'Vous recevrez vos identifiants par email',
            'Connectez-vous sur le service concerné',
            'Profitez de votre abonnement immédiatement',
            'Support disponible 24/7',
          ],
        }

        setOffre(offreFormatted)
        // Sélectionner le premier forfait par défaut
        if (offreFormatted.forfaits?.length > 0) {
          setSelectedForfait(offreFormatted.forfaits[0])
        } else {
          setSelectedForfait({
            id: 0,
            prix: offreFormatted.prixMensuel,
            duree: offreFormatted.duree,
            plan: 'Standard',
          })
        }

        // Promotions actives pour cette offre (optionnel)
        try {
          const { data } = await promotionsAPI.activesParAbonnement(Number(id))
          setPromotions(Array.isArray(data) ? data : [])
        } catch {
          setPromotions([])
        }
      } catch (error) {
        console.error('Erreur chargement offre:', error)
        toast.error('Impossible de charger cette offre')
        setOffre(null)
      } finally {
        setLoading(false)
      }
    }

    loadOffre()
  }, [id])

  const handleSouscrire = (e) => {
    e.preventDefault()

    if (!offre) return

    // Validation basique
    if (!nom || !email || !telephone) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const forfait = selectedForfait || offre.forfaits?.[0]
    const prixUnitaire = forfait?.prix ?? offre.prixMensuel
    const duree = forfait?.duree ?? offre.duree ?? 1
    const montantTotal = prixUnitaire * quantity

    // Rediriger vers la page de paiement avec les données (compatible PaiementNouveau.jsx)
    navigate('/paiement', {
      state: {
        offre: {
          ...offre,
          prixMensuel: prixUnitaire,
          duree,
          selectedForfait: forfait,
        },
        quantity,
        montantTotal,
        nom,
        prenoms,
        pseudo,
        email,
        telephone,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement de l&apos;offre...</p>
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
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  const forfait = selectedForfait || offre.forfaits?.[0]
  const prixUnitaire = forfait?.prix ?? offre.prixMensuel
  const duree = forfait?.duree ?? offre.duree ?? 1
  
  const montantTotal = prixUnitaire ;

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
            {/* Image principale - style Catalogue */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-800">
              <img
                src={offre.image}
                alt={offre.nom}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <h2 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight text-center px-4">
                  {offre.nom.split(' ').slice(0, 2).join(' ')}
                </h2>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold border">
                {categories.find(c => c.value === offre.categorie)?.label || offre.categorie}
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-yellow-400 rounded-full">
                <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                <span className="text-xs font-bold text-yellow-900">{offre.rating}</span>
              </div>
              {offre.stock != null && offre.stock < 10 && offre.stock > 0 && (
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-full">
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
                    <span>{offre.partenaire?.nom || 'RICHESSES'}</span>
                  </div>
                  {offre.partenaire?.note != null && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{offre.partenaire.note}</span>
                    </div>
                  )}
                </div>
                {offre.partenaire?.ville && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{offre.partenaire.ville}</span>
                  </div>
                )}
                {offre.partenaire?.ventes != null && offre.partenaire.ventes > 0 && (
                  <div className="text-sm text-gray-600">
                    ✅ {offre.partenaire.ventes}+ ventes réussies
                  </div>
                )}
              </div>
            </div>

            {/* Caractéristiques */}
            {offre.caracteristiques?.length > 0 && (
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
            )}

            {/* Mode d&apos;emploi */}
            <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Mode d&apos;emploi
              </h3>
              <ol className="space-y-3">
                {offre.modeEmploi?.map((etape, index) => (
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
                  <span className="text-gray-500 text-sm">({offre.avis || 128} avis)</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{duree} mois</span>
                </div>
              </div>

              {/* Sélection du forfait (comme dans Catalogue) */}
              {offre.forfaits?.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choisir une formule
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {offre.forfaits.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedForfait(f)}
                        className={`flex-1 min-w-[100px] p-4 rounded-xl border-2 text-center transition-all ${
                          selectedForfait?.id === f.id
                            ? 'border-slate-600 bg-slate-50 text-slate-700'
                            : 'border-gray-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-xs text-gray-500">{f.duree} mois</div>
                        <div className="text-lg font-bold text-slate-700">
                          {formatPrix(f.prix)}
                        </div>
                        {f.plan && (
                          <div className="text-xs text-gray-500 truncate">{f.plan}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prix */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-slate-700 mb-2">
                  {formatPrix(prixUnitaire)}
                </div>
                {duree > 1 && (
                  <div className="text-gray-500">
                    {formatPrix(Math.round(prixUnitaire / duree))} / mois
                  </div>
                )}
              </div>

              {/* Promotions actives (optionnelles) */}
              {promotions?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-amber-700 mb-3">
                    Réductions disponibles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {promotions.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        {p.type === 'POURCENTAGE'
                          ? `-${Number(p.valeur) || 0}%`
                          : `-${Number(p.valeur) || 0} FCFA`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSouscrire} className="space-y-6">
                {/* Quantité */}
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                  >
                    {[1, 2, 3, 4, 5].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div> 
                */}

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                  />
                </div>

                {/* Prénoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénoms
                  </label>
                  <input
                    type="text"
                    value={prenoms}
                    onChange={(e) => setPrenoms(e.target.value)}
                    placeholder="Vos prénoms"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                  />
                </div>

                {/* Pseudo */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pseudo (optionnel)
                  </label>
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Votre pseudo"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                  />
                </div> */}

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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
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
                    placeholder="0102030405"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour la confirmation de paiement Mobile Money
                  </p>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total à payer</span>
                    <span className="text-2xl text-slate-700">
                      {formatPrix(montantTotal)}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {quantity} × {formatPrix(prixUnitaire)}
                    </p>
                  )}
                </div>

                {/* Bouton souscription */}
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg"
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
