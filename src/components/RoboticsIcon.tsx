import React from 'react';

interface RoboticsIconProps {
  className?: string;
}

export default function RoboticsIcon({ className = "w-5 h-5" }: RoboticsIconProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Outer rounded container with the icon's signature red background */}
      <rect 
        width="100" 
        height="100" 
        rx="22" 
        fill="#cf2d2d" 
      />
      
      {/* Friendly robot face silhouette in custom-glowing solid white */}
      
      {/* Antenna tip ball */}
      <circle cx="50" cy="19" r="6" fill="white" />
      
      {/* Antenna stem */}
      <rect x="47" y="23" width="6" height="12" rx="2" fill="white" />
      
      {/* Left and Right Ears/Receivers */}
      <rect x="18" y="46" width="6" height="18" rx="3" fill="white" />
      <rect x="76" y="46" width="6" height="18" rx="3" fill="white" />
      
      {/* Main head element */}
      <rect x="23" y="33" width="54" height="43" rx="11" fill="white" />
      
      {/* Eye visa/cutout circles using the background red */}
      <circle cx="39" cy="51" r="5.5" fill="#cf2d2d" />
      <circle cx="61" cy="51" r="5.5" fill="#cf2d2d" />
      
      {/* Friendly eye shine reflections */}
      <circle cx="41" cy="49" r="1.8" fill="white" />
      <circle cx="63" cy="49" r="1.8" fill="white" />
      
      {/* Polite smiling vector mouth track */}
      <rect x="37" y="63" width="26" height="4" rx="2" fill="#cf2d2d" />
    </svg>
  );
}
