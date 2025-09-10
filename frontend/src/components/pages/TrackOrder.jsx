import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Paper, Chip, Divider, LinearProgress, Snackbar, Alert } from '@mui/material';
import { io } from 'socket.io-client';
import { ordersAPI } from '../../services/api';

function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState({});
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState({ open: false, message: '' });
  const socketRef = useRef(null);
  const [otpInfo, setOtpInfo] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        // Use public endpoints so customers can view without auth
        const [pubRes, trackRes] = await Promise.all([
          ordersAPI.getPublic(id),
          ordersAPI.getPublicTracking(id)
        ]);
        if (!active) return;
        setOrder(pubRes.data || {});
        setTracking(trackRes.data || {});
        const dc = pubRes.data?.deliveryConfirmation;
        if (dc?.otp) setOtpInfo({ otp: dc.otp });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    const s = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = s;
    try { s.emit('subscribe:order', id); } catch {}
    s.on('order:status', async (p) => {
      if (p?.orderId === id) {
        setOrder((prev) => ({ ...(prev||{}), status: p.status }));
        try {
          const res = await ordersAPI.getPublicTracking(id);
          setTracking(res.data || {});
        } catch {}
      }
    });
    s.on('order:tracking', (p) => { if (p?.orderId === id) { setNotify({ open: true, message: 'Tracking updated' }); setTracking(p.tracking || {}); }});
          s.on('order:otp', (p) => { if (p?.orderId === id) { setOtpInfo({ otp: p.otp }); setNotify({ open: true, message: 'Delivery OTP generated for your order' }); }});
    return () => { try { s.disconnect(); } catch {} };
  }, [id]);

  const isStepDone = (step) => {
    const status = order?.status || 'Pending';
    const rank = {
      'Pending': 0,
      'OrderPlaced': 1,
      'OrderConfirmed': 1,
      'Packed': 2,
      'Processing': 2,
      'Shipped': 3,
      'OutForDelivery': 4,
      'Delivered': 5
    };
    const stepRank = { ordered: 1, shipped: 3, ofd: 4, arriving: 5 };
    return (rank[status] || 0) >= stepRank[step];
  };

  const arrivingLabel = () => {
    const exp = tracking?.expectedDelivery ? new Date(tracking.expectedDelivery) : null;
    if (!exp) return 'Arriving soon';
    return `Arriving ${exp.toLocaleString()}`;
  };

  const orderedLabel = () => {
    const d = order?.createdAt ? new Date(order.createdAt) : null;
    if (!d) return 'Ordered';
    const opts = { month: 'long', day: 'numeric' };
    return `Ordered ${d.toLocaleDateString(undefined, opts)}`;
  };

  const StepItem = ({ checked, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
          width: 22,
          height: 22,
          borderRadius: '4px',
          border: checked ? '0' : '2px solid #cfd8dc',
          background: checked ? 'var(--primary-green)' : 'transparent'
        }} />
        <Box sx={{ width: 2, flex: 1, background: '#e0e0e0', minHeight: 28, mt: 0.5 }} />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: checked ? 600 : 400 }}>{label}</Typography>
    </Box>
  );

  const isDelivered = (order?.status || '').toLowerCase() === 'delivered';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-dark)', mb: 2 }}>Your delivery</Typography>
        {loading && <LinearProgress />}
        {order && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{isDelivered ? 'Delivered' : arrivingLabel()}</Typography>
              <Chip label={order.status || 'Pending'} size="small" />
            </Box>
            {tracking?.updatedAt && (
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Last updated: {new Date(tracking.updatedAt).toLocaleString()}</Typography>
            )}
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          {isDelivered ? (
            <Alert severity="success">This order has been delivered. Tracking is no longer available.</Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <StepItem checked={isStepDone('ordered')} label={orderedLabel()} />
                <StepItem checked={isStepDone('shipped')} label="Shipped" />
                <StepItem checked={isStepDone('ofd')} label="Out for delivery" />
                <StepItem checked={isStepDone('arriving')} label={arrivingLabel()} />
              </Box>

              {otpInfo?.otp && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Delivery OTP:</Typography>
                  <Chip color="primary" label={otpInfo.otp} sx={{ mt: 0.5 }} />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
      <Snackbar open={notify.open} autoHideDuration={3000} onClose={() => setNotify({ open: false, message: '' })}>
        <Alert onClose={() => setNotify({ open: false, message: '' })} severity="info" sx={{ width: '100%' }}>{notify.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default TrackOrder;



