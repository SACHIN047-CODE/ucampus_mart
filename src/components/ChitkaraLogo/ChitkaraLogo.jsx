import React from 'react';

export default function ChitkaraLogo({ type = 'full', height = 36, className = '' }) {
  // SVG drawing of the emblem:
  // - A red stylized wing (left-oriented curve)
  // - A black/grey stylized wing (right-oriented curve)
  // They overlap elegantly to represent Chitkara's official logo motif.
  const emblem = (
    <svg
      width={height * 0.9}
      height={height}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Glow effect */}
      <defs>
        <radialGradient id="emblem-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e21a22" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#e21a22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#emblem-glow)" />
      
      {/* Left Red Wing Motif */}
      <path
        d="M32.5 12C28.2 21.5 24.8 33.2 26.5 45.8C27.5 53.2 30.5 59.8 35.5 64.8C35.2 60.5 33.8 54.5 32.8 48C31.5 39.5 32.2 29.8 35.8 20.8C37.2 17.2 39.2 13.8 41.5 10.8C38.2 11 35.2 11.5 32.5 12Z"
        fill="#e21a22"
      />
      {/* Right Dark Grey/Black Wing Motif */}
      <path
        d="M47.5 12C51.8 21.5 55.2 33.2 53.5 45.8C52.5 53.2 49.5 59.8 44.5 64.8C44.8 60.5 46.2 54.5 47.2 48C48.5 39.5 47.8 29.8 44.2 20.8C42.8 17.2 40.8 13.8 38.5 10.8C41.8 11 44.8 11.5 47.5 12Z"
        fill="#2d2d2d"
      />
      {/* Joining core spark */}
      <path
        d="M40 32C38.8 37.5 37.2 43 38.5 48.5C39.2 51.5 40.8 51.5 41.5 48.5C42.8 43 41.2 37.5 40 32Z"
        fill="#e21a22"
      />
    </svg>
  );

  if (type === 'mark') {
    return (
      <span className={`chitkara-logo-mark ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {emblem}
      </span>
    );
  }

  return (
    <div className={`chitkara-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      {emblem}
      <div 
        className="chitkara-logo-text" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          lineHeight: '1.1',
          fontFamily: 'var(--font-display)',
          textAlign: 'left'
        }}
      >
        <span 
          style={{ 
            fontWeight: '800', 
            fontSize: `${height * 0.44}px`, 
            color: 'var(--primary)', 
            letterSpacing: '-0.02em', 
            textTransform: 'uppercase'
          }}
        >
          Chitkara
        </span>
        <span 
          className="chitkara-sub"
          style={{ 
            fontWeight: '600', 
            fontSize: `${height * 0.28}px`, 
            color: 'var(--text)', 
            letterSpacing: '0.12em', 
            textTransform: 'uppercase',
            opacity: 0.85
          }}
        >
          CampusMart
        </span>
      </div>
    </div>
  );
}
