
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, ...props }) => {
  const baseClasses = "block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] sm:text-sm p-2.5";
  const combinedClasses = `${baseClasses} ${className}`;
  
  return <select className={combinedClasses} {...props} />;
};