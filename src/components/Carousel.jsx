import { useState, useEffect } from 'react';
import React from 'react'

export default function Carousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Changer toutes les 5 secondes
  
      return () => {
        clearInterval(interval); // Nettoyer l'intervalle au démontage
      };
    }, [images.length]);
  
    return (
      <div className="relative w-full h-[700px] mb-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={`https://image.tmdb.org/t/p/original${ images[currentIndex]}`}
            alt={`Carousel ${currentIndex}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
}
