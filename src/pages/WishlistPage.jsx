import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MapPin, ArrowLeft, Compass, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksData } from '../data/booksData';
import { useAuth } from '../context/AuthContext';
import BookDetailsModal from '../components/BookDetailsModal';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist, loading } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);

  const savedBooks = useMemo(() => {
    return booksData.filter(book => wishlist.includes(book.id));
  }, [wishlist]);

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

  const handleRemove = (e, bookId) => {
    e.stopPropagation();
    toggleWishlist(bookId);
  };

  // Dynamic hand-drawn book cover generator (copied from BookFinderPage)
  const BookCover = ({ title, author, color }) => {
    return (
      <svg width="100%" height="200" viewBox="0 0 140 200" style={{ filter: 'drop-shadow(3px 5px 8px rgba(92, 64, 51, 0.15))' }}>
        <path d="M 8 12 Q 12 9, 16 12 L 16 188 Q 12 191, 8 188 Z" fill="#422B1E" />
        <path d="M 16 12 Q 73 9, 130 12 C 133 70, 133 130, 130 188 Q 73 191, 16 188 Z" fill={color} stroke="#422B1E" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 22 18 Q 71 15, 122 18 C 125 70, 125 130, 122 182 Q 71 185, 22 182 Z" fill="none" stroke="#FFFDF9" strokeWidth="1" opacity="0.3" />
        <path d="M 16 12 L 32 12 L 16 28 Z" fill="#E6C587" stroke="#422B1E" strokeWidth="1" />
        <foreignObject x="24" y="32" width="98" height="110">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', padding: '4px', color: '#FFFDF9', fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 'bold', lineHeight: '1.25', textShadow: '1px 1px 2px rgba(0,0,0,0.55)', userSelect: 'none' }}>
            {title}
          </div>
        </foreignObject>
        <foreignObject x="24" y="145" width="98" height="30">
          <div style={{ textAlign: 'center', color: '#FFFDF9', opacity: 0.9, fontFamily: 'var(--font-body)', fontSize: '8px', lineHeight: '1.1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', userSelect: 'none' }}>
            {author}
          </div>
        </foreignObject>
      </svg>
    );
  };

  if (loading) return null; // Auth loading state handled by provider usually

  return (
    <div className="wishlist-wrapper" style={styles.pageWrapper}>
      <div className="container" style={styles.container}>
        
        {/* Back Link */}
        <Link to="/finder" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Finder
        </Link>

        {/* Header Title */}
        <div style={styles.header}>
          <h1 className="wishlist-heading" style={styles.heading}>Your Heritage Wishlist</h1>
          <p style={styles.subheading}>A curated collection of your favorite rare finds and academic treasures</p>
        </div>

        {/* Results Grid */}
        <div style={{ position: 'relative', minHeight: '350px', width: '100%' }}>
          <AnimatePresence mode="wait">
            {savedBooks.length > 0 ? (
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
                {savedBooks.map(book => (
                  <motion.div
                    key={book.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ y: -6, rotate: 1.0, boxShadow: '5px 8px 0px rgba(92, 64, 51, 0.2)' }}
                    className="premium-card book-card wobbly-border"
                    style={{ ...styles.bookCard, cursor: 'pointer' }}
                    onClick={() => setSelectedBook(book)}
                  >
                    <div style={styles.coverWrapper}>
                      <BookCover title={book.title} author={book.author} color={book.coverColor} />
                      {/* Remove Button */}
                      <button 
                        onClick={(e) => handleRemove(e, book.id)}
                        style={styles.wishlistBtn}
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={20} color="#FF4B4B" />
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
                      
                      <div style={styles.stallInfo}>
                        <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <strong style={styles.stallName}>{book.stallName}</strong>
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
                <div style={styles.emptyIconWrapper}>
                   <Heart size={60} color="var(--color-primary)" fill="none" opacity={0.3} />
                </div>
                <h3 style={styles.emptyTitle}>Wishlist is Empty</h3>
                <p style={styles.emptyText}>
                  You haven't saved any books yet. Start exploring heritage stalls to build your personal academic collection.
                </p>
                <Link to="/finder" style={styles.exploreBtn}>
                  Explore Books
                </Link>
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
    background: 'var(--color-bg-paper)',
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
    textDecoration: 'none',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  heading: {
    fontSize: '3.2rem',
    color: 'var(--color-primary)',
    marginBottom: '12px',
    fontFamily: 'var(--font-heading)',
  },
  subheading: {
    fontSize: '1.2rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    maxWidth: '600px',
    margin: '0 auto',
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
    backgroundColor: '#FFFDF9',
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
    marginBottom: '20px',
    fontWeight: '500',
  },
  stallInfo: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px dashed rgba(92, 64, 51, 0.12)',
    paddingTop: '16px',
    marginTop: 'auto',
    alignItems: 'center',
  },
  stallName: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    fontWeight: '600',
  },
  viewOnMapBtn: {
    padding: '8px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #5C4033',
    boxShadow: '2px 3px 0px rgba(140, 58, 58, 0.2)',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '80px 24px',
    backgroundColor: '#FFFDF9',
    border: '2px dashed #5C4033',
    borderRadius: '32px',
    maxWidth: '550px',
    margin: '40px auto 0',
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.1)',
  },
  emptyIconWrapper: {
    marginBottom: '24px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    color: 'var(--color-primary)',
    marginBottom: '12px',
  },
  emptyText: {
    color: 'var(--color-text-ink)',
    opacity: 0.7,
    fontSize: '1.05rem',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  exploreBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    padding: '14px 32px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
    border: '1.5px solid #4A1212',
    boxShadow: '2px 4px 0px rgba(140, 58, 58, 0.3)',
    transition: 'transform 0.2s',
  }
};

export default WishlistPage;
