import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  
  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
