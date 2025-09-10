import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  TextField,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Skeleton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalCafe as CoffeeIcon,
  LocationOn as LocationIcon,
  Scale as WeightIcon,
  Star as StarIcon
} from '@mui/icons-material';

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

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProductById, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, has: hasInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Product not found');
      }
    }
  }, [id, getProductById]);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    if (product) {
      try {
        await addToCart(product, quantity);
        navigate('/cart');
        setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="80%" height={60} />
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={40} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button onClick={() => navigate('/shop')} variant="contained">
          Back to Shop
        </Button>
      </Container>
    );
  }

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
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'contain',
                backgroundColor: 'white',
                p: 2
              }}
              src={product.imageUrl || product.image || '/images/coffee-placeholder.jpg'}
              alt={product.name}
            />
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'var(--text-dark)', fontWeight: 700 }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={product.averageRating || 0} 
                precision={0.5} 
                readOnly
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
                ({product.ratings?.length || 0} reviews)
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 3 }}>
              ₹{product.price?.toFixed(2) || '0.00'}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: 'var(--text-dark)', lineHeight: 1.6 }}>
              {product.description}
            </Typography>

            {/* Product Details */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CoffeeIcon sx={{ mr: 1, color: 'var(--primary-green)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Roast Level
                    </Typography>
                  </Box>
                  <Chip 
                    label={product.roastLevel || product.category || 'N/A'} 
                    size="small"
                    sx={{ backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'var(--primary-green)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Origin
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {product.origin || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WeightIcon sx={{ mr: 1, color: 'var(--primary-green)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Weight
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {product.weight || 250}g
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShoppingCartIcon sx={{ mr: 1, color: 'var(--primary-green)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Stock
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {product.countInStock || 0} available
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2, fontWeight: 600 }}>
                Quantity:
              </Typography>
              <QuantityButton onClick={() => handleQuantityChange(-1)}>
                <RemoveIcon />
              </QuantityButton>
              <TextField
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ mx: 2, width: '80px' }}
                inputProps={{ min: 1, style: { textAlign: 'center' } }}
              />
              <QuantityButton onClick={() => handleQuantityChange(1)}>
                <AddIcon />
              </QuantityButton>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <StyledButton
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!product.countInStock || product.countInStock <= 0}
                fullWidth
              >
                Add to Cart
              </StyledButton>
              <StyledButton
                variant="outlined"
                fullWidth
                onClick={() => {
                  if (!user) {
                    setShowLoginDialog(true);
                    return;
                  }
                  toggleWishlist(product);
                }}
              >
                {hasInWishlist(product._id || product.id) ? 'Remove Wishlist' : 'Add Wishlist'}
              </StyledButton>
            </Box>

            {(!product.countInStock || product.countInStock <= 0) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This product is currently out of stock
              </Alert>
            )}
          </Grid>
        </Grid>

        {/* Product Tabs */}
        <Box sx={{ mt: 6 }}>
          <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
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
                <Tab label="Description" />
                <Tab label="Reviews" />
                <Tab label="Shipping" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
              )}

              {tabValue === 1 && (
                <Box>
                  {product.ratings && product.ratings.length > 0 ? (
                    <List>
                      {product.ratings.map((review, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating 
                                value={review.rating || 0} 
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
                                {review.comment || 'No comment'}
                              </Typography>
                            </Box>
                            }
                            secondary={review.date || 'No date'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No reviews yet. Be the first to review this product!
                    </Typography>
                  )}
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-dark)' }}>
                    Shipping Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Free shipping on orders above ₹999
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Standard delivery: 3-5 business days
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Express delivery: 1-2 business days (additional charges apply)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • We ship to all major cities in India
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      </Container>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please log in to add items to your cart.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowLoginDialog(false);
              navigate('/login');
            }}
            variant="contained"
            sx={{ backgroundColor: 'var(--primary-green)' }}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductDetails;