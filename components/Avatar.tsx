import React from 'react';
import { AvatarConfig } from '../types';

interface Props {
  config: AvatarConfig | undefined;
  size?: number;
  className?: string;
}

const Avatar: React.FC<Props> = ({ config, size = 64, className = "" }) => {
  // Defaults if no config provided
  const safeConfig: AvatarConfig = config || {
    skinTone: '#f5d0b0',
    profession: 'office',
    hairColor: '#4a3020',
    accessory: 'none',
    mouth: 'smile',
    gender: 'male'
  };

  const { skinTone, profession, hairColor, accessory, mouth, gender } = safeConfig;

  // Helpers for profession colors
  const getVestColor = () => {
    switch (profession) {
      case 'construction': return '#ff6b00'; // Orange
      case 'crane': return '#ffcc00'; // Yellow
      case 'electrician': return '#eaff00'; // Lime/Yellow
      case 'plumber': return '#0066cc'; // Blue (Overalls)
      case 'carpenter': return '#8b4513'; // Brown plaid base
      default: return '#3b82f6'; // Office Blue
    }
  };

  const getHelmetColor = () => {
    switch (profession) {
      case 'construction': return '#ffffff'; // White hardhat
      case 'crane': return '#ffcc00'; // Yellow hardhat
      case 'electrician': return '#ffffff'; // White
      default: return null;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`rounded-full shadow-sm bg-blue-50 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="50" fill="#e0f2fe" />

      {/* Body / Shoulders */}
      <path d="M20 90 Q50 100 80 90 L80 110 L20 110 Z" fill={getVestColor()} />
      <path d="M20 90 Q20 70 35 65 L65 65 Q80 70 80 90" fill={getVestColor()} />
      
      {/* Profession Details: Vests Reflectors / Suspenders */}
      {(profession === 'construction' || profession === 'crane' || profession === 'electrician') && (
         <path d="M30 90 L35 65 M70 90 L65 65" stroke="#ccc" strokeWidth="4" />
      )}
      {profession === 'plumber' && (
         <path d="M35 65 L35 90 M65 65 L65 90" stroke="#004c99" strokeWidth="4" /> 
      )}

      {/* Neck */}
      <rect x="40" y="55" width="20" height="15" fill={skinTone} />

      {/* Head */}
      <circle cx="50" cy="45" r="22" fill={skinTone} />

      {/* Hair (Behind Head for women or long hair) */}
      {gender === 'female' && profession === 'office' && (
          <path d="M28 45 Q20 60 25 75 Q50 80 75 75 Q80 60 72 45" fill={hairColor} />
      )}

      {/* Face Features */}
      {/* Eyes */}
      <circle cx="43" cy="42" r="2.5" fill="#333" />
      <circle cx="57" cy="42" r="2.5" fill="#333" />

      {/* Mouth */}
      {mouth === 'smile' && (
        <path d="M40 52 Q50 60 60 52" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      )}
      {mouth === 'neutral' && (
        <line x1="42" y1="55" x2="58" y2="55" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      )}
      {mouth === 'braces' && (
        <g>
             <path d="M40 52 Q50 60 60 52" fill="#fff" stroke="#333" strokeWidth="1" />
             <path d="M41 53 Q50 61 59 53" fill="none" stroke="#999" strokeWidth="1" />
             <line x1="45" y1="52" x2="45" y2="57" stroke="#999" strokeWidth="0.5" />
             <line x1="50" y1="54" x2="50" y2="58" stroke="#999" strokeWidth="0.5" />
             <line x1="55" y1="52" x2="55" y2="57" stroke="#999" strokeWidth="0.5" />
        </g>
      )}

      {/* Accessories */}
      {(accessory === 'glasses' || accessory === 'sunglasses') && (
        <g>
            <circle cx="43" cy="42" r="6" fill={accessory === 'sunglasses' ? '#333' : 'none'} stroke="#333" strokeWidth="1.5" />
            <circle cx="57" cy="42" r="6" fill={accessory === 'sunglasses' ? '#333' : 'none'} stroke="#333" strokeWidth="1.5" />
            <line x1="49" y1="42" x2="51" y2="42" stroke="#333" strokeWidth="1.5" />
        </g>
      )}

      {/* Hair Top / Headgear */}
      {getHelmetColor() ? (
        // Hard Hat
        <g>
            <path d="M26 40 Q50 15 74 40" fill={getHelmetColor() || '#fff'} stroke="#333" strokeWidth="0.5"/>
            <rect x="24" y="38" width="52" height="6" rx="2" fill={getHelmetColor() || '#fff'} stroke="#333" strokeWidth="0.5" />
            {profession === 'electrician' && (
                // Lightning bolt on helmet
                <path d="M48 25 L54 25 L50 31 L56 31 L46 38 L48 31 L44 31 Z" fill="#FFD700" />
            )}
        </g>
      ) : profession === 'plumber' || profession === 'carpenter' ? (
        // Cap
        <g>
            <path d="M26 35 Q50 20 74 35 L74 40 L26 40 Z" fill={profession === 'plumber' ? '#004c99' : '#8b4513'} />
            <path d="M24 38 Q50 38 76 38 L85 42 L24 42 Z" fill={profession === 'plumber' ? '#004c99' : '#8b4513'} />
        </g>
      ) : (
        // Normal Hair (Male/Short)
        <path d="M28 40 Q50 15 72 40" fill={hairColor} />
      )}
      
      {/* Hair for female (Bangs) if not helmet */}
      {gender === 'female' && !getHelmetColor() && profession === 'office' && (
          <path d="M28 40 Q50 45 72 40" fill={hairColor} stroke={hairColor} strokeWidth="2"/>
      )}

    </svg>
  );
};

export default Avatar;