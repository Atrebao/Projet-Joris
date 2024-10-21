import React, { useState } from "react";

export default function ModalForms({ item, onClose }) {
  const [nomPrenoms, setNomPrenoms] = useState("");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [serviceId, setServiceId] = useState();
  const [typeAbonnement, setTypeAbonnement] = useState("");

  const handleSubmit = (e, item) => {
    e.preventDefault();
    setServiceId(item.id)
    const data = { nomPrenoms, numero, email, serviceId, typeAbonnement };
    console.log(data);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h1 className="font-bold text-3xl mb-4 text-center">
          Abonnement <i className="text-orange-400">{item?.nom}</i>
        </h1>
        <form onSubmit={(e) => handleSubmit(e,item)}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Nom & Prenoms</span>
            </label>
            <input
              value={nomPrenoms}
              type="text"
              placeholder="Votre nom et prenoms"
              className="input input-bordered w-full"
              required
              onChange={(e) => setNomPrenoms(e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Numero whatsapp</span>
            </label>
            <input
              value={numero}
              type="text"
              placeholder="Votre numero whatsapp"
              className="input input-bordered w-full"
              required
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              value={email}
              type="email"
              placeholder="Votre email"
              className="input input-bordered w-full"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-control mb-4 ">
            <label className="label">
              <span className="label-text">Type d'abonnement</span>
            </label>
            <select
              value={typeAbonnement}
              onChange={(e) => setTypeAbonnement(e.target.value)}
              className="select  select-bordered w-full max-w"
            >
              <option selected disabled></option>
              {item.modalite.map((modalite, index) => (
                <option key={index}>
                  {modalite.mois} mois ( {modalite.prix} FCFA)
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Soumettre
            </button>
            <button type="button" className="btn btn-error" onClick={onClose}>
              Fermer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
