import React, { useState } from "react";
import netflix from "../assets/images/netflix.jpg";
import { DATA } from "../data/data";

import Service from "./Service";
export default function Services() {
  const [data, setData] = useState(DATA);


  return (
    <div className="max-w-[1640px] mx-auto  px-4 py-1 ">
      <h1 className="text-blue-300 font-bold text-4xl text-center">
        NOS SERVICES
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-10 lg:pl-[100px] py-10">
        {DATA.map((item, index) => (
          <Service key={index} item={item} />
        ))}
      </div>


    </div>
  );
}
