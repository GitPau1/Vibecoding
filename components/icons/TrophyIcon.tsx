
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-1 1.2-1.6.6-3.4.6-5 0A1.2 1.2 0 0 1 3 17v-2.34" />
    <path d="M14 14.66V17c0 .55.47.98 1 1.2 1.6.6 3.4.6 5 0A1.2 1.2 0 0 0 21 17v-2.34" />
    <path d="M18 12H6v-6c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4v6z" />
  </svg>
);
