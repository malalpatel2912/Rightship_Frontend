'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const 
ListCompany = ({
  // Images array containing either URLs or imported image objects
  images = [],
  // Optional custom title
  title = "Image Gallery",
  // Optional custom gradient colors for title
  titleGradient = {
    from: "#1079B5",
    to: "#C11010"
  },
  // Number of items to show per slide
  itemsPerSlide = 6,
  // Auto-play interval in milliseconds
  autoPlayInterval = 16000,
  // Custom classes for image container
  imageContainerClassName = "px-4 py-8 bg-[#88c4ec] rounded-xl",
  // Custom classes for individual images
  imageClassName = "w-full max-h-20 object-contain",
  // Optional click handler for images
  onImageClick = null,
  // Optional alt text generator
  getAltText = (index) => `Image ${index + 1}`
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = Math.ceil(images.length / itemsPerSlide);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlayInterval > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [totalSlides, autoPlayInterval]);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Get current slide images
  const getCurrentImages = () => {
    const startIndex = currentIndex * itemsPerSlide;
    return images.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div className="py-10 bg-gray-50">
      {/* Title Section */}
      {title && (
        <h2 className="text-3xl font-bold text-center mb-6">
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-r"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${titleGradient.from}, ${titleGradient.to})`
            }}
          >
            {title}
          </span>
        </h2>
      )}

      {/* Carousel Container */}
      <div className="relative group px-6 md:px-8 lg:px-12">
        <div className="grid gap-6 transition-all duration-300 ease-in-out">
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 grid-rows-2 gap-4 lg:gap-6 py-6">
            {getCurrentImages().map((image, index) => (
              <div
                key={currentIndex * itemsPerSlide + index}
                className={imageContainerClassName}
                onClick={() => onImageClick?.(currentIndex * itemsPerSlide + index)}
                role={onImageClick ? "button" : "presentation"}
              >
                <a target='_blank' href={image.link}>
                <img
                  src={image.image}
                  alt={getAltText(currentIndex * itemsPerSlide + index)}
                  className={imageClassName}
                />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 
                     bg-white shadow-md p-2 rounded-full 
                     border-2 border-gray-300 
                     hover:border-[#084C73] 
                     transition-all duration-300 ease-in-out"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <ChevronLeft size={32} className="text-[#C1C1C1] hover:text-[#084C73] transition-colors duration-300" />
        </button>

        <button
          className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 
                     bg-white shadow-md p-2 rounded-full 
                     border-2 border-gray-300 
                     hover:border-[#084C73] 
                     transition-all duration-300 ease-in-out"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight size={32} className="text-[#C1C1C1] hover:text-[#084C73] transition-colors duration-300" />
        </button>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${
                index === currentIndex
                  ? "bg-blue-500 scale-125"
                  : "bg-gray-400 hover:bg-gray-600"
              } transition-all duration-300`}
              onClick={() => goToSlide(index)}
              role="button"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListCompany;