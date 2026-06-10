import React from 'react';
import { motion } from 'framer-motion';
import { STORY_CATEGORIES } from '../data/storiesData';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="category-filter-container">
      <div className="category-scroll-wrapper">
        {STORY_CATEGORIES.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`category-badge ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
