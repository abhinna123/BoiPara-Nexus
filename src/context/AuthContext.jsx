import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync user data to Firestore
  const syncUserToFirestore = async (firebaseUser) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user record
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      
      // Initialize empty wishlist
      await setDoc(doc(db, 'wishlists', firebaseUser.uid), {
        items: []
      });
    } else {
      // Update last login
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  useEffect(() => {
    let unsubscribeWishlist = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncUserToFirestore(currentUser);
        
        // Listen to wishlist changes
        const wishlistRef = doc(db, 'wishlists', currentUser.uid);
        unsubscribeWishlist = onSnapshot(wishlistRef, (doc) => {
          if (doc.exists()) {
            setWishlist(doc.data().items || []);
          } else {
            setWishlist([]);
          }
        });
      } else {
        setWishlist([]);
        unsubscribeWishlist();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeWishlist();
    };
  }, []);

  const googleSignIn = async () => {
    console.log('GOOGLE_SIGNIN_STARTED');
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('GOOGLE_SIGNIN_SUCCESS');
    } catch (error) {
      console.log('GOOGLE_SIGNIN_FAILED', {
        code: error.code,
        message: error.message
      });
      console.error("GOOGLE_LOGIN_FULL_ERROR", {
        code: error.code,
        message: error.message,
        full: error
      });
      throw error;
    }
  };

  const emailSignUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await syncUserToFirestore(userCredential.user);
    } catch (error) {
      console.error("Email Sign-Up Error:", error);
      throw error;
    }
  };

  const emailLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const toggleWishlist = async (bookId) => {
    if (!user) return;

    const wishlistRef = doc(db, 'wishlists', user.uid);
    const isSaved = wishlist.includes(bookId);

    try {
      // Ensure the document exists before updating
      const docSnap = await getDoc(wishlistRef);
      if (!docSnap.exists()) {
        await setDoc(wishlistRef, { items: [bookId] });
      } else {
        await updateDoc(wishlistRef, {
          items: isSaved ? arrayRemove(bookId) : arrayUnion(bookId)
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const value = {
    user,
    wishlist,
    loading,
    googleSignIn,
    emailSignUp,
    emailLogin,
    logout,
    toggleWishlist
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          height: '100vh', 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--color-bg-paper)',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-heading)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>BoiPara Nexus</h2>
            <p style={{ opacity: 0.6 }}>Loading heritage data...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
