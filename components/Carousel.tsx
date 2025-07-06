
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

type CarouselItem = {
  id: string;
  title: string;
  imageUrl?: string;
  path: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(nextSlide, 5000);
    return () => resetTimeout();
  }, [currentIndex, nextSlide, resetTimeout]);

  const handleMouseEnter = () => resetTimeout();
  const handleMouseLeave = () => {
      resetTimeout();
      timeoutRef.current = setTimeout(nextSlide, 5000);
  };
  
  if (items.length === 0) return null;

  return (
    <div 
        className="carousel-container" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map(item => (
          <div key={item.id} className="carousel-slide" onClick={() => navigate(item.path)}>
            <img src={item.imageUrl || `https://via.placeholder.com/800x400?text=${encodeURIComponent(item.title)}`} alt={item.title} />
            <div className="overlay">
              <h3 className="slide-title">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="carousel-nav left">
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="carousel-nav right">
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-indicator ${currentIndex === index ? 'active' : ''}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
