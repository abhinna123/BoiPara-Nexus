import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
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

        {/* Mobile Menu Sidebar Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Dark Transparent Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="menu-backdrop"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(44, 36, 27, 0.4)',
                  zIndex: 1100,
                }}
              />
              
              {/* Sidebar Drawer */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="mobile-menu-drawer"
              >
                <div className="mobile-menu-header">
                  <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
                    <BookOpen size={24} color="var(--color-primary)" />
                    <span className="logo-text" style={{ fontSize: '20px' }}>BoiPara Nexus</span>
                  </Link>
                  <button onClick={() => setIsMenuOpen(false)} className="close-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                </div>

                <div className="mobile-links" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                  {!user && (
                    <button 
                      className="sign-in-btn" 
                      style={{ marginTop: '20px', width: '100%' }}
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </motion.div>
            </>
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

