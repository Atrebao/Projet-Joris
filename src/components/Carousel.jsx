import { useState, useEffect } from "react";
import React from "react";
import requests from "../Request";
import axios from "axios";

export default function Carousel() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState([]);
    const [titles, setTitles] = useState([]);
    const [overViews, setOverViews] = useState([]);

    useEffect(() => {
      axios.get(requests.requestPopular).then((res) => {
        const data = res.data.results;
        const img = data.map((movie) => movie.backdrop_path);
        const titres = data.map((movie) => movie.title);
        const overs = data.map((movie) => movie.overview);
        setImages(img);
        setTitles(titres);
        setOverViews(overs)
        console.log(images);
      });
    }, []);

    useEffect(() => {
      if (images.length > 0) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
          );
        }, 5000);

        return () => {
          clearInterval(interval);
        };
      }
    }, [images.length]);

    if (images.length === 0) {
      return <p>Chargement...</p>;
    }

    const truncateString = (str, num) => {
      if (str?.length > num) {
        return str.slice(0, num) + "...";
      } else {
        return str;
      }
    };

    return (
      <div className="relative w-full h-[700px] mb-10">
        <div className="absolute inset-0 flex items-center justify-center">
          {images[currentIndex] && (
            <img
              src={`https://image.tmdb.org/t/p/original${images[currentIndex]}`}
              alt={`Image du film: ${titles[currentIndex]}`}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute w-full top-[40%] p-4 md:p-8">
          <h1 className="text-3xl text-blue-400 font-bold md:text-5xl">
            {titles[currentIndex] || "Titre non disponible"}
          </h1>
          <p className="text-gray-100 text-md">{truncateString(overViews[currentIndex],150)}</p>
        </div>
      </div>
    );
  };

