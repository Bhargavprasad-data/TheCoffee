# TheCoffee – Live GPS Tracking Mini Project

This adds a live GPS tracking system to the existing app using React (frontend) and Node.js + Express + MongoDB + Socket.IO (backend).

## Features
- Driver Console: login (dummy), capture GPS via HTML5 Geolocation, send every few seconds
- Customer Track: enter Order ID, see assigned driver live on a map (Leaflet)
- Admin Live: login (dummy), see all drivers live; search/filter; route history endpoint

## Tech
- Backend: Express, Mongoose, JWT, Socket.IO
- Frontend: React, react-router, Leaflet (CDN), socket.io-client

## Setup
1) Backend
- Create `.env` in `backend/`:
```
MONGODB_URI=mongodb://localhost:27017/coffee-shop
JWT_SECRET=dev_secret
ADMIN_USER=admin
ADMIN_PASS=admin123
```
- Install and run:
```
cd backend
npm install
npm run dev
```

2) Frontend
```
cd frontend
npm install
npm start
```

## Usage
- Seed dummy drivers: POST `http://localhost:5000/api/tracking/seed` or use the button in Driver Console.

- Driver Console: open `http://localhost:3000/driver`
  - driverId: `DRV1001` or `DRV1002`, password: `pass123`
  - Allow location permissions and click Start

- Admin Live: open `http://localhost:3000/admin/live`
  - Login with `admin` / `admin123` (or `.env` values)

- Customer Track: open `http://localhost:3000/track`
  - Enter Order ID (Mongo `_id`) that has `driverId` set (assign via `/api/tracking/order/assign`)

## APIs
- POST `/api/tracking/driver/login` { driverId, password }
- POST `/api/tracking/driver/location` Bearer token
- POST `/api/tracking/admin/login` { username, password }
- GET `/api/tracking/admin/drivers?q=` Bearer token
- GET `/api/tracking/admin/drivers/:driverId/history` Bearer token
- POST `/api/tracking/order/assign` Bearer token
- GET `/api/tracking/order/:orderId/driver`

## Notes
- Leaflet is loaded via CDN in `frontend/public/index.html`.
- Socket rooms:
  - `driver:{driverId}` per driver
  - `admin:all` for admin broadcast
  - `order:{orderId}` for customer events
