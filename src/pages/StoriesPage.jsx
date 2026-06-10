import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, X } from 'lucide-react';
import './StoriesPage.css';

const heritageStories = [
  {
    id: 1,
    title: "The Coffee House Chronicles",
    date: "Established 1876",
    description: "Step into the smoke-filled rooms where Nobel laureates and revolutionaries debated the future of India over cups of infusion.",
    fullStory: "For over a century, the Albert Hall, now known as the Indian Coffee House, has been the epicenter of Kolkata's intellectual life. Located on Bankim Chatterjee Street, its high ceilings and peeling paint have witnessed the birth of revolutionary ideas and the blossoming of literary movements. From Satyajit Ray to Amartya Sen, the wooden chairs have held the weight of giants. The rhythmic clinking of heavy ceramic cups and the persistent aroma of 'Infusion' (black coffee) create a symphony of nostalgia that continues to draw students and veterans alike into its hallowed halls.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
    category: "Culture",
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "Forgotten Ink & Rare Finds",
    date: "Century Old Collections",
    description: "Hidden behind stacks of modern textbooks lie first editions from the 19th century, waiting for a persistent seeker to find them.",
    fullStory: "The stalls of College Street are a labyrinth of paper. While many come for the latest engineering manuals, the true treasures are found in the dusty corners of shops like Dasgupta & Co. Here, one might stumble upon a first edition of Rabindranath Tagore's Gitanjali or an obscure medical treatise from the East India Company era. These books aren't just paper and ink; they are survivors of the humid Bengal summers and the monsoon damp, preserved by the dedication of stall owners who treat their collections like family heritage. Every yellowed page tells a story of a previous owner, often marked by elegant Bengali calligraphy in the margins.",
    image: "/bookshelf.png",
    category: "Rare Books",
    readTime: "6 min read"
  },
  {
    id: 3,
    title: "The Tram Line of Knowledge",
    date: "Route 24 Legacy",
    description: "A slow, rhythmic journey through time, connecting the intellectual heartbeat of North Kolkata to the rest of the city.",
    fullStory: "The tram car number 24 has long been the scholar's chariot. As it trundles down College Street, its metallic groan and the chime of its bell signal a pace of life that the rest of the world has forgotten. For decades, students from Presidency and Calcutta University have hopped onto these moving libraries, using the commute to finish a final chapter or engage in spirited debates on the open platforms. The tram tracks represent more than just transport; they are the iron veins of Kolkata's academic district, pulsing with the energy of a thousand young minds since the late 19th century.",
    image: "/tram.png",
    category: "Heritage",
    readTime: "5 min read"
  },
  {
    id: 4,
    title: "Academic Legacy of Presidency",
    date: "Since 1817",
    description: "From Derozio to Satyajit Ray, explore how one institution shaped the Bengali Renaissance and global academic discourse.",
    fullStory: "Presidency University, formerly Hindu College, stands as a majestic witness to the 'Bengal Renaissance'. Founded in 1817, it was one of the first institutions of Western-style higher education in Asia. The corridors have echoed with the footsteps of Henry Louis Vivian Derozio, who sparked the Young Bengal movement, and later, polymaths like Jagadish Chandra Bose and Satyendra Nath Bose. The architecture itself—with its grand pillars and sprawling library—serves as a temple of reason. Today, it remains not just a university, but a symbol of the intellectual fearlessness that defines the spirit of Kolkata.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
    category: "Institutions",
    readTime: "10 min read"
  }
];

const StoriesPage = () => {
  const [selectedStory, setSelectedStory] = useState(null);

  // Global fallback image
  const handleImageError = (e) => {
    e.target.src = '/bookshelf.png';
  };

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

      {/* Stories Grid */}
      <section className="container">
        <div className="stories-grid">
          {heritageStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="story-card premium-card"
            >
              <div className="story-card-image-wrapper">
                <img 
                  src={story.image} 
                  alt={story.title} 
                  className="story-card-image" 
                  onError={handleImageError}
                />
                <div className="story-card-overlay"></div>
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', gap: '12px' }}>
                  <span className="badge" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                    <Clock size={12} /> {story.readTime}
                  </span>
                </div>
              </div>
              
              <div className="story-card-content">
                <div className="story-card-date">{story.date}</div>
                <h3 className="story-card-title">{story.title}</h3>
                <p className="story-card-description">{story.description}</p>
                
                <div className="story-card-footer">
                  <button 
                    className="read-story-btn"
                    onClick={() => setSelectedStory(story)}
                  >
                    Read Story <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedStory(null)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              
              <div className="modal-scroll-content">
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
                      <BookOpen size={14} /> {selectedStory.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
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
