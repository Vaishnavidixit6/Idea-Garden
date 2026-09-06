import React from 'react';

/**
 * Botanical & Whimsical SVG Illustrations and Decorative Accents
 * Crafted with organic lines, earthy tones, and warm greenhouse aesthetic.
 */

// A cheerful little seedling in rich sage and soil
export const BotanicalSprout: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Soil mound */}
    <ellipse cx="24" cy="42" rx="14" ry="3.5" fill="#B8A48B" opacity="0.6" />
    <path
      d="M13 41.5C16 39 32 39 35 41.5"
      stroke="#8C765C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Stem */}
    <path
      d="M24 41C24 33 23 25 24 16"
      stroke="#4A6B48"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Left leaf */}
    <path
      d="M24 24C17 24 10 20 10 14C16 13 22 17 24 24Z"
      fill="#6E8E6A"
      stroke="#3B5A39"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Right leaf */}
    <path
      d="M24 20C30 19 37 14 38 8C31 8 26 13 24 20Z"
      fill="#88A882"
      stroke="#4A6B48"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Tiny dewdrop */}
    <circle cx="21" cy="17" r="1.5" fill="#E8F4E5" opacity="0.9" />
  </svg>
);

// A cozy terracotta flower pot with a sprouting idea
export const PottedPlant: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Terracotta pot rim */}
    <rect x="18" y="38" width="28" height="6" rx="2" fill="#C86D51" stroke="#8E4630" strokeWidth="1.5" />
    {/* Terracotta pot base */}
    <path
      d="M20 44L23 58C23.2 59 24.2 60 25.4 60H38.6C39.8 60 40.8 59 41 58L44 44H20Z"
      fill="#D97A5C"
      stroke="#8E4630"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Pot shading */}
    <path d="M22 44L24 57C24.1 57.5 24.6 58 25.2 58H28L26 44H22Z" fill="#C86D51" opacity="0.4" />
    {/* Stem */}
    <path d="M32 38C32 28 30 20 32 12" stroke="#486846" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left leaf */}
    <path
      d="M31 28C22 28 14 24 15 16C23 16 29 21 31 28Z"
      fill="#6B8E67"
      stroke="#3A5838"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Right leaf */}
    <path
      d="M32 23C41 23 48 18 47 10C39 10 34 16 32 23Z"
      fill="#86A882"
      stroke="#486846"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Top budding leaf / flower bud */}
    <ellipse cx="32" cy="11" rx="3.5" ry="5" fill="#E8A678" stroke="#B86C42" strokeWidth="1.5" />
    <path d="M30 14C30 9 32 6 32 6C32 6 34 9 34 14" stroke="#486846" strokeWidth="1.2" />
  </svg>
);

// Pressed daisy / botanical blossom
export const BotanicalFlower: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Petals */}
    <circle cx="16" cy="8" r="4.5" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="24" cy="16" r="4.5" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="16" cy="24" r="4.5" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="8" cy="16" r="4.5" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="10" cy="10" r="4" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="22" cy="10" r="4" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="22" cy="22" r="4" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    <circle cx="10" cy="22" r="4" fill="#FFFDF8" stroke="#D8CDBB" strokeWidth="1" />
    {/* Center core */}
    <circle cx="16" cy="16" r="4.5" fill="#E9B858" stroke="#C29235" strokeWidth="1.2" />
    <circle cx="15.5" cy="15" r="1.5" fill="#FBF0D2" />
  </svg>
);

// A delicate vine divider with leaves
export const BotanicalDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 py-3 overflow-hidden ${className}`}>
    <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent to-[#D4C8B4]" />
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 10C15 10 20 4 30 10C40 16 45 10 58 10"
        stroke="#8FA689"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M18 8C16 3 22 2 24 6C20 7 19 8 18 8Z"
        fill="#7A9A73"
        stroke="#4E6B47"
        strokeWidth="1"
      />
      {/* Center sprout */}
      <circle cx="30" cy="10" r="2.5" fill="#C86D51" />
      {/* Right leaf */}
      <path
        d="M42 12C44 17 38 18 36 14C40 13 41 12 42 12Z"
        fill="#7A9A73"
        stroke="#4E6B47"
        strokeWidth="1"
      />
    </svg>
    <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent to-[#D4C8B4]" />
  </div>
);

// Botanical corner vine flourish
export const BotanicalCornerVine: React.FC<{
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ className = '', position = 'top-right' }) => {
  const rotationClass = {
    'top-left': 'scale-x-[-1]',
    'top-right': '',
    'bottom-left': 'scale-[-1]',
    'bottom-right': 'scale-y-[-1]'
  }[position];

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none opacity-40 select-none ${rotationClass} ${className}`}
    >
      <path
        d="M54 2C30 3 10 22 4 52"
        stroke="#6B8865"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M38 12C36 5 44 4 46 9C42 11 39 12 38 12Z"
        fill="#82A37D"
        stroke="#4A6844"
        strokeWidth="1"
      />
      <path
        d="M24 23C18 20 20 13 25 15C25 19 24 22 24 23Z"
        fill="#9CB997"
        stroke="#4A6844"
        strokeWidth="1"
      />
      <path
        d="M15 36C8 36 8 28 14 29C15 33 15 35 15 36Z"
        fill="#82A37D"
        stroke="#4A6844"
        strokeWidth="1"
      />
      <circle cx="49" cy="5" r="2" fill="#D98A6C" />
      <circle cx="30" cy="18" r="1.5" fill="#D98A6C" />
    </svg>
  );
};

