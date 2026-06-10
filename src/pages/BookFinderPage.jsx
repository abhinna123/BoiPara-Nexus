import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, MapPin, ArrowLeft, Compass, X, Heart, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksData } from '../data/booksData';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import BookDetailsModal from '../components/BookDetailsModal';

// Fuzzy search utility function
const fuzzyMatch = (searchTerm, text) => {
  if (!searchTerm || !text) return 0;
  
  const search = searchTerm.toLowerCase().trim();
  const target = text.toLowerCase().trim();
  
  // Exact match gets highest score
  if (target === search) return 1;
  
  // Contains exact substring
  if (target.includes(search)) return 0.9;
  
  // Handle empty search
  if (search.length === 0) return 0;
  
  // Calculate similarity based on character matching
  let score = 0;
  const searchLen = search.length;
  const targetLen = target.length;
  
  // Simple character-by-character matching with tolerance for transpositions
  let matches = 0;
  let i = 0, j = 0;
  
  while (i < searchLen && j < targetLen) {
    if (search[i] === target[j]) {
      matches++;
      i++;
      j++;
    } else {
      // Allow for single character transposition or missing character
      if (i + 1 < searchLen && search[i + 1] === target[j]) {
        // Transposition case: "ab" vs "ba"
        matches += 0.5;
        i += 2;
        j++;
      } else if (j + 1 < targetLen && search[i] === target[j + 1]) {
        // Transposition case: "ba" vs "ab"
        matches += 0.5;
        i++;
        j += 2;
      } else {
        // Try skipping a character in either string (handles missing/extra chars)
        const skipSearchMatch = (i + 1 < searchLen && search[i + 1] === target[j]) ? 1 : 0;
        const skipTargetMatch = (j + 1 < targetLen && search[i] === target[j + 1]) ? 1 : 0;
        
        if (skipSearchMatch > skipTargetMatch) {
          i++;
        } else if (skipTargetMatch > skipSearchMatch) {
          j++;
        } else {
          i++;
          j++;
        }
      }
    }
  }
  
  // Add remaining matches if one string is exhausted
  while (i < searchLen) {
    // Look for remaining characters in target
    if (target.indexOf(search[i]) !== -1) {
      matches += 0.5;
    }
    i++;
  }
  
  while (j < targetLen) {
    // Look for remaining characters in search
    if (search.indexOf(target[j]) !== -1) {
      matches += 0.5;
    }
    j++;
  }
  
  // Calculate base score from character matches
  const baseScore = matches / Math.max(searchLen, targetLen);
  
  // Boost score for word order flexibility
  const searchWords = search.split(/\s+/);
  const targetWords = target.split(/\s+/);
  
  let wordMatches = 0;
  for (const searchWord of searchWords) {
    if (searchWord.length > 2) { // Only consider meaningful words
      for (const targetWord of targetWords) {
        if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
          wordMatches++;
          break;
        }
      }
    }
  }
  
  const wordScore = searchWords.length > 0 ? wordMatches / searchWords.length : 0;
  
  // Combine scores with weighting
  return Math.max(baseScore * 0.6 + wordScore * 0.4, baseScore);
};

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

