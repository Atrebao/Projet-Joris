import React, { useState, useEffect } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StatCard from "../components/StatCard";
import { getUserProfil, HOMEADMIN, months } from "../Utils/Utils";
import { DateFilter } from "../components/DateFilter";
import { getGrapheChiffreAffaire } from "../services/StatsService";
import {useNavigate} from 'react-router-dom'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);
export default function Stats() {
  const navigate = useNavigate();
  const [loadingData, setloadingData] = useState(true);
  const [grapheChiffreAffaire, setGrapheChiffreAffaire] = useState({
    data: {
      labels: months.map((item) => item.name),
      datasets: [
        {
          label: "Chiffre d'affaire",
          data: [159, 800, 281, 856, 515, 140, 265, 159, 780, 181, 256, 455],
          backgroundColor: "#33b2ff",
          borderColor: "white",
          borderRadius: 3,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "",
        },
      },
      scales: {
        y: {
          display: false,
        },
        xAxes: [
          {
            maxBarThickness: 100,
          },
        ],
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  const recupereChiffreAffaire = (filterParam) => {
    getGrapheChiffreAffaire("", "application/json", filterParam)
      .then((res) => {
        setGrapheChiffreAffaire((prev) => ({
          ...prev,
          data: {
            labels: res.data.labels,
            datasets: [
              {
                label: "Chiffre d'affaire",
                data: res.data.data,
                backgroundColor: "#fbbf24",
                borderColor: "white",
                borderRadius: 3,
                borderSkipped: false,
              },
            ],
          },
        }));
      })
      .catch((err) => {});
  };

  useEffect(() => {
    if (!getUserProfil()) {
      navigate(`${HOMEADMIN}/login`)
    }
  }, [])

  useEffect(() => {
    const date = new Date();

    const filterParam = {
      periode: "MOIS",
      mois: date.getMonth() + 1,
      annee: date.getFullYear(),
      dateDebut: "",
      dateFin: "",
      status: "",
    };

    //recupereChiffreAffaire(filterParam);
  }, []);

  const filterChiffreAffaireByParam = (filter) => {
    const filterParam = {
      periode: filter.periode,
      mois: filter.mois,
      annee: filter.annee,
      dateDebut: filter.debut,
      dateFin: filter.fin,
      status: filter.status,
    };
    recupereChiffreAffaire(filterParam);
  };

  return (
    <div className="w-11/12 h-full mx-auto pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Tableau de bord</h1>
        <div className="bg-muted/50 gap-4 ">
          <DateFilter filtrerChiffreAffaire={filterChiffreAffaireByParam} />
        </div>
      </div>
      <div className="w-full py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="w-full  max-w-lg  p-5 bg-white rounded-xl  shadow-md flex items-center justify-between ">
          <div className="">
            <p className="text-gray-600 pb-3 font-semibold">Chiffre affaire</p>
            <h2 className="text-3xl font-bold ">0 F CFA</h2>
          </div>
          <div className="p-3 rounded-full bg-stone-700 text-md text-white">
            <AttachMoneyIcon />
          </div>
        </div>
        <StatCard
          designation={"Total souscription"}
          total={0}
          rappord={0}
          icon={AttachMoneyIcon}
        />
        <div className="w-full  max-w-lg  p-5 bg-white rounded-xl  shadow-md flex items-center justify-between ">
          <div className="">
            <p className="text-gray-600 pb-3 font-semibold">Total client</p>
            <h2 className="text-3xl font-bold ">0 </h2>
            <p className="text-xs font-semibold text-orange-400">
              Rapport jour 0
            </p>
          </div>
          <div className="p-3 rounded-full bg-stone-700 text-md text-white">
            <AttachMoneyIcon />
          </div>
        </div>
      </div>
      <div className="w-full  pt-7 rounded-sm shadow-md p-3 bg-white">
        <h1 className="text-md font-semibold">Chiffre d'affaire</h1>
        <Bar
          className="mt-2 p-4"
          height={90}
          options={grapheChiffreAffaire.options}
          data={grapheChiffreAffaire.data}
        />
      </div>
    </div>
  );
}
