
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: 'input' | 'textarea';
}

export const Input: React.FC<InputProps> = ({ className, as = 'input', ...props }) => {
  const baseClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a54ff] focus:ring-[#0a54ff] sm:text-sm p-2";
  const combinedClasses = `${baseClasses} ${className}`;
  
  if (as === 'textarea') {
    return <textarea className={combinedClasses} rows={3} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />;
  }
  
  return <input className={combinedClasses} {...props as React.InputHTMLAttributes<HTMLInputElement>} />;
};
