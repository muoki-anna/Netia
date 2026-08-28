import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() =>
    pb.authStore.isValid ? pb.authStore.model : null
  );

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setCurrentUser(pb.authStore.isValid ? pb.authStore.model : null);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    await pb.collection('users').authWithPassword(email, password);
  };

  const signup = async (email, password, name) => {
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
    });
    await pb.collection('users').authWithPassword(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return context;
}
