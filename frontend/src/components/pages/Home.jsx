import { Box, Button, Container, Grid, Typography, Card, CardMedia, CardContent, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Star as StarIcon, LocalCafe as LocalCafeIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useProducts } from '../../context/ProductContext';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)',
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  color: 'var(--text-dark)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.03) 3px, transparent 3px),
      radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.03) 3px, transparent 3px),
      radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.03) 3px, transparent 3px),
      radial-gradient(circle at 90% 20%, rgba(139, 69, 19, 0.03) 3px, transparent 3px),
      radial-gradient(circle at 10% 60%, rgba(139, 69, 19, 0.03) 3px, transparent 3px)
    `,
    backgroundSize: '120px 120px, 100px 100px, 140px 140px, 90px 90px, 110px 110px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& .coffee-ribbon': {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    height: 60,
    transform: 'skewY(-5deg)',
    background: 'linear-gradient(90deg, #2a544a, #0f3d33)',
    boxShadow: 'var(--shadow-medium)'
  }
}));

const ProductStrip = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
  padding: '1rem 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  overflowX: 'auto',
  transform: 'skewY(-3deg)',
  margin: '-1rem 0 1.5rem',
  position: 'relative',
  boxShadow: 'var(--shadow-medium)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.12) 2px, transparent 2px),
      radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.12) 2px, transparent 2px)
    `,
    backgroundSize: '80px 80px, 60px 60px',
    pointerEvents: 'none',
  },
  '&::-webkit-scrollbar': {
    display: 'none'
  },
}));

const RibbonContent = styled(Box)(({ theme }) => ({
  transform: 'skewY(2deg)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  flexWrap: 'wrap',
  padding: '1rem 2rem',
  position: 'relative',
  zIndex: 1,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--primary-green)',
  color: 'white',
  borderRadius: '50px',
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

const CoffeeBeanDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60px',
  height: '40px',
  background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.1) 0%, transparent 70%)',
  borderRadius: '50%',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40px',
    height: '25px',
    background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

// Items to display on the ribbons
const COFFEE_ITEMS = ['Cappuccino', 'Espresso', 'Mocha', 'Latte', 'Americano'];

