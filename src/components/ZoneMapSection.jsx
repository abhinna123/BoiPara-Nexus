import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Book, MapPin, Tag, BookOpen, Feather, Stethoscope, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { zonesData } from '../data/zonesData';

// Helper to render customized hand-drawn heritage icons for nodes
const getZoneMarkerIcon = (zoneId, color) => {
  const size = 18;
  const badgeStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #5C4033',
    background: '#FFFDF9',
    boxShadow: '1px 2px 0px rgba(92, 64, 51, 0.15)',
    flexShrink: 0,
  };
  
  if (zoneId === 'engineering') {
    return <div style={badgeStyle}><BookOpen size={size} color={color} style={{ transform: 'rotate(-5deg)' }} /></div>;
  }
  if (zoneId === 'medical') {
    return <div style={badgeStyle}><Stethoscope size={size} color={color} /></div>;
  }
  if (zoneId === 'upsc') {
    return <div style={badgeStyle}><PenTool size={size} color={color} style={{ transform: 'rotate(10deg)' }} /></div>;
  }
  if (zoneId === 'literature') {
    return <div style={badgeStyle}><Feather size={size} color={color} style={{ transform: 'rotate(-10deg)' }} /></div>;
  }
  return <div style={badgeStyle}><MapPin size={size} color={color} /></div>;
};

