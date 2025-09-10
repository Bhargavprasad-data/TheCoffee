import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalCafe as LocalCafeIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-light)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: 'var(--shadow-medium)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--primary-green)',
  color: 'white',
  borderRadius: '25px',
  padding: '12px 24px',
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

const QuantityButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'var(--light-mint)',
  color: 'var(--primary-green)',
  border: '2px solid var(--primary-green)',
  '&:hover': {
    backgroundColor: 'var(--primary-green)',
    color: 'white',
  },
}));

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const handleQuantityChange = async (id, change) => {
    try {
      const currentItem = cartItems.find(item => item.id === id);
      if (currentItem) {
        const newQuantity = Math.max(1, currentItem.quantity + change);
        await updateQuantity(id, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // You can add a toast notification here if you want
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      // You can add a toast notification here if you want
    }
  };

  const subtotal = getCartTotal();
  const shippingCost = 99; // Fixed shipping cost in INR
  const total = subtotal + shippingCost;



  const handleCheckout = async () => {
    // Navigate to checkout page instead of handling payment here
    navigate('/checkout');
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
       
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ShoppingCartIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
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
              Shopping Cart
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Review your coffee selection and proceed to checkout
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cartItems.length === 0 ? (
              <StyledCard sx={{ p: 4, textAlign: 'center' }}>
                <LocalCafeIcon sx={{ fontSize: 80, color: 'var(--text-muted)', mb: 2 }} />
                <Typography variant="h5" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                  Your cart is empty
                </Typography>
                <Typography sx={{ color: 'var(--text-muted)', mb: 3 }}>
                  Add some delicious coffee to get started!
                </Typography>
                <StyledButton onClick={() => navigate('/shop')}>
                  Continue Shopping
                </StyledButton>
              </StyledCard>
            ) : (
              cartItems.map((item) => (
                <StyledCard key={item.id || item._id} sx={{ mb: 3 }}>
                  <Grid container>
                    <Grid item xs={12} sm={4}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image || item.imageUrl || '/images/coffee-placeholder.jpg'}
                        alt={item.name}
                        sx={{
                          objectFit: 'contain',
                          backgroundColor: '#f9f9f9',
                          p: 2
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 1 }}>
                              {item.name}
                            </Typography>
                            <Chip 
                              label={item.category} 
                              size="small"
                              sx={{
                                backgroundColor: 'var(--light-mint)',
                                color: 'var(--primary-green)',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          <IconButton
                            onClick={() => handleRemoveItem(item.id)}
                            size="small"
                            sx={{ 
                              color: '#d32f2f',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 2 }}>
                          ₹{item.price.toFixed(2)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <QuantityButton
                              onClick={() => handleQuantityChange(item.id, -1)}
                              size="small"
                            >
                              <RemoveIcon />
                            </QuantityButton>
                            <Typography sx={{ mx: 3, fontWeight: 600, color: 'var(--text-dark)' }}>
                              {item.quantity}
                            </Typography>
                            <QuantityButton
                              onClick={() => handleQuantityChange(item.id, 1)}
                              size="small"
                            >
                              <AddIcon />
                            </QuantityButton>
                          </Box>
                          <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Grid>
                  </Grid>
                </StyledCard>
              ))
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard sx={{ position: 'sticky', top: '100px' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 3 }}>
                  Order Summary
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Subtotal" 
                      primaryTypographyProps={{ color: 'var(--text-muted)' }}
                    />
                    <Typography sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      ₹{subtotal.toFixed(2)}
                    </Typography>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Shipping" 
                      primaryTypographyProps={{ color: 'var(--text-muted)' }}
                    />
                    <Typography sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      ₹{shippingCost.toFixed(2)}
                    </Typography>
                  </ListItem>
                  <Divider sx={{ my: 2 }} />
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Total" 
                      primaryTypographyProps={{ 
                        color: 'var(--text-dark)', 
                        fontWeight: 600,
                        variant: 'h6'
                      }}
                    />
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      ₹{total.toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>

                <StyledButton
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleCheckout}
                  sx={{ mt: 3 }}
                >
                  Proceed to Checkout
                </StyledButton>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;