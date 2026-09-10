# ☕ TheCoffee — Live GPS Delivery Tracking System

**TheCoffee** is a real-time delivery tracking system designed for a coffee-ordering application. It extends the existing application with **live GPS tracking**, allowing customers and administrators to monitor delivery drivers in real time.

The system uses **React** for the frontend and **Node.js, Express, MongoDB, and Socket.IO** for the backend. Driver locations are captured using the browser's **HTML5 Geolocation API** and transmitted to the server through real-time communication.

---

## 🚀 Features

### 🚚 Driver Console

Drivers can:

* Login using their driver credentials
* Allow browser-based GPS location access
* Start and stop location tracking
* Automatically send their current location
* Update their location at regular intervals
* Communicate with the backend using Socket.IO

---

### 📍 Customer Live Tracking

Customers can track their assigned delivery driver using an **Order ID**.

Features include:

* Enter Order ID
* Find the assigned driver
* View the driver on a live map
* Receive real-time location updates
* Track delivery progress without refreshing the page

The map is implemented using **Leaflet**.

---

### 👨‍💼 Admin Live Dashboard

Administrators can monitor delivery drivers in real time.

Features include:

* Admin authentication
* View all active drivers
* Monitor live driver locations
* Search drivers
* Filter drivers
* View driver location history
* Assign drivers to orders

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │                     │
                    │  Order Tracking UI  │
                    └──────────┬──────────┘
                               │
                               │ Socket.IO
                               ▼
┌─────────────────┐     ┌─────────────────────┐
│     Driver      │     │                     │
│                 │────▶│   Node.js + Express │
│ GPS Location    │     │                     │
│ HTML5 Geolocation│    │    Socket.IO        │
└─────────────────┘     └──────────┬──────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │     MongoDB      │
                         │                  │
                         │ Driver Data      │
                         │ Location History │
                         │ Orders           │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Admin       │
                         │                  │
                         │ Live Dashboard   │
                         └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Leaflet
* Socket.IO Client
* HTML5 Geolocation API
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT Authentication

### Development

* npm
* Nodemon
* REST APIs
* WebSockets

---

## 📁 Project Structure

```text
TheCoffee/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   │
│   ├── package.json
│   └── ...
│
├── package.json
├── package-lock.json
├── eslint.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Bhargavprasad-data/TheCoffee.git

cd TheCoffee
```

---

## 🔧 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/coffee-shop
JWT_SECRET=your_secret_key

ADMIN_USER=admin
ADMIN_PASS=your_admin_password
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will normally run on:

```text
http://localhost:3000
```

---

# 🧪 Testing the Application

## 1. Seed Dummy Drivers

Use the seed endpoint:

```http
POST /api/tracking/seed
```

This creates sample drivers for testing.

---

## 2. Driver Console

Open:

```text
http://localhost:3000/driver
```

Example driver credentials:

```text
Driver ID: DRV1001
Password: pass123
```

or

```text
Driver ID: DRV1002
Password: pass123
```

Allow browser location permission and click **Start Tracking**.

The browser will capture the driver's GPS coordinates and send them to the backend.

---

## 3. Admin Dashboard

Open:

```text
http://localhost:3000/admin/live
```

Login using the credentials configured in `.env`.

Example:

```text
Username: admin
Password: admin123
```

The admin can then view available drivers and their live locations.

---

## 4. Customer Tracking

Open:

```text
http://localhost:3000/track
```

Enter an Order ID that has an assigned driver.

The customer's map will display the driver's current location.

---

# 🔄 Real-Time Tracking Flow

```text
Driver
  │
  │ GPS Location
  ▼
HTML5 Geolocation
  │
  │ Latitude + Longitude
  ▼
React Driver Console
  │
  │ Socket.IO
  ▼
Node.js / Express Server
  │
  ├───────────────┐
  │               │
  ▼               ▼
MongoDB       Socket.IO
  │               │
  │               ├───────────────► Customer
  │               │
  │               └───────────────► Admin
  │
  ▼
Location History
```

---

# 🔌 API Endpoints

### Driver Authentication

