import React, { useState, useEffect } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StatCard from "../components/StatCard";
import { getUserProfil, HOMEADMIN, months } from "../Utils/Utils";
import { DateFilter } from "../components/DateFilter";
import { getGrapheChiffreAffaire } from "../services/StatsService";
import { useNavigate } from "react-router-dom";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { RECHERCHER_CHIFFRE_AFFAIRE } from "../Utils/constant";
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
    getGrapheChiffreAffaire(
      RECHERCHER_CHIFFRE_AFFAIRE,
      "application/json",
      filterParam
    )
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

        console.log(res.data);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    if (!getUserProfil()) {
      navigate(`${HOMEADMIN}/login`);
    }
  }, []);

  useEffect(() => {
    const date = new Date();

    const filterParam = {
      periode: "MOIS",
      mois: date.getMonth() + 1,
      annee: date.getFullYear(),
      dateDebut: "",
      dateFin: "",
    };

    recupereChiffreAffaire(filterParam);
  }, []);

  const filterChiffreAffaireByParam = (filter) => {
    const filterParam = {
      periode: filter.periode,
      mois: filter.mois,
      annee: filter.annee,
      dateDebut: filter.debut,
      dateFin: filter.fin,
    };
    recupereChiffreAffaire(filterParam);
  };

  return (
    <div className="w-11/12 mx-auto pt-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Tableau de bord</h1>
        <div className="bg-muted/50 p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
          <DateFilter filtrerChiffreAffaire={filterChiffreAffaireByParam} />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Chiffre d'affaires"
          value="0 F CFA"
          icon={<AttachMoneyIcon className="text-white" />}
          bgColor="bg-green-600"
        />
        <StatCard
          title="Total souscriptions"
          value="0"
          icon={<AttachMoneyIcon className="text-white" />}
          bgColor="bg-blue-600"
        />
        <StatCard
          title="Total clients"
          value="0"
          subtitle="Rapport jour 0"
          icon={<AttachMoneyIcon className="text-white" />}
          bgColor="bg-orange-600"
        />
      </div>

      {/* Graph Section */}
      <div className="w-full mt-10 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Chiffre d'affaire
        </h2>
        <Bar
          className="mt-2"
          height={90}
          options={grapheChiffreAffaire.options}
          data={grapheChiffreAffaire.data}
        />
      </div>
    </div>
  );
}
