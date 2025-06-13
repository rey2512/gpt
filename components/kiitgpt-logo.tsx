import React from "react";

export const KiitGptLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* Rounded square background */}
      <rect x="2" y="2" width="20" height="20" rx="6" />
      
      {/* Chat bubble shape */}
      <path 
        d="M7 10h10M7 14h6"
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M17 14l-3 3v-3h3z"
        fill="white"
        stroke="white" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}; 