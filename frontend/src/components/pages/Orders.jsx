import React, { useEffect, useState } from 'react';
import './Orders.css';
import { ordersAPI } from '../../services/api';
import { Box, Container, Typography, Card, CardContent, Grid, Chip, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await ordersAPI.get('/myorders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusLabel = (order) => order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending');
  const getStatusClass = (order) => {
    const label = getStatusLabel(order).toLowerCase();
    if (label === 'delivered') return 'status-success';
    if (label === 'processing') return 'status-warning';
    if (label === 'cancelled') return 'status-danger';
    return 'status-info';
  };

  const canCancel = (order) => !['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].includes(order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'));

  const cancelOrder = async (id) => {
    try {
      await ordersAPI.cancel(id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to cancel order');
    }
  };

  const deleteOrder = async (id) => {
    try {
      await ordersAPI.deleteSelf(id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete order');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-dark)', mb: 3 }}>Your Orders</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : orders.length === 0 ? (
          <Typography sx={{ color: 'var(--text-muted)' }}>No orders yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {orders.map((order) => (
              <Grid key={order._id} item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Order #{order._id.substring(order._id.length - 6)}
                      </Typography>
                      <Chip label={getStatusLabel(order)} color={getStatusClass(order) === 'status-success' ? 'success' : getStatusClass(order) === 'status-warning' ? 'warning' : 'default'} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1 }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</Typography>
                    {order.orderItems.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography>{item.name} × {item.quantity}</Typography>
                        <Typography>₹{(item.price * (item.quantity || 0)).toFixed(2)}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                      <Typography variant="body2">Payment: {order.paymentMethod}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="h6">Total: ₹{Number(order.totalPrice || 0).toFixed(2)}</Typography>
                        {getStatusLabel(order) !== 'Delivered' && (
                          <Button size="small" variant="contained" onClick={() => navigate(`/orders/${order._id}/track`)}>Track</Button>
                        )}
                        {canCancel(order) ? (
                          <Button size="small" color="error" variant="outlined" onClick={() => cancelOrder(order._id)}>Cancel</Button>
                        ) : (
                          (order.status === 'Cancelled') && (
                            <Button size="small" color="error" variant="contained" onClick={() => deleteOrder(order._id)}>Delete</Button>
                          )
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Orders;