import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ordersAPI } from '../../services/api';
// Live tracking removed; use manual checkpoints/dates only
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Password as PasswordIcon,
  Cancel as CancelIcon,
  DeleteForever as DeleteForeverIcon
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
  '&.view': {
    color: '#1976d2',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
    },
  },
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
}));

const initialOrders = [];

const orderStatuses = ['Pending', 'OrderPlaced', 'OrderConfirmed', 'Packed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Delayed', 'Cancelled', 'Returned'];

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Manual tracking inputs only (no GPS/live)
  const [checkpointForm, setCheckpointForm] = useState({ status: 'Processing', location: '', note: '', delayed: false, delayedReason: '', expectedDelivery: '' });
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const socketRef = useRef(null);
  const [adminOtp, setAdminOtp] = useState('');
  // Stepper/simulator removed
  // removed driver assign/live map state
  // removed live driver updates

  // Heuristic ETA: use backend provided expectedDelivery if available, else infer by status
  const computedETA = useMemo(() => {
    const explicit = trackingData?.expectedDelivery;
    if (explicit) return new Date(explicit);
    const status = selectedOrder?.status;
    const now = new Date();
    const addHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);
    const addDays = (d) => addHours(d * 24);
    if (status === 'OutForDelivery') return addHours(2);
    if (status === 'Shipped') return addDays(2);
    if (status === 'Packed') return addDays(3);
    if (status === 'OrderConfirmed' || status === 'Processing') return addDays(4);
    if (status === 'OrderPlaced' || status === 'Pending') return addDays(5);
    return null;
  }, [trackingData?.expectedDelivery, selectedOrder?.status]);

  const normalizeOrders = (data) => (data || []).map((o, index) => ({
          id: o._id || index + 1,
          customerName: o.user?.name || 'Customer',
          customerEmail: o.user?.email || '',
          customerPhone: o.shippingAddress?.phone || o.user?.phone || '',
          items: (o.orderItems || []).map(i => ({ 
            name: i.name, 
            quantity: i.quantity ?? i.qty, 
            price: i.price,
            description: i.product?.description || i.description || '',
            origin: i.product?.origin || i.origin || '',
            roastLevel: i.product?.roastLevel || i.roastLevel || '',
            weight: i.product?.weight || i.weight || '',
            category: i.product?.category || i.category || ''
          })),
          total: o.totalPrice || 0,
          status: o.status || (o.isDelivered ? 'Delivered' : (o.isPaid ? 'Processing' : 'Pending')),
          paymentMethod: o.paymentMethod || 'Online',
          orderDate: o.createdAt,
          deliveryDate: o.deliveredAt,
          shippingAddress: `${o.shippingAddress?.address || ''}, ${o.shippingAddress?.city || ''}, ${o.shippingAddress?.postalCode || ''}`.replace(/^[,\s]+|[,\s]+$/g, ''),
          trackingNumber: o._id?.slice(-8) || ''
        }));

  const reloadOrders = async () => {
      try {
        const { data } = await ordersAPI.get('/');
        setOrders(normalizeOrders(data));
      } catch (e) {
        setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to load orders', severity: 'error' });
      }
    };

  useEffect(() => {
    let isActive = true;
    reloadOrders();

    // Setup websocket for live updates
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('AdminOrders socket connected');
    });

    socket.on('orders:changed', () => { if (isActive) reloadOrders(); });
    // live driver sockets removed
    socket.on('order:status', (payload) => {
      const { orderId, status } = payload || {};
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    });
    socket.on('order:tracking', (payload) => {
      const { orderId, tracking } = payload || {};
      if (selectedOrder && selectedOrder.id === orderId) {
        setTrackingData(tracking || {});
      }
    });

    return () => {
      isActive = false;
      try { socket.off('orders:changed'); socket.off('order:status'); socket.off('order:tracking'); socket.disconnect(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  // Load tracking for selected order when dialog opens (socket will push updates afterwards)
  useEffect(() => {
    if (!openDialog || !selectedOrder?.id) return;
    let active = true;
    const loadTracking = async () => {
      try {
        setTrackingLoading(true);
        const { data } = await ordersAPI.getTracking(selectedOrder.id);
        if (!active) return;
        setTrackingData(data || {});
      } catch (e) {
        // silently ignore
      } finally {
        if (active) setTrackingLoading(false);
      }
    };
    loadTracking();
    // removed live driver map and subscription
    return () => { active = false; };
  }, [openDialog, selectedOrder?.id]);

  // removed live driver updates

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Manual checkpoints only

  const addCheckpoint = async () => {
    try {
      const payload = { status: checkpointForm.status, location: checkpointForm.location, note: checkpointForm.note };
      if (checkpointForm.expectedDelivery) {
        payload.expectedDelivery = checkpointForm.expectedDelivery;
      }
      if (typeof checkpointForm.delayed === 'boolean') {
        payload.delayed = checkpointForm.delayed;
      }
      if (checkpointForm.delayedReason) {
        payload.delayedReason = checkpointForm.delayedReason;
      }
      await ordersAPI.addCheckpoint(selectedOrder.id, payload);
      setSnackbar({ open: true, message: 'Checkpoint added', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to add checkpoint', severity: 'error' });
    }
  };

  const handleDeleteOrder = async (order) => {
    try {
      if (order.status !== 'Cancelled') {
        setSnackbar({ open: true, message: 'Only cancelled orders can be deleted. Cancel it first.', severity: 'warning' });
        return;
      }
      if (!window.confirm('Delete this cancelled order permanently?')) return;
      await ordersAPI.delete(order.id);
      setSnackbar({ open: true, message: 'Order deleted successfully!', severity: 'success' });
      await reloadOrders();
    } catch (e) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to delete order', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4caf50';
      case 'Shipped': return '#2196f3';
      case 'Processing': return '#ff9800';
      case 'Pending': return '#f44336';
      case 'Cancelled': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getTotalOrders = () => orders.length;
  const getTotalRevenue = () => orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const getDeliveredOrders = () => orders.filter(order => order.status === 'Delivered').length;
  const getPendingOrders = () => orders.filter(order => order.status === 'Pending').length;

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
            <ReceiptIcon sx={{ mr: 2, color: 'var(--primary-green)', fontSize: 40 }} />
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
              Order Management
            </Typography>
          </Box>
          {/* <Box>
            <StyledButton onClick={() => navigate('/agent')}>
              Delivery Agent Console
            </StyledButton>
          </Box> */}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {getTotalOrders()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Total Orders
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                ₹{getTotalRevenue().toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Total Revenue
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {getDeliveredOrders()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Delivered Orders
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
              <Typography variant="h4" sx={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                {getPendingOrders()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                Pending Orders
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Orders Table */}
        <Paper sx={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--light-mint)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {order.customerName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                          {order.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                        ₹{order.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {order.paymentMethod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        className="view"
                        size="small"
                        onClick={() => handleViewOrder(order)}
                      >
                        <ViewIcon />
                      </ActionButton>
                      <ActionButton
                        className="edit"
                        size="small"
                        onClick={() => handleViewOrder(order)}
                      >
                        <EditIcon />
                      </ActionButton>
                      <ActionButton
                        className="delete"
                        size="small"
                        onClick={() => handleDeleteOrder(order)}
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

        {/* Order Details Dialog */}
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
            Order Details #{selectedOrder?.id}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedOrder && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                    Customer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Name: {selectedOrder.customerName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Email: {selectedOrder.customerEmail}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Phone: {selectedOrder.customerPhone}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                    {selectedOrder.shippingAddress}
                  </Typography>

                  <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                    Order Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Order Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </Typography>
                    {selectedOrder.deliveryDate && (
                      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Delivery Date: {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      Tracking: {selectedOrder.trackingNumber}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                    Order Items
                  </Typography>
                  {selectedOrder.items.map((item, index) => (
                    <Box key={index} sx={{ 
                      mb: 2,
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                          <strong>Quantity:</strong> {item.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                          <strong>Unit Price:</strong> ₹{item.price?.toFixed(2) || '0.00'}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                            <strong>Description:</strong> {item.description}
                          </Typography>
                        )}
                        {item.origin && (
                          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                            <strong>Origin:</strong> {item.origin}
                          </Typography>
                        )}
                        {item.roastLevel && (
                          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                            <strong>Roast Level:</strong> {item.roastLevel}
                          </Typography>
                        )}
                        {item.weight && (
                          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                            <strong>Weight:</strong> {item.weight}g
                          </Typography>
                        )}
                        {item.category && (
                          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                            <strong>Category:</strong> {item.category}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                  
                  <Box sx={{ 
                    borderTop: '2px solid var(--light-mint)', 
                    pt: 2, 
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      ₹{selectedOrder.total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ color: 'var(--text-dark)', mb: 2 }}>
                      Tracking
                    </Typography>
                    {/* Manual tracking controls */}
                    {selectedOrder?.status === 'Delivered' ? (
                      <Alert severity="success">This order has been delivered. Tracking actions are hidden.</Alert>
                    ) : (
                      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Actions</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                          <TextField
                            select
                            size="small"
                            label="Status"
                            value={checkpointForm.status}
                            onChange={(e) => setCheckpointForm({ ...checkpointForm, status: e.target.value })}
                            sx={{ minWidth: 220 }}
                          >
                            {orderStatuses.map((s) => (
                              <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                          </TextField>
                          <Button startIcon={<CheckCircleIcon />} size="small" variant="contained" sx={{ borderRadius: '20px', px: 2 }} onClick={async () => {
                            try {
                              await ordersAPI.setStatus(selectedOrder.id, checkpointForm.status);
                              setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
                            } catch (e) {
                              setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to update status', severity: 'error' });
                            }
                          }}>Update</Button>
                          <Button startIcon={<PasswordIcon />} size="small" variant="outlined" sx={{ borderRadius: '20px', px: 2 }} onClick={async () => {
                            try {
                              await ordersAPI.generateDeliveryOtp(selectedOrder.id);
                              setSnackbar({ open: true, message: `Delivery OTP generated`, severity: 'success' });
                        } catch (e) {
                          setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to generate OTP', severity: 'error' });
                        }
                          }}>Generate OTP</Button>
                          <TextField size="small" label="Enter Customer OTP" value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)} sx={{ minWidth: 200 }} />
                          <Button size="small" variant="contained" sx={{ borderRadius: '20px', px: 2 }} onClick={async () => {
                            try {
                              if (!adminOtp) { setSnackbar({ open: true, message: 'Enter OTP', severity: 'warning' }); return; }
                              await ordersAPI.confirmDelivery(selectedOrder.id, { otp: adminOtp, signedBy: 'Admin' });
                              setSnackbar({ open: true, message: 'Delivery confirmed', severity: 'success' });
                              setAdminOtp('');
                        } catch (e) {
                              setSnackbar({ open: true, message: e?.response?.data?.message || 'Invalid OTP', severity: 'error' });
                            }
                          }}>Confirm</Button>
                          <TextField size="small" label="Cancel Reason" value={checkpointForm.note} onChange={(e) => setCheckpointForm({ ...checkpointForm, note: e.target.value })} sx={{ minWidth: 280 }} />
                          <Button startIcon={<CancelIcon />} color="error" size="small" variant="outlined" sx={{ borderRadius: '20px', px: 2 }} onClick={async () => {
                            try {
                              await ordersAPI.setStatus(selectedOrder.id, 'Cancelled');
                              await ordersAPI.addCheckpoint(selectedOrder.id, { status: 'Cancelled', note: checkpointForm.note || 'Cancelled by admin' });
                              setSnackbar({ open: true, message: 'Order cancelled', severity: 'success' });
                        } catch (e) {
                              setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to cancel order', severity: 'error' });
                            }
                          }}>Cancel</Button>
                          {selectedOrder?.status === 'Cancelled' && (
                            <Button startIcon={<DeleteForeverIcon />} color="error" size="small" variant="contained" sx={{ borderRadius: '20px', px: 2 }} onClick={async () => {
                              try {
                                await ordersAPI.delete(selectedOrder.id);
                                setSnackbar({ open: true, message: 'Order deleted permanently', severity: 'success' });
                                setOpenDialog(false);
                              } catch (e) {
                                setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to delete order', severity: 'error' });
                              }
                            }}>Delete</Button>
                          )}
                      </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                          <TextField size="small" type="datetime-local" label="Expected Delivery" InputLabelProps={{ shrink: true }} value={checkpointForm.expectedDelivery} onChange={(e) => setCheckpointForm({ ...checkpointForm, expectedDelivery: e.target.value })} />
                          <TextField size="small" label="Current Hub/Location" value={checkpointForm.location} onChange={(e) => setCheckpointForm({ ...checkpointForm, location: e.target.value })} />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'var(--text-muted)' }}>
              Close
            </Button>
            <StyledButton onClick={handleCloseDialog}>
              Update Order
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

export default AdminOrders;