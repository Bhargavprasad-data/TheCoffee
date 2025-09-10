import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #0f3d33 0%, #12483b 100%)',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* dotted pattern like screenshot */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <Box component="img" src="/images/coffee-bean.svg" alt="coffee cup" sx={{ width: 24, height: 24 }} /> Guru's Coffee
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              We are passionate about bringing you the finest coffee from around the world.
              Our carefully selected beans are roasted to perfection to give you the best
              coffee experience.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'var(--accent-yellow)' }} />
              <Typography variant="body2">
                123 Coffee Street, Visakhapatnam City, BC 12345
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1, color: 'var(--accent-yellow)' }} />
              <Typography variant="body2">
                8280207839
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'var(--accent-yellow)' }} />
              <Typography variant="body2">
                info@thecoffee.com
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Follow Us
            </Typography>
            <Box>
              <IconButton
                component={Link}
                href="https://facebook.com"
                target="_blank"
                color="inherit"
                sx={{ width: 44, height: 44, backgroundColor: 'var(--accent-yellow)', color: 'var(--text-dark)', mr: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', '&:hover': { backgroundColor: 'var(--warm-yellow)' } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://twitter.com"
                target="_blank"
                color="inherit"
                sx={{ width: 44, height: 44, backgroundColor: 'var(--accent-yellow)', color: 'var(--text-dark)', mr: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', '&:hover': { backgroundColor: 'var(--warm-yellow)' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.instagram.com/gurusarakucoffee/"
                target="_blank"
                color="inherit"
                sx={{ width: 44, height: 44, backgroundColor: 'var(--accent-yellow)', color: 'var(--text-dark)', mr: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', '&:hover': { backgroundColor: 'var(--warm-yellow)' } }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Subscribe to our newsletter for updates and special offers!
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.2)', pt: 2 }}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Coffee Shop. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;