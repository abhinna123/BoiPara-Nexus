import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Zone Map', path: '/map' },
    { name: 'Book Finder', path: '/finder' },
    { name: 'Student Adda', path: '/adda' },
    { name: 'Heritage Stories', path: '/stories' },
  ];

  // Add Wishlist link for logged-in users
  if (user) {
    navLinks.push({ name: 'Wishlist', path: '/wishlist' });
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="nav-wrapper">
        <div className="container nav-container">
          {/* Mobile Menu Toggle */}
          <button className="nav-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <Link to="/" className="nav-logo">
            <BookOpen size={28} color="var(--color-primary)" />
            <span className="logo-text">BoiPara Nexus</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop-links">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="nav-right-section">
            <div className="auth-wrapper" style={{ position: 'relative' }}>
              {user ? (
                <div className="profile-container" style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="profile-trigger hover-lift"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="profile-avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        <UserIcon size={20} color="var(--color-primary)" />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="profile-dropdown premium-card wobbly-border"
                      >
                        <div className="dropdown-header">
                          <p className="user-name">{user.displayName || 'Researcher'}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                        <Link 
                          to="/wishlist" 
                          className="nav-logout-btn" 
                          style={{ color: 'var(--color-text-ink)', marginBottom: '8px', textDecoration: 'none' }}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart size={16} color="#FF4B4B" fill="#FF4B4B" /> Your Wishlist
                        </Link>
                        <button onClick={logout} className="nav-logout-btn">
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  className="sign-in-btn" 
                  onClick={() => setIsModalOpen(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mobile-menu-dropdown"
            >
              <div className="container mobile-menu-container">
                <div className="mobile-links">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      onClick={() => setIsMenuOpen(false)}
                      className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {!user ? (
                    <button 
                      className="sign-in-btn mobile-sign-in" 
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </button>
                  ) : (
                    <div className="mobile-user-info">
                      <div className="mobile-user-details">
                        <p className="user-name">{user.displayName || 'Researcher'}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <button onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }} className="nav-logout-btn mobile-logout">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;

