import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Box, Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await authAPI.forgotPassword(email);
      setMessage('If the email exists, a reset link has been sent.');
    } catch (e) {
      setError('Failed to send reset link');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', display: 'flex', alignItems: 'center' }} className="coffee-bean-bg">
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'var(--text-dark)' }}>Forgot Password</Typography>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} sx={{ mb: 2 }} />
            <Button type="submit" variant="contained">Send Reset Link</Button>
          </form>
          <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate('/login')}>Back to Login</Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;




