import React, { useState } from "react";
import ReactDatePicker from "react-datepicker";
import { months, years } from "../Utils/Utils"

export const DateFilter = ({ filtrerChiffreAffaire }) => {
    const date = new Date();
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    const [startDate, endDate] = dateRange;
    const [selectPeriode, setSelectPeriode] = useState("MOIS");
    const [selectMois, setSelectMois] = useState(date.getMonth() + 1);
    const [selectAnnee, setSelectAnnee] = useState(date.getFullYear());
  
    // Formatage de la date
    function formatDate(date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  
    const updateFiltre = (periode, mois, annee, debut, fin, status = "") => {
      const payload = {
        periode,
        mois,
        annee,
        debut: formatDate(debut),
        fin: formatDate(fin),
        status,
      };
  
      if (filtrerChiffreAffaire) filtrerChiffreAffaire(payload);
    };
  
    return (
      <div className="ml-auto lg:flex gap-x-3">
        <select
          value={selectPeriode}
          onChange={(e) => {
            setSelectPeriode(e.target.value);
            updateFiltre(e.target.value, selectMois, selectAnnee, startDate, endDate);
          }}
          className="my-2 select"
        >
          <option value="JOUR">Période</option>
          <option value="MOIS">Filtre par mois</option>
          <option value="ANNEE">Filtre par années</option>
        </select>
  
        {selectPeriode === "MOIS" && (
          <div className="flex items-center gap-x-3">
            <select
              value={selectMois}
              onChange={(e) => {
                setSelectMois(Number(e.target.value));
                updateFiltre(selectPeriode, Number(e.target.value), selectAnnee, startDate, endDate);
              }}
              className="my-2 select"
            >
              <option disabled>Mois</option>
              {months.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={selectAnnee}
              onChange={(e) => {
                setSelectAnnee(Number(e.target.value));
                updateFiltre(selectPeriode, selectMois, Number(e.target.value), startDate, endDate);
              }}
              className="my-2 select"
            >
              <option disabled>Années</option>
              {years.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
  
        {selectPeriode === "ANNEE" && (
          <select
            value={selectAnnee}
            onChange={(e) => {
              setSelectAnnee(Number(e.target.value));
              updateFiltre(selectPeriode, selectMois, Number(e.target.value), startDate, endDate);
            }}
            className="my-2 select"
          >
            <option disabled>Années</option>
            {years.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        )}
  
        {selectPeriode === "JOUR" && (
          <ReactDatePicker
            dateFormat="dd-MM-yyyy"
            selected={startDate}
            onChange={(update) => {
              if (update[1]) {
                updateFiltre(selectPeriode, selectMois, selectAnnee, update[0], update[1]);
              }
              setDateRange(update);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            className="text-sm font-normal cursor-pointer btn btn-sm hover:bg-gray-100 text-center h-10 my-2 w-52 rounded-md border border-input bg-gray-100 px-3 py-1 shadow-sm"
          />
        )}
      </div>
    );
  };
  