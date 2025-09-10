import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, InputAdornment } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Person as PersonIcon, AdminPanelSettings as AdminIcon, Key as KeyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function AdminSignup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (user?.isAdmin) navigate('/admin'); }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authAPI.adminRegister({ name: formData.name, email: formData.email, password: formData.password, adminCode: formData.adminCode });
      login(data);
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AdminIcon sx={{ mr: 1, color: 'var(--primary-green)' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-dark)' }}>Admin Sign Up</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ color: 'var(--primary-green)' }} /></InputAdornment>) }} />
            <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ color: 'var(--primary-green)' }} /></InputAdornment>) }} />
            <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: 'var(--primary-green)' }} /></InputAdornment>) }} />
            <TextField fullWidth label="Admin Invite Code" name="adminCode" value={formData.adminCode} onChange={handleChange} sx={{ mb: 3 }} InputProps={{ startAdornment: (<InputAdornment position="start"><KeyIcon sx={{ color: 'var(--primary-green)' }} /></InputAdornment>) }} helperText="Ask the owner for the invite code" />
            <Button type="submit" fullWidth variant="contained" className="btn-primary">Create Admin</Button>
            <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/admin/login')}>Already have an account? Login</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}


