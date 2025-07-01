
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, ...props }) => {
  const baseClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a54ff] focus:ring-[#0a54ff] sm:text-sm p-2";
  const combinedClasses = `${baseClasses} ${className}`;
  
  return <select className={combinedClasses} {...props} />;
};
