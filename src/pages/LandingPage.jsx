import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Stethoscope, PenTool, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksData } from '../data/booksData';

const miniNodes = [
  { id: 'engineering', title: 'Engineering', top: '25%', left: '25%', color: '#3A7CA5', icon: BookOpen, keywords: ['engineering', 'java', 'physics', 'algorithm', 'science', 'math'] },
  { id: 'medical', title: 'Medical', top: '65%', left: '35%', color: '#4B7F52', icon: Stethoscope, keywords: ['medical', 'anatomy', 'biology', 'medicine', 'doctor'] },
  { id: 'upsc', title: 'UPSC', top: '35%', left: '75%', color: '#B0413E', icon: PenTool, keywords: ['upsc', 'polity', 'history', 'exam', 'civil', 'governance'] },
  { id: 'literature', title: 'Literature', top: '75%', left: '65%', color: '#D4A373', icon: Feather, keywords: ['literature', 'tagore', 'novel', 'poetry', 'bengali', 'story'] },
];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Detect which node to highlight based on search query and filter books
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      
      // Node highlighting logic
      const match = miniNodes.find(node => 
        node.title.toLowerCase().includes(query) || 
        node.keywords.some(k => query.includes(k))
      );
      setHighlightedNode(match ? match.id : null);

      // Book filtering logic
      const filtered = booksData.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setHighlightedNode(null);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (term) => {
    const finalTerm = term || searchQuery;
    if (finalTerm.trim()) {
      navigate(`/finder?q=${encodeURIComponent(finalTerm.trim())}`);
    } else {
      navigate('/finder');
    }
  };

  const handleNodeClick = (nodeId) => {
    navigate(`/map?zone=${nodeId}`);
  };

  return (
    <div className="landing-wrapper" style={styles.wrapper}>
      {/* Background Illustrations with opacity */}
      <img src="/tram.png" alt="Kolkata Tram" style={styles.bgTram} />

      {/* Absolute Floating Cards */}
      <div className="premium-card animate-float-slow hover-lift floating-card" style={{ ...styles.floatingCard, top: '20%', left: '8%', animationDelay: '0s' }}>
        <h4 style={styles.floatingCardTitle}>DSA in Java</h4>
      </div>
      <div className="premium-card animate-float-slow hover-lift floating-card" style={{ ...styles.floatingCard, top: '28%', right: '10%', animationDelay: '2s' }}>
        <h4 style={styles.floatingCardTitle}>HC Verma Physics</h4>
      </div>
      <div className="premium-card animate-float-slow hover-lift floating-card" style={{ ...styles.floatingCard, bottom: '35%', left: '12%', animationDelay: '1s' }}>
        <h4 style={styles.floatingCardTitle}>Tagore Omnibus</h4>
      </div>
      <div className="premium-card animate-float-slow hover-lift floating-card" style={{ ...styles.floatingCard, bottom: '45%', right: '8%', animationDelay: '3s' }}>
        <h4 style={styles.floatingCardTitle}>UPSC Polity</h4>
      </div>
      
      <div className="container hero-section" style={styles.heroSection}>
        <div className="badges-container" style={styles.badgesContainer}>
          <span className="badge animate-fade-in" style={{animationDelay: '0.2s'}}>📚 10,000+ Books</span>
          <span className="badge animate-fade-in" style={{animationDelay: '0.4s'}}>🏛️ 500+ Legacy Stalls</span>
          <span className="badge animate-fade-in" style={{animationDelay: '0.6s'}}>👨‍🎓 Student Exchange</span>
        </div>

        <h1 className="hero-title" style={styles.title}>BoiPara Nexus</h1>
        <p className="hero-subtitle" style={styles.subtitle}>Discover the academic heritage of College Street</p>
        
        <div className="premium-card search-bar-glow hover-lift search-container" style={styles.searchContainer}>
          <Search color="var(--color-text-ink)" size={24} style={{ opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search for academic books, rare finds, or authors..." 
            className="search-input"
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button className="search-button" style={styles.searchButton} onClick={() => handleSearch()}>
            Search <ArrowRight size={18} />
          </button>

          {/* Dynamic Search Results Dropdown */}
          <AnimatePresence>
            {isFocused && searchQuery.trim().length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={styles.resultsDropdown}
                className="premium-card wobbly-border"
              >
                {searchResults.length > 0 ? (
                  <>
                    <div style={styles.dropdownHeader}>Suggested Books</div>
                    {searchResults.map((book) => (
                      <div 
                        key={book.id} 
                        style={styles.resultItem}
                        onClick={() => handleSearch(book.title)}
                      >
                        <div style={styles.resultIcon}>
                          <BookOpen size={16} color={book.coverColor} />
                        </div>
                        <div style={styles.resultDetails}>
                          <span style={styles.resultTitle}>{book.title}</span>
                          <span style={styles.resultMeta}>{book.author} • {book.category}</span>
                        </div>
                        <ArrowRight size={14} className="result-arrow" style={{ opacity: 0.3 }} />
                      </div>
                    ))}
                    <div 
                      style={styles.dropdownFooter}
                      onClick={() => handleSearch()}
                    >
                      See all results for "{searchQuery}"
                    </div>
                  </>
                ) : (
                  <div style={styles.noResults}>
                    <p style={styles.noResultsText}>No heritage books found for "{searchQuery}"</p>
                    <p style={styles.noResultsSub}>Try searching for 'Tagore', 'Physics', or 'Algorithms'</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hero Interactive Mini-Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="premium-card wobbly-border mini-map-card" 
          style={styles.miniMapCard}
        >
          <div style={styles.miniMapHeader}>
            <span style={styles.miniMapLabel}>Interactive Heritage Zones</span>
          </div>
          
          <div className="mini-map-content" style={styles.miniMapContent}>
            {/* Connecting Lines SVG */}
            <svg width="100%" height="100%" style={styles.miniMapLines}>
              <motion.path 
                d="M 25% 25% Q 45% 20% 75% 35%" 
                stroke="#5C4033" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
                fill="none" 
                opacity="0.15"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M 25% 25% Q 20% 45% 35% 65%" 
                stroke="#5C4033" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
                fill="none" 
                opacity="0.15"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M 75% 35% Q 70% 70% 65% 75%" 
                stroke="#5C4033" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
                fill="none" 
                opacity="0.15"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M 35% 65% Q 45% 75% 65% 75%" 
                stroke="#5C4033" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
                fill="none" 
                opacity="0.15"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {miniNodes.map((node) => {
              const Icon = node.icon;
              const isActive = highlightedNode === node.id || hoveredNode === node.id;
              
              return (
                <motion.div
                  key={node.id}
                  style={{
                    ...styles.miniNode,
                    top: node.top,
                    left: node.left,
                    backgroundColor: isActive ? node.color : '#FFFDF9',
                    color: isActive ? '#FFFDF9' : node.color,
                    borderColor: isActive ? node.color : '#5C4033',
                    zIndex: isActive ? 10 : 5,
                  }}
                  whileHover={{ scale: 1.15, rotate: 2 }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                  className={`mini-node ${highlightedNode === node.id ? 'animate-glow' : ''}`}
                >
                  <Icon size={16} />
                  <span className="mini-node-title" style={styles.miniNodeTitle}>{node.title}</span>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{...styles.nodeGlow, backgroundColor: node.color}}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          
          <button 
            onClick={() => navigate('/map')}
            style={styles.fullMapBtn}
          >
            Explore Full Map <ArrowRight size={14} />
          </button>
        </motion.div>
        
        <p style={styles.heroFooter}>Preserving Kolkata's academic heritage through technology</p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 'calc(100vh - 80px)',
    background: 'var(--color-bg-paper)',
  },
  bgTram: {
    position: 'absolute',
    top: '5%',
    right: '-5%',
    width: '650px',
    opacity: 0.2,
    pointerEvents: 'none',
    zIndex: -1,
  },
  heroSection: {
    padding: '120px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  },
  badgesContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroFooter: {
    marginTop: '32px',
    fontSize: '0.95rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  floatingCard: {
    position: 'absolute',
    padding: '12px 20px',
    zIndex: 5,
    border: '1px solid rgba(44, 36, 27, 0.05)',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  floatingCardTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--color-text-ink)',
    margin: 0,
  },
  title: {
    fontSize: '5.5rem',
    letterSpacing: '-2px',
    lineHeight: '1.1',
    color: 'var(--color-primary)',
    marginBottom: '16px',
    textShadow: '2px 4px 10px rgba(140, 58, 58, 0.1)',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    marginBottom: '48px',
    fontWeight: '400',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 8px 8px 24px',
    width: '100%',
    maxWidth: '750px',
    gap: '16px',
    border: '1px solid rgba(44, 36, 27, 0.08)',
    marginBottom: '60px',
    position: 'relative',
    overflow: 'visible', // Essential for dropdown visibility
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1.1rem',
    background: 'transparent',
    color: 'var(--color-text-ink)',
  },
  searchButton: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '16px 36px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1.05rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  },
  resultsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    left: 0,
    right: 0,
    background: '#FFFDF9',
    border: '2px solid #5C4033',
    boxShadow: '0 15px 35px rgba(92, 64, 51, 0.15), 4px 6px 0px rgba(92, 64, 51, 0.2)',
    zIndex: 100,
    textAlign: 'left',
    padding: '8px 0',
  },
  dropdownHeader: {
    padding: '8px 20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.6,
    borderBottom: '1px dashed rgba(92, 64, 51, 0.1)',
    marginBottom: '4px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resultIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 64, 51, 0.05)',
  },
  resultDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  resultTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--color-text-ink)',
  },
  resultMeta: {
    fontSize: '0.8rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
  },
  dropdownFooter: {
    padding: '12px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
    textAlign: 'center',
    borderTop: '1px dashed rgba(92, 64, 51, 0.1)',
    marginTop: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  noResults: {
    padding: '24px 20px',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--color-text-ink)',
    margin: 0,
  },
  noResultsSub: {
    fontSize: '0.85rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    marginTop: '4px',
  },
  miniMapCard: {
    width: '100%',
    maxWidth: '650px',
    background: '#FFFDF9',
    border: '1.5px solid #5C4033',
    padding: '24px',
    position: 'relative',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.15)',
  },
  miniMapHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  miniMapLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    opacity: 0.8,
  },
  miniMapContent: {
    height: '220px',
    position: 'relative',
    width: '100%',
    background: 'rgba(92, 64, 51, 0.02)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  miniMapLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  miniNode: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    border: '1.5px solid #5C4033',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
  },
  miniNodeTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
  },
  nodeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    zIndex: -1,
    filter: 'blur(12px)',
    opacity: 0.3,
  },
  fullMapBtn: {
    marginTop: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '1px solid rgba(140, 58, 58, 0.2)',
    borderRadius: 'var(--radius-pill)',
    transition: 'all 0.2s',
  }
};

export default LandingPage;