const ZoneMapSection = () => {
  const [searchParams] = useSearchParams();
  const [selectedZone, setSelectedZone] = useState(null);
  const [highlightedStall, setHighlightedStall] = useState(null);

  useEffect(() => {
    const zoneId = searchParams.get('zone');
    const stallName = searchParams.get('stall');

    if (zoneId) {
      const zone = zonesData.find(z => z.id === zoneId);
      if (zone) {
        setSelectedZone(zone);
        if (stallName) {
          setHighlightedStall(stallName);
        }
      }
    }
  }, [searchParams]);

  // Calculate transformation for focus zoom
  const getMapTransform = () => {
    if (!selectedZone) return { scale: 1, x: 0, y: 0 };
    
    // Parse percentages (e.g., '15%' -> 15)
    const top = parseFloat(selectedZone.position.top);
    const left = parseFloat(selectedZone.position.left);
    
    // Scale factor for zoom (Reduced to 1.3x per requirements)
    const scale = 1.3;
    
    // We want the node to center in the AVAILABLE map area (excluding 450px side panel)
    // On a 1280px container, the available center is roughly at 32.5% from the left
    const targetX = 32.5; 
    const targetY = 50;
    
    // Calculate translation to center the node at (targetX, targetY)
    // Formula: target_pos - (node_pos * scale)
    const translateX = targetX - (left * scale);
    const translateY = targetY - (top * scale);
    
    return { scale, x: `${translateX}%`, y: `${translateY}%` };
  };

  const transform = getMapTransform();

  return (
    <section style={styles.section}>
      <div className="container" style={styles.container}>
        <div style={styles.header}>
          <h2 className="map-heading" style={styles.heading}>Interactive Zone Map</h2>
          <p style={styles.subheading}>Explore the knowledge network of College Street</p>
        </div>

        <div className="zone-map-wrapper" style={styles.wrapper}>
          <div className="map-container" style={styles.mapContainer}>
            {/* Main Map Content with Zoom & Pan Animation */}
            <motion.div
              animate={{ 
                scale: transform.scale,
                x: transform.x,
                y: transform.y,
              }}
              transition={{ 
                duration: 1, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              style={styles.mapContent}
            >
              {/* Subtle Decorative Elements */}
              {/* Compass Rose */}
              <div className="compass-rose" style={{ position: 'absolute', top: '5%', right: '5%', opacity: 0.85, pointerEvents: 'none', zIndex: 6 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="34" stroke="#5C4033" strokeWidth="1.5" strokeDasharray="3,2" />
                  <circle cx="40" cy="40" r="31" stroke="#5C4033" strokeWidth="1.2" />
                  <path d="M 40 40 L 40 12 L 44 40 Z" fill="#8C3A3A" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 40 12 L 36 40 Z" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 40 68 L 36 40 Z" fill="#8C3A3A" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 40 68 L 44 40 Z" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 68 40 L 40 44 Z" fill="#8C3A3A" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 68 40 L 40 36 Z" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 12 40 L 40 36 Z" fill="#8C3A3A" stroke="#5C4033" strokeWidth="1" />
                  <path d="M 40 40 L 12 40 L 40 44 Z" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1" />
                  <text x="36.5" y="9.5" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-heading)">N</text>
                  <circle cx="40" cy="40" r="3.5" fill="#5C4033" />
                </svg>
              </div>

              {/* Steaming Clay Tea Cup */}
              <div style={{ position: 'absolute', bottom: '26%', left: '12%', opacity: 0.9, zIndex: 6, transform: 'rotate(5deg)' }}>
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                  <path className="steam-line" d="M16 14 Q 13 8, 16 3" stroke="#8C6D4F" strokeWidth="1.5" strokeLinecap="round" />
                  <path className="steam-line" d="M21 16 Q 25 10, 21 4" stroke="#8C6D4F" strokeWidth="1.5" strokeLinecap="round" />
                  <path className="steam-line" d="M26 14 Q 23 8, 25 3" stroke="#8C6D4F" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 11 20 C 11 20, 9 37, 13 43 C 16 47, 24 47, 27 43 C 31 37, 29 20, 29 20 Z" fill="#D4A373" stroke="#5C4033" strokeWidth="1.8" strokeLinejoin="round" />
                  <ellipse cx="20" cy="20" rx="9" ry="2.5" fill="#C7925E" stroke="#5C4033" strokeWidth="1.8" />
                </svg>
              </div>

              {/* SVG Knowledge Network Lines & Tram Tracks */}
              <svg viewBox="0 0 100 100" style={styles.svgNetwork} preserveAspectRatio="none">
                <g opacity={selectedZone ? 0.2 : 0.35}>
                  <path d="M -10 40 C 25 42, 45 58, 110 52" stroke="#7A5A45" strokeWidth="5" strokeDasharray="1.5,7" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M -10 39.2 C 25 41.2, 45 57.2, 110 51.2" stroke="#5A5A5A" strokeWidth="0.8" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M -10 40.8 C 25 42.8, 45 58.8, 110 52.8" stroke="#5A5A5A" strokeWidth="0.8" fill="none" vectorEffect="non-scaling-stroke" />
                </g>

                <g opacity={selectedZone ? 0.4 : 1}>
                  {/* Roads */}
                  <path d="M 20 15 Q 45 10 75 35" stroke="#422B1E" strokeWidth="4.2" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 20 15 Q 45 10 75 35" stroke="#FFFDF9" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 20 15 Q 45 10 75 35" stroke="#8C3A3A" strokeWidth="0.6" strokeDasharray="1.5,1.5" fill="none" vectorEffect="non-scaling-stroke" />

                  <path d="M 20 15 C 10 40 30 60 25 70" stroke="#422B1E" strokeWidth="4.2" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 20 15 C 10 40 30 60 25 70" stroke="#FFFDF9" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 20 15 C 10 40 30 60 25 70" stroke="#8C3A3A" strokeWidth="0.6" strokeDasharray="1.5,1.5" fill="none" vectorEffect="non-scaling-stroke" />

                  <path d="M 75 35 Q 80 60 65 80" stroke="#422B1E" strokeWidth="4.2" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 75 35 Q 80 60 65 80" stroke="#FFFDF9" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 75 35 Q 80 60 65 80" stroke="#8C3A3A" strokeWidth="0.6" strokeDasharray="1.5,1.5" fill="none" vectorEffect="non-scaling-stroke" />

                  <path d="M 25 70 Q 45 90 65 80" stroke="#422B1E" strokeWidth="4.2" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 25 70 Q 45 90 65 80" stroke="#FFFDF9" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 25 70 Q 45 90 65 80" stroke="#8C3A3A" strokeWidth="0.6" strokeDasharray="1.5,1.5" fill="none" vectorEffect="non-scaling-stroke" />

                  <path d="M 75 35 C 50 50 60 60 25 70" stroke="#422B1E" strokeWidth="4.2" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 75 35 C 50 50 60 60 25 70" stroke="#FFFDF9" strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
                  <path d="M 75 35 C 50 50 60 60 25 70" stroke="#8C3A3A" strokeWidth="0.6" strokeDasharray="1.5,1.5" fill="none" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>

              {/* Zone Nodes */}
              {zonesData.map((zone, index) => {
                const isSelected = selectedZone?.id === zone.id;
                const isDimmed = selectedZone && !isSelected;
                const isHighlighted = isSelected && highlightedStall;
                
                return (
                  <div 
                    key={zone.id}
                    className={`premium-card zone-node animate-fade-node wobbly-border ${isHighlighted ? 'animate-glow' : ''} ${isSelected ? 'pulse-focus' : ''}`}
                    style={{
                      ...styles.node,
                      top: zone.position.top,
                      left: zone.position.left,
                      backgroundColor: '#FFFDF9',
                      border: isSelected ? `3px solid ${zone.color}` : '2px solid #5C4033',
                      boxShadow: isSelected 
                        ? `0 0 40px ${zone.shadow}, 5px 8px 0px rgba(92, 64, 51, 0.2)` 
                        : '4px 6px 0px rgba(92, 64, 51, 0.2)',
                      transform: isSelected 
                        ? 'translate(-50%, calc(-50% - 10px)) scale(1.1) rotate(1deg)' 
                        : 'translate(-50%, -50%)',
                      zIndex: isSelected ? 15 : 10,
                      opacity: isDimmed ? 0.5 : 1,
                      transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                      animationDelay: `${index * 0.15}s`
                    }}
                    onClick={() => {
                      setSelectedZone(zone);
                      setHighlightedStall(null);
                    }}
                  >
                    {getZoneMarkerIcon(zone.id, zone.color)}
                    <span style={styles.nodeTitle}>{zone.title}</span>

                    <div style={{
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#FFFDF9',
                      borderRight: isSelected ? `3px solid ${zone.color}` : '2px solid #5C4033',
                      borderBottom: isSelected ? `3px solid ${zone.color}` : '2px solid #5C4033',
                      zIndex: -1,
                      transition: 'border-color 0.8s'
                    }}></div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Mobile Overlay */}
          <AnimatePresence>
            {selectedZone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedZone(null);
                  setHighlightedStall(null);
                }}
                className="side-panel-overlay"
                style={styles.overlay}
              />
            )}
          </AnimatePresence>

          {/* Side Panel moved outside map-container for mobile layout freedom */}
          <div className={`side-panel ${selectedZone ? 'open' : ''}`}>
            {selectedZone && (
              <>
                <div className="mobile-drag-handle" style={styles.dragHandle}></div>
                <div style={{...styles.panelHeader, borderBottom: `2px solid ${selectedZone.color}`}}>
                  <div style={styles.panelTitleGroup}>
                    <div style={{...styles.nodeDot, backgroundColor: selectedZone.color}}></div>
                    <h3 style={styles.panelTitleText}>{selectedZone.title}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedZone(null);
                      setHighlightedStall(null);
                    }} 
                    style={styles.closeBtn}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={styles.panelContent}>
                  <p style={styles.panelDesc}>{selectedZone.description}</p>
                  
                  <div style={styles.statGroup}>
                    <Book size={20} color={selectedZone.color} />
                    <strong>{selectedZone.bookCount} Books</strong>
                  </div>
                  
                  <div style={styles.infoSection}>
                    <div style={styles.infoTitle}><MapPin size={18} color={selectedZone.color}/> Key Stalls</div>
                    <ul style={styles.list}>
                      {selectedZone.stalls.map(stall => (
                        <li 
                          key={stall}
                          style={{
                            color: highlightedStall === stall ? 'var(--color-primary)' : 'inherit',
                            fontWeight: highlightedStall === stall ? '700' : 'normal',
                            backgroundColor: highlightedStall === stall ? `${selectedZone.color}15` : 'transparent',
                            padding: highlightedStall === stall ? '4px 8px' : '0',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {stall} {highlightedStall === stall && ' (Located!)'}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={styles.infoSection}>
                    <div style={styles.infoTitle}><Tag size={18} color={selectedZone.color}/> Popular Categories</div>
                    <div style={styles.tagContainer}>
                      {selectedZone.categories.map(cat => (
                        <span key={cat} style={{...styles.categoryTag, color: selectedZone.color, backgroundColor: selectedZone.shadow}}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '100px 0',
    position: 'relative',
    zIndex: 5,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  heading: {
    fontSize: '3rem',
    color: 'var(--color-primary)',
    marginBottom: '12px',
  },
  subheading: {
    fontSize: '1.2rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '650px',
    backgroundColor: '#F8F4E6',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E"), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5) 0%, rgba(248, 244, 230, 0.75) 100%)`,
    backgroundBlendMode: 'multiply',
    borderRadius: '45px 15px 45px 15px',
    boxShadow: 'inset 0 0 45px rgba(92, 64, 51, 0.12), 0 12px 36px rgba(44, 36, 27, 0.04)',
    overflow: 'hidden',
    border: '1.5px solid rgba(92, 64, 51, 0.45)',
  },
  mapContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformOrigin: '0 0',
  },
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 36, 27, 0.4)',
    zIndex: 999,
  },
  dragHandle: {
    width: '40px',
    height: '5px',
    backgroundColor: 'rgba(92, 64, 51, 0.15)',
    borderRadius: '10px',
    margin: '0 auto 24px auto',
    display: 'none',
  },
  svgNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  node: {
    position: 'absolute',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    minWidth: '220px',
    background: '#FFFDF9',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
  },
  nodeDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
  },
  nodeTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--color-text-ink)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    marginBottom: '32px',
  },
  panelTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  panelTitleText: {
    fontSize: '1.4rem',
    margin: 0,
    color: 'var(--color-text-ink)',
  },
  closeBtn: {
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    transition: 'opacity 0.2s, transform 0.2s',
  },
  panelContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  panelDesc: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: 'var(--color-text-ink)',
    opacity: 0.85,
  },
  statGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.1rem',
    padding: '16px',
    backgroundColor: 'var(--color-bg-paper)',
    borderRadius: '12px',
    border: '1px solid rgba(44, 36, 27, 0.05)',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoTitle: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--color-text-ink)',
    fontSize: '1.1rem',
  },
  list: {
    paddingLeft: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    listStyleType: 'disc',
    color: 'var(--color-text-ink)',
    opacity: 0.85,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  categoryTag: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.9rem',
    fontWeight: '600',
  }
};

export default ZoneMapSection;
