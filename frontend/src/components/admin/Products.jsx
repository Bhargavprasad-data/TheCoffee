import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Fab,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalCafe as LocalCafeIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon
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
  '&.view': {
    color: '#1976d2',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
    },
  },
}));

const categories = ['Light Roast', 'Medium Roast', 'Dark Roast', 'Espresso', 'Decaf'];
const origins = ['India', 'USA', 'Ethiopia', 'Colombia', 'Italy', 'Brazil', 'Guatemala', 'Costa Rica', 'Kenya', 'Jamaica'];

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    origin: '',
    rating: 0,
    reviews: 0,
    image: '',
    stock: 0,
    featured: false
  });

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        origin: '',
        rating: 0,
        reviews: 0,
        image: '',
        stock: 0,
        featured: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target.result // Store as base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      if (editingProduct) {
      // Update existing product
        await updateProduct(editingProduct._id || editingProduct.id, formData);
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success'
        });
    } else {
      // Add new product
        await addProduct(formData);
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
    }
    handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving product. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error deleting product. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleToggleFeatured = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { ...product, featured: !product.featured });
    }
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
              Product Management
        </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledButton
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </StyledButton>
            <StyledButton
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </StyledButton>
            <StyledButton
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
              Add Product
            </StyledButton>
          </Box>
      </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {products.length}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Total Products
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {products.filter(p => p.featured).length}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Featured Products
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {products.reduce((sum, p) => sum + (p.stock ?? p.countInStock ?? 0), 0)}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Total Stock
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                ₹{products.reduce((sum, p) => sum + (Number(p.price || 0) * (p.stock ?? p.countInStock ?? 0)), 0).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Inventory Value
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Products Display */}
        {viewMode === 'table' ? (
          <Paper sx={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
            <TableContainer>
        <Table>
          <TableHead>
                  <TableRow sx={{ backgroundColor: 'var(--light-mint)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
                    <TableRow key={product._id || product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={product.image || product.imageUrl}
                            alt={product.name}
                            sx={{ width: 50, height: 50, borderRadius: 1, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                              {product.origin}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          size="small"
                          sx={{
                            backgroundColor: 'var(--light-mint)',
                            color: 'var(--primary-green)',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                          ₹{Number(product.price).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: (product.stock ?? product.countInStock) > 10 ? 'var(--primary-green)' : '#d32f2f'
                          }}
                        >
                          {product.stock ?? product.countInStock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating 
                            value={product.rating} 
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
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({product.reviews})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.featured ? 'Yes' : 'No'}
                          size="small"
                          color={product.featured ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <ActionButton
                          className="view"
                          size="small"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <ViewIcon />
                        </ActionButton>
                        <ActionButton
                          className="edit"
                          size="small"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                        </ActionButton>
                        <ActionButton
                          className="delete"
                          size="small"
                          onClick={() => handleDelete(product._id || product.id)}
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
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id || product.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 'var(--shadow-heavy)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || product.imageUrl}
                    alt={product.name}
                    sx={{ objectFit: 'contain', backgroundColor: '#f9f9f9', p: 2 }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                        {product.name}
                      </Typography>
                      {product.featured && (
                        <Chip 
                          label="Featured" 
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={product.rating} 
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
                        ({product.reviews})
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700, mb: 1 }}>
                      ₹{Number(product.price).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={product.category} 
                        size="small"
                        sx={{
                          backgroundColor: 'var(--light-mint)',
                          color: 'var(--primary-green)',
                          fontWeight: 600
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: (product.stock ?? product.countInStock) > 10 ? 'var(--primary-green)' : '#d32f2f'
                        }}
                      >
                        Stock: {product.stock ?? product.countInStock}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <ActionButton
                      className="edit"
                      size="small"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <EditIcon />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      size="small"
                      onClick={() => handleDelete(product._id || product.id)}
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      {/* Add/Edit Product Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
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
            {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Origin</InputLabel>
                  <Select
                  name="origin"
                  value={formData.origin}
                    onChange={handleInputChange}
                    required
                  >
                    {origins.map((origin) => (
                      <MenuItem key={origin} value={origin}>
                        {origin}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Rating"
                  name="rating"
                  type="number"
                  value={formData.rating}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Number of Reviews"
                  name="reviews"
                  type="number"
                  value={formData.reviews}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--text-dark)', fontWeight: 600 }}>
                    Product Image
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      sx={{
                        borderColor: 'var(--primary-green)',
                        color: 'var(--primary-green)',
                        '&:hover': {
                          borderColor: 'var(--secondary-green)',
                          backgroundColor: 'rgba(30, 57, 50, 0.1)',
                        }
                      }}
                    >
                      Upload Image
                    </Button>
                  </label>
                  {formData.image && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
        </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'var(--text-muted)' }}>
              Cancel
          </Button>
            <StyledButton onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Add Product'}
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

export default AdminProducts;