import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo user credentials
  const DEMO_USER = {
    email: 'demo@mealmatch.com',
    password: '123456'
  };

  // Admin credentials
  const ADMIN_USER = {
    email: 'admin@mealmatch.com',
    password: 'admin123'
  };

  useEffect(() => {
    // Check if user is logged in (check session/token)
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('mealmatch_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Verify user still exists in database (except for demo/admin users)
          if (userData.id === 'demo-user-id' || userData.id === 'admin-user-id') {
            setUser(userData);
          } else {
            // Verify with backend for real users
            await verifyUserSession(userData);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('mealmatch_user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const verifyUserSession = async (userData) => {
    try {
      const response = await authService.getProfile(userData.id);
      if (response.data.user) {
        setUser(userData);
      } else {
        // User no longer exists, clear localStorage
        localStorage.removeItem('mealmatch_user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying user session:', error);
      localStorage.removeItem('mealmatch_user');
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      // Check for admin user
      if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        const adminUser = {
          id: 'admin-user-id',
          email: ADMIN_USER.email,
          name: 'Admin User',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('mealmatch_user', JSON.stringify(adminUser));
        return adminUser;
      }

      // Check for demo user
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const demoUser = {
          id: 'demo-user-id',
          email: DEMO_USER.email,
          name: 'Demo User',
          role: 'user',
          city: 'Mumbai' // Demo user always uses Mumbai for weather-based pricing
        };
        setUser(demoUser);
        localStorage.setItem('mealmatch_user', JSON.stringify(demoUser));
        return demoUser;
      }

      // For real users, make API call to authenticate
      const response = await authService.login(email, password);
      const userData = response.data.user;
      
      setUser(userData);
      localStorage.setItem('mealmatch_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      // Make API call to register user
      const response = await authService.register(userData);
      const newUser = response.data.user;
      
      setUser(newUser);
      localStorage.setItem('mealmatch_user', JSON.stringify(newUser));
      return { user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mealmatch_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
