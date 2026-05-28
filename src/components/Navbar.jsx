import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

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
      <nav style={styles.nav}>
        <div className="container nav-container" style={styles.container}>
          {/* Mobile Menu Toggle - Now on the left */}
          <button className="nav-menu-toggle" style={styles.menuToggle} onClick={toggleMenu}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <Link to="/" style={styles.logo} className="nav-logo">
            <BookOpen size={28} color="var(--color-primary)" />
            <span className="logo-text" style={styles.logoText}>BoiPara Nexus</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop-links" style={styles.links}>
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                style={{
                  ...styles.link, 
                  color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-ink)',
                  fontWeight: location.pathname === link.path ? '600' : '400'
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div style={styles.rightSection} className="nav-right-section">
            <div style={styles.authWrapper}>
              {user ? (
                <div style={styles.profileContainer}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={styles.profileButton}
                    className="hover-lift"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" style={styles.avatar} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        <UserIcon size={20} color="var(--color-primary)" />
                      </div>
                    )}
                  </button>

                  {isProfileOpen && (
                    <div className="premium-card wobbly-border" style={styles.dropdown}>
                      <div style={styles.dropdownHeader}>
                        <p style={styles.userName}>{user.displayName || 'Researcher'}</p>
                        <p style={styles.userEmail}>{user.email}</p>
                      </div>
                      <button onClick={logout} className="nav-logout-btn">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="premium-card hover-lift sign-in-btn" 
                  style={styles.button}
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
                style={styles.menuBackdrop}
              />
              
              {/* Sidebar Drawer */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="nav-mobile-menu" 
                style={styles.mobileMenu}
              >
                <div style={styles.mobileMenuHeader}>
                  <Link to="/" style={styles.logo} onClick={() => setIsMenuOpen(false)}>
                    <BookOpen size={24} color="var(--color-primary)" />
                    <span style={{...styles.logoText, fontSize: '20px'}}>BoiPara Nexus</span>
                  </Link>
                  <button onClick={() => setIsMenuOpen(false)} style={styles.closeMenuBtn}>
                    <X size={24} />
                  </button>
                </div>

                <div style={styles.mobileLinks}>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        ...styles.mobileLink, 
                        color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-ink)',
                        fontWeight: location.pathname === link.path ? '600' : '400'
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {!user && (
                    <button 
                      className="premium-card" 
                      style={{...styles.button, marginTop: '20px', width: '100%', textAlign: 'center'}}
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

const styles = {
  nav: {
    background: 'rgba(248, 244, 230, 0.95)',
    borderBottom: '1px solid rgba(44, 36, 27, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '80px',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-text-ink)',
    letterSpacing: '-0.5px'
  },
  links: {
    display: 'flex',
    gap: '36px',
    alignItems: 'center',
  },
  link: {
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  authWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    padding: '10px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    border: '1.5px solid rgba(140, 58, 58, 0.3)',
    borderRadius: 'var(--radius-pill)',
    background: '#fff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  },
  menuToggle: {
    display: 'none',
    color: 'var(--color-text-ink)',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
  },
  menuBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(44, 36, 27, 0.4)',
    zIndex: 1100,
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '300px',
    maxWidth: '85vw',
    background: '#FFFDF9',
    padding: '30px 24px',
    boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px dashed rgba(44, 36, 27, 0.1)',
  },
  closeMenuBtn: {
    color: 'var(--color-text-ink)',
    opacity: 0.6,
  },
  mobileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  mobileLink: {
    fontSize: '18px',
    fontFamily: 'var(--font-heading)',
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    padding: 0,
    border: '2px solid rgba(140, 58, 58, 0.2)',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '240px',
    background: '#FFFDF9',
    padding: '20px',
    zIndex: 110,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
    boxShadow: '0 10px 40px rgba(44, 36, 27, 0.15)',
  },
  dropdownHeader: {
    borderBottom: '1px dashed rgba(44, 36, 27, 0.1)',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--color-text-ink)',
    margin: 0,
  },
  userEmail: {
    fontSize: '0.8rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    margin: '4px 0 0 0',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    color: 'var(--color-primary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background 0.2s',
  }
};

export default Navbar;

