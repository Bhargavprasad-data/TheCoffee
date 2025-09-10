import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { authAPI } from '../../services/api';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--primary-green)',
  color: 'white',
  borderRadius: '25px',
  padding: '8px 16px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'var(--secondary-green)',
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-medium)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  margin: '0 4px',
  '&.edit': {
    color: 'var(--primary-green)',
    '&:hover': {
      backgroundColor: 'rgba(30, 57, 50, 0.1)',
    },
  },
  '&.delete': {
    color: '#d32f2f',
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
    },
  },
}));

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isAdmin: false
  });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getAllUsers();
      const normalizedUsers = data.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        joinDate: new Date(user.createdAt || Date.now()).toISOString().split('T')[0],
        orderCount: 0 // You can add order count logic later if needed
      }));
      setUsers(normalizedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load users', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        isAdmin: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'isAdmin' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update existing user
        await authAPI.updateProfile(formData);
        setUsers(users.map(user =>
          user.id === selectedUser.id
            ? { ...user, ...formData }
            : user
        ));
        setSnackbar({ 
          open: true, 
          message: 'User updated successfully!', 
          severity: 'success' 
        });
      }
      handleCloseDialog();
      fetchUsers(); // Refresh the list
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update user', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: You'll need to create a delete user endpoint in your backend
        // For now, we'll just remove from local state
        setUsers(users.filter(user => user.id !== userId));
        setSnackbar({ 
          open: true, 
          message: 'User deleted successfully!', 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Failed to delete user', 
          severity: 'error' 
        });
      }
    }
  };

  const getRoleColor = (isAdmin) => {
    return isAdmin ? '#1976d2' : '#757575';
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
      className="coffee-bean-bg"
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                color: 'var(--text-dark)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              className="heading-primary"
            >
              Manage Users
            </Typography>
          </Box>
        </Box>

        {/* Users Table */}
        <Paper sx={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--light-mint)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 2, color: 'var(--primary-green)' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={user.isAdmin ? <AdminIcon /> : <PersonIcon />}
                        label={user.isAdmin ? 'Admin' : 'Customer'}
                        size="small"
                        sx={{
                          backgroundColor: getRoleColor(user.isAdmin),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {user.joinDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {user.orderCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        className="edit"
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon />
                      </ActionButton>
                      <ActionButton
                        className="delete"
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <DeleteIcon />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Edit User Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              backgroundColor: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: 'var(--text-dark)', 
            fontWeight: 600,
            borderBottom: '1px solid #e0e0e0'
          }}>
            {selectedUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 3 }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 3 }}
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleChange}
                  />
                }
                label="Admin Access"
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'var(--text-muted)' }}>
              Cancel
            </Button>
            <StyledButton onClick={handleSubmit}>
              {selectedUser ? 'Update User' : 'Add User'}
            </StyledButton>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Users;