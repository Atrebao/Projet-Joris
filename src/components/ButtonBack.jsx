import React from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function ButtonBack({title, textSize}) {
  const handleBack = () => {
    window.history.back();
  };
  return (
    <div
      onClick={handleBack}
      className="flex items-center cursor-pointer"
    >
      <div className="p-2 bg-white flex justify-center shadow-md rounded-md mr-4">
        <ArrowBackIosNewIcon sx={{ fontSize: 10 }} />
      </div>
      <h1 className={`text-${textSize} font-bold`}>{title}</h1>
    </div>
  );
}