// Cozy brass watering can illustration
export const WateringCan: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 48
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Body of can */}
    <path
      d="M18 26H40L42 52C42 53.1 41.1 54 40 54H20C18.9 54 18 53.1 18 52L18 26Z"
      fill="#D4A359"
      stroke="#8C6527"
      strokeWidth="1.8"
    />
    {/* Shading */}
    <path d="M20 28H28L29 52H21L20 28Z" fill="#E6B86C" />
    {/* Handle arch */}
    <path
      d="M18 32C10 32 10 46 18 48"
      stroke="#8C6527"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Top handle */}
    <path
      d="M22 26C22 18 36 18 36 26"
      stroke="#8C6527"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Spout */}
    <path
      d="M40 38L54 22"
      stroke="#8C6527"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Rose (sprinkler head) */}
    <path
      d="M52 20L58 26"
      stroke="#8C6527"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Droplets */}
    <circle cx="59" cy="30" r="1.5" fill="#88B8C8" />
    <circle cx="61" cy="36" r="1.2" fill="#88B8C8" />
    <circle cx="56" cy="35" r="1.2" fill="#88B8C8" />
  </svg>
);

// Growth stage icon representation
export const BotanicalStageIcon: React.FC<{ stage: string; className?: string; size?: number }> = ({
  stage,
  className = '',
  size = 18
}) => {
  switch (stage) {
    case 'seed':
      return (
        <span className={`inline-flex items-center justify-center text-amber-700 ${className}`}>
          🌱
        </span>
      );
    case 'refinement':
      return (
        <span className={`inline-flex items-center justify-center text-teal-800 ${className}`}>
          🌿
        </span>
      );
    case 'new_direction':
      return (
        <span className={`inline-flex items-center justify-center text-purple-800 ${className}`}>
          🌼
        </span>
      );
    case 'mature':
      return (
        <span className={`inline-flex items-center justify-center text-emerald-800 ${className}`}>
          🌳
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center justify-center text-stone-700 ${className}`}>
          🌱
        </span>
      );
  }
};

// Subtle spray of leaves for section titles and notebook headers
export const BotanicalLeafFlourish: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="32"
    height="18"
    viewBox="0 0 32 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path
      d="M2 14C8 14 18 10 30 4"
      stroke="#5A7D58"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M10 12C9 7 15 6 16 10C13 11 11 12 10 12Z"
      fill="#7B9D78"
      stroke="#436541"
      strokeWidth="0.8"
    />
    <path
      d="M20 9C21 4 27 5 26 9C23 9.5 21 9 20 9Z"
      fill="#92B38F"
      stroke="#436541"
      strokeWidth="0.8"
    />
    <circle cx="29.5" cy="4.5" r="1.5" fill="#D98A6C" />
  </svg>
);

// Organic curved tendril line to show connection between idea concepts
export const BotanicalTendrilCurve: React.FC<{ className?: string; orientation?: 'left' | 'right' }> = ({
  className = '',
  orientation = 'right'
}) => (
  <svg
    width="48"
    height="36"
    viewBox="0 0 48 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${orientation === 'left' ? 'scale-x-[-1]' : ''} ${className}`}
  >
    <path
      d="M4 32C12 32 20 4 44 4"
      stroke="#7A9C77"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="3 3"
    />
    <path
      d="M24 16C23 11 29 11 29 15C27 16 25 16 24 16Z"
      fill="#88A882"
      stroke="#4A6E46"
      strokeWidth="0.8"
    />
    <circle cx="44" cy="4" r="2.5" fill="#C86D51" />
  </svg>
);

// Organic hand-drawn botanical branch divider with leaves and berries
export const BotanicalBranchDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center my-4 overflow-hidden ${className}`}>
    <svg width="240" height="24" viewBox="0 0 240 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 12C50 11 90 13 120 12C150 11 190 13 230 12"
        stroke="#A89B84"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Leaves branching off */}
      <path d="M60 12C63 7 71 8 70 12C67 13 63 13 60 12Z" fill="#88A882" stroke="#5A7D58" strokeWidth="0.8" />
      <path d="M100 12C102 17 110 16 109 12C106 11 103 11 100 12Z" fill="#75996F" stroke="#4B7049" strokeWidth="0.8" />
      <path d="M140 12C143 7 151 8 150 12C147 13 143 13 140 12Z" fill="#88A882" stroke="#5A7D58" strokeWidth="0.8" />
      <path d="M180 12C182 17 190 16 189 12C186 11 183 11 180 12Z" fill="#75996F" stroke="#4B7049" strokeWidth="0.8" />
      {/* Center blossom/seed */}
      <circle cx="120" cy="12" r="3" fill="#C26749" />
      <circle cx="120" cy="12" r="1.2" fill="#FAF6EE" />
    </svg>
  </div>
);

// Hand-drawn sketch wavy underline
export const HanddrawnWavyUnderline: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="120" height="8" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M2 5C15 2 25 7 38 4C51 1 63 7 76 4C89 1 101 7 118 4"
      stroke="#C26749"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);


