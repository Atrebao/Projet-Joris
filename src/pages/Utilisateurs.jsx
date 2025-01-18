import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import { Pagination, Skeleton } from "@mui/material";
import {
  PowerIcon,
  PowerOffIcon,
  Settings2Icon,
  UserRoundCogIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import EditPenIcon from "../assets/icons/pen.svg";
import TrashIcon from "../assets/icons/trash.svg";
import { useStoreUser } from "../store/user";
import AjouterModifierUtilisateur from "../components/AjouterModifierUtilisateur";
import { getUserProfil, HOMEADMIN } from "../Utils/Utils";

export default function Utilisateurs() {
  const [searchLoading, setSearchLoading] = useState(false);
  const usersStore = useStoreUser();
  const loading = usersStore.loading;

      useEffect(() => {
        if (!getUserProfil()) {
          navigate(`${HOMEADMIN}/login`);
        }
      }, []);

        useEffect(() => {
          usersStore.getAllData();
        }, []);

  const columns = [
    {
      name: "Nom et prenoms",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.nomPrenoms
        ),
      sortable: true,
    },
    {
      name: "Username",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.username
        ),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          row.email
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
      name: "Action",
      cell: (row) =>
        loading ? (
          <Skeleton animation="wave" variant="text" width={80} />
        ) : (
          <div className="flex items-center gap-x-3">
            <div className="tooltip" data-tip="Modifier">
              <button
                onClick={() => {
                  document.getElementById("add_user").showModal();
                }}
                className="w-7 h-7 rounded-lg bg-main flex items-center justify-center"
              >
                <img src={EditPenIcon} alt="icon" className="w-4" />
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  document.getElementById("disable").showModal();
                }}
                className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center"
              >
                <img src={TrashIcon} alt="icon" className="w-4" />
              </button>
            </div>
            <dialog id="disable" className="modal">
              <div className="modal-box max-w-md rounded-lg">
                <h3 className="font-extrabold text-xl text-red-600 ">
                  Attention
                </h3>
                <p className="pt-2 text-black font-medium">
                  Voulez vous vraiment effectuer cette action ?
                </p>
                <div className="modal-action">
                  <form
                    method="dialog"
                    className="w-full flex items-center justify-end gap-x-4"
                  >
                    <button className="bg-gray-100 text-gray-600 w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold">
                      Annuler
                    </button>
                    <button className="bg-red-600 text-white w-fit h-10 px-4 rounded-md flex items-center justify-center font-semibold">
                      Désactiver
                    </button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        ),
    },
  ];

  return (
    <div className="w-11/12 h-full mx-auto pt-14">
      <h1 className="text-4xl font-bold">Utilisateurs</h1>
      <div className="w-full p-5 bg-white rounded-md mt-10">
        <div className="w-full pt-5 flex items-center justify-between">
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
          <button
            onClick={() => {
              document.getElementById("add_user").showModal();
            }}
            className="p-3 rounded-lg shadow-sm bg-stone-700 hover:bg-stone-800 transition-all text-white "
          >
            Ajouter un utilisateur
          </button>
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
              {!usersStore?.data?.length ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                !loading &&
                usersStore.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nom}</td>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                    <td>{item.telephone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog pour ajouter un abonnement */}
    
        <dialog id="add_user" className="modal">
          <div className="modal-box w-10/12 max-w-2xl">
            <div className="modal-action">
              <h1 className="mr-auto text-2xl font-bold font-mtn mb-8">
                Enregistrer utilisateur
              </h1>
              <form method="dialog">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold">
                  ✕
                </button>
              </form>
            </div>
            <AjouterModifierUtilisateur />
          </div>
        </dialog>
    
    </div>
  );
}
