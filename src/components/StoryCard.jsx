import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const StoryCard = ({ story, onReadClick }) => {
  const handleImageError = (e) => {
    e.target.src = '/bookshelf.png';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 }
      }}
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
        <div className="story-card-badges">
          <span className="badge-mini">
            <Clock size={12} /> {story.readTime}
          </span>
          <span className="badge-mini category-label">
            <Tag size={12} /> {story.category}
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
            onClick={() => onReadClick(story)}
          >
            Read Story <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;
