/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MascotReaction, MascotSkin } from '../types/game';

interface MascotImpProps {
  reaction: MascotReaction;
  skin?: MascotSkin;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export const MascotImp: React.FC<MascotImpProps> = ({
  reaction = 'smug',
  skin = 'classic',
  size = 'md',
  animated = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  // Skin color schemes
  const skinColors = {
    classic: {
      body: '#8B5CF6', // mischievous violet-purple
      bodyShade: '#6D28D9',
      face: '#A78BFA',
      horns: '#F59E0B',
      hornsShade: '#D97706',
      belly: '#DDD6FE',
      blush: '#EC4899',
    },
    cyber: {
      body: '#06B6D4',
      bodyShade: '#0891B2',
      face: '#67E8F9',
      horns: '#10B981',
      hornsShade: '#059669',
      belly: '#CFFAFE',
      blush: '#3B82F6',
    },
    king: {
      body: '#7C3AED',
      bodyShade: '#5B21B6',
      face: '#C4B5FD',
      horns: '#FCD34D',
      hornsShade: '#F59E0B',
      belly: '#EDE9FE',
      blush: '#F43F5E',
    },
    fancy: {
      body: '#475569',
      bodyShade: '#334155',
      face: '#94A3B8',
      horns: '#E2E8F0',
      hornsShade: '#94A3B8',
      belly: '#F1F5F9',
      blush: '#FB7185',
    },
  };

  const col = skinColors[skin] || skinColors.classic;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${
        animated && reaction === 'laugh' ? 'animate-comic-shake' : ''
      } ${animated && reaction === 'smug' ? 'animate-float' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none pointer-events-none"
      >
        <defs>
          <radialGradient id={`glow-${skin}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={col.face} />
            <stop offset="100%" stopColor={col.body} />
          </radialGradient>
          <linearGradient id={`hornGrad-${skin}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={col.horns} />
            <stop offset="100%" stopColor={col.hornsShade} />
          </linearGradient>
        </defs>

        {/* --- Imp Horns --- */}
        {/* Left Horn */}
        <path
          d="M 68 80 C 45 45 35 15 50 10 C 65 18 72 45 78 78 Z"
          fill={`url(#hornGrad-${skin})`}
          stroke="#1E1B4B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right Horn */}
        <path
          d="M 132 80 C 155 45 165 15 150 10 C 135 18 128 45 122 78 Z"
          fill={`url(#hornGrad-${skin})`}
          stroke="#1E1B4B"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* --- Ears --- */}
        {/* Left Ear */}
        <path
          d="M 45 105 C 15 110 5 95 15 85 C 32 90 42 98 48 105 Z"
          fill={col.body}
          stroke="#1E1B4B"
          strokeWidth="4"
        />
        {/* Right Ear */}
        <path
          d="M 155 105 C 185 110 195 95 185 85 C 168 90 158 98 152 105 Z"
          fill={col.body}
          stroke="#1E1B4B"
          strokeWidth="4"
        />

        {/* --- Main Imp Head / Body --- */}
        <ellipse
          cx="100"
          cy="115"
          rx="62"
          ry="55"
          fill={`url(#glow-${skin})`}
          stroke="#1E1B4B"
          strokeWidth="5"
        />

        {/* Subtle Cheek Blush */}
        <circle cx="58" cy="128" r="8" fill={col.blush} opacity="0.4" />
        <circle cx="142" cy="128" r="8" fill={col.blush} opacity="0.4" />

        {/* --- Eyebrows --- */}
        {reaction === 'smug' && (
          <>
            <path d="M 60 88 Q 75 80 88 90" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 112 92 Q 125 76 142 84" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {reaction === 'laugh' && (
          <>
            <path d="M 58 84 Q 72 74 88 84" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 112 84 Q 128 74 142 84" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {reaction === 'shock' && (
          <>
            <path d="M 58 78 Q 72 68 88 80" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 112 80 Q 128 68 142 78" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {reaction === 'rage' && (
          <>
            <path d="M 60 82 L 90 98" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            <path d="M 140 82 L 110 98" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {reaction === 'thinking' && (
          <>
            <path d="M 58 88 Q 72 82 86 86" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 114 80 Q 128 72 144 82" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {(reaction === 'triumph' || reaction === 'wink') && (
          <>
            <path d="M 60 82 Q 74 74 88 84" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 112 84 Q 126 74 140 82" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" />
          </>
        )}

        {/* --- Eyes --- */}
        {reaction === 'smug' && (
          <>
            {/* Left Eye: Smug half-lid */}
            <path d="M 62 105 Q 75 92 88 105 Z" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="78" cy="102" r="5" fill="#1E1B4B" />
            <circle cx="80" cy="100" r="2" fill="#FFFFFF" />
            {/* Right Eye: Arched sly look */}
            <path d="M 112 105 Q 125 90 138 105 Z" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="123" cy="101" r="5" fill="#1E1B4B" />
            <circle cx="125" cy="99" r="2" fill="#FFFFFF" />
          </>
        )}

        {reaction === 'laugh' && (
          <>
            {/* Eyes squeezed shut laughing */}
            <path d="M 60 102 Q 75 90 88 102" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 112 102 Q 125 90 140 102" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        )}

        {reaction === 'shock' && (
          <>
            {/* Huge wide surprised cartoon eyes */}
            <circle cx="75" cy="100" r="15" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="75" cy="100" r="5" fill="#1E1B4B" />
            <circle cx="125" cy="100" r="15" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="125" cy="100" r="5" fill="#1E1B4B" />
          </>
        )}

        {reaction === 'rage' && (
          <>
            {/* Angry narrowed red glow eyes */}
            <path d="M 62 98 Q 75 110 88 102 Z" fill="#FEE2E2" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="76" cy="102" r="4.5" fill="#DC2626" />
            <path d="M 112 102 Q 125 110 138 98 Z" fill="#FEE2E2" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="124" cy="102" r="4.5" fill="#DC2626" />
          </>
        )}

        {reaction === 'wink' && (
          <>
            {/* Winking left eye */}
            <path d="M 60 104 Q 74 95 88 104" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Wide right eye */}
            <circle cx="125" cy="102" r="12" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx="125" cy="102" r="5" fill="#1E1B4B" />
            <circle cx="127" cy="100" r="2" fill="#FFFFFF" />
          </>
        )}

        {(reaction === 'triumph' || reaction === 'thinking') && (
          <>
            <circle cx="75" cy="102" r="12" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx={reaction === 'thinking' ? 78 : 75} cy={reaction === 'thinking' ? 98 : 102} r="5" fill="#1E1B4B" />
            <circle cx="125" cy="102" r="12" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <circle cx={reaction === 'thinking' ? 128 : 125} cy={reaction === 'thinking' ? 98 : 102} r="5" fill="#1E1B4B" />
          </>
        )}

        {/* --- Mouth & Expressions --- */}
        {reaction === 'smug' && (
          <g>
            {/* Devious asymmetric grin */}
            <path
              d="M 72 135 Q 100 148 135 125 Q 125 142 95 145 Z"
              fill="#1E1B4B"
              stroke="#1E1B4B"
              strokeWidth="2"
            />
            {/* Tiny sharp tooth */}
            <polygon points="85,136 92,143 97,137" fill="#FFFFFF" />
          </g>
        )}

        {reaction === 'laugh' && (
          <g>
            {/* Wide cackling mouth */}
            <path
              d="M 68 126 Q 100 120 132 126 Q 130 158 100 160 Q 70 158 68 126 Z"
              fill="#7F1D1D"
              stroke="#1E1B4B"
              strokeWidth="4"
            />
            {/* Imp fangs */}
            <polygon points="76,126 84,136 90,126" fill="#FFFFFF" />
            <polygon points="110,126 116,136 124,126" fill="#FFFFFF" />
            {/* Tongue */}
            <path d="M 88 152 Q 100 142 112 152 Q 100 162 88 152 Z" fill="#F43F5E" />
          </g>
        )}

        {reaction === 'shock' && (
          <ellipse
            cx="100"
            cy="142"
            rx="14"
            ry="18"
            fill="#1E1B4B"
            stroke="#1E1B4B"
            strokeWidth="3"
          />
        )}

        {reaction === 'rage' && (
          <g>
            {/* Gnashing angry zigzag mouth */}
            <rect x="70" y="130" width="60" height="18" rx="4" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
            <line x1="85" y1="130" x2="85" y2="148" stroke="#1E1B4B" strokeWidth="3" />
            <line x1="100" y1="130" x2="100" y2="148" stroke="#1E1B4B" strokeWidth="3" />
            <line x1="115" y1="130" x2="115" y2="148" stroke="#1E1B4B" strokeWidth="3" />
          </g>
        )}

        {reaction === 'wink' && (
          <g>
            <path d="M 80 134 Q 100 146 122 134" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Cute cheeky tooth */}
            <polygon points="96,138 101,146 106,139" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="1.5" />
          </g>
        )}

        {reaction === 'thinking' && (
          <path d="M 82 138 Q 100 134 118 142" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
        )}

        {reaction === 'triumph' && (
          <g>
            <path
              d="M 75 132 Q 100 152 125 132 Q 115 152 100 152 Q 85 152 75 132 Z"
              fill="#1E1B4B"
            />
            <polygon points="85,134 91,142 97,135" fill="#FFFFFF" />
          </g>
        )}

        {/* --- Skin Specific Accessories --- */}
        {skin === 'king' && (
          <g id="crown">
            <path
              d="M 65 65 L 75 40 L 100 55 L 125 40 L 135 65 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="3"
            />
            <circle cx="75" cy="40" r="4" fill="#EF4444" />
            <circle cx="100" cy="55" r="4.5" fill="#3B82F6" />
            <circle cx="125" cy="40" r="4" fill="#10B981" />
          </g>
        )}

        {skin === 'cyber' && (
          <g id="cyber-visor">
            <path
              d="M 55 96 L 145 96 L 140 108 L 60 108 Z"
              fill="rgba(16, 185, 129, 0.4)"
              stroke="#10B981"
              strokeWidth="2.5"
            />
            <line x1="70" y1="102" x2="130" y2="102" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="4 2" />
          </g>
        )}

        {skin === 'fancy' && (
          <g id="fancy-attire">
            {/* Top Hat */}
            <path d="M 50 68 L 150 68" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <rect x="70" y="25" width="60" height="43" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
            <rect x="70" y="55" width="60" height="8" fill="#DC2626" />
            {/* Monocle */}
            <circle cx="125" cy="102" r="15" fill="none" stroke="#F59E0B" strokeWidth="3" />
            <line x1="140" y1="105" x2="160" y2="140" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            {/* Bowtie */}
            <polygon points="85,165 115,165 100,172" fill="#DC2626" />
            <polygon points="85,179 115,179 100,172" fill="#DC2626" />
            <circle cx="100" cy="172" r="3" fill="#991B1B" />
          </g>
        )}
      </svg>
    </div>
  );
};
