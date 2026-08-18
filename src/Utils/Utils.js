import { BookOpen, Gamepad2, Gift, Headphones, Sparkles, Tv } from 'lucide-react'

export const HOMECLIENT = "/client";
export const HOMEADMIN = "/backoffice";
export const HOMEPARTENAIRE = "/partenaire";

export const resetStorage = () => {
  localStorage.removeItem("infoUser");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("partenaire");
};

export const saveUserProfil = (data) => {
  if (data?.accessToken) {
    localStorage.setItem("token", data.accessToken);
  }
  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  if (data?.partenaire) {
    localStorage.setItem("partenaire", JSON.stringify(data.partenaire));
  }
  return localStorage.setItem("infoUser", JSON.stringify(data));
};

/** Retourne l'ID du partenaire connecté (null si admin/client) */
export const getPartenaireId = () => {
  const info = getUserProfil();
  if (info?.partenaire?.id) return info.partenaire.id;
  const partenaire = JSON.parse(localStorage.getItem("partenaire") || "null");
  return partenaire?.id ?? null;
};

/** Retourne l'objet partenaire connecté (null si admin/client) */
export const getPartenaire = () => {
  const info = getUserProfil();
  if (info?.partenaire) return info.partenaire;
  const partenaire = JSON.parse(localStorage.getItem("partenaire") || "null");
  return partenaire ?? null;
};

/** Vérifie si l'utilisateur connecté est un partenaire */
export const isPartenaire = () => !!getPartenaireId();

/** Vérifie si l'utilisateur connecté est un admin */
export const isAdmin = () => {
  const info = getUserProfil();
  const user = info?.user || JSON.parse(localStorage.getItem("user") || "null");
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
};

export const saveToken = (token) => {
  return localStorage.setItem("accessToken", JSON.stringify(token));
};

export const savePaiement = (paiement) => {
  const p = getPaiement();
  if(p){
    if(p.status === "SUCCES" || p.status === "ECHEC"){
      localStorage.removeItem("p");
      return localStorage.setItem("paiement", JSON.stringify(paiement));
    } 
  }
};

export const getPaiement = () => {
  return JSON.parse(localStorage.getItem("paiement"));
};

export const getUserProfil = () => {
  return JSON.parse(localStorage.getItem("infoUser"));
};

export const getClient = () => {
  const info = getUserProfil();
  if(info?.user) return info.user;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user ?? null;
};

export const userToken = () => {
  const user = getUserProfil();
  return user ? user.accessToken : null;
};

export const months = [
  { code: 1, name: "Janvier" },
  { code: 2, name: "Février" },
  { code: 3, name: "Mars" },
  { code: 4, name: "Avril" },
  { code: 5, name: "Mai" },
  { code: 6, name: "Juin" },
  { code: 7, name: "Juillet" },
  { code: 8, name: "Août" },
  { code: 9, name: "Septembre" },
  { code: 10, name: "Octobre" },
  { code: 11, name: "Novembre" },
  { code: 12, name: "Décembre" },
];

export const CATEGORIES = [
  { value: '', label: 'Tout', icon: Sparkles, description: 'Tous les services' },
  { value: 'streaming', label: 'Streaming', icon: Tv, description: 'Films & séries' },
  { value: 'musique', label: 'Musique', icon: Headphones, description: 'Audio en illimité' },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Jeux & abonnements' },
  { value: 'cartes', label: 'Cartes Cadeaux & Paiement', icon: Gift, description: 'Recharges, cartes bancaires & codes' },
  { value: 'productivite', label: 'Productivité', icon: BookOpen, description: 'Logiciels & outils pro' },
];

