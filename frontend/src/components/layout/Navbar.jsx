import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  LocalCafe as LocalCafeIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'var(--light-mint)',
  boxShadow: 'var(--shadow-light)',
  color: 'var(--text-dark)',
  width: '100vw',
  left: 0,
  right: 0,
  margin: 0,
  padding: 0,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: 'var(--text-dark)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  '&:hover': {
    backgroundColor: 'rgba(30, 57, 50, 0.08)',
    color: 'var(--text-dark)',
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '25px',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'var(--primary-green)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--primary-green)',
    },
  },
}));

const StyledSearchButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'var(--accent-yellow)',
  color: 'var(--text-dark)',
  '&:hover': {
    backgroundColor: 'var(--warm-yellow)',
  },
}));

// pages will be computed dynamically based on auth
const settings = ['Profile', 'Orders', 'Admin', 'Logout'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();

  const pages = useMemo(() => {
    if (user?.isAdmin) return ['HOME', 'ADMIN'];
    if (user) return ['HOME', 'SHOP'];
    return ['HOME', 'SHOP', 'LOGIN', 'SIGN UP'];
  }, [user]);

  const accountMenu = useMemo(() => {
    if (!user) return ['Login', 'Sign Up'];
    if (user.isAdmin) return ['Admin', 'Logout'];
    return ['Orders', 'Logout'];
  }, [user]);

  const [logoSrc, setLogoSrc] = useState('/image/gurus-araku-logo.png');
  const handleLogoError = () => {
    // try alternate path
    if (logoSrc !== '/images/gurus-araku-logo.png') setLogoSrc('/images/gurus-araku-logo.png');
  };

  const handleOpenNavMenu = (event) => {
    // Toggle sidebar for mobile/desktop instead of menu
    window.dispatchEvent(new Event('toggle-sidebar'));
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (page) => {
    handleCloseNavMenu();
    switch(page) {
      case 'HOME':
        navigate('/');
        break;
      case 'SHOP':
        navigate('/shop');
        break;
      case 'LOGIN':
        navigate('/login');
        break;
      case 'SIGN UP':
        navigate('/signup');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'PROFILE':
        navigate('/profile');
        break;
      case 'ORDERS':
        navigate('/orders');
        break;
      default:
        break;
    }
  };

  const handleUserMenuClick = (setting) => {
    handleCloseUserMenu();
    switch(setting) {
      case 'Profile':
        navigate('/profile');
        break;
      case 'Orders':
        navigate('/orders');
        break;
      case 'Admin':
        navigate('/admin');
        break;
      case 'Logout':
        logout();
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <StyledAppBar position="fixed" className="nav-coffee" sx={{ width: '100vw', maxWidth: '100vw' }}>
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: '64px', md: '80px' }, width: '100%' }}>
           {/* Sidebar toggle button and Logo/Name group */}
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleOpenNavMenu} sx={{ color: 'var(--text-dark)' }}>
              <MenuIcon />
            </IconButton>
            {/* Logo */}
            <Box
              component="img"
              src={logoSrc}
              alt="Guru's Araku Coffee Logo"
              onError={handleLogoError}
              sx={{ display: { xs: 'none', md: 'flex' }, height: 88, width: 88, borderRadius: '50%', backgroundColor: 'transparent' }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'var(--font-primary)',
                fontWeight: 700,
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.8rem',
                background: 'linear-gradient(90deg, #5a3e2b, #8B4513, #c79a69, #f5deb3)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'coffeeShift 6s ease-in-out infinite'
              }}
            >
              Guru's Coffee
            </Typography>
          </Box>
          {/* Desktop Navigation removed (moved to Sidebar). Keep space flexible. */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Search Bar */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <StyledSearchField
              size="small"
              placeholder="Search..."
              value={new URLSearchParams(location.search).get('q') || ''}
              onChange={(e) => {
                const q = e.target.value;
                const params = new URLSearchParams(location.search);
                if (q) params.set('q', q); else params.delete('q');
                navigate({ pathname: '/shop', search: params.toString() });
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StyledSearchButton size="small" onClick={() => navigate('/shop' + (new URLSearchParams(location.search).toString() ? ('?' + new URLSearchParams(location.search).toString()) : ''))}>
                      <SearchIcon />
                    </StyledSearchButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
          </Box>

          {/* Cart and User Menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Only show cart for logged-in users (not admins) */}
            {user && !user.isAdmin && (
              <IconButton
                size="large"
                aria-label="show cart items"
                sx={{ color: 'var(--text-dark)' }}
                onClick={() => navigate('/cart')}
              >
                <Badge badgeContent={getCartCount()} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: 'var(--accent-yellow)', color: 'var(--text-dark)' } }}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
              {/* Profile icon */}
            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ color: 'var(--text-dark)' }}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Box>
    </StyledAppBar>
  );
}

export default Navbar;