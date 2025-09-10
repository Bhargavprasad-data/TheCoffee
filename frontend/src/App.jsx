import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Shop from './components/pages/Shop';
import ProductDetails from './components/pages/ProductDetails';
import Cart from './components/pages/Cart';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import Profile from './components/pages/Profile';
import Checkout from './components/pages/Checkout';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import Orders from './components/pages/Orders';
import TrackOrder from './components/pages/TrackOrder';
import AgentConsole from './components/pages/AgentConsole';
import AdminDashboard from './components/admin/Dashboard';
import AdminProducts from './components/admin/Products';
import AdminOrders from './components/admin/Orders';
import AdminUsers from './components/admin/Users';
import AdminSales from './components/admin/Sales';
import AdminLogin from './components/admin/AdminLogin';
import AdminSignup from './components/admin/AdminSignup';
// Live tracking pages removed
import ProtectedRoute from './components/ProtectedRoute';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3932', // Dark forest green
      light: '#d4e9e2', // Light mint green
      dark: '#006241', // Starbucks green
    },
    secondary: {
      main: '#ffd700', // Bright yellow accent
      light: '#f4d03f', // Warm yellow
      dark: '#f39c12', // Darker yellow
    },
    text: {
      primary: '#1e3932',
      secondary: '#6b7177',
    },
    background: {
      default: '#d4e9e2',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      letterSpacing: '1px',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      letterSpacing: '1px',
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    h4: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(30, 57, 50, 0.1)',
    '0 4px 16px rgba(30, 57, 50, 0.15)',
    '0 8px 32px rgba(30, 57, 50, 0.2)',
    '0 16px 64px rgba(30, 57, 50, 0.25)',
    '0 32px 128px rgba(30, 57, 50, 0.3)',
    '0 2px 8px rgba(30, 57, 50, 0.1)',
    '0 4px 16px rgba(30, 57, 50, 0.15)',
    '0 8px 32px rgba(30, 57, 50, 0.2)',
    '0 16px 64px rgba(30, 57, 50, 0.25)',
    '0 32px 128px rgba(30, 57, 50, 0.3)',
    '0 2px 8px rgba(30, 57, 50, 0.1)',
    '0 4px 16px rgba(30, 57, 50, 0.15)',
    '0 8px 32px rgba(30, 57, 50, 0.2)',
    '0 16px 64px rgba(30, 57, 50, 0.25)',
    '0 32px 128px rgba(30, 57, 50, 0.3)',
    '0 2px 8px rgba(30, 57, 50, 0.1)',
    '0 4px 16px rgba(30, 57, 50, 0.15)',
    '0 8px 32px rgba(30, 57, 50, 0.2)',
    '0 16px 64px rgba(30, 57, 50, 0.25)',
    '0 32px 128px rgba(30, 57, 50, 0.3)',
    '0 2px 8px rgba(30, 57, 50, 0.1)',
    '0 4px 16px rgba(30, 57, 50, 0.15)',
    '0 8px 32px rgba(30, 57, 50, 0.2)',
    // index 24 padding to prevent MUI elevation warnings
    '0 64px 256px rgba(30, 57, 50, 0.35)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'uppercase',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: '#1e3932',
          color: 'white',
          '&:hover': {
            backgroundColor: '#006241',
          },
        },
        outlined: {
          borderColor: '#1e3932',
          color: '#1e3932',
          '&:hover': {
            borderColor: '#006241',
            color: '#006241',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(30, 57, 50, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(30, 57, 50, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#1e3932',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1e3932',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7177',
            '&.Mui-focused': {
              color: '#1e3932',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d4e9e2',
          color: '#1e3932',
          boxShadow: '0 2px 8px rgba(30, 57, 50, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <ProductProvider>
            <Router>
            <div className="app" style={{ 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#d4e9e2'
            }}>
              <Navbar />
              <Sidebar />
              <main className="main-content" style={{ flex: 1, paddingTop: '80px' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Signup />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id/track" element={<TrackOrder />} />
                  <Route path="/agent" element={<AgentConsole />} />
                  
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin>{<AdminDashboard />}</ProtectedRoute>} />
                  
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/signup" element={<AdminSignup />} />
                  <Route path="/admin/products" element={<ProtectedRoute requireAdmin>{<AdminProducts />}</ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute requireAdmin>{<AdminOrders />}</ProtectedRoute>} />
                  <Route path="/admin/sales" element={<ProtectedRoute requireAdmin>{<AdminSales />}</ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute requireAdmin>{<AdminUsers />}</ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
                          </div>
            </Router>
          </ProductProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
