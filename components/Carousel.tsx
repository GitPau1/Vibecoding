

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './ui/ImageWithFallback';

type CarouselItem = {
  id: string;
  title: string;
  imageUrl?: string;
  path: string;
  category: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const hasDraggedRef = useRef(false);

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

  const getPositionX = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): number => {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
  }
  
  const getPositionXFromUp = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): number => {
    return 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
  }

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = getPositionX(e);
    resetTimeout();
    if(containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
    }
  }, [resetTimeout]);

  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
    }
    
    if (hasDraggedRef.current) {
        const endX = getPositionXFromUp(e);
        const moved = endX - startXRef.current;
        if (moved < -50) { // Swiped left
          nextSlide();
        } else if (moved > 50) { // Swiped right
          prevSlide();
        }
    } else {
      // It's a click because it didn't meet the drag threshold
      const currentItem = items[currentIndex];
      if (currentItem.path.startsWith('http')) {
        window.open(currentItem.path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(currentItem.path);
      }
    }
    
    timeoutRef.current = setTimeout(nextSlide, 5000);
  }, [nextSlide, prevSlide, items, currentIndex, navigate]);
    
  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if(!isDraggingRef.current) return;
      const currentX = getPositionX(e);
      if (Math.abs(currentX - startXRef.current) > 10) { // Drag threshold
        hasDraggedRef.current = true;
      }
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
        handleDragEnd(e);
    }
  }, [handleDragEnd]);

  if (items.length === 0) return null;

  return (
    <div 
        ref={containerRef}
        className="carousel-container h-[240px] md:h-[320px] desktop:h-[400px]" 
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map(item => (
          <div key={item.id} className="carousel-slide">
            {item.imageUrl ? (
              <ImageWithFallback src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="carousel-fallback-gradient"></div>
            )}
            <div className="overlay">
              <div className="carousel-content-wrapper">
                <div className="carousel-chip">{item.category}</div>
                <h3 className="carousel-title text-white text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight line-clamp-2">{item.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
                e.stopPropagation(); // Prevent drag end from firing
                goToSlide(index)
            }}
            className={`carousel-indicator ${currentIndex === index ? 'active' : ''}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;