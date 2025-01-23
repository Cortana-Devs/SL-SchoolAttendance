import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserRole, loginWithEmail } from '../utils/firebase';

interface AuthContextType {
  currentUser: User | null;
  userRole: 'admin' | 'teacher' | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        // Restore role from localStorage if available
        const storedRole = localStorage.getItem('userRole');
        if (storedRole === 'admin' || storedRole === 'teacher') {
          setUserRole(storedRole);
        }
      } catch (error) {
        console.error('Error setting persistence:', error);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        try {
          console.log('Fetching role for user:', user.uid);
          const role = await getUserRole(user.uid);
          console.log('User role:', role);
          if (mounted) {
            setUserRole(role);
            if (role) {
              localStorage.setItem('userRole', role);
            }
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          if (mounted) {
            setUserRole(null);
            localStorage.removeItem('userRole');
          }
        }
      } else {
        if (mounted) {
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const userCred = await loginWithEmail(email, password);
      console.log('Logged in as:', email);
      const role = await getUserRole(userCred.user.uid);
      console.log('Role after login:', role);
      if (role) {
        localStorage.setItem('userRole', role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const role = await getUserRole(result.user.uid);
      if (role) {
        localStorage.setItem('userRole', role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      setUserRole(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    currentUser,
    userRole,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 