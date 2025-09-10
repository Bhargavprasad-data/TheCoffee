import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ordersAPI } from '../../services/api';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  LocalCafe as LocalCafeIcon
} from '@mui/icons-material';
import GooglePayButton from '@google-pay/button-react';

// Lightweight PhonePe button to mirror GooglePayButton UX
const PhonePePayButton = ({ paymentRequest, onClick, onError }) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        mt: 1,
        backgroundColor: '#5F259F',
        '&:hover': { backgroundColor: '#4b1d7d' },
        color: '#fff',
        borderRadius: '8px',
        height: 48,
        px: 3,
        fontWeight: 700
      }}
    >
      Pay with PhonePe
    </Button>
  );
};

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
  '&:disabled': {
    backgroundColor: '#ccc',
    color: '#666',
  },
}));

const steps = ['Personal Details', 'Shipping Address', 'Payment Method', 'Order Review'];

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Form data
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Shipping Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    
    // Payment
    paymentMethod: 'COD'
  });

  // Persist form and step in localStorage to survive refreshes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('checkoutForm');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.formData) setFormData(parsed.formData);
        if (typeof parsed?.activeStep === 'number') setActiveStep(parsed.activeStep);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('checkoutForm', JSON.stringify({ formData, activeStep }));
    } catch {}
  }, [formData, activeStep]);

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 99;
  const total = subtotal + shippingCost;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0: // Personal Details
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setSnackbar({ open: true, message: 'Please fill in all personal details', severity: 'error' });
          return false;
        }
        break;
      case 1: // Shipping Address
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          setSnackbar({ open: true, message: 'Please fill in all shipping details', severity: 'error' });
          return false;
        }
        break;
      case 2: // Payment Method
        if (!formData.paymentMethod) {
          setSnackbar({ open: true, message: 'Please select a payment method', severity: 'error' });
          return false;
        }
        break;
    }
    return true;
  };

  const placeOrder = async () => {
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          phone: formData.phone || user?.phone || '',
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        totalPrice: total,
      };

      await ordersAPI.create(orderPayload);
      setShowSuccessDialog(true);
    } catch (error) {
      setSnackbar({ open: true, message: error?.response?.data?.message || 'Failed to place order', severity: 'error' });
    }
  };

  const handlePayment = async () => {
    try {
      switch (formData.paymentMethod) {
        case 'COD':
          await placeOrder();
          break;
        case 'PhonePe':
          setShowQRDialog(true);
          break;
        case 'GooglePay':
          // Google Pay will be handled by the button component
          break;
        default:
          setSnackbar({ open: true, message: 'Invalid payment method', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
    }
  };

  const handleGooglePaySuccess = async (paymentData) => {
    console.log('Google Pay Success:', paymentData);
    await placeOrder();
  };

  const handleOrderSuccess = async () => {
    setShowSuccessDialog(false);
    await clearCart(); // Clear cart after successful order
    navigate('/profile');
  };

  const renderPersonalDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </Grid>
    </Grid>
  );

  const renderShippingAddress = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={3}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State"
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Pincode"
          value={formData.pincode}
          onChange={(e) => handleInputChange('pincode', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Landmark (Optional)"
          value={formData.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderPaymentMethod = () => (
    <Box>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <FormLabel component="legend" sx={{ color: 'var(--text-dark)', fontWeight: 600, mb: 2 }}>
          Select Payment Method
        </FormLabel>
        <RadioGroup
          value={formData.paymentMethod}
          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
        >
          <FormControlLabel
            value="COD"
            control={<Radio sx={{ color: 'var(--primary-green)' }} />}
            label={
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Cash on Delivery</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Pay when you receive your order
                </Typography>
              </Box>
            }
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            value="PhonePe"
            control={<Radio sx={{ color: 'var(--primary-green)' }} />}
            label={
              <Box>
                <Typography sx={{ fontWeight: 600 }}>PhonePe</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Pay using PhonePe UPI
                </Typography>
              </Box>
            }
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            value="GooglePay"
            control={<Radio sx={{ color: 'var(--primary-green)' }} />}
            label={
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Google Pay</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Pay using Google Pay
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>

      {formData.paymentMethod === 'GooglePay' && (
        <Box sx={{ mt: 3 }}>
          <GooglePayButton
            environment="TEST"
            paymentRequest={{
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                  allowedCardNetworks: ['MASTERCARD', 'VISA'],
                },
                tokenizationSpecification: {
                  type: 'PAYMENT_GATEWAY',
                  parameters: {
                    gateway: 'example',
                    gatewayMerchantId: 'exampleGatewayMerchantId',
                  },
                },
              }],
              merchantInfo: {
                merchantId: '12345678901234567890',
                merchantName: 'The Coffee Shop',
              },
              transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPriceLabel: 'Total',
                totalPrice: total.toFixed(2),
                currencyCode: 'INR',
                countryCode: 'IN',
              },
            }}
            onLoadPaymentData={handleGooglePaySuccess}
            onError={(error) => {
              setSnackbar({ open: true, message: 'Google Pay payment failed', severity: 'error' });
            }}
          />
        </Box>
      )}

      {formData.paymentMethod === 'PhonePe' && (
        <Box sx={{ mt: 3 }}>
          <PhonePePayButton
            paymentRequest={{
              apiVersion: 1,
              apiVersionMinor: 0,
              allowedPaymentMethods: [{
                type: 'UPI',
                parameters: { allowedApps: ['com.phonepe.app'] }
              }],
              merchantInfo: {
                merchantId: 'PHONEPE_DEMO_MERCHANT',
                merchantName: 'The Coffee Shop',
              },
              transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPriceLabel: 'Total',
                totalPrice: total.toFixed(2),
                currencyCode: 'INR',
                countryCode: 'IN',
              },
            }}
            onClick={() => {
              try {
                setShowQRDialog(true);
              } catch (e) {
                setSnackbar({ open: true, message: 'PhonePe init failed', severity: 'error' });
            }
            }}
            onError={() => setSnackbar({ open: true, message: 'PhonePe payment failed', severity: 'error' })}
          />
        </Box>
      )}
    </Box>
  );

  const renderOrderReview = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'var(--text-dark)', fontWeight: 600 }}>
        Order Summary
      </Typography>
      
      <List>
        {cartItems.map((item) => (
          <ListItem key={item.id} sx={{ px: 0 }}>
            <ListItemText
              primary={item.name}
              secondary={`Quantity: ${item.quantity}`}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            <Typography sx={{ fontWeight: 600 }}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Typography>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem sx={{ px: 0 }}>
          <ListItemText primary="Subtotal" />
          <Typography sx={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</Typography>
        </ListItem>
        <ListItem sx={{ px: 0 }}>
          <ListItemText primary="Shipping" />
          <Typography sx={{ fontWeight: 600 }}>₹{shippingCost.toFixed(2)}</Typography>
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <ListItem sx={{ px: 0 }}>
          <ListItemText 
            primary="Total" 
            primaryTypographyProps={{ fontWeight: 700, variant: 'h6' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
            ₹{total.toFixed(2)}
          </Typography>
        </ListItem>
      </List>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-dark)', fontWeight: 600 }}>
          Shipping Details
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Name:</strong> {formData.firstName} {formData.lastName}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Phone:</strong> {formData.phone}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Address:</strong> {formData.address}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>City:</strong> {formData.city}, {formData.state} - {formData.pincode}
        </Typography>
        {formData.landmark && (
          <Typography sx={{ mb: 1 }}>
            <strong>Landmark:</strong> {formData.landmark}
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-dark)', fontWeight: 600 }}>
          Payment Method
        </Typography>
        <Chip 
          label={formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 
                 formData.paymentMethod === 'PhonePe' ? 'PhonePe UPI' : 'Google Pay'}
          color="primary"
          variant="outlined"
        />
      </Box>
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderShippingAddress();
      case 2:
        return renderPaymentMethod();
      case 3:
        return renderOrderReview();
      default:
        return null;
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
              Checkout
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <StyledCard sx={{ mb: 4, p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </StyledCard>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <StyledCard sx={{ p: 4 }}>
              <CardContent>
                {renderStepContent(activeStep)}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <StyledCard sx={{ p: 3, position: 'sticky', top: '100px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: 'var(--text-dark)', fontWeight: 600 }}>
                  Order Summary
                </Typography>
                
                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`Qty: ${item.quantity}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                      <Typography sx={{ fontSize: '0.9rem' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary="Subtotal" />
                    <Typography>₹{subtotal.toFixed(2)}</Typography>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary="Shipping" />
                    <Typography>₹{shippingCost.toFixed(2)}</Typography>
                  </ListItem>
                  <Divider sx={{ my: 2 }} />
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary="Total" 
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      ₹{total.toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <StyledButton
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </StyledButton>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <StyledButton
                onClick={handlePayment}
                disabled={formData.paymentMethod === 'GooglePay'}
              >
                Place Order
              </StyledButton>
            ) : (
              <StyledButton onClick={handleNext}>
                Next
              </StyledButton>
            )}
          </Box>
        </Box>
      </Container>

      {/* PhonePe Payment Dialog (sheet-like, similar to Google Pay) */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">PhonePe Payment</Typography>
            <IconButton onClick={() => setShowQRDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>UPI</Typography>
              <Chip label="Test Mode" size="small" />
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f9f9ff', border: '1px solid #ede7f6' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                Total payable
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'var(--text-muted)' }}>
              Your payment method won't be charged because you're in a test environment
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowQRDialog(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              setShowQRDialog(false);
              await placeOrder();
            }}
            variant="contained"
            sx={{
              backgroundColor: '#5F259F',
              '&:hover': { backgroundColor: '#4b1d7d' }
            }}
          >
            Pay with PhonePe
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={handleOrderSuccess} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'var(--primary-green)', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-dark)' }}>
              Order Placed Successfully!
            </Typography>
            <Typography sx={{ mb: 3, color: 'var(--text-muted)' }}>
              Your order has been confirmed. You will receive an email with order details shortly.
            </Typography>
            <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 600 }}>
              Order Total: ₹{total.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrderSuccess} variant="contained" fullWidth>
            View Orders
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;
