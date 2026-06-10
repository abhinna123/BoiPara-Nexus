import { useState, useEffect } from 'react';
import { BookOpen, User, Tag, Phone, Send, Camera, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const AddaPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    price: '',
    contact: '',
    image: null,
    imageFile: null
  });

  const [editingId, setEditingId] = useState(null);

  // Real-time sync with Firestore
  useEffect(() => {
    const q = query(collection(db, 'adda_listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isUserAdded: true // In Firestore context, all are user-added
      }));
      setBooks(listings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching listings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for Storage
        alert('Image size should be less than 2MB');
        return;
      }
      
      // Store the file object for uploading on submit
      setFormData(prev => ({ 
        ...prev, 
        imageFile: file,
        image: URL.createObjectURL(file) // For local preview
      }));
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `adda_images/${user.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to post a listing');
      return;
    }

    if (formData.name && formData.author && formData.price && formData.contact) {
      setIsUploading(true);
      try {
        let imageUrl = formData.image;
        
        // Upload new image if a new file was selected
        if (formData.imageFile) {
          imageUrl = await uploadImage(formData.imageFile);
        }

        const listingData = {
          name: formData.name,
          author: formData.author,
          price: formData.price,
          contact: formData.contact,
          image: imageUrl,
          userId: user.uid,
          userName: user.displayName || 'Student',
          userEmail: user.email,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          // Update existing listing - exclude user info to prevent changes
          const { userId, userName, userEmail, ...updateData } = listingData;
          const docRef = doc(db, 'adda_listings', editingId);
          await updateDoc(docRef, updateData);
          setEditingId(null);
        } else {
          // Create new listing
          await addDoc(collection(db, 'adda_listings'), {
            ...listingData,
            createdAt: serverTimestamp()
          });
        }
        
        setFormData({ name: '', author: '', price: '', contact: '', image: null, imageFile: null });
        const fileInput = document.getElementById('book-image-upload');
        if (fileInput) fileInput.value = '';
      } catch (error) {
        console.error("Error saving listing:", error);
        alert("Failed to save listing. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEdit = (book) => {
    if (book.userId !== user?.uid) return;
    setFormData({
      name: book.name,
      author: book.author,
      price: book.price,
      contact: book.contact,
      image: book.image,
      imageFile: null
    });
    setEditingId(book.id);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const book = books.find(b => b.id === id);
    if (!book || book.userId !== user?.uid) return;
    
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, 'adda_listings', id));
        if (editingId === id) {
          setEditingId(null);
          setFormData({ name: '', author: '', price: '', contact: '', image: null, imageFile: null });
        }
      } catch (error) {
        console.error("Error deleting listing:", error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', author: '', price: '', contact: '', image: null, imageFile: null });
    const fileInput = document.getElementById('book-image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="adda-wrapper" style={styles.wrapper}>
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
          style={{
            ...styles.formCard,
            opacity: !user ? 0.7 : 1,
            pointerEvents: isUploading ? 'none' : 'auto'
          }}
        >
          {!user && (
            <div style={styles.loginNotice}>
              Please login to post or manage your listings.
            </div>
          )}
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
                  disabled={!user}
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
                  disabled={!user}
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
                  disabled={!user}
                />
              </div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div className="search-bar-glow adda-input-wrapper" style={styles.inputWrapper}>
                  <Phone size={18} style={styles.inputIcon} />
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Contact Number"
                    value={formData.contact}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    maxLength={10}
                    disabled={!user}
                  />
                </div>
                {formData.contact && formData.contact.length !== 10 && (
                  <p style={{ color: '#8C3A3A', fontSize: '0.8rem', marginTop: '4px', marginLeft: '4px' }}>
                    Phone number must contain exactly 10 digits
                  </p>
                )}
              </div>
            </div>
            
            {/* Image Upload Field */}
            <div className="adda-input-group" style={styles.uploadGroup}>
              <label 
                htmlFor="book-image-upload" 
                className="search-bar-glow adda-input-wrapper" 
                style={{
                  ...styles.uploadLabel,
                  cursor: !user ? 'not-allowed' : 'pointer'
                }}
              >
                <Camera size={20} style={styles.inputIcon} />
                <span>{formData.image ? 'Image Selected' : 'Upload Book Photo (Optional)'}</span>
                <input
                  id="book-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={!user}
                />
              </label>
              {formData.image && (
                <div style={styles.previewContainer}>
                  <img src={formData.image} alt="Preview" style={styles.imagePreview} />
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button 
                type="submit" 
                className="hover-lift adda-submit-btn" 
                style={{
                  ...styles.submitButton,
                  opacity: (formData.contact.length !== 10 || !user || isUploading) ? 0.6 : 1,
                  cursor: (formData.contact.length !== 10 || !user || isUploading) ? 'not-allowed' : 'pointer'
                }}
                disabled={formData.contact.length !== 10 || !user || isUploading}
              >
                {isUploading ? 'Uploading...' : (editingId ? 'Update Listing' : 'Post to Adda')} 
                {!isUploading && (editingId ? <Edit2 size={18} /> : <Send size={18} />)}
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading listings...</div>
          ) : (
            <motion.div layout className="adda-grid" style={styles.grid}>
              <AnimatePresence mode="popLayout">
                {books.map((book) => {
                  const isOwner = user && book.userId === user.uid;
                  
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
                        <p style={styles.sellerInfo}>Listed by: {book.userName}</p>
                      </div>
                      <div style={styles.cardFooter}>
                        <button style={styles.contactButton} onClick={() => window.location.href = `tel:${book.contact}`}>
                          Contact Seller
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
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
    position: 'relative',
  },
  loginNotice: {
    position: 'absolute',
    top: '20px',
    right: '40px',
    fontSize: '0.9rem',
    color: 'var(--color-primary)',
    fontWeight: '500',
    fontStyle: 'italic',
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
  sellerInfo: {
    fontSize: '0.85rem',
    color: 'var(--color-text-ink)',
    opacity: 0.6,
    marginTop: '4px',
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
