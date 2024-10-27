import React from "react";
import { categories } from "../data/data";
export default function () {
  return (
    <div className="mx-auto my-[50px]">
      <h1 className="text-blue-300 font-bold text-4xl text-center py-10 ">
        NOS SERVICES
      </h1>
      <div className="w-3/4 mx-auto carousel  flex items-center space-x-4 p-4   ">
        {categories.map((data, index) => (
          <div className="carousel-item">
            <div
              className={`  ${data.bgColor} w-[200px] h-[250px] rounded-[30px]  shadow-[0_20px_13px_-10px_rgba(0,0,0,0.5)]  flex items-center justify-center cursor-pointer hover:scale-105 duration-300 '`}
            >
              <img src={data.image} className="w-24 rounded-full " alt="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
