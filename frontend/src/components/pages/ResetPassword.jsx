import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Box, Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();

  const token = query.get('token');
  const email = query.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      await authAPI.resetPassword(token, password, email);
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      setError('Failed to reset password');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', display: 'flex', alignItems: 'center' }} className="coffee-bean-bg">
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'var(--text-dark)' }}>Reset Password</Typography>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="New Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Confirm Password" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} sx={{ mb: 2 }} />
            <Button type="submit" variant="contained">Reset Password</Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPassword;




