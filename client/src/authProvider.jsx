import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Create context
const AuthContext = createContext();

// Custom hook to access context
export const useAuthContext = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const { isAuthenticated, user, loginWithRedirect, logout, getIdTokenClaims, isLoading } = useAuth0();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    if (!isLoading) {  // Wait until Auth0 has finished loading
      if (isAuthenticated) {
        setAuthState({
          isAuthenticated: true,
          user: user,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <AuthContext.Provider value={{ authState, loginWithRedirect, logout, getIdTokenClaims }}>
      {children}
    </AuthContext.Provider>
  );
};
