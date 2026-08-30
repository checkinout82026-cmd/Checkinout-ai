import React from 'react';

interface KumonLogoProps {
  variant?: 'horizontal' | 'vertical' | 'badge' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'white';
}

export function KumonLogo({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  subtitle = 'Dublin - East',
  className = '',
  theme = 'light'
}: KumonLogoProps) {
  // Color configuration
  const brandBlue = '#0099DD'; // Signature Kumon Blue
  const brandDarkBlue = '#006494';
  const textColor = theme === 'white' ? '#FFFFFF' : '#1e293b';
  const subtextColor = theme === 'white' ? '#E0F2FE' : '#64748b';
  const faceBg = theme === 'white' ? 'rgba(255,255,255,0.2)' : '#E0F2FE';
  const faceBorder = theme === 'white' ? '#FFFFFF' : '#0099DD';

  // Dimension scaling
  const dimensions = {
    sm: { iconSize: 28, textHeight: 'h-6', fontSize: 'text-lg', subSize: 'text-[10px]' },
    md: { iconSize: 38, textHeight: 'h-8', fontSize: 'text-2xl', subSize: 'text-xs' },
    lg: { iconSize: 48, textHeight: 'h-11', fontSize: 'text-3xl', subSize: 'text-sm' },
    xl: { iconSize: 64, textHeight: 'h-14', fontSize: 'text-4xl', subSize: 'text-base' }
  }[size];

  // Thinking Face Icon (The signature creative Kumon emblem)
  const ThinkingFaceIcon = ({ size: iconDimension = dimensions.iconSize }: { size?: number }) => (
    <svg
      width={iconDimension}
      height={iconDimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      aria-label="Kumon Thinking Face"
    >
      <defs>
        <linearGradient id="kumonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A3E0" />
          <stop offset="100%" stopColor="#0077B6" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Outer Head / Oval Shape */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="44"
        fill={theme === 'white' ? 'rgba(255,255,255,0.15)' : 'url(#kumonGrad)'}
        stroke={theme === 'white' ? '#FFFFFF' : '#0099DD'}
        strokeWidth="3"
        filter="url(#softShadow)"
      />

      {/* Inner Thinking Face Head Contour */}
      <path
        d="M24 50 C24 32 36 20 50 20 C64 20 76 32 76 50 C76 68 64 80 50 80 C36 80 24 68 24 50 Z"
        fill={theme === 'white' ? 'rgba(255,255,255,0.95)' : '#FFFFFF'}
      />

      {/* Serene / Thoughtful Thinking Eyes (Iconic Kumon curved closed eyes representing deep thought & concentration) */}
      <path
        d="M36 46 Q41 40 46 46"
        stroke="#0082CA"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M54 46 Q59 40 64 46"
        stroke="#0082CA"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Focused / Content Small Nose & Thinking Smile */}
      <circle cx="50" cy="54" r="1.5" fill="#0082CA" />
      <path
        d="M45 61 Q50 65 55 61"
        stroke="#0082CA"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gentle Spark of Inspiration in the top-right */}
      <circle cx="72" cy="26" r="3" fill="#FFE066" />
    </svg>
  );

  if (variant === 'icon') {
    return <ThinkingFaceIcon size={dimensions.iconSize} />;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm border border-[#e5e1da] rounded-2xl shadow-sm ${className}`}>
        <ThinkingFaceIcon size={32} />
        <div className="flex flex-col text-left">
          <span className="font-extrabold tracking-wider text-base text-[#0099DD] leading-none uppercase font-sans">
            KUMON
          </span>
          {showSubtitle && (
            <span className="text-[11px] font-semibold text-[#4a4a48] mt-0.5 tracking-tight">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative mb-2">
          <ThinkingFaceIcon size={dimensions.iconSize * 1.3} />
        </div>
        <div className="flex items-center tracking-widest uppercase font-black text-[#0099DD] font-sans text-2xl sm:text-3xl">
          <span>K</span>
          <span>U</span>
          <span>M</span>
          <span className="text-[#0077B6]">O</span>
          <span>N</span>
        </div>
        {showSubtitle && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-px w-3 bg-[#0099DD]/40"></span>
            <span className="text-xs font-bold text-[#4a4a48] tracking-wide uppercase">
              {subtitle}
            </span>
            <span className="h-px w-3 bg-[#0099DD]/40"></span>
          </div>
        )}
      </div>
    );
  }

  // Default: Horizontal Clean Layout
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <ThinkingFaceIcon size={dimensions.iconSize} />
      
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-sans font-black tracking-wider uppercase leading-none text-[#0099DD] ${dimensions.fontSize}`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            KUMON
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-semibold tracking-tight leading-tight mt-0.5 ${dimensions.subSize}`} style={{ color: subtextColor }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
