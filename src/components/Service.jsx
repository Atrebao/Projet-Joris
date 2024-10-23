import React, { useState } from "react";
import ModalForms from "./ModalForms";
export default function Service({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fonction pour ouvrir le modal et passer l'élément cliqué
  const handleOpenModal = (item) => {
    setSelectedItem(item); // Enregistre l'élément cliqué pour utilisation dans le formulaire
    setIsModalOpen(true); // Ouvre le modal
    console.log("Coucou");
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null); // Réinitialise l'élément sélectionné
  };

  return (
    <>
      <div
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
            {item.modalite.map((modal) => (
              <div className="stat">
                <div className="stat-title text-2xl">{modal.mois} mois</div>
                <div className="stat-value">{modal.prix}$</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <ModalForms item={selectedItem} onClose={handleCloseModal} />
      )}
    </>
  );
}
