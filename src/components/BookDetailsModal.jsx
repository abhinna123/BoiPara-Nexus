import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Compass, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookCover from './BookCover';

const BookDetailsModal = ({ isOpen, onClose, book, onLocate }) => {
  const { user, wishlist, toggleWishlist } = useAuth();
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const displayTitle = book?.title || 'Untitled Book';
  const displayAuthor = book?.author || 'Unknown Author';
  const displayCategory = book?.category || 'Uncategorized';
  const displayPrice = book?.price || 'Price Not Available';
  const displayDescription = book?.description || 'No description available for this book.';
  const displayStallName = book?.stallName || 'Unknown Stall';
  const displayStallNumber = book?.stallNumber || 'Not Specified';
  const displayLocation = book?.location || 'Location Not Specified';
  const displayPhoneNumber = book?.phoneNumber || '';
  const displayCoverColor = book?.coverColor || '#8C3A3A';

  const isSaved = book ? wishlist.includes(book.id) : false;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save books to your wishlist.");
      return;
    }
    toggleWishlist(book.id);
  };

  const handleWhatsApp = () => {
    if (!displayPhoneNumber) return;
    
    const message = `Hello, I am interested in the book "${displayTitle}" listed on BoiPara Nexus. Is it still available?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${displayPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.modalOverlay} onClick={onClose} className="book-details-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="premium-card wobbly-border book-details-container"
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} style={styles.closeButton} aria-label="Close modal">
              <X size={22} color="var(--color-text-ink)" />
            </button>

            <div className="book-details-content" style={styles.content}>
              {/* Cover Column */}
              <div className="book-details-cover-col" style={styles.coverCol}>
                <div style={{
                  ...styles.coverWrapper,
                  backgroundColor: `${displayCoverColor}10`,
                  border: `1.5px dashed ${displayCoverColor}40`
                }}>
                  <BookCover 
                    title={displayTitle} 
                    author={displayAuthor} 
                    color={displayCoverColor} 
                    size="lg" 
                  />
                </div>
              </div>

              {/* Info Column */}
              <div className="book-details-info-col" style={styles.infoCol}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    ...styles.categoryBadge,
                    color: displayCoverColor,
                    backgroundColor: `${displayCoverColor}12`,
                    border: `1px solid ${displayCoverColor}25`
                  }}>
                    {displayCategory}
                  </span>
                </div>

                <h2 style={styles.bookTitle}>{displayTitle}</h2>
                <p style={styles.bookAuthor}>By {displayAuthor}</p>
                <div style={styles.priceContainer}>
                  <span style={styles.priceLabel}>Price: </span>
                  <span style={styles.priceValue}>{displayPrice}</span>
                </div>

                <div style={styles.divider} />

                <h4 style={styles.sectionTitle}>Description</h4>
                <p style={styles.bookDesc}>{displayDescription}</p>

                <div style={styles.divider} />

                <h4 style={styles.sectionTitle}>Availability</h4>
                <div style={styles.stallCard}>
                  <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <strong style={styles.stallName}>{displayStallName}</strong>
                    <span style={styles.stallLocation}>{displayLocation} • {displayStallNumber}</span>
                  </div>
                </div>

                <div style={styles.divider} />

                <h4 style={styles.sectionTitle}>Contact Seller</h4>
                {displayPhoneNumber ? (
                  <button 
                    onClick={handleWhatsApp}
                    style={styles.whatsappBtn}
                    className="hover-lift"
                  >
                    <MessageCircle size={20} />
                    <span>WhatsApp Seller</span>
                  </button>
                ) : (
                  <p style={styles.fallbackText}>Seller contact not available.</p>
                )}

                <div style={styles.divider} />

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {onLocate && book && (
                    <button 
                      onClick={() => {
                        onClose();
                        onLocate(book);
                      }}
                      style={styles.locateBtn}
                      className="hover-lift"
                    >
                      <Compass size={20} />
                      <span>Locate on Map</span>
                    </button>
                  )}

                  {book && (
                    <button 
                      onClick={handleWishlistClick}
                      style={{
                        ...styles.wishlistBtn,
                        backgroundColor: isSaved ? '#FFF0F0' : '#FFFDF9',
                        color: isSaved ? '#FF4B4B' : 'var(--color-text-ink)',
                        borderColor: isSaved ? '#FF4B4B' : '#5C4033',
                      }}
                      className="hover-lift"
                    >
                      <Heart size={20} fill={isSaved ? '#FF4B4B' : 'none'} />
                      <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    height: '100dvh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    background: 'rgba(44, 36, 27, 0.55)',
    backdropFilter: 'blur(8px)',
    margin: 0,
    padding: '24px',
    top: 0,
    left: 0,
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '780px',
    maxHeight: '90vh',
    maxHeight: '90dvh',
    overflowY: 'auto',
    margin: 0,
    transform: 'none',
    background: '#FFFDF9',
    padding: '36px',
    boxShadow: '0 25px 80px rgba(92, 64, 51, 0.25), 4px 8px 0px rgba(92, 64, 51, 0.2)',
    pointerEvents: 'auto',
    border: '2px solid #5C4033',
  },
  closeButton: {
    position: 'absolute',
    top: '18px',
    right: '18px',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s, transform 0.2s',
    opacity: 0.8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    gap: '32px',
    width: '100%',
  },
  coverCol: {
    flex: '0 0 220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  coverWrapper: {
    width: '100%',
    padding: '24px 16px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'inset 0 0 20px rgba(92, 64, 51, 0.05)',
  },
  infoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  categoryBadge: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.3px',
    display: 'inline-block',
  },
  bookTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    color: 'var(--color-text-ink)',
    margin: '0 0 6px 0',
    lineHeight: '1.25',
  },
  bookAuthor: {
    fontSize: '1.05rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    margin: '0 0 16px 0',
    fontWeight: '500',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '8px',
  },
  priceLabel: {
    fontSize: '0.95rem',
    color: 'var(--color-text-ink)',
    opacity: 0.7,
  },
  priceValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
  },
  divider: {
    height: '1px',
    borderTop: '1.5px dashed rgba(92, 64, 51, 0.12)',
    margin: '16px 0',
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    color: 'var(--color-text-ink)',
    marginBottom: '8px',
    fontWeight: '700',
  },
  bookDesc: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    margin: 0,
  },
  stallCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FAF6EE',
    border: '1px solid rgba(92, 64, 51, 0.1)',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  stallName: {
    fontSize: '0.95rem',
    color: 'var(--color-text-ink)',
    fontWeight: '600',
  },
  stallLocation: {
    fontSize: '0.85rem',
    color: 'var(--color-text-ink)',
    opacity: 0.7,
    marginTop: '2px',
  },
  locateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFDF9',
    padding: '14px 28px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    border: '1.5px solid #4A1212',
    boxShadow: '3px 5px 0px rgba(140, 58, 58, 0.3)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s',
    alignSelf: 'flex-start',
    width: 'auto',
  },
  wishlistBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 28px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    border: '1.5px solid #5C4033',
    boxShadow: '3px 5px 0px rgba(92, 64, 51, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
    width: 'auto',
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: '#25D366', // WhatsApp Green
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    boxShadow: '3px 4px 0px rgba(18, 140, 62, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
    width: 'auto',
  },
  fallbackText: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    opacity: 0.5,
    fontStyle: 'italic',
    margin: '4px 0',
  }
};

export default BookDetailsModal;
