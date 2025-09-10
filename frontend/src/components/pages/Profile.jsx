import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../context/ProductContext';
import { authAPI, ordersAPI } from '../../services/api';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Badge,
  IconButton,
  Rating
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Receipt as OrderIcon,
  Favorite as WishlistIcon,
  Settings as SettingsIcon,
  LocationOn as AddressIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalCafe as CoffeeIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon
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

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// Default data before load (no demo data)
const userData = { 
  name: '', 
  email: '', 
  phone: '', 
  avatar: '/images/avatar.jpg', 
  joinDate: new Date().toISOString(), 
  totalOrders: 0, 
  totalSpent: 0, 
  wishlistItems: 0 
};

// Will be loaded from backend
let orderHistory = [];

// Cart items now come from CartContext
// Wishlist items now come from WishlistContext

const addresses = [
  {
    id: 1,
    type: 'Home',
    address: '123 Coffee Street, Visakhapatnam, AP 530001',
    isDefault: true
  },
  {
    id: 2,
    type: 'Office',
    address: '456 Brew Lane, Hyderabad, TS 500001',
    isDefault: false
  }
];

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, addToCart } = useCart();
  const { items: wishlistItems, remove: removeFromWishlist } = useWishlist();
  const { products } = useProducts();
  
  // Debug: Log cart items whenever they change
  useEffect(() => {
    console.log('Profile: Cart items updated:', cartItems);
    console.log('Profile: Cart items count:', cartItems.length);
  }, [cartItems]);
  
  // Debug: Log wishlist items whenever they change
  useEffect(() => {
    console.log('Profile: Wishlist items updated:', wishlistItems);
    console.log('Profile: Wishlist items count:', wishlistItems.length);
    if (wishlistItems.length > 0) {
      console.log('Profile: First wishlist item:', wishlistItems[0]);
      console.log('Profile: First wishlist item full structure:', JSON.stringify(wishlistItems[0], null, 2));
      console.log('Profile: First wishlist item ID:', {
        id: wishlistItems[0].id,
        type: typeof wishlistItems[0].id,
        isObject: typeof wishlistItems[0].id === 'object',
        hasToString: !!(wishlistItems[0].id && typeof wishlistItems[0].id === 'object' && wishlistItems[0].id.toString)
      });
    }
  }, [wishlistItems]);
  
  // Handle add to cart from wishlist - EXACTLY like Shop page
  const handleAddToCart = async (wishlistItem) => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to add items to cart', severity: 'warning' });
      return;
    }
    
    try {
      // Get the actual product from ProductContext using the wishlist item ID
      let productId = null;
      
      // Try to get product ID from wishlist item
      if (wishlistItem.id) {
        productId = typeof wishlistItem.id === 'object' ? wishlistItem.id.toString() : wishlistItem.id;
      } else if (wishlistItem._id) {
        productId = typeof wishlistItem._id === 'object' ? wishlistItem._id.toString() : wishlistItem._id;
      } else if (wishlistItem.product) {
        productId = typeof wishlistItem.product === 'object' ? wishlistItem.product.toString() : wishlistItem.product;
      }
      
      console.log('Extracted product ID from wishlist:', productId);
      
      if (!productId) {
        throw new Error('Could not extract product ID from wishlist item');
      }
      
      // Find the actual product in ProductContext (this ensures we have the correct format)
      const actualProduct = products.find(p => p._id === productId || p.id === productId);
      
      if (!actualProduct) {
        console.error('Product not found in ProductContext. Creating fallback product.');
        
        // Fallback: Create product from wishlist data
        const fallbackProduct = {
          _id: productId,
          id: productId,
          name: wishlistItem.name,
          price: wishlistItem.price,
          imageUrl: wishlistItem.image || wishlistItem.imageUrl,
          image: wishlistItem.image || wishlistItem.imageUrl,
          category: wishlistItem.category,
          origin: wishlistItem.origin,
          roastLevel: wishlistItem.roastLevel,
          averageRating: wishlistItem.rating || wishlistItem.averageRating,
          countInStock: wishlistItem.countInStock
        };
        
        console.log('Using fallback product:', fallbackProduct);
        await addToCart(fallbackProduct, 1);
      } else {
        console.log('Found actual product in ProductContext:', actualProduct);
        // Use the actual product from ProductContext (like Shop page does)
        await addToCart(actualProduct, 1);
      }
      
      setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
    }
  };
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(userData);
  const [orders, setOrders] = useState([]);
  
  // Debug: Log orders whenever they change
  useEffect(() => {
    console.log('Profile: Orders updated:', orders);
    console.log('Profile: Orders count:', orders.length);
    if (orders.length > 0) {
      console.log('Profile: First order:', orders[0]);
      console.log('Profile: First order structure:', {
        _id: orders[0]._id,
        status: orders[0].status,
        totalPrice: orders[0].totalPrice,
        orderItems: orders[0].orderItems?.length || 0
      });
    }
  }, [orders]);
  
  const canCancel = (order) => !['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].includes(order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'));

  const reloadMyOrders = async () => {
    try {
      const myOrders = await ordersAPI.get('/myorders');
      console.log('Profile: Orders loaded:', myOrders.data);
      setOrders(Array.isArray(myOrders.data) ? myOrders.data : []);
    } catch (error) {
      console.error('Profile: Failed to load orders:', error);
    }
  };

  const cancelMyOrder = async (id) => {
    try {
      await ordersAPI.cancel(id);
      await reloadMyOrders();
      setSnackbar({ open: true, message: 'Order cancelled', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to cancel', severity: 'error' });
    }
  };

  const deleteMyOrder = async (id) => {
    try {
      await ordersAPI.deleteSelf(id);
      await reloadMyOrders();
      setSnackbar({ open: true, message: 'Order deleted', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to delete', severity: 'error' });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await authAPI.getProfile();
        setProfileData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          avatar: '/images/avatar.jpg',
          joinDate: data.createdAt || new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0
        });
        // Load user orders
        const myOrders = await ordersAPI.get('/myorders');
        console.log('Profile: Initial orders response:', myOrders);
        const ordersData = Array.isArray(myOrders.data) ? myOrders.data : [];
        console.log('Profile: Processed orders data:', ordersData);
        setOrders(ordersData);
        
        // Calculate initial statistics
        const totalOrders = ordersData.length;
        const completedSpent = ordersData.reduce((sum, order) => {
          if (order.status === 'Delivered' || order.isDelivered) {
            return sum + (order.totalPrice || 0);
          }
          return sum;
        }, 0);
        
        console.log('Profile: Initial statistics calculated:', { totalOrders, completedSpent });
        
        // Update profile data with initial statistics
        setProfileData(prev => ({
          ...prev,
          totalOrders,
          totalSpent: completedSpent
        }));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [user]);

  // Calculate statistics when orders or wishlist items change
  useEffect(() => {
    const totalOrders = orders.length;
    
    // Calculate completed orders spent (only delivered orders)
    const completedSpent = orders.reduce((sum, order) => {
      if (order.status === 'Delivered' || order.isDelivered) {
        return sum + (order.totalPrice || 0);
      }
      return sum;
    }, 0);
    
    const wishlistCount = wishlistItems.length;

    console.log('Profile: Calculating statistics:', {
      totalOrders,
      completedSpent,
      wishlistCount,
      orders: orders.map(o => ({ id: o._id, status: o.status, totalPrice: o.totalPrice }))
    });

    // Update profile data with current statistics
    setProfileData(prev => ({
      ...prev,
      totalOrders,
      totalSpent: completedSpent,
      wishlistItems: wishlistCount
    }));
  }, [orders, wishlistItems]);



  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async () => {
    try {
      await authAPI.updateProfile(profileData);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setSnackbar({
        open: true,
        message: 'Item removed from cart!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to remove from cart!',
        severity: 'error'
      });
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      setSnackbar({
        open: true,
        message: 'Item removed from wishlist!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove from wishlist!',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4caf50';
      case 'Processing': return '#ff9800';
      case 'Shipped': return '#2196f3';
      case 'Pending': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircleIcon />;
      case 'Processing': return <ScheduleIcon />;
      case 'Shipped': return <ShippingIcon />;
      case 'Pending': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  // Determine tabs based on user role
  const getTabs = () => {
    if (user?.isAdmin) {
      return [
        { icon: <AdminIcon />, label: "Admin Info" },
        { icon: <DashboardIcon />, label: "Quick Stats" },
        { icon: <SettingsIcon />, label: "Settings" }
      ];
    }
    return [
      { icon: <OrderIcon />, label: "Orders" },
      { icon: <CartIcon />, label: "Cart" },
      { icon: <WishlistIcon />, label: "Wishlist" },
      { icon: <SettingsIcon />, label: "Settings" }
    ];
  };

  const tabs = getTabs();

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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <PersonIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
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
            {user?.isAdmin ? 'Admin Profile' : 'My Profile'}
      </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Summary Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow-light)',
              textAlign: 'center'
            }}>
              <Avatar
          sx={{
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: user?.isAdmin ? 'var(--secondary-green)' : 'var(--primary-green)',
                  fontSize: '3rem'
                }}
              >
                {profileData.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 1 }}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                {user?.isAdmin ? 'Administrator' : 'Member'} since {new Date(profileData.joinDate).toLocaleDateString()}
              </Typography>
              
              {!user?.isAdmin && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      {profileData.totalOrders}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Total Orders
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      ₹{profileData.totalSpent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Total Spent
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      {profileData.wishlistItems}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Wishlist Items
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      {orders.filter(order => !['Delivered', 'Cancelled'].includes(order.status)).length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Active Orders
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {/* Show message when no data */}
              {!user?.isAdmin && profileData.totalOrders === 0 && profileData.wishlistItems === 0 && (
                <Box sx={{ textAlign: 'center', py: 2, color: 'var(--text-muted)' }}>
                  <Typography variant="body2">
                    No orders or wishlist items yet. Start shopping to see your statistics here!
                  </Typography>
                </Box>
              )}

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ textAlign: 'center', py: 1, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Typography variant="caption">
                    Debug: Orders: {orders.length}, Wishlist: {wishlistItems.length}, Last Update: {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
              )}

              <StyledButton
                startIcon={<EditIcon />}
                onClick={() => setEditMode(!editMode)}
                  fullWidth
              >
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </StyledButton>
            </Paper>
              </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              backgroundColor: 'white', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow-light)'
            }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      '&.Mui-selected': {
                        color: 'var(--primary-green)',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'var(--primary-green)',
                    },
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Tab key={index} icon={tab.icon} label={tab.label} />
                  ))}
                </Tabs>
              </Box>

              {/* Admin Info Tab */}
              {user?.isAdmin && (
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                    Administrator Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: '12px', backgroundColor: 'var(--light-mint)' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 600, mb: 2 }}>
                            <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Admin Role
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>
                            You have full administrative access to manage products, orders, users, and view sales reports.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: '12px', backgroundColor: 'var(--light-mint)' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 600, mb: 2 }}>
                            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Management Access
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>
                            Access admin dashboard, product management, order processing, and user management.
                          </Typography>
                        </CardContent>
                      </Card>
              </Grid>
            </Grid>
        </TabPanel>
              )}

              {/* Quick Stats Tab (Admin) */}
              {user?.isAdmin && (
        <TabPanel value={tabValue} index={1}>
                  <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                    Quick Statistics
                  </Typography>
            <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'var(--light-mint)', borderRadius: '16px' }}>
                        <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                          <DashboardIcon sx={{ fontSize: '2rem', mb: 1 }} />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                          Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                          Manage your coffee shop
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'var(--light-mint)', borderRadius: '16px' }}>
                        <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                          <CoffeeIcon sx={{ fontSize: '2rem', mb: 1 }} />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                          Products
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                          Manage inventory
                        </Typography>
                      </Paper>
              </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'var(--light-mint)', borderRadius: '16px' }}>
                        <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                          <AssessmentIcon sx={{ fontSize: '2rem', mb: 1 }} />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                          Reports
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                          View sales data
                        </Typography>
                      </Paper>
              </Grid>
              </Grid>
                </TabPanel>
              )}

              {/* Orders Tab (Customer only) */}
              {!user?.isAdmin && (
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                    Order History
                  </Typography>
                  {orders.map((order) => (
                    <Card key={order._id} sx={{ mb: 3, borderRadius: '12px' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                            Order #{order._id.substring(order._id.length - 6)}
                          </Typography>
                          <Chip 
                            icon={getStatusIcon(order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'))}
                            label={order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending')}
                            sx={{
                              backgroundColor: getStatusColor(order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending')),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {order.orderItems.map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  component="img"
                                  src={item.image || item.imageUrl || '/images/coffee-placeholder.jpg'}
                                  alt={item.name}
                                  sx={{ width: 50, height: 50, borderRadius: 1, mr: 2 }}
                                />
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {item.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                    Qty: {item.quantity} × ₹{item.price}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                            Total: ₹{Number(order.totalPrice || 0).toFixed(2)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!(order.status === 'Delivered' || order.isDelivered) && (
                              <StyledButton size="small" onClick={() => navigate(`/orders/${order._id}/track`)}>
                                Track Order
                              </StyledButton>
                            )}
                            {canCancel(order) ? (
                              <Button size="small" color="error" variant="outlined" onClick={() => cancelMyOrder(order._id)}>Cancel</Button>
                            ) : (
                              (order.status === 'Cancelled') && (
                                <Button size="small" color="error" variant="contained" onClick={() => deleteMyOrder(order._id)}>Delete</Button>
                              )
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
        </TabPanel>
              )}

              {/* Cart Tab (Customer only) */}
              {!user?.isAdmin && (
                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                    Shopping Cart ({cartItems.length} items)
                  </Typography>
                  {cartItems.map((item) => (
                    <Card key={item.id} sx={{ mb: 3, borderRadius: '12px' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{ width: 80, height: 80, borderRadius: 1, mr: 3 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {item.name}
                            </Typography>
                            <Chip 
                              label={item.category} 
                              size="small"
                              sx={{
                                backgroundColor: 'var(--light-mint)',
                                color: 'var(--primary-green)',
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                              Quantity: {item.quantity}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 1 }}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {cartItems.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <StyledButton size="large" onClick={() => navigate('/checkout')}>
                        Proceed to Checkout
                      </StyledButton>
                    </Box>
                  )}
                </TabPanel>
              )}

              {/* Wishlist Tab (Customer only) */}
              {!user?.isAdmin && (
        <TabPanel value={tabValue} index={2}>
                  <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                    My Wishlist ({wishlistItems.length} items)
                  </Typography>
                  {wishlistItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        Your wishlist is empty
                      </Typography>
                      <Typography sx={{ color: 'var(--text-muted)', mb: 3 }}>
                        Add some products to your wishlist to see them here!
                      </Typography>
                      <StyledButton onClick={() => navigate('/shop')}>
                        Browse Products
                      </StyledButton>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {wishlistItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card sx={{ borderRadius: '12px', height: '100%' }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={item.image || item.imageUrl || '/images/coffee-placeholder.jpg'}
                              alt={item.name}
                              sx={{ objectFit: 'contain', backgroundColor: '#f9f9f9', p: 2 }}
                            />
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {item.name}
                              </Typography>
                              <Chip
                                label={item.category} 
                                size="small"
                                sx={{
                                  backgroundColor: 'var(--light-mint)',
                                  color: 'var(--primary-green)',
                                  fontWeight: 600,
                                  mb: 1
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Rating 
                                  value={item.rating || 0} 
                                  precision={0.5} 
                                  readOnly 
                                  size="small"
                                  sx={{
                                    '& .MuiRating-iconFilled': {
                                      color: '#ffd700 !important', // Golden yellow for filled stars
                                    },
                                    '& .MuiRating-iconHover': {
                                      color: '#ffd700 !important', // Golden yellow for hover
                                    },
                                    '& .MuiRating-iconEmpty': {
                                      color: '#e0e0e0 !important', // Light gray for empty stars
                                    },
                                    '& .MuiRating-icon': {
                                      color: '#e0e0e0', // Default color for all stars
                                    },
                                    '& .MuiRating-iconFilled.MuiRating-icon': {
                                      color: '#ffd700 !important', // Ensure filled stars are yellow
                                    }
                                  }}
                                />
                                <Typography variant="body2" sx={{ ml: 1, color: 'var(--text-muted)' }}>
                                  {item.rating}
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 2 }}>
                                ₹{item.price.toFixed(2)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                        <StyledButton size="small" fullWidth onClick={() => handleAddToCart(item)}>
          Add to Cart
        </StyledButton>
        {/* Debug button to test cart add */}
        
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleRemoveFromWishlist(item.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>
              )}

              {/* Settings Tab */}
              <TabPanel value={tabValue} index={user?.isAdmin ? 2 : 3}>
                <Typography variant="h5" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                  Account Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                      Personal Information
                    </Typography>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      disabled={!editMode}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled={!editMode}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileData.phone}
                      disabled={!editMode}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    {editMode && (
                      <StyledButton onClick={handleSaveProfile}>
                        Save Changes
                      </StyledButton>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                      Notification Preferences
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Order updates"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Promotional emails"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Newsletter"
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                </Grid>
        </TabPanel>
      </Paper>
          </Grid>
        </Grid>

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

export default Profile;