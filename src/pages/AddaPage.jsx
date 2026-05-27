import { useState, useEffect } from 'react';
import { BookOpen, User, Tag, Phone, Send, Camera, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ADDA_STORAGE_KEY = 'boipara_adda_books';

// Initial default books to show if storage is empty
const defaultBooks = [
  { id: 1, name: 'Introduction to Algorithms', author: 'CLRS', price: '₹450', contact: '9876543210', image: null, isUserAdded: false, userId: 'system' },
  { id: 2, name: 'The God of Small Things', author: 'Arundhati Roy', price: '₹200', contact: '8765432109', image: null, isUserAdded: false, userId: 'system' },
  { id: 3, name: 'A Brief History of Time', author: 'Stephen Hawking', price: '₹300', contact: '7654321098', image: null, isUserAdded: false, userId: 'system' },
];

const AddaPage = () => {
  const { user } = useAuth();
  // Initialize state from localStorage or defaults
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem(ADDA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all books have the correct isUserAdded flag
      // Default books should always be false, others should be true
      const defaultIds = defaultBooks.map(b => b.id);
      return parsed.map(book => ({
        ...book,
        isUserAdded: defaultIds.includes(book.id) ? false : true
      }));
    }
    return defaultBooks;
  });

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    price: '',
    contact: '',
    image: null
  });

  const [editingId, setEditingId] = useState(null);

  // Sync with localStorage whenever books state changes
  useEffect(() => {
    localStorage.setItem(ADDA_STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage safety
        alert('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.author && formData.price && formData.contact) {
      if (editingId) {
        // Update existing listing
        setBooks(prev => prev.map(book => 
          book.id === editingId ? { ...formData, id: editingId, isUserAdded: true, userId: book.userId } : book
        ));
        setEditingId(null);
      } else {
        // Prevent duplicate entries (case-insensitive check for name and author)
        const isDuplicate = books.some(book => 
          book.name.toLowerCase() === formData.name.toLowerCase() && 
          book.author.toLowerCase() === formData.author.toLowerCase()
        );

        if (isDuplicate) {
          alert('This book listing already exists!');
          return;
        }

        const newBook = {
          id: Date.now(),
          ...formData,
          isUserAdded: true,
          userId: user?.uid || 'anonymous'
        };
        setBooks([newBook, ...books]);
      }
      
      setFormData({ name: '', author: '', price: '', contact: '', image: null });
      // Reset file input manually
      const fileInput = document.getElementById('book-image-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleEdit = (book) => {
    if (!book.isUserAdded || (book.userId !== user?.uid && book.userId !== 'anonymous')) return;
    setFormData({
      name: book.name,
      author: book.author,
      price: book.price,
      contact: book.contact,
      image: book.image
    });
    setEditingId(book.id);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const book = books.find(b => b.id === id);
    if (!book || !book.isUserAdded || (book.userId !== user?.uid && book.userId !== 'anonymous')) return;
    
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setBooks(prev => prev.filter(book => book.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({ name: '', author: '', price: '', contact: '', image: null });
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', author: '', price: '', contact: '', image: null });
    const fileInput = document.getElementById('book-image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.wrapper}>
      {/* Background Decoration */}
      <img src="/tram.png" alt="Kolkata Tram" style={styles.bgTram} />

      <div className="container" style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.header}
        >
          <div style={styles.badgeWrapper}>
            <span className="badge">🤝 Peer-to-Peer</span>
          </div>
          <h1 className="adda-title" style={styles.title}>Student Adda</h1>
          <p style={styles.subtitle}>Exchange, sell, or find academic books directly from fellow students.</p>
        </motion.div>

        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="premium-card adda-form-card" 
          style={styles.formCard}
        >
          <h2 style={styles.formTitle}>{editingId ? 'Edit Listing' : 'List a Book'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="adda-input-group" style={styles.inputGroup}>
              <div className="search-bar-glow adda-input-wrapper" style={styles.inputWrapper}>
                <BookOpen size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Book Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div className="search-bar-glow adda-input-wrapper" style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  name="author"
                  placeholder="Author"
                  value={formData.author}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            <div className="adda-input-group" style={styles.inputGroup}>
              <div className="search-bar-glow adda-input-wrapper" style={styles.inputWrapper}>
                <Tag size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  name="price"
                  placeholder="Price (e.g. ₹200)"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div className="search-bar-glow adda-input-wrapper" style={styles.inputWrapper}>
                <Phone size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact Number"
                  value={formData.contact}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            
            {/* Image Upload Field */}
            <div className="adda-input-group" style={styles.uploadGroup}>
              <label htmlFor="book-image-upload" className="search-bar-glow adda-input-wrapper" style={styles.uploadLabel}>
                <Camera size={20} style={styles.inputIcon} />
                <span>{formData.image ? 'Image Selected' : 'Upload Book Photo (Optional)'}</span>
                <input
                  id="book-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              {formData.image && (
                <div style={styles.previewContainer}>
                  <img src={formData.image} alt="Preview" style={styles.imagePreview} />
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button type="submit" className="hover-lift adda-submit-btn" style={styles.submitButton}>
                {editingId ? 'Update Listing' : 'Post to Adda'} {editingId ? <Edit2 size={18} /> : <Send size={18} />}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="hover-lift" style={styles.cancelButton}>
                  Cancel <X size={18} />
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Book List Section */}
        <div style={styles.listSection}>
          <h2 style={styles.listTitle}>Recent Listings</h2>
          <motion.div layout className="adda-grid" style={styles.grid}>
            <AnimatePresence mode="popLayout">
              {books.map((book) => {
                const isOwner = book.isUserAdded && (book.userId === user?.uid || (book.userId === 'anonymous' && !user));
                
                return (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="premium-card hover-lift"
                    style={styles.bookCard}
                  >
                    {book.image && (
                      <div style={styles.cardImageContainer}>
                        <img src={book.image} alt={book.name} style={styles.cardImage} />
                      </div>
                    )}
                    <div style={styles.cardHeader}>
                      <h3 style={styles.bookName}>{book.name}</h3>
                      {isOwner && (
                        <div style={styles.cardActions}>
                          <button onClick={() => handleEdit(book)} title="Edit Listing" style={styles.actionIcon}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(book.id)} title="Delete Listing" style={{ ...styles.actionIcon, color: '#8C3A3A' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={styles.cardBody}>
                      <p style={styles.authorName}>by {book.author}</p>
                      <div style={styles.cardMeta}>
                        <span style={styles.priceTag}>{book.price}</span>
                        <div style={styles.contactInfo}>
                          <Phone size={14} />
                          <span>{book.contact}</span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.cardFooter}>
                      <button style={styles.contactButton}>
                        Contact Seller
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    paddingTop: '80px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgTram: {
    position: 'absolute',
    top: '10%',
    left: '-5%',
    width: '500px',
    opacity: 0.1,
    pointerEvents: 'none',
    zIndex: -1,
    transform: 'rotate(-5deg)',
  },
  container: {
    paddingBottom: '100px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '40px',
  },
  badgeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '4rem',
    color: 'var(--color-primary)',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    maxWidth: '600px',
    margin: '0 auto',
  },
  formCard: {
    maxWidth: '800px',
    margin: '0 auto 80px',
    padding: '40px',
    border: '1px solid rgba(140, 58, 58, 0.1)',
  },
  formTitle: {
    fontSize: '1.8rem',
    marginBottom: '24px',
    textAlign: 'center',
    color: 'var(--color-text-ink)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  uploadGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  uploadLabel: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: '#fff',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(44, 36, 27, 0.1)',
    cursor: 'pointer',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
    transition: 'all 0.3s ease',
  },
  previewContainer: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid rgba(44, 36, 27, 0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  inputWrapper: {
    flex: 1,
    minWidth: '280px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(44, 36, 27, 0.1)',
    padding: '0 16px',
    transition: 'all 0.3s ease',
  },
  inputIcon: {
    color: 'var(--color-primary)',
    opacity: 0.6,
    marginRight: '12px',
  },
  input: {
    flex: 1,
    padding: '14px 0',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    background: 'transparent',
    color: 'var(--color-text-ink)',
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  submitButton: {
    flex: 2,
    minWidth: '200px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '1.1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(140, 58, 58, 0.2)',
    transition: 'transform 0.2s, background 0.2s',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    minWidth: '150px',
    backgroundColor: 'transparent',
    color: 'var(--color-text-ink)',
    padding: '16px 32px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid rgba(44, 36, 27, 0.2)',
    fontSize: '1.1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  listSection: {
    marginTop: '40px',
  },
  listTitle: {
    fontSize: '2.2rem',
    marginBottom: '32px',
    color: 'var(--color-text-ink)',
    borderBottom: '2px solid var(--color-primary)',
    display: 'inline-block',
    paddingBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    alignItems: 'stretch',
  },
  bookCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#fff',
    border: '1px solid rgba(44, 36, 27, 0.05)',
    overflow: 'hidden',
    height: '100%',
  },
  cardImageContainer: {
    width: 'calc(100% + 48px)',
    margin: '-24px -24px 0 -24px',
    height: '220px',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(44, 36, 27, 0.05)',
    position: 'relative',
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.5s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    paddingTop: '4px',
  },
  bookName: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: 'var(--color-text-ink)',
    margin: 0,
    lineHeight: '1.3',
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionIcon: {
    padding: '6px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(44, 36, 27, 0.03)',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  priceTag: {
    backgroundColor: 'rgba(140, 58, 58, 0.1)',
    color: 'var(--color-primary)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.9rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  authorName: {
    fontSize: '1rem',
    color: 'var(--color-text-ink)',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  contactInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'var(--color-text-ink)',
    opacity: 0.8,
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid rgba(44, 36, 27, 0.05)',
  },
  contactButton: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-primary)',
    color: 'var(--color-primary)',
    fontWeight: '600',
    transition: 'all 0.3s',
    cursor: 'pointer',
    background: 'transparent',
  }
};

export default AddaPage;
