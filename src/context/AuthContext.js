import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

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
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on app load
    console.log('[Auth] App loaded, checking for stored session...');
    const storedSessionId = localStorage.getItem('sessionId');
    console.log('[Auth] Stored session ID:', storedSessionId);
    
    if (storedSessionId) {
      console.log('[Auth] Found stored session, validating...');
      validateSession(storedSessionId);
    } else {
      console.log('[Auth] No stored session found');
      setLoading(false);
    }
  }, []);

  const validateSession = async (sessionIdToValidate) => {
    try {
      console.log('[Auth] Validating session:', sessionIdToValidate);
      const result = await apiService.validateSession(sessionIdToValidate);
      console.log('[Auth] Session validation result:', result);
      
      if (result.success && result.valid) {
        console.log('[Auth] Session is valid, setting authenticated state');
        setUser(result.user);
        setSessionId(sessionIdToValidate);
        setIsAuthenticated(true);
        localStorage.setItem('sessionId', sessionIdToValidate);
      } else {
        console.log('[Auth] Session is invalid, clearing session:', result.error);
        // Session is invalid, clear stored session
        localStorage.removeItem('sessionId');
        setUser(null);
        setSessionId(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[Auth] Session validation error:', error);
      localStorage.removeItem('sessionId');
      setUser(null);
      setSessionId(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const result = await apiService.login(username, password);
      if (result.success) {
        setUser(result.user);
        setSessionId(result.session_id);
        setIsAuthenticated(true);
        localStorage.setItem('sessionId', result.session_id);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (username, password, email, fullName) => {
    try {
      const result = await apiService.signup(username, password, email, fullName);
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await apiService.logout(sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API success
      setUser(null);
      setSessionId(null);
      setIsAuthenticated(false);
      localStorage.removeItem('sessionId');
    }
  };

  const value = {
    user,
    sessionId,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    validateSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

