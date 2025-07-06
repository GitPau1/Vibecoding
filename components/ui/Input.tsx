
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: 'input' | 'textarea';
  rows?: number;
}

export const Input: React.FC<InputProps> = ({ className, as = 'input', rows, ...props }) => {
  const baseClasses = "block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] sm:text-sm p-2.5";
  const combinedClasses = `${baseClasses} ${className}`;
  
  if (as === 'textarea') {
    return <textarea className={combinedClasses} rows={rows || 3} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />;
  }
  
  return <input className={combinedClasses} {...props as React.InputHTMLAttributes<HTMLInputElement>} />;
};
