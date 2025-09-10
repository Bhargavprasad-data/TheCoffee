import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalCafe as LocalCafeIcon, Star as StarIcon } from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: 'white',
  boxShadow: 'var(--shadow-light)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: 'var(--shadow-heavy)',
  },
}));

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

const FilterCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-light)',
  padding: '24px',
  height: 'fit-content',
  position: 'sticky',
  top: '100px',
}));

function Shop() {
  const { products } = useProducts();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, has: hasInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    categories: [],
    origins: [],
    priceRange: [0, 0],
    searchQuery: '',
    minRating: 0,
    sortBy: 'relevance'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const productsPerPage = 12;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get unique categories and origins from products
  const categories = [...new Set(products.map(p => p.category))];
  const origins = [...new Set(products.map(p => p.origin))];

  // Calculate dynamic price range and rating stats
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0, avg: 0 };
    const prices = products.map(p => p.price || 0).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    };
  }, [products]);

  const ratingStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 5, avg: 0 };
    const ratings = products.map(p => p.rating || p.averageRating || 0).filter(r => r > 0);
    if (ratings.length === 0) return { min: 0, max: 5, avg: 0 };
    return {
      min: Math.floor(Math.min(...ratings)),
      max: Math.ceil(Math.max(...ratings)),
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    };
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (priceStats.max > 0 && filters.priceRange[1] === 0) {
      setFilters(prev => ({ ...prev, priceRange: [0, priceStats.max] }));
    }
  }, [priceStats, filters.priceRange]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    const base = products.filter(product => {
      const matchesCategories = filters.categories.length === 0 || filters.categories.includes(product.category);
      const matchesOrigins = filters.origins.length === 0 || filters.origins.includes(product.origin);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesSearch = !filters.searchQuery ||
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesRating = (product.rating || 0) >= (filters.minRating || 0);
      return matchesCategories && matchesOrigins && matchesPrice && matchesSearch && matchesRating;
    });
    switch (filters.sortBy) {
      case 'priceAsc':
        return base.slice().sort((a,b) => (a.price||0) - (b.price||0));
      case 'priceDesc':
        return base.slice().sort((a,b) => (b.price||0) - (a.price||0));
      case 'rating':
        return base.slice().sort((a,b) => (b.rating||0) - (a.rating||0));
      case 'newest':
        return base.slice().sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      default:
        return base;
    }
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Apply search from global query param (?q=)
  const urlParams = new URLSearchParams(window.location.search);
  const globalQuery = urlParams.get('q') || '';
  if (globalQuery && filters.searchQuery !== globalQuery) {
    // one-way sync to filters when arriving via navbar search
    setFilters(prev => ({ ...prev, searchQuery: globalQuery }));
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    try {
      await addToCart(product, 1);
      setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
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
            <LocalCafeIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
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
              Our Coffee Collection
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: '600px', mx: 'auto' }}>
            Discover our carefully curated selection of premium coffee beans from around the world
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <FilterCard>
              <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 3, fontWeight: 600 }}>
                Filters
              </Typography>

              {/* Search */}
              <TextField
                fullWidth
                label="Search products"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Category Filter (multi-select) */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={filters.categories}
                  label="Categories"
                  onChange={(e) => handleFilterChange('categories', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Origin Filter (multi-select) */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Origins</InputLabel>
                <Select
                  multiple
                  value={filters.origins}
                  label="Origins"
                  onChange={(e) => handleFilterChange('origins', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                >
                  {origins.map((origin) => (
                    <MenuItem key={origin} value={origin}>
                      {origin}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Rating filter */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Min Rating</InputLabel>
                <Select
                  value={filters.minRating}
                  label="Min Rating"
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                >
                  <MenuItem value={0}>Any Rating</MenuItem>
                  <MenuItem value={1}>1+ Stars</MenuItem>
                  <MenuItem value={2}>2+ Stars</MenuItem>
                  <MenuItem value={3}>3+ Stars</MenuItem>
                  <MenuItem value={4}>4+ Stars</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                </Select>
              </FormControl>

              {/* Sort */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort by"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                  <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Avg. Customer Review</MenuItem>
                  <MenuItem value="newest">Newest Arrivals</MenuItem>
                </Select>
              </FormControl>

              {/* Price Range */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={priceStats.max}
                  step={Math.max(1, Math.floor(priceStats.max / 100))}
                  sx={{
                    color: 'var(--primary-green)',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'var(--primary-green)',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'var(--primary-green)',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    Min: ₹0
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    Avg: ₹{priceStats.avg}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    Max: ₹{priceStats.max}
                  </Typography>
                </Box>
              </Box>

              {/* Results Count */}
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                {filteredProducts.length} products found
              </Typography>
            </FilterCard>
          </Grid>

          {/* Products Grid */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {currentProducts.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product._id || product.id}>
                  <StyledCard>
                                      <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || product.image}
                    alt={product.name}
                    sx={{ objectFit: 'contain', backgroundColor: '#f9f9f9', p: 2 }}
                  />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                          {product.name}
                        </Typography>
                        <Chip 
                          label={product.category} 
                          size="small"
                          sx={{
                            backgroundColor: 'var(--light-mint)',
                            color: 'var(--primary-green)',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        {product.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating 
                          value={product.rating || 0} 
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
                          ({product.reviews || 0})
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 2 }}>
                        ₹{product.price?.toFixed(2) || '0.00'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                        Origin: {product.origin}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <StyledButton
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        sx={{ 
                          mb: 1,
                          height: '48px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 25px rgba(30, 57, 50, 0.3)',
                            color:'#fff',
                          }
                        }}
                      >
                        Add to Cart
                      </StyledButton>
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <StyledButton
                          fullWidth
                          variant="outlined"
                          onClick={async () => {
                            try {
                              await toggleWishlist(product);
                              setSnackbar({
                                open: true,
                                message: hasInWishlist(product._id || product.id) 
                                  ? 'Removed from wishlist' 
                                  : 'Added to wishlist',
                                severity: 'success'
                              });
                            } catch (error) {
                              console.error('Wishlist operation failed:', error);
                              setSnackbar({
                                open: true,
                                message: 'Failed to update wishlist',
                                severity: 'error'
                              });
                            }
                          }}
                          sx={{
                            height: '40px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderColor: 'var(--primary-green)',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: 'var(--light-mint)',
                              borderColor: 'var(--secondary-green)',
                              color: 'var(--secondary-green)'
                            }
                          }}
                        >
                          {hasInWishlist(product._id || product.id) ? 'Remove' : 'Wishlist'}
                        </StyledButton>
                        <StyledButton
                          fullWidth
                          variant="outlined"
                          onClick={() => handleViewDetails(product._id || product.id)}
                          sx={{
                            height: '40px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderColor: 'var(--primary-green)',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: 'var(--light-mint)',
                              borderColor: 'var(--secondary-green)',
                              color: 'var(--secondary-green)'
                            }
                          }}
                        >
                          Details
                        </StyledButton>
                      </Box>
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'var(--text-dark)',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'var(--primary-green)',
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>

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
            <StyledButton onClick={() => {
              setShowLoginDialog(false);
              navigate('/login');
            }}>
              Login
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Container>
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

export default Shop;