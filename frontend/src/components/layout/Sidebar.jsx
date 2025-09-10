import { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_WIDTH = 220;
const HEADER_HEIGHT = 80;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  const items = useMemo(() => {
    const base = [
      { key: 'home', label: 'Home', icon: <HomeIcon />, to: '/' },
    ];
    // Show Shop only for non-admin users
    if (!user?.isAdmin) {
      base.push({ key: 'shop', label: 'Shop', icon: <StorefrontIcon />, to: '/shop' });
    }
    const authed = user
      ? [
          { key: 'profile', label: 'Profile', icon: <PersonIcon />, to: '/profile' },
        ]
      : [];
    // Add orders for non-admin users only
    if (user && !user.isAdmin) {
      base.push({ key: 'orders', label: 'Orders', icon: <ListAltIcon />, to: '/orders' });
    }
    const adminItems = user?.isAdmin ? [{ key: 'admin', label: 'Admin', icon: <AdminPanelSettingsIcon />, to: '/admin' }] : [];
    const end = user
      ? [{ key: 'logout', label: 'Logout', icon: <LogoutIcon />, action: () => { logout(); navigate('/'); } }]
      : [{ key: 'profile', label: 'Login', icon: <PersonIcon />, to: '/login' }];
    return [...base, ...authed, ...adminItems, ...end];
  }, [user, logout, navigate]);

  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: `${HEADER_HEIGHT}px`,
        left: 0,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        width: { xs: 72, md: SIDEBAR_WIDTH },
        bgcolor: 'var(--primary-green)',
        color: '#fff',
        zIndex: 1100,
        boxShadow: 'var(--shadow-medium)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 250ms ease',
      }}
    >
      {/* Click-away overlay */}
      {open && (
        <Box onClick={() => setOpen(false)} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.2)', zIndex: -1 }} />
      )}
      <List sx={{ py: 1 }}>
        {items.map((item) => (
          <Tooltip key={item.key} title={item.label} placement="right" enterDelay={600}>
            <ListItemButton
              onClick={() => (item.action ? item.action() : navigate(item.to))}
              selected={item.to ? isActive(item.to) : false}
              sx={{
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ sx: { display: { xs: 'none', md: 'block' }, fontWeight: 600 } }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mt: 'auto' }} />
      <Box sx={{ p: 2, display: { xs: 'none', md: 'block' }, opacity: 0.7, fontSize: 12 }}>Guru's Coffee</Box>
    </Box>
  );
}

export default Sidebar;


