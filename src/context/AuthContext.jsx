import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  limit, 
  query 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if any users exist in Firestore
  const checkFirstTimeSetup = async () => {
    if (!db) {
      setIsFirstTimeSetup(true);
      return true;
    }
    try {
      const q = query(collection(db, 'users'), limit(1));
      const snap = await getDocs(q);
      const isEmpty = snap.empty;
      setIsFirstTimeSetup(isEmpty);
      return isEmpty;
    } catch (err) {
      console.warn('First-time check notice:', err.message);
      // If collection read failed, assume first time or allow registration
      setIsFirstTimeSetup(false);
      return false;
    }
  };

  useEffect(() => {
    checkFirstTimeSetup();
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && db) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            // Check if this is the first user claiming owner
            setUserProfile({
              uid: user.uid,
              email: user.email,
              role: 'owner',
              isActive: true,
              name: user.displayName || user.email.split('@')[0],
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login handler
  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth is not initialized. Please verify your .env file.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if account is active
    if (db) {
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isActive === false) {
          await signOut(auth);
          throw new Error('Your account has been deactivated by management.');
        }
        setUserProfile(data);
      }
    }
    return userCredential;
  };

  // Register first business owner
  const registerFirstOwner = async (email, password, fullName = 'Business Owner') => {
    if (!auth || !db) throw new Error('Firebase is not configured yet.');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      name: fullName,
      role: 'owner',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
    setIsFirstTimeSetup(false);
    return cred;
  };

  // Logout handler
  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const isOwner = userProfile?.role === 'owner';
  const isWorker = userProfile?.role === 'worker' || isOwner;
  const isAccountActive = userProfile?.isActive !== false;

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      isOwner,
      isWorker,
      isAccountActive,
      isFirstTimeSetup,
      checkFirstTimeSetup,
      login,
      registerFirstOwner,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
