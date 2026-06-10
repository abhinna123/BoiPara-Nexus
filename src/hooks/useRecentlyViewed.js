import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'boipara_recently_viewed';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentlyViewedIds(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to parse recently viewed books:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  const addViewedBook = useCallback((bookId) => {
    if (!bookId) return;
    
    setRecentlyViewedIds((prevIds) => {
      // Remove the id if it already exists to move it to the front
      const filtered = prevIds.filter((id) => id !== bookId);
      // Add to the front and limit to MAX_ITEMS
      return [bookId, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { recentlyViewedIds, addViewedBook };
};
