import React from 'react';

// Dynamic hand-drawn book cover generator
export const BookCover = ({ title, author, color, size = 'sm' }) => {
  const isLarge = size === 'lg';
  const titleFontSize = isLarge ? '14px' : '11px';
  const authorFontSize = isLarge ? '10px' : '8px';
  const height = isLarge ? 280 : 200;

  return (
    <svg 
      width="100%" 
      height={height} 
      viewBox="0 0 140 200" 
      style={{ filter: 'drop-shadow(3px 5px 8px rgba(92, 64, 51, 0.15))' }}
    >
      {/* Hand-drawn Spine */}
      <path d="M 8 12 Q 12 9, 16 12 L 16 188 Q 12 191, 8 188 Z" fill="#422B1E" />
      
      {/* Cartoon Cover Plaque */}
      <path 
        d="M 16 12 Q 73 9, 130 12 C 133 70, 133 130, 130 188 Q 73 191, 16 188 Z" 
        fill={color} 
        stroke="#422B1E" 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />
      
      {/* Inner Embossed Gold/Ink Outline */}
      <path 
        d="M 22 18 Q 71 15, 122 18 C 125 70, 125 130, 122 182 Q 71 185, 22 182 Z" 
        fill="none" 
        stroke="#FFFDF9" 
        strokeWidth="1" 
        opacity="0.3" 
      />

      {/* Decorative Ribbon Accent */}
      <path d="M 16 12 L 32 12 L 16 28 Z" fill="#E6C587" stroke="#422B1E" strokeWidth="1" />
      
      {/* Book Title Wrapper inside SVG using foreignObject */}
      <foreignObject x="24" y="32" width="98" height="110">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          textAlign: 'center',
          padding: '4px',
          color: '#FFFDF9',
          fontFamily: 'var(--font-heading)',
          fontSize: titleFontSize,
          fontWeight: 'bold',
          lineHeight: '1.25',
          textShadow: '1px 1px 2px rgba(0,0,0,0.55)',
          userSelect: 'none'
        }}>
          {title}
        </div>
      </foreignObject>
      
      {/* Author Name */}
      <foreignObject x="24" y="145" width="98" height="30">
        <div style={{
          textAlign: 'center',
          color: '#FFFDF9',
          opacity: 0.9,
          fontFamily: 'var(--font-body)',
          fontSize: authorFontSize,
          lineHeight: '1.1',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          userSelect: 'none'
        }}>
          {author}
        </div>
      </foreignObject>
    </svg>
  );
};

export default BookCover;
