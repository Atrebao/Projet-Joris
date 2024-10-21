import React, { useEffect, useState } from "react";
import axios from "axios";
import requests from "../../src/Request";
import Carousel from "../components/Carousel";
import Services from "../components/Services";
export default function () {
    const [movies, setMovies] = useState([]);
    const [images, setImages] = useState([]);
  
    useEffect(() => {
      axios.get(requests.requestPopular).then((res) => {
        setMovies(res.data.results);
        const data = res.data.results;
        const img = data.map(movie => movie.backdrop_path); // Extraction des chemins des images
        setImages(img); // Met à jour les images sans créer de tableau imbriqué
      });
    }, []);



  return (
    <div className="w-full h-full md:py-[65px]   ">
      <div className="w-full h-full">
        {/* <div className="absolute w-full h-[550px] bg-gradient-to-r from-black "></div> */}
        <Carousel images={images}/>
        <Services/>
      </div>
    </div>
  );
}
