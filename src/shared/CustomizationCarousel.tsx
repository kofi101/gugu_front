import React, { useState } from 'react';

interface CarouselProps {
  images: string[];
}

const CustomizationCarousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images?.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images?.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        className="object-cover w-full h-64 rounded-lg shadow-md"
      />

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 left-2 hover:bg-opacity-75"
      >
        &larr;
      </button>

      <button
        onClick={nextSlide}
        className="absolute p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 right-2 hover:bg-opacity-75"
      >
        &rarr;
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-2 space-x-2">
        {images?.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${currentIndex === idx ? 'bg-gray-800' : 'bg-gray-300'}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomizationCarousel;
