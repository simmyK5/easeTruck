import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

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
    role: null,  // add role
    name: null   // optional: if you want name globally
  });
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await getIdTokenClaims();
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/user-role/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token.__raw}`,
          },
        });
      
  
        setAuthState({
          isAuthenticated: true,
          user: user,
          role: response.data.role
        });
      } catch (err) {
        console.error('Failed to fetch user role', err);
      }
    };
  
    if (!isLoading && isAuthenticated && user) {
      fetchUserRole();
    }
  }, [isAuthenticated, user, isLoading]);
  

  return (
    <AuthContext.Provider value={{ authState, loginWithRedirect, logout, getIdTokenClaims }}>
      {children}
    </AuthContext.Provider>
  );
};
