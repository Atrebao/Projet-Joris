import React, { useState } from "react";
import netflix from "../assets/images/netflix.jpg";
import { DATA } from "../data/data";
import ModalForms from "./ModalForms";
export default function Services() {
  const [data, setData] = useState(DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fonction pour ouvrir le modal et passer l'élément cliqué
  const handleOpenModal = (item) => {
    setSelectedItem(item); // Enregistre l'élément cliqué pour utilisation dans le formulaire
    setIsModalOpen(true); // Ouvre le modal
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null); // Réinitialise l'élément sélectionné
  };

  return (
    <div className="max-w-[1640px] mx-auto  px-4 py-1 ">
      <h1 className="text-blue-300 font-bold text-4xl text-center">
        NOS SERVICES
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-10 lg:pl-[100px] py-10">
        {DATA.map((item, index) => (
          <div
            key={index}
            className="card bg-base-100 w-full sm:w-80 lg:w-96 shadow-xl py-10 hover:scale-105 duration-300 cursor-pointer"
            onClick={() => handleOpenModal(item)}
          >
            <figure className="px-10 pt-10">
              <img
                src={item.image}
                alt="Shoes"
                className="rounded-xl max-h-[160px]"
              />
            </figure>
            <div className="card-body">
              <div className="stats stats-vertical lg:stats-horizontal">
                {item.modalite.map((modal) =>(
                  <div className="stat">
                  <div className="stat-title text-2xl">{modal.mois} mois</div>
                  <div className="stat-value">{modal.prix}$</div>
                </div>
                ))}
               
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ModalForms item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
}