function Home() {
  const navigate = useNavigate();
  const { getFeaturedProducts } = useProducts();
  const featuredProducts = getFeaturedProducts();

  return (
    <Box className="coffee-bean-outline">
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  color: 'var(--text-dark)',
                  fontWeight: 700,
                  mb: 4,
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                className="heading-primary"
              >
                SIP THAT<br />
                COMPLETES<br />
                YOUR DAY
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: 'var(--text-dark)',
                    fontWeight: 700,
                    mr: 2
                  }}
                >
                  1M+
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff6b6b' }}>C</Avatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#4ecdc4' }}>C</Avatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#45b7d1' }}>C</Avatar>
                </Box>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'var(--text-dark)',
                  fontWeight: 500,
                  mb: 4
                }}
              >
                Satisfied Customer
              </Typography>
              
              <Typography 
                variant="h6" 
                paragraph 
                sx={{ 
                  maxWidth: '600px', 
                  mb: 4,
                  color: 'var(--text-muted)',
                  lineHeight: 1.8
                }}
              >
                Complete your day with the perfect balance of warmth and flavor in every cup, bringing energy and life to every moment.
              </Typography>
              
              <StyledButton
                size="large"
                onClick={() => navigate('/shop')}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 4,
                  py: 2,
                  mr: 2
                }}
              >
                Shop Now
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  →
                </Box>
              </StyledButton>

              {/* Admin Access Button */}
              {/* <StyledButton
                size="large"
                onClick={() => navigate('/admin/login')}
                startIcon={<AdminIcon />}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 4,
                  py: 2,
                  backgroundColor: 'var(--accent-yellow)',
                  color: 'var(--text-dark)',
                  '&:hover': {
                    backgroundColor: 'var(--warm-yellow)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-medium)',
                  },
                }}
              >
                Admin Panel
              </StyledButton> */}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Coffee Bean Decorations */}
                <CoffeeBeanDecoration sx={{ top: '10%', left: '10%', opacity: 0.7 }} />
                <CoffeeBeanDecoration sx={{ top: '20%', right: '15%', opacity: 0.7 }} />
                <CoffeeBeanDecoration sx={{ bottom: '30%', left: '5%', opacity: 0.7 }} />
                
                {/* Main Coffee Image Container */}
                <Box sx={{
                  width: 400,
                  height: 400,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: 'var(--shadow-heavy)',
                }}>
                  <Box sx={{
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    backgroundColor: 'var(--light-mint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <LocalCafeIcon sx={{ 
                      fontSize: 120, 
                      color: 'var(--primary-green)',
                      opacity: 0.8
                    }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>
      <ProductStrip>
        <RibbonContent>
          {COFFEE_ITEMS.map((label) => (
            <Typography key={`green-${label}`} variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
              {label}
            </Typography>
          ))}
        </RibbonContent>
      </ProductStrip>

      {/* Yellow Ribbon */}
      <Box sx={{
        background:  '#FFD919',
        backgroundImage: 'linear-gradient(135deg, var(--accent-yellow) 0%, var(--warm-yellow) 100%)',
        padding: '1.25rem 0',
        transform: 'skewY(3deg)',
        margin: '0.5rem 0 1.5rem',
        position: 'relative',
        minHeight: 56,
        boxShadow: 'var(--shadow-medium)',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.12) 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.12) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px, 40px 40px',
          pointerEvents: 'none',
        }
      }}>
        <Box sx={{ transform: 'skewY(-3deg)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 4 }}>
          {COFFEE_ITEMS.map((label) => (
            <Typography key={`yellow-${label}`} variant="h6" sx={{ color: 'var(--text-dark)', fontWeight: 900 }}>
              {label}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{
            textAlign: 'center',
            color: 'var(--text-dark)',
            fontWeight: 700,
            mb: 6,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          className="heading-primary"
        >
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card className="card-coffee" sx={{ height: '100%' }}>
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'var(--primary-green)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  zIndex: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  Featured
                </Box>
                <CardMedia
                  component="img"
                  height="300"
                  image={product.imageUrl || product.image}
                  alt={product.name}
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#f9f9f9',
                    p: 2
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flexGrow: 1, color: 'var(--text-dark)' }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ color: 'var(--accent-yellow)', fontSize: 20 }} />
                      <Typography sx={{ color: 'var(--text-dark)', fontWeight: 'medium' }}>
                        {product.rating}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'var(--text-muted)', mb: 2, minHeight: '48px' }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 'bold', mb: 2 }}>
                    ₹{product.price.toFixed(2)}
                  </Typography>
                  <StyledButton
                    fullWidth
                    onClick={() => navigate(`/product/${product.id}`)}
                    sx={{ mb: 1 }}
                  >
                    Order Now
                  </StyledButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Why Choose OCOFFEE? Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          mb: 4,
          backgroundColor: '#f9f9f9',
          py: 8,
          px: 2,
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden'
        }} className="coffee-bean-bg">
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{
              color: 'var(--text-dark)',
              fontWeight: 700,
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            className="heading-primary"
          >
            Why Choose Guru's COFFEE?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{
                backgroundColor: 'white',
                p: 4,
                borderRadius: '16px',
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <Box sx={{ 
                  width: '64px', 
                  height: '64px',
                  backgroundColor: 'var(--light-mint)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <img src="/images/coffee-bean.svg" alt="Premium Quality" width="32" height="32" />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  Premium Quality
                </Typography>
                <Typography sx={{ color: 'var(--text-muted)' }}>
                  We source only the finest coffee beans from sustainable farms worldwide.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                backgroundColor: 'white',
                p: 4,
                borderRadius: '16px',
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <Box sx={{ 
                  width: '64px', 
                  height: '64px',
                  backgroundColor: 'var(--light-mint)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <img src="/images/roasting.svg" alt="Expert Roasting" width="32" height="32" />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  Expert Roasting
                </Typography>
                <Typography sx={{ color: 'var(--text-muted)' }}>
                  Our master roasters bring out the unique flavors in every carefully crafted batch.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                backgroundColor: 'white',
                p: 4,
                borderRadius: '16px',
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <Box sx={{ 
                  width: '64px', 
                  height: '64px',
                  backgroundColor: 'var(--light-mint)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <img src="/images/delivery.svg" alt="Fast Delivery" width="32" height="32" />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  Fast Delivery
                </Typography>
                <Typography sx={{ color: 'var(--text-muted)' }}>
                  Fresh coffee delivered to your doorstep across India within 24 hours.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;