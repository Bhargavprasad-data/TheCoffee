import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const login = (authResponse) => {
    // authResponse should include token and user fields
    const { token: authToken, ...userData } = authResponse;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
    setSnackbar({ open: true, message: 'Logged in successfully', severity: 'success' });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setSnackbar({ open: true, message: 'Logged out', severity: 'success' });
  };

  // No need for an async hydration effect; we lazily init from localStorage above

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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