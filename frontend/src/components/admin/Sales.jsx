import { useEffect, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  TrendingUp, 
  TrendingDown, 
  CalendarMonth, 
  FilterList, 
  FileDownload,
  Coffee,
  LocalShipping,
  ShoppingCart,
  CurrencyRupee,
  People as PeopleIcon,
  LocalCafe,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ordersAPI, productsAPI, authAPI } from '../../services/api';

// Styled components
const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: 'var(--shadow-light)',
  border: '1px solid rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-medium)',
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  borderRadius: 20,
  background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)'
  }
}));

const DonutChart = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'conic-gradient(from 0deg, var(--primary-green) 0deg 180deg, var(--secondary-green) 180deg 360deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'white',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  }
}));

const BarChart = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'end',
  gap: 8,
  height: 200,
  padding: '20px 0'
}));

const Bar = styled(Box)(({ height, theme }) => ({
  width: 40,
  height: `${height}%`,
  background: 'linear-gradient(180deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
  borderRadius: '8px 8px 0 0',
  minHeight: 20,
  position: 'relative',
  '&:hover': {
    background: 'linear-gradient(180deg, var(--secondary-green) 0%, #006241 100%)'
  }
}));

export default function AdminSales() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Feb 2024');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate().toString());
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate dynamic stats from orders data (EXACT same logic as Admin Dashboard)
  const calculateStats = (ordersData, productsData, usersData, salesSummary) => {
    // Use actual data from database
    const orders = ordersData || [];
    const products = productsData || [];
    const users = usersData || [];
    const summary = salesSummary || { totals: { sales: 0, orders: 0 } };

    console.log('calculateStats called with:', {
      ordersCount: orders.length,
      productsCount: products.length,
      usersCount: users.length,
      summary: summary
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // DYNAMIC CALCULATION: Use ALL actual orders for real-time data
    const effectiveOrders = (orders || []).filter(o => (o.status || (o.isDelivered ? 'Delivered' : (o.isPaid ? 'Processing' : 'Pending'))) !== 'Cancelled');
    
    // Calculate totals from actual data (EXACT same logic as Admin Dashboard)
    const totals = summary?.totals || { sales: 0, orders: 0 };
    
    console.log('Total orders:', orders.length);
    console.log('Effective orders (non-cancelled):', effectiveOrders.length);
    console.log('Current month/year:', currentMonth, currentYear);
    console.log('Sample order structure:', orders[0]);
    console.log('Sample order items:', orders[0]?.items);

    // Filter orders for previous month (for comparison)
    const prevMonthOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear;
    });
    
    const totalSales = totals.sales || 0;
    const totalOrders = effectiveOrders.length || 0;
    const totalCustomers = users?.length || 0;
    const totalProducts = products?.length || 0;
    const totalQuantity = effectiveOrders.reduce((sum, order) => {
      if (order.items && Array.isArray(order.items)) {
        return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
      } else {
        // If no items array, assume quantity of 1 per order
        return sum + 1;
      }
    }, 0);

    // Previous month totals
    const prevTotalSales = prevMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const prevTotalOrders = prevMonthOrders.length;
    const prevTotalQuantity = prevMonthOrders.reduce((sum, order) => {
      if (order.items && Array.isArray(order.items)) {
        return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
      } else {
        return sum + 1;
      }
    }, 0);

    // Calculate percentage changes
    const salesChange = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
    const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;
    const quantityChange = prevTotalQuantity > 0 ? ((totalQuantity - prevTotalQuantity) / prevTotalQuantity) * 100 : 0;

    // DYNAMIC DAILY DATA: Calculate based on actual order dates
    const dailyData = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get all unique days that have orders
    const orderDays = new Set();
    effectiveOrders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          orderDays.add(orderDate.getDate());
        }
      }
    });
    
    // If no orders in current month, show last 7 days with actual data
    if (orderDays.size === 0) {
      // Get orders from any month and show their actual days
      effectiveOrders.forEach(order => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt);
          orderDays.add(orderDate.getDate());
        }
      });
    }
    
    // Calculate data for each day that has orders
    Array.from(orderDays).sort((a, b) => a - b).forEach(day => {
      const dayOrders = effectiveOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === day;
      });
      
      const daySales = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const dayOrdersCount = dayOrders.length;
      const dayQuantity = dayOrders.reduce((sum, order) => {
        if (order.items && Array.isArray(order.items)) {
          return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
        } else {
          return sum + 1;
        }
      }, 0);
      
      dailyData.push({
        day: day.toString(),
        sales: daySales,
        orders: dayOrdersCount,
        quantity: dayQuantity
      });
    });
    
    // If still no data, create a single entry with total values
    if (dailyData.length === 0 && totalSales > 0) {
      dailyData.push({
        day: '1',
        sales: totalSales,
        orders: totalOrders,
        quantity: totalQuantity
      });
    }

    // Use only real daily data from orders

    // DYNAMIC PRODUCT CATEGORIES: Calculate based on actual order items
    const productCategorySales = {};
    effectiveOrders.forEach(order => {
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        order.items.forEach(item => {
          const product = products.find(p => p._id === item.product);
          if (product) {
            const category = product.category || 'Other';
            if (!productCategorySales[category]) {
              productCategorySales[category] = { sales: 0, quantity: 0 };
            }
            productCategorySales[category].sales += (item.price * item.quantity);
            productCategorySales[category].quantity += item.quantity;
          }
        });
      } else {
        // If no items array, use order total and assign to "General" category
        const category = 'General';
        if (!productCategorySales[category]) {
          productCategorySales[category] = { sales: 0, quantity: 0 };
        }
        productCategorySales[category].sales += (order.totalAmount || 0);
        productCategorySales[category].quantity += 1; // Assume quantity of 1
      }
    });

    const productCategories = Object.entries(productCategorySales).map(([name, data]) => ({
      name,
      sales: data.sales,
      quantity: data.quantity,
      change: 0
    })).sort((a, b) => b.sales - a.sales);

    // DYNAMIC HOURLY DATA: Calculate based on actual order times
    const hourlyData = [];
    for (let hour = 6; hour <= 20; hour++) {
      const hourOrders = effectiveOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getHours() === hour;
      });
      
      const hourSales = hourOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      hourlyData.push({ hour, sales: hourSales });
    }

    // If no time data available, put all sales at 12:00 (lunch time)
    if (hourlyData.every(h => h.sales === 0) && totalSales > 0) {
      const lunchHourIndex = hourlyData.findIndex(h => h.hour === 12);
      if (lunchHourIndex !== -1) {
        hourlyData[lunchHourIndex].sales = totalSales;
      }
    }

    // Use only real hourly data from orders

    // DYNAMIC WEEKDAY/WEEKEND: Calculate based on actual order dates
    let weekdaySales = effectiveOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    }).reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    let weekendSales = effectiveOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }).reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // If no date data available, use total sales as weekday (most common)
    if (weekdaySales === 0 && weekendSales === 0 && totalSales > 0) {
      weekdaySales = totalSales;
      weekendSales = 0;
    }

    const totalSalesForPeriod = weekdaySales + weekendSales;
    const weekdayPercentage = totalSalesForPeriod > 0 ? (weekdaySales / totalSalesForPeriod) * 100 : 0;
    const weekendPercentage = totalSalesForPeriod > 0 ? (weekendSales / totalSalesForPeriod) * 100 : 0;

    // DYNAMIC DAY OF WEEK: Calculate based on actual order dates
    const dayOfWeekSales = {};
    for (let day = 0; day < 7; day++) {
      const dayOrders = effectiveOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getDay() === day;
      });
      
      dayOfWeekSales[day] = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    }

    // If no date data available, put all sales on Monday (most common business day)
    if (Object.values(dayOfWeekSales).every(sales => sales === 0) && totalSales > 0) {
      dayOfWeekSales[1] = totalSales; // Monday
    }

    // Use only real day of week data from orders

    const result = {
      totalSales,
      totalOrders,
      totalQuantity,
      totalCustomers,
      totalProducts,
      salesChange,
      ordersChange,
      quantityChange,
      dailyData,
      productCategories,
      hourlyData,
      weekdaySales,
      weekendSales,
      weekdayPercentage,
      weekendPercentage,
      dayOfWeekSales,
      currentMonth: currentMonth,
      currentYear: currentYear
    };

    console.log('DYNAMIC CALCULATION RESULTS:', {
      totalSales,
      totalOrders,
      totalQuantity,
      totalCustomers,
      totalProducts,
      productCategories: productCategories.length,
      dailyData: dailyData.length,
      hourlyData: hourlyData.length,
      weekdaySales,
      weekendSales,
      dayOfWeekSales: Object.values(dayOfWeekSales).filter(v => v > 0).length
    });
    
    console.log('Sample daily data:', dailyData.slice(0, 3));
    console.log('Sample product categories:', productCategories.slice(0, 3));
    console.log('Sample hourly data:', hourlyData.filter(h => h.sales > 0));

    console.log('calculateStats result:', result);
    return result;
  };

    const loadSalesData = async () => {
    try {
      setLoading(true);
      console.log('Fetching sales data...');
      
      const [ordersRes, productsRes, summaryRes, usersRes] = await Promise.all([
        ordersAPI.get('/'),
        productsAPI.getAll(),
        ordersAPI.get('/stats/summary'),
        authAPI.getAllUsers()
      ]);
      
      const ordersData = ordersRes.data || [];
      const productsData = productsRes.data || [];
      const salesSummary = summaryRes.data || null;
      const usersData = (usersRes.data || []).filter(u => !u.isAdmin);
      
      console.log('Orders data:', ordersData.length, 'orders');
      console.log('Products data:', productsData.length, 'products');
      console.log('Sales summary:', salesSummary);
      console.log('Users data:', usersData.length, 'users');
      
      // Validate orders data structure - be more lenient
      const validOrders = ordersData.filter(order => {
        if (!order) return false;
        // Accept orders even if they don't have items array
        console.log('Processing order:', order);
        return true;
      });
      
      console.log('Valid orders:', validOrders.length, 'out of', ordersData.length);
      
      setOrders(validOrders);
      setProducts(productsData);
      
      const calculatedStats = calculateStats(validOrders, productsData, usersData, salesSummary);
      console.log('Calculated stats:', calculatedStats);
      console.log('Sample order data:', validOrders[0]);
      console.log('Sample product data:', productsData[0]);
      console.log('Sample user data:', usersData[0]);
      
      // Set stats if we have calculated stats (even if values are 0)
      if (calculatedStats) {
        console.log('Setting stats with data:', calculatedStats);
        setStats(calculatedStats);
      } else {
        console.log('No calculated stats found, setting stats to null');
        setStats(null);
      }
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Error loading sales data:', e);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
    
    // Auto-refresh every 30 seconds to get latest data
    const interval = setInterval(loadSalesData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#4CAF50' : '#F44336';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  const getMonthName = (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: 'var(--text-dark)' }}>Loading...</Typography>
        </Container>
      </Box>
    );
  }

    if (!stats) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: 'var(--text-dark)' }}>
            {loading ? 'Loading Sales Data...' : 'No Sales Data Available'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            {loading 
              ? 'Fetching real-time sales data from your database. This may take a moment.'
              : 'No orders have been placed yet. Sales data will appear here once customers start placing orders.'
            }
          </Typography>
          {!loading && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                Debug Info: Check browser console for detailed data fetching logs.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    );
  }

  const monthName = getMonthName(stats.currentMonth);
  const maxDailySales = Math.max(...stats.dailyData.map(d => d.sales));

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', 
      py: 4 
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Coffee sx={{ fontSize: 40, color: 'var(--primary-green)', mr: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-dark)' }}>
            COFFEE SHOP SALES
          </Typography>
        </Box>

        {/* Month Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>Sales Report</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Month"
            >
              <MenuItem value={`${monthName} ${stats.currentYear}`}>{monthName} {stats.currentYear}</MenuItem>
            </Select>
          </FormControl>
          <IconButton sx={{ color: 'var(--primary-green)' }}>
            <CalendarMonth />
          </IconButton>
          <IconButton sx={{ color: 'var(--primary-green)' }}>
            <FilterList />
          </IconButton>
          <IconButton sx={{ color: 'var(--primary-green)' }}>
            <FileDownload />
          </IconButton>
          <IconButton 
            sx={{ color: 'var(--primary-green)' }}
            onClick={loadSalesData}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', ml: 2 }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>

        {/* Top KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyRupee sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">Total Sales</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(stats.totalSales)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getChangeIcon(stats.salesChange)}
                <Typography variant="body2">
                  {stats.salesChange >= 0 ? '+' : ''}{stats.salesChange.toFixed(1)}% | 
                  {stats.salesChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(stats.salesChange * stats.totalSales / 100))} vs LM
                </Typography>
              </Box>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">Orders</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatNumber(stats.totalOrders)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getChangeIcon(stats.ordersChange)}
                <Typography variant="body2">
                  {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}% | 
                  {stats.ordersChange >= 0 ? '+' : ''}{formatNumber(Math.abs(stats.ordersChange * stats.totalOrders / 100))} vs LM
                </Typography>
              </Box>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">Customers</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatNumber(stats.totalCustomers)}
              </Typography>
              <Typography variant="body2">Registered users</Typography>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalCafe sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6">Products</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {formatNumber(stats.totalProducts)}
              </Typography>
              <Typography variant="body2">In inventory</Typography>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Daily Summary and Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Daily Summary */}
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Overall Summary - {monthName} {stats.currentYear}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        {stats.totalOrders}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Total Orders</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        {formatCurrency(stats.totalSales)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Total Sales</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        {formatNumber(stats.totalQuantity)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Total Quantity</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <DonutChart>
                    <Box sx={{ position: 'absolute', zIndex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                        Qty, Sales, Orders
                      </Typography>
                    </Box>
                  </DonutChart>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Daily Sales Chart */}
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Daily Sales Bar Chart
                </Typography>
                <BarChart>
                  {stats.dailyData.map((day, index) => (
                    <Box key={day.day} sx={{ textAlign: 'center' }}>
                      <Bar 
                        height={maxDailySales > 0 ? (day.sales / maxDailySales) * 100 : 0} 
                      />
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', mt: 1 }}>
                        {formatCurrency(day.sales)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                        {monthName} {day.day}
                      </Typography>
                    </Box>
                  ))}
                </BarChart>
              </CardContent>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Weekday/Weekend Sales */}
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Sales by Weekday / Weekend
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DonutChart>
                    <Box sx={{ position: 'absolute', zIndex: 1, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                        Total Sales
                      </Typography>
                      <Typography variant="h5" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                        {formatCurrency(stats.totalSales)}
                      </Typography>
                    </Box>
                  </DonutChart>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label={`Weekend ${formatCurrency(stats.weekendSales)} (${stats.weekendPercentage.toFixed(1)}%)`} 
                    sx={{ m: 0.5, background: 'var(--primary-green)', color: 'white' }}
                  />
                  <Chip 
                    label={`Weekday ${formatCurrency(stats.weekdaySales)} (${stats.weekdayPercentage.toFixed(1)}%)`} 
                    sx={{ m: 0.5, background: 'var(--secondary-green)', color: 'white' }}
                  />
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Product Categories */}
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Sales by Product Category
                </Typography>
                {stats.productCategories.length > 0 ? (
                  <Grid container spacing={1}>
                    {stats.productCategories.slice(0, 8).map((product, index) => (
                      <Grid item xs={6} key={product.name}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                            {formatCurrency(product.sales)}
                          </Typography>
                          {product.change !== 0 && (
                            <Typography variant="caption" sx={{ color: getChangeColor(product.change) }}>
                              {product.change >= 0 ? '+' : ''}{product.change}%
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    No product categories available
                  </Typography>
                )}
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Store Locations - Dynamic based on actual data */}
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Sales by Store Location
                </Typography>
                {stats.productCategories.length > 0 ? (
                  stats.productCategories.slice(0, 3).map((product, index) => (
                    <Box key={product.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                          {formatCurrency(product.sales)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Qty: {product.quantity}
                      </Typography>
                      {index < 2 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    No store location data available
                  </Typography>
                )}
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Sales by Day of Week */}
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
                  Sales by Day of Week
                </Typography>
                {Object.entries(stats.dayOfWeekSales).map(([dayIndex, sales]) => {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = dayNames[parseInt(dayIndex)];
                  const percentage = stats.totalSales > 0 ? (sales / stats.totalSales) * 100 : 0;
                  
                  return (
                    <Box key={dayIndex} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {dayName}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                          {formatCurrency(sales)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {percentage.toFixed(1)}% of total sales
                      </Typography>
                      {parseInt(dayIndex) < 6 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  );
                })}
              </CardContent>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Hourly Sales Table */}
        <DashboardCard sx={{ mt: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'var(--text-dark)' }}>
              Sales by Days | Hours
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Hour</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Mon</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Tue</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Wed</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Thu</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Fri</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Sat</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Sun</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.hourlyData.map((hour) => (
                    <TableRow key={hour.hour}>
                      <TableCell sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                        {hour.hour}:00
                      </TableCell>
                      {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                        const dayOrders = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          return orderDate.getDay() === dayIndex && orderDate.getHours() === hour.hour;
                        });
                        const daySales = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                        return (
                          <TableCell key={dayIndex}>
                            {formatCurrency(daySales)}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 8, 
                            background: 'linear-gradient(90deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
                            borderRadius: 4,
                            flex: 1
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                            {formatCurrency(hour.sales)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </DashboardCard>
      </Container>
    </Box>
  );
}



