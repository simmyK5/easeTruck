import React, { createContext, useReducer,useContext } from 'react';

// Initial state
const initialState = {
  user: null,
  isLoading: false,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Context provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};