export const SERVICES_MARKETPLACE = [
  { value: 'netflix', label: 'Netflix', category: 'streaming', color: '#e50914', initials: 'N' },
  { value: 'disney', label: 'Disney+', category: 'streaming', color: '#113ccf', initials: 'D+' },
  { value: 'prime', label: 'Prime Video', category: 'streaming', color: '#1f9fe0', initials: 'PV' },
  { value: 'canal', label: 'Canal+', category: 'streaming', color: '#1d1d1b', initials: 'C+' },
  { value: 'crunchyroll', label: 'Crunchyroll', category: 'streaming', color: '#f47521', initials: 'CR' },
  { value: 'spotify', label: 'Spotify', category: 'musique', color: '#1db954', initials: 'S' },
  { value: 'deezer', label: 'Deezer', category: 'musique', color: '#a238ff', initials: 'Dz' },
  { value: 'applemusic', label: 'Apple Music', category: 'musique', color: '#fa2d48', initials: 'AM' },
  { value: 'ytmusic', label: 'YouTube Premium', category: 'musique', color: '#ff0000', initials: 'YT' },
  { value: 'gamepass', label: 'Xbox Game Pass', category: 'gaming', color: '#107c10', initials: 'GP' },
  { value: 'psplus', label: 'PlayStation Plus', category: 'gaming', color: '#0070d1', initials: 'PS' },
  { value: 'steam', label: 'Steam', category: 'gaming', color: '#1b2838', initials: 'St' },
  { value: 'amazongift', label: 'Amazon Gift Card', category: 'cartes', color: '#ff9900', initials: 'AZ' },
  { value: 'playgift', label: 'Google Play', category: 'cartes', color: '#34a853', initials: 'GP' },
  { value: 'appgift', label: 'App Store', category: 'cartes', color: '#0d96f6', initials: 'AS' },
  { value: 'visaprepaid', label: 'Carte Visa Prépayée', category: 'cartes', color: '#1a1f71', initials: 'VISA' },
  { value: 'mastercard', label: 'Carte Mastercard Prépayée', category: 'cartes', color: '#eb001b', initials: 'MC' },
  { value: 'canva', label: 'Canva Pro', category: 'productivite', color: '#00c4cc', initials: 'Cv' },
  { value: 'autre', label: 'Autre service', category: 'cartes', color: '#64748b', initials: 'AU' },
];

