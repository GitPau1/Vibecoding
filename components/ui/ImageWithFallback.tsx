
import React, { useState, useEffect } from 'react';
import { SoccerBallIcon } from '../icons/SoccerBallIcon';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className, fallbackClassName, ...props }) => {
  const [error, setError] = useState(!src);

  useEffect(() => {
    setError(!src);
  }, [src]);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className} ${fallbackClassName}`}>
        <SoccerBallIcon className="w-1/4 h-1/4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
