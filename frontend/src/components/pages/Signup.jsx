import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
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
  Person as PersonIcon,
  LocalCafe as LocalCafeIcon
} from '@mui/icons-material';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await authAPI.register({
        name: formData.name,
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
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed';
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
            {/* Coffee Bean Decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                backgroundImage: 'radial-gradient(circle, var(--coffee-brown) 2px, transparent 2px)',
                backgroundSize: '8px 8px',
                opacity: 0.3,
                zIndex: 0
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
              <LocalCafeIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 32 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  color: 'var(--text-dark)',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
                className="heading-primary"
              >
                Create Account
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: 'var(--text-muted)',
                textAlign: 'center',
                mb: 3,
                position: 'relative',
                zIndex: 1
              }}
            >
              Join The Coffee family and start your journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', marginBottom: 2, position: 'relative', zIndex: 1 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                className="input-coffee"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'var(--primary-green)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--text-muted)',
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--text-muted)',
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
                autoComplete="new-password"
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
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--text-muted)',
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
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'var(--primary-green)' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--text-muted)',
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
                  height: '48px',
                  mb: 3
                }}
              >
                Sign Up
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
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
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup;