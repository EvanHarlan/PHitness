// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

// 1. Define the AuthProvider component first
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Configure axios with the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token validity by fetching user data
          const res = await axios.get('/api/auth/user');
          
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          // Token is invalid or expired
          console.error("Error verifying token:", err.message);
          localStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);
  
  // Login function
  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. Define the propTypes after the component definition
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext