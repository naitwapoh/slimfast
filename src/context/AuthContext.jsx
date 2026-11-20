import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

// Fixed Master Admin Credentials requested by business owner:
// Name/Username: admin
// Password: slimfast2026
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'slimfast2026';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('slimfast_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('slimfast_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync admin record into Firestore if db available
  useEffect(() => {
    if (db) {
      try {
        setDoc(doc(db, 'users', 'master-admin'), {
          uid: 'master-admin',
          name: 'admin',
          email: 'admin@slimfast.co.tz',
          role: 'owner',
          isActive: true,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch (e) {}
    }
  }, []);

  // Login handler supporting Master Admin & Worker accounts provisioned by Admin
  const login = async (identifier, password) => {
    setLoading(true);
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check Master Admin Credentials
    if (
      (cleanId === ADMIN_USERNAME || cleanId === 'admin@slimfast.co.tz' || cleanId === 'admin@slimfast.com') &&
      cleanPass === ADMIN_PASSWORD
    ) {
      const adminSession = {
        uid: 'master-admin',
        name: 'admin',
        email: 'admin@slimfast.co.tz',
        role: 'owner',
        isActive: true,
        loginAt: new Date().toISOString()
      };
      setCurrentUser(adminSession);
      setUserProfile(adminSession);
      localStorage.setItem('slimfast_auth_session', JSON.stringify(adminSession));
      setLoading(false);
      return adminSession;
    }

    // 2. Check Worker Accounts registered by the Admin in Firestore
    if (db) {
      try {
        const usersRef = collection(db, 'users');
        const snap = await getDocs(usersRef);
        let foundWorker = null;

        snap.forEach(d => {
          const data = d.data();
          const emailMatch = data.email && data.email.toLowerCase() === cleanId;
          const nameMatch = data.name && data.name.toLowerCase() === cleanId;
          const passMatch = data.password === cleanPass || data.tempPassword === cleanPass;

          if ((emailMatch || nameMatch) && passMatch) {
            foundWorker = { id: d.id, ...data };
          }
        });

        if (foundWorker) {
          if (foundWorker.isActive === false) {
            setLoading(false);
            throw new Error('Your staff account has been deactivated by the admin.');
          }

          const workerSession = {
            uid: foundWorker.id,
            name: foundWorker.name || cleanId,
            email: foundWorker.email || `${cleanId}@slimfast.co.tz`,
            role: foundWorker.role || 'worker',
            isActive: true,
            loginAt: new Date().toISOString()
          };

          setCurrentUser(workerSession);
          setUserProfile(workerSession);
          localStorage.setItem('slimfast_auth_session', JSON.stringify(workerSession));
          setLoading(false);
          return workerSession;
        }
      } catch (err) {
        if (err.message && err.message.includes('deactivated')) throw err;
        console.warn('Worker lookup error:', err);
      }
    }

    setLoading(false);
    throw new Error('Invalid credentials. Only the admin can register staff accounts and assign passwords.');
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('slimfast_auth_session');
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
      login,
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
