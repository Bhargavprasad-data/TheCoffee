import { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Divider, List, ListItem, ListItemText, Snackbar, Alert } from '@mui/material';
import { ordersAPI } from '../../services/api';

function AgentConsole() {
  const [agentId, setAgentId] = useState('DEL123');
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gps, setGps] = useState({ lat: '', lng: '' });
  const [status, setStatus] = useState('OutForDelivery');
  const [streaming, setStreaming] = useState(false);
  const watchIdRef = useRef(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    if (!agentId) return;
    const { data } = await ordersAPI.agentOrders(agentId);
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--light-mint) 0%, #e8f5e8 100%)', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-dark)', mb: 3 }}>Delivery Agent Console</Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
            <Button variant="contained" onClick={load}>Load Orders</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Assigned Orders</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {orders.map(o => (
              <ListItem key={o._id} button selected={selected?._id === o._id} onClick={() => setSelected(o)}>
                <ListItemText primary={`#${o._id?.slice(-6)} — ${o.status}`} secondary={o.shippingAddress?.address} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {selected && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Update Order #{selected._id?.slice(-6)}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField label="Latitude" value={gps.lat} onChange={(e) => setGps({ ...gps, lat: e.target.value })} />
              <TextField label="Longitude" value={gps.lng} onChange={(e) => setGps({ ...gps, lng: e.target.value })} />
              <Button variant="outlined" onClick={async () => {
                const lat = parseFloat(gps.lat); const lng = parseFloat(gps.lng);
                if (Number.isNaN(lat) || Number.isNaN(lng)) return;
                await ordersAPI.update(`/orders/${selected._id}/gps`, {}); // placeholder; direct fetch below due to baseURL helper
                await fetch(`http://localhost:5000/api/orders/${selected._id}/gps`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
              }}>Send GPS</Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
              <Button variant="contained" onClick={async () => {
                await fetch(`http://localhost:5000/api/orders/${selected._id}/agent/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
              }}>Send Status</Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              {!streaming ? (
                <Button variant="contained" onClick={() => {
                  if (!navigator.geolocation) {
                    setSnack({ open: true, message: 'Geolocation not supported', severity: 'error' });
                    return;
                  }
                  const id = navigator.geolocation.watchPosition(async (pos) => {
                    try {
                      if (!selected?._id) return;
                      const lat = pos.coords.latitude;
                      const lng = pos.coords.longitude;
                      await fetch(`http://localhost:5000/api/orders/${selected._id}/gps`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
                    } catch {}
                  }, () => {}, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
                  watchIdRef.current = id;
                  setStreaming(true);
                }}>Start Live GPS</Button>
              ) : (
                <Button color="error" variant="outlined" onClick={() => {
                  try { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
                  watchIdRef.current = null;
                  setStreaming(false);
                }}>Stop Live GPS</Button>
              )}
            </Stack>
          </Paper>
        )}
        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default AgentConsole;


