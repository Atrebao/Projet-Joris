import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import { Pagination, Skeleton } from "@mui/material";
import { getPaiements } from "../services/PaiementsService";
import EditPenIcon from "../assets/icons/pen.svg";
import {
  PowerIcon,
  PowerOffIcon,
  Settings2Icon,
  UserRoundCogIcon,
} from "lucide-react";

export default function Paiements() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paiements, setPaiements] = useState([]);

  useEffect(() => {
    setLoading(true);
    try {
      getPaiements()
        .then((response) => {
          if (response.data) {
            setLoading(false);
            setPaiements(response.data);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err.data);
        });
    } catch (err) {
      setLoading(false);
    }
  }, []);

  const columns = [
    {
      name: "Nom & Prenoms client",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.nomPrenoms
        ),
      sortable: true,
    },
    {
      name: "Montant",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.montant
        ),
      sortable: true,
    },
    {
      name: "Reference",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.reference
        ),
      sortable: true,
    },
    {
      name: "Numero telephone",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.numero
        ),
    },
    {
      name: "Date de paiement",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.datePaiement
        ),
    },

    {
      name: "Action",
      cell: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          <div className="flex items-center gap-x-3">
            <div className="tooltip" data-tip="Details">
              <button
                
                onClick={() => {
                  document.getElementById("details_paiement").showModal();
                }}
                className="w-7 h-7 rounded-lg bg-stone-700 flex items-center justify-center b"
              >
                <img src={EditPenIcon} alt="icon" className="w-4" />
              </button>
            </div>

            <dialog id="details_paiement" className="modal">
              <div className="modal-box w-10/12 max-w-2xl">
                <div className="modal-action">
                  <h1 className="mr-auto text-2xl font-bold font-mtn mb-8">
                    Details de paiement 
                  </h1>
                  <form method="dialog">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold">
                      ✕
                    </button>
                  </form>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="divide-y divide-gray-100">
                    <div className="px-4 py-3 grid grid-cols-3 gap-4">
                      <div className="text-sm font-semibold text-gray-900">
                        Date de paiement
                      </div>
                      <div className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">{row.datePaiement}</div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3 gap-4">
                      <div className="text-sm font-semibold text-gray-900">
                      Mode paiement
                      </div>
                      <div className="mt-1 text-sm font-medium leading-6 text-blue-700 sm:col-span-2 sm:mt-0">{row.modePaiement}</div>
                    </div>
                  </div>
                </div>
                {/* <AjouterModifierUtilisateur /> */}
              </div>
            </dialog>
          </div>
        ),
    },
  ];

  return (
    <div className="w-11/12 h-full mx-auto pt-14">
      <h1 className="text-4xl font-bold">Paiements</h1>
      <div className="w-full p-5 bg-white rounded-md mt-10">
        <div className="w-full pt-5 flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            <input
              type="text"
              placeholder="Rechercher"
              className="input input-bordered w-full max-w-xs"
              value=""
              onChange={() => {}}
            />
            <button className="w-14 h-11 bg-stone-800 text-white rounded-md flex items-center justify-center">
              {!searchLoading ? (
                <SearchIcon />
              ) : (
                <TailSpin
                  height="25"
                  width="25"
                  color="#fff"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={searchLoading}
                />
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg mt-16">
          <table className="custom-table table  table-zebra">
            {/* head */}
            <thead className="bg-stone-700  text-white ">
              <tr>
                {columns.map((item, index) => (
                  <th key={index} className="text-lg">
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-semibold">
              {!paiements.length ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                !loading &&
                paiements.map((item, index) => (
                  <tr key={index}>
                    <td>{item.souscription.client.nomPrenoms}</td>
                    <td>
                      {item.montant
                        ? item.montant
                        : item.souscription.modalite.prix}
                    </td>
                    <td>{item.reference}</td>
                    <td>
                      {item.numeroPaiement
                        ? item.numeroPaiement
                        : item.souscription.client.numero}
                    </td>
                    <td>{item.datePaiement}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