```http
POST /api/tracking/driver/login
```

Request:

```json
{
  "driverId": "DRV1001",
  "password": "pass123"
}
```

---

### Update Driver Location

```http
POST /api/tracking/driver/location
```

Authentication:

```text
Bearer Token
```

---

### Admin Authentication

```http
POST /api/tracking/admin/login
```

Request:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

### Get Drivers

```http
GET /api/tracking/admin/drivers?q=
```

Requires:

```text
Bearer Token
```

---

### Driver Location History

```http
GET /api/tracking/admin/drivers/:driverId/history
```

Requires:

```text
Bearer Token
```

---

### Assign Driver to Order

```http
POST /api/tracking/order/assign
```

---

### Get Driver Assigned to Order

```http
GET /api/tracking/order/:orderId/driver
```

---

# 🔌 Socket.IO Rooms

The application uses dedicated Socket.IO rooms for real-time communication.

### Driver Room

```text
driver:{driverId}
```

Used for communication with an individual driver.

### Admin Room

```text
admin:all
```

Used to broadcast driver updates to administrators.

### Order Room

```text
order:{orderId}
```

Used for sending live delivery updates to customers associated with a specific order.

---

# 🗺️ Location Tracking

The driver application uses the browser's **Geolocation API** to obtain:

```text
Latitude
Longitude
```

The location is periodically sent to the backend.

The backend can then:

1. Validate the authenticated driver
2. Store the location
3. Update the driver's latest position
4. Broadcast the update using Socket.IO
5. Send the location to the appropriate customer/admin clients

---

# 🔐 Security

The application implements:

* JWT authentication
* Protected driver APIs
* Protected admin APIs
* Password-based authentication
* Environment variables for sensitive configuration
* MongoDB data storage
* Token-based API authorization

### Important

Never commit your `.env` file to GitHub.

Do not use development credentials such as:

```text
admin / admin123
```

in a production environment.

---

# 📊 Main Application Components

| Component         | Purpose                                     |
| ----------------- | ------------------------------------------- |
| Driver Console    | Captures and sends driver GPS location      |
| Customer Tracking | Displays assigned driver location           |
| Admin Dashboard   | Monitors multiple drivers                   |
| Express API       | Handles backend requests                    |
| MongoDB           | Stores drivers, orders and location history |
| Socket.IO         | Provides real-time communication            |
| Leaflet           | Displays locations on interactive maps      |
| JWT               | Handles authentication                      |

---

# 🎯 Use Case

The system can be used for applications such as:

* ☕ Coffee delivery
* 🍔 Food delivery
* 📦 Package delivery
* 🛵 Local courier services
* 🚚 Logistics tracking
* 🏪 E-commerce delivery

The same architecture can be extended to support multiple delivery agents and thousands of real-time tracking sessions.

---

# 🚀 Future Improvements

Possible future enhancements:

* Live route visualization
* Estimated Time of Arrival (ETA)
* Distance calculation
* Driver availability status
* Delivery status updates
* Push notifications
* Customer delivery notifications
* Route optimization
* Geofencing
* Driver performance analytics
* Delivery history dashboard
* Production authentication
* Cloud deployment
* Redis-based Socket.IO scaling
* Automated testing
* Docker support

---

# 📸 Screenshots

Add application screenshots here:

```text
screenshots/
├── driver-console.png
├── customer-tracking.png
├── admin-dashboard.png
└── live-map.png
```

Example:

```markdown
![Driver Console](screenshots/driver-console.png)

![Customer Tracking](screenshots/customer-tracking.png)

![Admin Dashboard](screenshots/admin-dashboard.png)
```

---

# 👨‍💻 Author

**Bhargavprasad Vana**

GitHub:
https://github.com/Bhargavprasad-data

---

# ⭐ Project

**TheCoffee — Live GPS Delivery Tracking System**

Built using:

```text
React
Node.js
Express
MongoDB
Socket.IO
JWT
Leaflet
HTML5 Geolocation
```

If you find this project useful, consider giving the repository a ⭐.

**Repository:**
https://github.com/Bhargavprasad-data/TheCoffee
