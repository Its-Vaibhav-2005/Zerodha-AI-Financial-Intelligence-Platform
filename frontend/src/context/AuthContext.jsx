import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwtToken, setJwtToken] = useState(() => localStorage.getItem('zerodha_jwt') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('zerodha_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem('zerodha_jwt', jwtToken);
    } else {
      localStorage.removeItem('zerodha_jwt');
    }
  }, [jwtToken]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('zerodha_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zerodha_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Login failed.');
      }
      setJwtToken(data.access_token);
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, name = '', riskProfile = 'Moderate') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, risk_profile: riskProfile }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Registration failed.');
      }
      setJwtToken(data.access_token);
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setJwtToken(null);
    setUser(null);
    localStorage.removeItem('zerodha_jwt');
    localStorage.removeItem('zerodha_user');
  };

  // Helper fetch function that automatically injects the Bearer JWT token
  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    };
    
    // Inject json content-type if body is object and not FormData
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        isAuthenticated: !!jwtToken,
        isLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
