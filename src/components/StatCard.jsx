import React from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";


export default function StatCard({ designation, total, rappord, icon }) {

    const iconMap = {
        AttachMoneyIcon: <AttachMoneyIcon  />,
        
      };

  return (
    <div className="w-full  max-w-lg  p-5 bg-white rounded-xl  shadow-md flex items-center justify-between ">
      <div className="">
        <p className="text-gray-600 pb-3 font-semibold">{designation}</p>
        <h2 className="text-3xl font-bold ">{total} </h2>
        <p className="text-xs font-semibold text-orange-400">Rapport jour {rappord}</p>
      </div>
      <div className="p-3 rounded-full bg-stone-700 text-md text-white">
       {iconMap[icon]}
      </div>
    </div>
  );
}
