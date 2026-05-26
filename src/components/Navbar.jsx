import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Zone Map', path: '/map' },
    { name: 'Book Finder', path: '/finder' },
    { name: 'Student Adda', path: '/adda' },
    { name: 'Heritage Stories', path: '/stories' },
  ];

  return (
    <>
      <nav style={styles.nav}>
        <div className="container" style={styles.container}>
          <Link to="/" style={styles.logo}>
            <BookOpen size={28} color="var(--color-primary)" />
            <span style={styles.logoText}>BoiPara Nexus</span>
          </Link>
          <div style={styles.links}>
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
                    <button onClick={logout} style={styles.logoutBtn}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="premium-card hover-lift" 
                style={styles.button}
                onClick={() => setIsModalOpen(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
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
    background: 'rgba(248, 244, 230, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(44, 36, 27, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '16px 0',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  link: {
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  authWrapper: {
    position: 'relative',
  },
  button: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-primary)',
    border: '1px solid rgba(140, 58, 58, 0.3)',
    borderRadius: 'var(--radius-pill)',
    background: '#fff',
    cursor: 'pointer',
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
    '&:hover': {
      background: 'rgba(140, 58, 58, 0.05)',
    }
  }
};

export default Navbar;

