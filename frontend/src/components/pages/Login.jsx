import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  LocalCafe as LocalCafeIcon
} from '@mui/icons-material';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      login(data);
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      if (data?.isAdmin && (next === '/admin' || next?.startsWith('/admin'))) {
        navigate(next);
      } else if (next) {
        navigate(next);
      } else {
        navigate(data?.isAdmin ? '/admin' : '/');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid email or password';
      setError(message);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="coffee-bean-bg"
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Paper
            elevation={3}
            className="form-coffee"
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Coffee Bean Decorations */}
            <Box sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: '40px',
              height: '25px',
              background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '25px',
                height: '15px',
                background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
              }
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocalCafeIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  color: 'var(--text-dark)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                className="heading-primary"
              >
                Welcome Back
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%', marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                className="input-coffee"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'var(--primary-green)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-muted)',
                    '&.Mui-focused': {
                      color: 'var(--primary-green)',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="input-coffee"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'var(--primary-green)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'var(--primary-green)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-green)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-muted)',
                    '&.Mui-focused': {
                      color: 'var(--primary-green)',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="btn-primary"
                sx={{
                  mt: 3,
                  mb: 2,
                  height: '48px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Sign In
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ 
                    color: 'var(--primary-green)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      color: 'var(--primary-green)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;