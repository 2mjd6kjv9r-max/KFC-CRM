import React from 'react';

const SandersIcon = ({ size = 32, color = "#E4002B", className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Glasses */}
        <circle cx="35" cy="45" r="12" stroke={color} strokeWidth="5" fill="none" />
        <circle cx="65" cy="45" r="12" stroke={color} strokeWidth="5" fill="none" />
        <line x1="47" y1="45" x2="53" y2="45" stroke={color} strokeWidth="5" />

        {/* Eyebrows */}
        <path d="M25 32 Q35 25 45 32" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M55 32 Q65 25 75 32" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Goatee/Beard simplified */}
        <path d="M40 68 Q50 78 60 68" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M48 72 L42 88 H58 L52 72" fill={color} />

        {/* String Tie */}
        <path d="M50 90 L35 98 M50 90 L65 98" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="90" r="4" fill={color} />
    </svg>
);

export default SandersIcon;