// Simplified Book Card Component for reuse
const BookCard = ({ book, wishlist, onWishlistClick, onSelect, onLocate, styles }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6, rotate: 1.0, boxShadow: '5px 8px 0px rgba(92, 64, 51, 0.2)' }}
      className="premium-card book-card wobbly-border"
      style={{ ...styles.bookCard, cursor: 'pointer' }}
      onClick={() => onSelect(book)}
    >
      <div style={styles.coverWrapper}>
        <BookCover title={book.title} author={book.author} color={book.coverColor} />
        {/* Wishlist Heart Button */}
        <button 
          onClick={(e) => onWishlistClick(e, book.id)}
          style={{
            ...styles.wishlistBtn,
            color: wishlist.includes(book.id) ? '#FF4B4B' : 'rgba(92, 64, 51, 0.4)',
            backgroundColor: wishlist.includes(book.id) ? '#FFF0F0' : '#FFFDF9'
          }}
          title={wishlist.includes(book.id) ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart size={20} fill={wishlist.includes(book.id) ? '#FF4B4B' : 'none'} />
        </button>
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
              onLocate(book);
            }}
            style={styles.viewOnMapBtn}
            title="Locate on Map"
          >
            <Compass size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BookFinderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedBook, setSelectedBook] = useState(null);
  const { user, wishlist, toggleWishlist } = useAuth();
  const { recentlyViewedIds, addViewedBook } = useRecentlyViewed();

  // AI Recommendation Engine (Local Scoring Logic)
  const aiRecommendations = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    if (!query || query.length < 2) return [];

    const scores = booksData.map(book => {
      let score = 0;
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();
      const category = book.category.toLowerCase();
      const desc = book.description.toLowerCase();
      const tags = book.tags || [];

      // 1. Exact Title Match (High Priority)
      if (title === query) score += 20;
      else if (title.includes(query)) score += 10;

      // 2. Tag Relevance
      tags.forEach(tag => {
        if (tag.toLowerCase() === query) score += 15;
        else if (tag.toLowerCase().includes(query)) score += 5;
      });

      // 3. Category Match
      if (category.toLowerCase().includes(query)) score += 8;

      // 4. Author Match
      if (author.toLowerCase().includes(query)) score += 6;

      // 5. Description Context
      if (desc.toLowerCase().includes(query)) score += 3;

      return { ...book, aiScore: score };
    });

    // Sort by score and take top 5
    return scores
      .filter(book => book.aiScore > 0)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 5);
  }, [debouncedQuery]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    addViewedBook(book.id);
  };

  // Synchronize local input state with URL search param
  useEffect(() => {
    setSearchQuery(queryParam);
    setDebouncedQuery(queryParam);
  }, [queryParam]);

  // Handle debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery.trim() });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  // Simulated loading when query or category changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [debouncedQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setDebouncedQuery(searchQuery);
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

  const handleWishlistClick = (e, bookId) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save books to your wishlist.");
      return;
    }
    toggleWishlist(bookId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams({});
    setSelectedCategory('All');
  };

  const categories = ['All', 'Engineering', 'Medical', 'UPSC', 'Literature'];

  // Map recently viewed IDs back to full book objects
  const recentlyViewedBooks = useMemo(() => {
    return recentlyViewedIds
      .map(id => booksData.find(book => book.id === id))
      .filter(Boolean);
  }, [recentlyViewedIds, booksData]);

  // Filter books matching search query and category with useMemo for performance
  const filteredBooks = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    
    if (!query) {
      let books = selectedCategory === 'All' 
        ? booksData 
        : booksData.filter(book => book.category.toLowerCase() === selectedCategory.toLowerCase());
      
      // Apply sorting when no search query
      return applySorting(books);
    }

    let books = booksData
      .filter(book => 
        selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase()
      )
      .map(book => {
        // Calculate relevance score for each field
        const titleScore = fuzzyMatch(query, book.title);
        const authorScore = fuzzyMatch(query, book.author);
        const descriptionScore = fuzzyMatch(query, book.description);
        const stallNameScore = fuzzyMatch(query, book.stallName);
        
        // Use the highest score from any field
        const maxScore = Math.max(titleScore, authorScore, descriptionScore, stallNameScore);
        
        // Only include books with a meaningful match score
        return maxScore > 0.3 ? { ...book, relevanceScore: maxScore } : null;
      })
      .filter(Boolean); // Remove null values
      
    // Apply sorting based on selected option
    return applySorting(books);
  }, [debouncedQuery, selectedCategory, booksData, sortBy]);

  // Apply sorting based on selected option
  function applySorting(books) {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high':
          return parsePrice(a.price) - parsePrice(b.price);
        case 'price-high-low':
          return parsePrice(b.price) - parsePrice(a.price);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'relevance':
        default:
          // Sort by relevance score (highest first)
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
    });
  }

  // Helper function to parse price strings (e.g., '₹899' -> 899)
  function parsePrice(priceStr) {
    return parseFloat(priceStr.replace(/[^\d.-]/g, '')) || 0;
  }

  // Sort options for the dropdown
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low-high', label: 'Price Low → High' },
    { value: 'price-high-low', label: 'Price High → Low' },
    { value: 'title-asc', label: 'Alphabetical (A → Z)' }
  ];

  return (
    <div className="finder-wrapper" style={styles.pageWrapper}>
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
                <X size={18} />
              </button>
            )}
            <button type="submit" className="finder-search-btn" style={styles.searchBtn}>
              Find Book
            </button>
          </form>
        </div>

        {/* Sort Dropdown */}
        <div className="premium-card wobbly-border" style={{ 
          ...styles.searchBarCard, 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '16px 20px' 
          }}>
            <Compass size={20} style={{ color: '#5C4033', opacity: 0.7 }} />
            <span style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.95rem', 
              color: 'var(--color-text-ink)', 
              fontWeight: '500'
            }}>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-pill)', 
                border: '1.5px solid #5C4033', 
                backgroundColor: '#FFFDF9', 
                color: 'var(--color-text-ink)', 
                fontFamily: 'var(--font-body)', 
                fontSize: '0.9rem',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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

        {/* Recently Viewed Section */}
        {!debouncedQuery && (
          <div style={styles.recentlyViewedWrapper}>
            <div style={styles.sectionHeader}>
              <Clock size={22} color="var(--color-primary)" />
              <h2 style={styles.sectionTitle}>Recently Viewed Books</h2>
            </div>
            {recentlyViewedBooks.length > 0 ? (
              <div className="recently-viewed-scroll" style={styles.horizontalScroll}>
                {recentlyViewedBooks.map(book => (
                  <div key={book.id} style={{ flex: '0 0 280px', margin: '4px' }}>
                    <BookCard 
                      book={book}
                      wishlist={wishlist}
                      onWishlistClick={handleWishlistClick}
                      onSelect={handleBookSelect}
                      onLocate={handleViewOnMap}
                      styles={styles}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyRecentState}>
                <p>No recently viewed books yet.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations Section */}
        {debouncedQuery && (
          <div style={styles.aiWrapper}>
            <div style={styles.sectionHeader}>
              <div style={styles.aiIconBadge}>
                <Sparkles size={20} color="#FFFDF9" fill="#FFFDF9" />
              </div>
              <h2 style={styles.sectionTitle}>AI Recommended Books</h2>
            </div>
            
            {aiRecommendations.length > 0 ? (
              <div className="recently-viewed-scroll" style={styles.horizontalScroll}>
                {aiRecommendations.map(book => (
                  <div key={`ai-${book.id}`} style={{ flex: '0 0 280px', margin: '4px' }}>
                    <BookCard 
                      book={book}
                      wishlist={wishlist}
                      onWishlistClick={handleWishlistClick}
                      onSelect={handleBookSelect}
                      onLocate={handleViewOnMap}
                      styles={styles}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyRecentState}>
                <p>Try searching for a topic to get AI-powered recommendations.</p>
              </div>
            )}
            <div style={styles.aiDivider} />
          </div>
        )}

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
                  <BookCard 
                    key={book.id}
                    book={book}
                    wishlist={wishlist}
                    onWishlistClick={handleWishlistClick}
                    onSelect={handleBookSelect}
                    onLocate={handleViewOnMap}
                    styles={styles}
                  />
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
                  We couldn't find any books matching "{debouncedQuery || selectedCategory}" in the directories. Try adjusting your spelling, typing a different author, or resetting the search filters.
                </p>
                <button onClick={clearSearch} style={styles.resetBtn}>
                  Reset Search & Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      <BookDetailsModal
        isOpen={Boolean(selectedBook)}
        onClose={() => setSelectedBook(null)}
        book={selectedBook}
        onLocate={handleViewOnMap}
      />
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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    padding: '12px 28px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s, transform 0.1s',
    border: 'none',
    cursor: 'pointer',
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
  recentlyViewedWrapper: {
    width: '100%',
    marginBottom: '48px',
    padding: '0 10px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingLeft: '10px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.75rem',
    color: 'var(--color-primary)',
    margin: 0,
  },
  aiWrapper: {
    width: '100%',
    marginBottom: '40px',
    padding: '0 10px',
    position: 'relative',
  },
  aiIconBadge: {
    backgroundColor: 'var(--color-primary)',
    padding: '8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(140, 58, 58, 0.3)',
  },
  aiDivider: {
    height: '1px',
    width: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(140, 58, 58, 0.2), transparent)',
    margin: '20px 0 40px 0',
  },
  horizontalScroll: {
    display: 'flex',
    gap: '24px',
    overflowX: 'auto',
    padding: '10px 10px 24px 10px',
    scrollbarWidth: 'none', // Hide scrollbar for Firefox
    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
    WebkitOverflowScrolling: 'touch',
  },
  emptyRecentState: {
    padding: '24px 10px',
    color: 'var(--color-text-ink)',
    opacity: 0.5,
    fontStyle: 'italic',
    fontSize: '0.95rem',
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
    position: 'relative',
  },
  wishlistBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    padding: '10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    border: '1.5px solid #5C403315',
    cursor: 'pointer',
    zIndex: 10,
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
    cursor: 'pointer',
  }
};

export default BookFinderPage;
