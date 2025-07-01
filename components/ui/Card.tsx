
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  const combinedClasses = `bg-white border border-gray-200 rounded-lg shadow-sm ${className}`;
  return <div className={combinedClasses} {...props} />;
};
