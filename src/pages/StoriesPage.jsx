import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, X, Tag, Share2, CheckCircle } from 'lucide-react';
import { heritageStories } from '../data/storiesData';
import CategoryFilter from '../components/CategoryFilter';
import StoryCard from '../components/StoryCard';
import './StoriesPage.css';

const StoriesPage = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [scrollProgress, setScrollProgress] = useState(0);
  const modalScrollRef = useRef(null);

  // Handle Share Logic
  const handleShare = useCallback(async (story) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${story.id}`;
    const shareData = {
      title: `BoiPara Nexus: ${story.title}`,
      text: story.description,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback for failed share attempt
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast("Link copied to clipboard");
        } catch (copyError) {
          console.error('Copy failed:', copyError);
        }
      }
    }
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Deep linking: Check URL for story ID on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    
    if (storyId) {
      const story = heritageStories.find(s => s.id.toString() === storyId);
      if (story) {
        setSelectedStory(story);
      }
    }
  }, []);

  // Update URL when story is selected/deselected
  useEffect(() => {
    const url = new URL(window.location);
    if (selectedStory) {
      url.searchParams.set('id', selectedStory.id);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState({}, '', url);
  }, [selectedStory]);

  // Synchronously derive filtered stories to prevent layout flickers/shifts
  const filteredStories = useMemo(() => {
    return activeCategory === "All" 
      ? heritageStories 
      : heritageStories.filter(story => story.category === activeCategory);
  }, [activeCategory]);

  // Global fallback image
  const handleImageError = (e) => {
    e.target.src = '/bookshelf.png';
  };

  // Handle Scroll Progress for Modal
  useEffect(() => {
    const handleScroll = () => {
      if (modalScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = modalScrollRef.current;
        const totalHeight = scrollHeight - clientHeight;
        if (totalHeight === 0) {
          setScrollProgress(0);
          return;
        }
        const progress = (scrollTop / totalHeight) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    const currentRef = modalScrollRef.current;
    if (selectedStory && currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();
    } else {
      setScrollProgress(0);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [selectedStory]);

  // Disable scroll when modal is open and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedStory(null);
      }
    };

    if (selectedStory) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStory]);

  return (
    <div className="stories-wrapper">
      {/* Hero Section */}
      <section className="stories-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="stories-hero-content"
          >
            <span className="stories-hero-badge">The BoiPara Archives</span>
            <h1 className="stories-hero-title">Heritage Stories</h1>
            <p className="stories-hero-subtitle">
              Uncovering the layers of history, intellect, and culture that made College Street 
              the world's largest second-hand book market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {/* Stories Grid */}
      <section className="container">
        <div className="stories-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredStories.map((story) => (
              <StoryCard 
                key={story.id}
                story={story}
                onReadClick={setSelectedStory}
                onShareClick={handleShare}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {filteredStories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-stories"
            style={{ textAlign: 'center', padding: '100px 0' }}
          >
            <h3>No stories found in this category yet.</h3>
            <p>Our researchers are still digging through the archives!</p>
          </motion.div>
        )}
      </section>

      {/* Story Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <div className="modal-backdrop" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="story-modal premium-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reading Progress Bar */}
              <div className="reading-progress-container">
                <motion.div 
                  className="reading-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${scrollProgress}%` }}
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
                />
                <div className="progress-percentage">
                  {Math.round(scrollProgress)}%
                </div>
              </div>

              <div className="modal-header-actions">
                <button 
                  className="modal-action-btn share"
                  onClick={() => handleShare(selectedStory)}
                  aria-label="Share story"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  className="modal-action-btn close"
                  onClick={() => setSelectedStory(null)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div 
                className="modal-scroll-content"
                ref={modalScrollRef}
              >
                <div className="modal-hero-image-wrapper">
                  <img 
                    src={selectedStory.image} 
                    alt={selectedStory.title} 
                    className="modal-hero-image" 
                    onError={handleImageError}
                  />
                  <div className="modal-image-overlay"></div>
                </div>
                
                <div className="modal-body-content">
                  <div className="story-card-date">{selectedStory.date}</div>
                  <h2 className="modal-story-title">{selectedStory.title}</h2>
                  <div className="story-divider"></div>
                  <p className="modal-full-story">{selectedStory.fullStory}</p>
                  
                  <div className="modal-footer-info">
                    <span className="badge">
                      <Clock size={14} /> {selectedStory.readTime}
                    </span>
                    <span className="badge">
                      <Tag size={14} /> {selectedStory.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className="toast-notification"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
          >
            <CheckCircle size={18} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aesthetic Footer Element */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.4 }}
        className="container"
        style={{ textAlign: 'center', marginTop: '100px', borderTop: '1px dashed var(--color-primary)', paddingTop: '40px' }}
      >
        <BookOpen size={40} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
        <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>
          More stories being archived by our researchers...
        </p>
      </motion.div>
    </div>
  );
};

export default StoriesPage;