export const getServiceMeta = (serviceValue = '') => {
  const normalized = String(serviceValue || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = SERVICES_MARKETPLACE.find((s) => {
    const sNorm = s.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lNorm = s.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    return sNorm === normalized || lNorm === normalized || normalized.includes(sNorm);
  });
  if (found) return found;
  return {
    value: serviceValue || 'autre',
    label: serviceValue || 'Service',
    category: 'cartes',
    color: '#0ea5e9',
    initials: (serviceValue || 'S').slice(0, 2).toUpperCase(),
  };
};

export const OPERATOR_BADGES = [
  { 
    id: 'orange',
    label: 'Orange Money', 
    short: 'Orange',
    badgeClass: 'bg-[#ff7900] text-white',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiNkcP-3jO9hJmuSHaXVo8yEzdoy-lOy8NcQgBHvbqCw&s=10',
    operateur: 'ORANGE'
  },
  { 
    id: 'mtn',
    label: 'MTN MoMo', 
    short: 'MTN',
    badgeClass: 'bg-[#ffcc00] text-black',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlqaD_Qzu_IV_656Imb1VC9S9ik-48CY-SEyRKzdKOVw&s=10',
    operateur: 'MTN'
  },
  { 
    id: 'moov',
    label: 'Moov Money', 
    short: 'Moov',
    badgeClass: 'bg-[#0066b3] text-white',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7iEvNAHsFlwe7yYgXHjcZif32WIRTgyLKb8jvuaJiaA&s=10',
    operateur: 'MOOV'
  },
  { 
    id: 'wave',
    label: 'Wave', 
    short: 'Wave',
    badgeClass: 'bg-[#1dc8ff] text-black',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZaeFi3xAkC86Ui29AojMASpYfFMPLDzf-1hTcDVS-0Q&s=10',
    operateur: 'WAVE'
  }
];

export const paymentMethods = [
  {
    id: "visa",
    name: "Visa",
    icon: "",
    value: "VISA",
    color: "slate-600",
  },
  {
    id: "mobile_money",
    name: "Mobile money",
    icon: "",
    value: "MOBILE_MONEY",
    color: "slate-600",
  },
];

export const years = [
  { name: "2027" },
  { name: "2026" },
  { name: "2025" },
  { name: "2024" },
  { name: "2023" },
  { name: "2022" },
];

export const periodes = [
  { designation: "jours", value: "JOUR" },
  { designation: "mois", value: "MOIS" },
  { designation: "année", value: "ANNEE" },
];

export const statutPaiementsListe = [
  { libelle: "Succès", value: "SUCCES" },
  { libelle: "Echec", value: "ECHEC" },
  { libelle: "En attente de paiement", value: "EN_ATTENTE_DE_PAIEMENT" },
];

export const etatSouscriptionsListe = [
  { libelle: "Actif", value: "ACTIF" },
  { libelle: "Inactif", value: "INACTIF" },
  { libelle: "Expiré", value: "EXPIRE" },
];

export const normalizeOffer = (data = {}) => {
  let forfaits = []
  if (Array.isArray(data.forfaitOffres) && data.forfaitOffres.length > 0) {
    forfaits = data.forfaitOffres.map((fo) => ({
      ...(fo.forfait || {}),
      id: fo.forfait?.id || fo.id,
      plan: fo.forfait?.plan || `${fo.forfait?.duree || 1} Mois`,
      duree: Number(fo.forfait?.duree || 1),
      periode: fo.forfait?.periode || 'MOIS',
      prixPartage: Number(fo.prixPartage || data.prixVente || 0),
      prixPrive: Number(fo.prixPrive || data.prixVente || 0),
      isPartageActive: fo.isPartageActive !== false,
      isPriveActive: fo.isPriveActive !== false,
    }))
  } else if (Array.isArray(data.forfaits) && data.forfaits.length > 0) {
    forfaits = data.forfaits.map((f) => ({
      ...f,
      duree: Number(f.duree || 1),
      periode: f.periode || 'MOIS',
      prixPartage: Number(f.prix || data.prixVente || 0),
      prixPrive: Number(f.prix || data.prixVente || 0),
      isPartageActive: true,
      isPriveActive: true,
    }))
  } else {
    forfaits = [
      {
        id: data.id,
        plan: data.typeCompte || 'Standard',
        duree: Number(data.duree || 1),
        periode: 'MOIS',
        prixPartage: Number(data.prixVente || 0),
        prixPrive: Number(data.prixVente || 0),
        isPartageActive: true,
        isPriveActive: true,
      },
    ]
  }

  // Calculer tous les prix actifs parmi tous les forfaits et types d'accès
  const allActivePrices = []
  forfaits.forEach((f) => {
    if (f.isPartageActive && Number(f.prixPartage) > 0) allActivePrices.push(Number(f.prixPartage))
    if (f.isPriveActive && Number(f.prixPrive) > 0) allActivePrices.push(Number(f.prixPrive))
  })
  if (allActivePrices.length === 0) {
    allActivePrices.push(Number(data.prixVente || data.prixOriginal || data.prix || 0))
  }

  const minPrice = Math.min(...allActivePrices)
  const maxPrice = Math.max(...allActivePrices)
  const isMultiTarifs = minPrice !== maxPrice || forfaits.length > 1

  // Formatage des badges de durées discrets (ex: 1M, 3M, 1A)
  const distinctDurations = Array.from(
    new Set(
      forfaits.map((f) => {
        const d = Number(f.duree || 1)
        const p = (f.periode || 'MOIS').toUpperCase()
        if (p.startsWith('AN')) return `${d}A`
        if (p.startsWith('JOUR')) return `${d}J`
        return `${d}M`
      })
    )
  )

  const firstForfait = forfaits[0] || {}
  const meta = getServiceMeta(data.service || data.nomService || data.nom)

  return {
    id: data.id,
    service: data.service || data.nomService || meta.value || 'service',
    nom: data.titreOffre || data.nom || data.nomService || `${meta.label} Abonnement`,
    categorie: data.categorie || meta.category || 'streaming',
    description: data.description || '',
    image: data.imageService || data.image || '',
    prix: minPrice,
    prixMax: maxPrice,
    prixOriginal: Number(data.prixOriginal ?? data.prixVente ?? minPrice),
    isMultiTarifs,
    distinctDurations,
    promotionDirecte: data.promotionDirecte || null,
    duree: Number(firstForfait.duree || data.duree || 1),
    periode: firstForfait.periode || 'MOIS',
    stock: Number(data.stock ?? data.quantiteDisponible ?? 0),
    partenaire: data.partenaire?.nomBoutique || data.partenaire?.nom || 'DigiStore CI',
    partenaireId: data.partenaire?.id,
    forfaitNom: firstForfait.plan || 'Standard',
    forfaits,
  }
}

export const formatWhatsAppPhone = (phone = '') => {
  let cleaned = String(phone).replace(/\D/g, '')
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2)
  if (cleaned.startsWith('0') && cleaned.length === 10) cleaned = `225${cleaned.slice(1)}`
  return cleaned
}

