import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, MapPin, ArrowLeft, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksData } from '../data/booksData';

// Dynamic hand-drawn book cover generator
const BookCover = ({ title, author, color }) => {
  return (
    <svg width="100%" height="200" viewBox="0 0 140 200" style={{ filter: 'drop-shadow(3px 5px 8px rgba(92, 64, 51, 0.15))' }}>
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
          fontSize: '11px',
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
          fontSize: '8px',
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

// Pulsing Loading Card
const SkeletonCard = () => (
  <div className="premium-card wobbly-border" style={{ ...styles.bookCard, opacity: 0.5, pointerEvents: 'none' }}>
    <div style={{ ...styles.coverWrapper, background: '#E6DCC4', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <BookOpen size={40} color="#FAF6EE" />
    </div>
    <div style={{ ...styles.cardDetails, gap: '10px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '16px', width: '70px', background: '#E6DCC4', borderRadius: '4px' }} />
      <div style={{ height: '24px', width: '90%', background: '#E6DCC4', borderRadius: '4px' }} />
      <div style={{ height: '14px', width: '60%', background: '#E6DCC4', borderRadius: '4px' }} />
      <div style={{ height: '42px', width: '100%', background: '#E6DCC4', borderRadius: '4px', marginTop: '8px' }} />
    </div>
  </div>
);

const BookFinderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize local input state with URL search param
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Simulated loading when query or category changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [queryParam, selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleViewOnMap = (book) => {
    const categoryToZone = {
      'Engineering': 'engineering',
      'Literature': 'literature',
      'Medical': 'medical',
      'UPSC': 'upsc'
    };
    const zoneId = categoryToZone[book.category] || 'engineering';
    navigate(`/map?zone=${zoneId}&stall=${encodeURIComponent(book.stallName)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSelectedCategory('All');
  };

  const categories = ['All', 'Engineering', 'Medical', 'UPSC', 'Literature'];

  // Filter books matching search query and category
  const filteredBooks = booksData.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.stallName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={styles.pageWrapper}>
      <div className="container" style={styles.container}>
        
        {/* Back Link */}
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Map
        </Link>

        {/* Header Title */}
        <div style={styles.header}>
          <h1 className="finder-heading" style={styles.heading}>Smart Book Finder</h1>
          <p style={styles.subheading}>Scan through heritage stalls and locate academic or rare editions instantly</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="premium-card wobbly-border finder-search-card" style={styles.searchBarCard}>
          <form onSubmit={handleSearchSubmit} className="finder-search-form" style={styles.searchForm}>
            <Search color="#5C4033" size={22} style={{ opacity: 0.6 }} />
            <input 
              type="text" 
              placeholder="Search by book title, author, category, or book stall..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} style={styles.clearBtn}>
                Clear
              </button>
            )}
            <button type="submit" className="finder-search-btn" style={styles.searchBtn}>
              Find Book
            </button>
          </form>
        </div>

        {/* Categories Navigation Row */}
        <div style={styles.categoryRow}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="category-pill"
                style={{
                  ...styles.categoryPill,
                  backgroundColor: isSelected ? 'var(--color-primary)' : '#FFFDF9',
                  color: isSelected ? '#FFFDF9' : 'var(--color-text-ink)',
                  borderColor: isSelected ? 'var(--color-primary)' : '#5C4033',
                  boxShadow: isSelected ? '2px 4px 0px rgba(140, 58, 58, 0.25)' : '2px 3px 0px rgba(92, 64, 51, 0.15)'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading and Results Grid */}
        <div style={{ position: 'relative', minHeight: '350px', width: '100%' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="finder-grid"
                style={styles.gridContainer}
              >
                {[1, 2, 3, 4].map(id => <SkeletonCard key={id} />)}
              </motion.div>
            ) : filteredBooks.length > 0 ? (
              <motion.div 
                key="results"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
                className="finder-grid"
                style={styles.gridContainer}
              >
                {filteredBooks.map(book => (
                  <motion.div
                    key={book.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ y: -6, rotate: 1.0, boxShadow: '5px 8px 0px rgba(92, 64, 51, 0.2)' }}
                    className="premium-card book-card wobbly-border"
                    style={styles.bookCard}
                  >
                    <div style={styles.coverWrapper}>
                      <BookCover title={book.title} author={book.author} color={book.coverColor} />
                    </div>
                    <div style={styles.cardDetails}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          ...styles.categoryBadge,
                          color: book.coverColor,
                          backgroundColor: book.coverColor + '12',
                          border: `1px solid ${book.coverColor}25`
                        }}>
                          {book.category}
                        </span>
                        <span style={styles.priceTag}>{book.price}</span>
                      </div>
                      
                      <h3 style={styles.bookTitle}>{book.title}</h3>
                      <p style={styles.bookAuthor}>By {book.author}</p>
                      <p style={styles.bookDesc}>{book.description}</p>
                      
                      <div style={styles.stallInfo}>
                        <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <strong style={styles.stallName}>{book.stallName}</strong>
                          <span style={styles.stallLocation}>{book.location}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOnMap(book);
                          }}
                          style={styles.viewOnMapBtn}
                          title="Locate on Map"
                        >
                          <Compass size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={styles.emptyState}
              >
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.85 }}>
                  {/* Cartoon empty shelf drawing */}
                  <line x1="15" y1="75" x2="85" y2="75" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="22" y1="75" x2="22" y2="88" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="78" y1="75" x2="78" y2="88" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Sad Magnifying glass */}
                  <circle cx="50" cy="42" r="16" stroke="#5C4033" strokeWidth="2" fill="#FAF6EE" />
                  <line x1="62" y1="54" x2="78" y2="70" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" />
                  
                  <circle cx="45" cy="39" r="1" fill="#5C4033" />
                  <circle cx="55" cy="39" r="1" fill="#5C4033" />
                  <path d="M 47 48 Q 50 45, 53 48" stroke="#5C4033" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </svg>
                <h3 style={styles.emptyTitle}>No Rare Editions Found</h3>
                <p style={styles.emptyText}>
                  We couldn't find any books matching "{searchQuery || selectedCategory}" in the directories. Try adjusting your spelling, typing a different author, or resetting the search filters.
                </p>
                <button onClick={clearSearch} style={styles.resetBtn}>
                  Reset Search & Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    padding: '120px 0 80px',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  backLink: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-primary)',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '24px',
    transition: 'transform 0.2s',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  heading: {
    fontSize: '3.2rem',
    color: 'var(--color-primary)',
    marginBottom: '12px',
  },
  subheading: {
    fontSize: '1.25rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    maxWidth: '650px',
    margin: '0 auto',
  },
  searchBarCard: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: '#FFFDF9',
    border: '2px solid #5C4033',
    padding: '8px 12px',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.15)',
    marginBottom: '32px',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1.1rem',
    background: 'transparent',
    color: 'var(--color-text-ink)',
    fontFamily: 'var(--font-body)',
  },
  clearBtn: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    padding: '8px 12px',
    fontWeight: '500',
  },
  searchBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    padding: '12px 28px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  categoryRow: {
    display: 'flex',
    gap: '14px',
    marginBottom: '48px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryPill: {
    padding: '10px 22px',
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    border: '1.5px solid #5C4033',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '36px',
    width: '100%',
    padding: '10px 0',
  },
  bookCard: {
    backgroundColor: '#FFFDF9',
    border: '2px solid #5C4033',
    borderRadius: '20px 15px 20px 18px / 15px 20px 18px 20px',
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.15)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  },
  coverWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 0 24px',
    borderBottom: '1.5px dashed rgba(92, 64, 51, 0.12)',
    marginBottom: '20px',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryBadge: {
    padding: '5px 12px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  priceTag: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
  },
  bookTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.35rem',
    color: 'var(--color-text-ink)',
    margin: '8px 0 4px',
    lineHeight: '1.2',
  },
  bookAuthor: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    opacity: 0.75,
    marginBottom: '12px',
    fontWeight: '500',
  },
  bookDesc: {
    fontSize: '0.9rem',
    lineHeight: '1.45',
    color: 'var(--color-text-ink)',
    opacity: 0.7,
    marginBottom: '20px',
    flex: 1,
  },
  stallInfo: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px dashed rgba(92, 64, 51, 0.12)',
    paddingTop: '16px',
    marginTop: 'auto',
  },
  stallName: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    fontWeight: '600',
  },
  stallLocation: {
    fontSize: '0.8rem',
    color: 'var(--color-text-ink)',
    opacity: 0.65,
    marginTop: '2px',
  },
  viewOnMapBtn: {
    padding: '8px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    border: '1.5px solid #5C4033',
    boxShadow: '2px 3px 0px rgba(140, 58, 58, 0.2)',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    backgroundColor: '#FFFDF9',
    border: '2px dashed #5C4033',
    borderRadius: '24px',
    maxWidth: '500px',
    margin: '40px auto 0',
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.1)',
  },
  emptyTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.6rem',
    color: 'var(--color-primary)',
    marginTop: '16px',
    marginBottom: '8px',
  },
  emptyText: {
    color: 'var(--color-text-ink)',
    opacity: 0.75,
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  resetBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    padding: '12px 28px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.95rem',
    fontWeight: '600',
    border: '1.5px solid #4A1212',
    boxShadow: '2px 3px 0px rgba(140, 58, 58, 0.3)',
  }
};

export default BookFinderPage;
