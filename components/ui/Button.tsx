import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses = {
    primary: "bg-[#6366f1] text-white hover:bg-[#4f46e5] focus:ring-[#4f46e5]",
    outline: "border border-gray-400 bg-white text-[#6366f1] hover:bg-indigo-50 focus:ring-[#6366f1]",
  };

  const sizeClasses = {
    sm: 'text-xs px-4 py-1.5',
    md: 'text-sm px-4 py-2 md:px-5 md:py-2.5',
    lg: 'text-base px-7 py-3',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return <button className={combinedClasses} {...props} />;
};
