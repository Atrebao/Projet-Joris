export const DATA = [
  {
    id: 1,
    nom: "Netflix",
    image:
      "https://images.ctfassets.net/4cd45et68cgf/4nBnsuPq03diC5eHXnQYx/d48a4664cdc48b6065b0be2d0c7bc388/Netflix-Logo.jpg?w=2000",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    // price : "3000",
    // description :"1 mois",
    description:
      "Regardé plus de 90 millions de films sans publicité et en streaming haute qualité.",
    categorie: "Netflix",
    icon: "Clapperboard",
  },
  {
    id: 2,
    nom: "Prime",
    image:
      "https://next.ink/wp-content/uploads/2023/12/Amazon-Prime-Video-Symbole.jpg",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    price: "3000",
    description: "2 mois",
    categorie: "Prime",
    description:
      "Regardé plus de 90 millions de films sans publicité et en streaming haute qualité.",
    icon: "Clapperboard",
  },

  {
    id: 3,
    nom: "Crunchyroll",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJyvBogK8_WGEsHammfstExKgA9ow-epf_1Q&s",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    price: "3000",
    description: "1 mois",
    categorie: "Crunchyroll",
    description:
      "Regardé plus de 90 millions d'animés sans publicité et en streaming haute qualité.",
    icon: "Clapperboard",
  },
  {
    id: 4,
    nom: "Disney +",
    image:
      "https://www.internetmatters.org/wp-content/uploads/2020/04/disney-plus-logo-1143358-600x322.jpeg",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    price: "3000",
    description: "2 mois",
    categorie: "Disney",
    description:
      "Regardé plus de 90 millions de fimls sans publicité et en streaming haute qualité.",
    icon: "Clapperboard",
  },
  {
    id: 5,
    nom: "Spotify",
    image: "https://www.scdn.co/i/_global/open-graph-default.png",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    price: "3000",
    description: "1 mois",
    categorie: "Spotify",
    description:
      "Écoutez plus de 90 millions de titres sans publicité et en streaming haute qualité.",
    icon: "Music2",
  },
  {
    id: 6,
    nom: "Apple music",
    image:
      "https://www.journaldugeek.com/app/uploads/2021/05/apple-music-hifi.jpg",
    modalite: [
      { id: 1, mois: 1, prix: 2000 },
      { id: 2, mois: 3, prix: 7000 },
    ],
    price: "3000",
    description:
      "Écoutez plus de 90 millions de titres sans publicité et en streaming haute qualité.",
    categorie: "Apple music",
    icon: "Music2",
  },
];



export const souscriptions = [
  {
    id:1,
    dateCreation : "",
    client :{
      id:1,
      nomPrenoms : "Kouassi bob",
      numero:"0585747485",
      email : "boby@gmail.com",
      conditionsUtilisation : true,
      dateCreation : ""
    },
    statut : "",
    dateExpiration : "",
    abonnement :  {
      id: 6,
      nom: "Apple music",
      image:
        "https://www.journaldugeek.com/app/uploads/2021/05/apple-music-hifi.jpg",
      modalite: [
        { id: 1, mois: 1, prix: 2000 },
        { id: 2, mois: 3, prix: 7000 },
      ],
      price: "3000",
      description:
        "Écoutez plus de 90 millions de titres sans publicité et en streaming haute qualité.",
      categorie: "Apple music",
      icon: "Music2",
    },
    modalite :{id: 1, mois: 1, prix: 2000}
    
  },
  {
    id:2,
    dateCreation : "",
    client :{
      id:1,
      nomPrenoms : "Obito Marui",
      numero:"0585747485",
      email : "obito@gmail.com",
      conditionsUtilisation : true,
      dateCreation : ""
    },
    statut : "",
    dateExpiration : "",
    abonnement : {
      id: 3,
      nom: "Crunchyroll",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJyvBogK8_WGEsHammfstExKgA9ow-epf_1Q&s",
      modalite: [
        { id: 1, mois: 1, prix: 2000 },
        { id: 2, mois: 3, prix: 7000 },
      ],
      price: "3000",
      description: "1 mois",
      categorie: "Crunchyroll",
      description:
        "Regardé plus de 90 millions d'animés sans publicité et en streaming haute qualité.",
      icon: "Clapperboard",
    },
    modalite : { id: 2, mois: 3, prix: 7000 },
    
  }
];

export const categories = [
  {
    id: 1,
    nom: "Netflix",
    image:
      "https://images.ctfassets.net/4cd45et68cgf/4nBnsuPq03diC5eHXnQYx/d48a4664cdc48b6065b0be2d0c7bc388/Netflix-Logo.jpg?w=2000",
    bgColor: "bg-black",
  },
  {
    id: 2,
    nom: "Prime",
    image:
      "https://next.ink/wp-content/uploads/2023/12/Amazon-Prime-Video-Symbole.jpg",
    bgColor: "bg-[#243040]",
  },
  {
    id: 3,
    nom: "Crunchyroll",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJyvBogK8_WGEsHammfstExKgA9ow-epf_1Q&s",
    bgColor: "bg-[#ffffff]",
  },
  {
    id: 4,
    nom: "Disney",
    image:
      "https://www.internetmatters.org/wp-content/uploads/2020/04/disney-plus-logo-1143358-600x322.jpeg",
    bgColor: "bg-[#0f2259]",
  },
  {
    id: 5,
    nom: "Spotify",
    image: "https://www.scdn.co/i/_global/open-graph-default.png",
    bgColor: "bg-[#18d55c]",
  },
  {
    id: 6,
    nom: "Apple music",
    image:
      "https://www.journaldugeek.com/app/uploads/2021/05/apple-music-hifi.jpg",
    bgColor: "bg-[#ffffff]",
  },
];
