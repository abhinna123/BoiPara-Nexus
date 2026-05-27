import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Globe, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { googleSignIn, emailLogin, emailSignUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName) throw new Error("Please enter your name");
        await emailSignUp(email, password, displayName);
      } else {
        await emailLogin(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await googleSignIn();
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.modalOverlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="premium-card wobbly-border modal-content"
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} style={styles.closeButton}>
              <X size={20} color="var(--color-text-ink)" />
            </button>

            <div style={styles.content}>
              <div style={styles.header}>
                <h2 className="modal-title" style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                <p style={styles.subtitle}>
                  {isSignUp 
                    ? 'Join the BoiPara community to preserve academic heritage.' 
                    : 'Access your heritage findings and community connections.'}
                </p>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <form onSubmit={handleAuth} style={styles.form}>
                {isSignUp && (
                  <div className="search-bar-glow" style={styles.inputWrapper}>
                    <UserIcon size={18} style={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      style={styles.input}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="search-bar-glow" style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="search-bar-glow" style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    placeholder="Password"
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="hover-lift" style={styles.submitButton} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
              </form>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or</span>
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  onClick={handleGoogleSignIn}
                  className="hover-lift" 
                  style={{ ...styles.authButton, borderColor: '#4285F420' }}
                >
                  <Globe size={20} color="#4285F4" />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div style={styles.footer}>
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={styles.toggleLink}
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
                <p style={styles.disclaimer}>
                  By continuing, you agree to our heritage preservation standards and community guidelines.
                </p>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(4px)',
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    overflowY: 'auto',
    margin: 0,
    transform: 'none',
    background: '#FFFDF9',
    padding: '48px 32px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
    boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
    pointerEvents: 'auto',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    opacity: 0.6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  content: {
    textAlign: 'center',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '2rem',
    color: 'var(--color-text-ink)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    opacity: 0.7,
    lineHeight: '1.4',
  },
  error: {
    backgroundColor: 'rgba(140, 58, 58, 0.1)',
    color: 'var(--color-primary)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    border: '1px solid rgba(140, 58, 58, 0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px',
    background: '#fff',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(44, 36, 27, 0.1)',
    height: '50px',
  },
  inputIcon: {
    opacity: 0.4,
    color: 'var(--color-text-ink)',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.95rem',
    background: 'transparent',
    color: 'var(--color-text-ink)',
  },
  submitButton: {
    marginTop: '8px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    height: '50px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(140, 58, 58, 0.2)',
    border: 'none',
    cursor: 'pointer',
  },
  divider: {
    margin: '24px 0',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerText: {
    background: '#FFFDF9',
    padding: '0 12px',
    fontSize: '0.85rem',
    color: 'var(--color-text-ink)',
    opacity: 0.4,
    zIndex: 1,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  authButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    background: '#fff',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--color-text-ink)',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(44, 36, 27, 0.05)',
    cursor: 'pointer',
  },
  footer: {
    borderTop: '1px dashed rgba(44, 36, 27, 0.1)',
    paddingTop: '20px',
  },
  toggleLink: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    display: 'block',
    width: '100%',
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: 'var(--color-text-ink)',
    opacity: 0.5,
    lineHeight: '1.4',
  }
};

export default LoginModal;
