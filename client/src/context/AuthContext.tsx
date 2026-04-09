import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  verificationEmailSent: boolean;
  setVerificationEmailSent: (sent: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  useEffect(() => {
    console.log("AuthProvider: Setting up onAuthStateChanged listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User logged in: ${user.email}` : "User logged out");
      setUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with email:", email);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error("Email or password is incorrect");
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting sign up with email:", email);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("User already exists. Please sign in");
      }
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out");
    return signOut(auth);
  };
  
  const signInWithGoogle = async () => {
    try {
      console.log("Attempting Google sign in with popup");
      await signInWithPopup(auth, googleProvider);
      console.log("Google sign in successful");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, signInWithGoogle, verificationEmailSent, setVerificationEmailSent }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
