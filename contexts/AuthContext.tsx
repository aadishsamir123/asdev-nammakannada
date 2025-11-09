import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../config/firebase';
import { User } from '../types';

// Storage key for persisting auth state
const AUTH_USER_KEY = '@namma_kannada_auth_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  // Keep ref in sync with user state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Load persisted user data on mount
  useEffect(() => {
    loadPersistedUser();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated with Firebase, load their data
        await loadUserData(firebaseUser);
      } else {
        // No Firebase user - only clear if we had a user before (indicates logout)
        // Don't clear AsyncStorage on initial load if Firebase auth fails
        if (userRef.current) {
          setUser(null);
          await AsyncStorage.removeItem(AUTH_USER_KEY);
        }
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadPersistedUser = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading persisted user:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const updatedUser = {
          ...userData,
          createdAt: userData.createdAt,
          lastLogin: new Date(),
        };
        setUser(updatedUser);
        
        // Persist user data to AsyncStorage
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
        
        // Update last login
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: new Date(),
        }, { merge: true });
      } else {
        // Create new user document (for Google Sign-In first time users)
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Initialize user progress for new Google users
        await setDoc(doc(db, 'userProgress', firebaseUser.uid), {
          userId: firebaseUser.uid,
          currentLessonId: '',
          completedLessonIds: [],
          xp: 0,
          streak: 0,
          lastActivityDate: new Date(),
          lessonProgress: {},
        });
        
        setUser(newUser);
        // Persist user data to AsyncStorage
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      // Initialize user progress
      await setDoc(doc(db, 'userProgress', userCredential.user.uid), {
        userId: userCredential.user.uid,
        currentLessonId: '',
        completedLessonIds: [],
        xp: 0,
        streak: 0,
        lastActivityDate: new Date(),
        lessonProgress: {},
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri();
      const clientId = '509985955615-8cnjsvoe3sdtph37nv3g2oabpgcnm14c.apps.googleusercontent.com';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=id_token&` +
        `scope=openid%20profile%20email&` +
        `nonce=${Math.random().toString(36)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success') {
        const url = result.url;
        const idToken = url.match(/id_token=([^&]+)/)?.[1];
        
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        } else {
          throw new Error('No ID token found');
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Clear persisted user data from AsyncStorage
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
