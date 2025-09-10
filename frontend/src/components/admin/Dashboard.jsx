import { useEffect, useMemo, useState } from 'react';
import { ordersAPI, productsAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Button,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  LocalCafe as LocalCafeIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon
} from '@mui/icons-material';

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

const StatCard = styled(Paper)(({ theme }) => ({
  padding: '24px',
  height: '100%',
  cursor: 'pointer',
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-light)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: 'var(--shadow-heavy)',
  }
}));

function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);

  useEffect(() => {
    let isActive = true;
    async function fetchAll() {
      try {
        setLoading(true);
        const [ordersRes, productsRes, summaryRes, usersRes] = await Promise.all([
          ordersAPI.get('/'),
          productsAPI.getAll(),
          ordersAPI.get('/stats/summary'),
          authAPI.getAllUsers()
        ]);
        if (!isActive) return;
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
        setSalesSummary(summaryRes.data || null);
        setUsers((usersRes.data || []).filter(u => !u.isAdmin));
      } catch (e) {
        if (!isActive) return;
        setError(e?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (isActive) setLoading(false);
      }
    }
    fetchAll();
    return () => { isActive = false; };
  }, []);

  // Simple auto-refresh when an admin updates statuses elsewhere
  const refresh = async () => {
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        ordersAPI.get('/'),
        ordersAPI.get('/stats/summary')
      ]);
      setOrders(ordersRes.data || []);
      setSalesSummary(summaryRes.data || null);
    } catch {}
  };

  const [users, setUsers] = useState([]);

  const computed = useMemo(() => {
    const totals = salesSummary?.totals || { sales: 0, orders: 0 };
    const effectiveOrders = (orders || []).filter(o => (o.status || (o.isDelivered ? 'Delivered' : (o.isPaid ? 'Processing' : 'Pending'))) !== 'Cancelled');
    const recentOrders = effectiveOrders.slice(0, 5).map(o => ({
      id: o._id,
      customer: o.user?.name || 'Customer',
      total: o.totalPrice || 0,
      status: o.status || (o.isDelivered ? 'Delivered' : (o.isPaid ? 'Processing' : 'Pending')),
      date: o.createdAt || Date.now()
    }));
    const topProducts = (products || []).slice(0, 5).map(p => ({
      name: p.name,
      sales: Math.round((p.ratings?.length || 0) * 1.2),
      revenue: Math.round((p.price || 0) * (p.ratings?.length || 0))
    }));
    return {
      loading,
      error,
      totalSales: totals.sales || 0,
      totalOrders: effectiveOrders.length || 0,
      totalCustomers: users?.length || 0,
      totalProducts: products?.length || 0,
      recentOrders,
      topProducts,
    };
  }, [loading, error, orders, products, salesSummary, users]);

  return computed;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const dashboardData = useDashboardData();

  const StatCardComponent = ({ title, value, icon, color, subtitle }) => (
    <StatCard
      onClick={() => {
        // Navigate to relevant section based on title
        if (title === 'Products') navigate('/admin/products');
        if (title === 'Orders') navigate('/admin/orders');
        if (title === 'Customers') navigate('/admin/users');
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ color: 'var(--text-dark)', fontWeight: 700, mb: 1 }}>
            {title === 'Total Sales' ? `₹${value.toLocaleString()}` : value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}15`,
            p: 2,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60
          }}
        >
          {icon}
        </Box>
      </Box>
    </StatCard>
  );

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
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
              Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledButton
              startIcon={<InventoryIcon />}
              onClick={() => navigate('/admin/products')}
            >
              Manage Products
            </StyledButton>
            <StyledButton
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/admin/sales')}
            >
              Sales Reports
            </StyledButton>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCardComponent
              title="Total Sales"
              value={dashboardData.totalSales}
              icon={<CurrencyRupeeIcon sx={{ color: '#2E7D32', fontSize: 30 }} />}
              color="#2E7D32"
              subtitle="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCardComponent
              title="Orders"
              value={dashboardData.totalOrders}
              icon={<ShoppingCartIcon sx={{ color: '#1976D2', fontSize: 30 }} />}
              color="#1976D2"
              subtitle="Total orders"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCardComponent
              title="Customers"
              value={dashboardData.totalCustomers}
              icon={<PeopleIcon sx={{ color: '#9C27B0', fontSize: 30 }} />}
              color="#9C27B0"
              subtitle="Registered users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCardComponent
              title="Products"
              value={dashboardData.totalProducts}
              icon={<LocalCafeIcon sx={{ color: '#ED6C02', fontSize: 30 }} />}
              color="#ED6C02"
              subtitle="In inventory"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Recent Orders */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow-light)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                  Recent Orders
                </Typography>
                <StyledButton
                  size="small"
                  onClick={() => navigate('/admin/orders')}
                >
                  View All
                </StyledButton>
              </Box>
              <List sx={{ p: 0 }}>
                {dashboardData.recentOrders.map((order, index) => (
                  <Box key={order.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Box sx={{
                          bgcolor: order.status === 'Delivered' ? '#4caf50' : 
                                   order.status === 'Processing' ? '#ff9800' : '#f44336',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShoppingCartIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                            {order.customer}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ 
                                color: 'var(--primary-green)', 
                                fontWeight: 600,
                                fontSize: '1rem'
                              }}
                            >
                              ₹{order.total.toFixed(2)}
                            </Typography>
                            <Chip 
                              label={order.status} 
                              size="small"
                              sx={{
                                backgroundColor: order.status === 'Delivered' ? '#4caf50' : 
                                                 order.status === 'Processing' ? '#ff9800' : '#f44336',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                        {new Date(order.date).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                    {index < dashboardData.recentOrders.length - 1 && (
                      <Divider sx={{ mx: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow-light)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                  Top Products
                </Typography>
                <TrendingUpIcon sx={{ color: 'var(--primary-green)' }} />
              </Box>
              <List sx={{ p: 0 }}>
                {dashboardData.topProducts.map((product, index) => (
                  <Box key={product.name}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Box sx={{
                          bgcolor: 'var(--light-mint)',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <LocalCafeIcon sx={{ color: 'var(--primary-green)', fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                            {product.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: 'var(--text-muted)' }}
                            >
                              {product.sales} sales
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: 'var(--primary-green)', fontWeight: 600 }}
                            >
                              ₹{product.revenue.toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.topProducts.length - 1 && (
                      <Divider sx={{ mx: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow-light)'
            }}>
              <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledButton
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/products')}
                  >
                    Add Product
                  </StyledButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledButton
                    fullWidth
                    startIcon={<InventoryIcon />}
                    onClick={() => navigate('/admin/products')}
                  >
                    Manage Inventory
                  </StyledButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledButton
                    fullWidth
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/admin/orders')}
                  >
                    Order Reports
                  </StyledButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledButton
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/admin/users')}
                  >
                    Manage Users
                  </StyledButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AdminDashboard;