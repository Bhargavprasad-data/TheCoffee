import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const salesData = {
    daily: {
      total: 15999,
      orders: 25,
      products: 45
    },
    weekly: {
      total: 89999,
      orders: 150,
      products: 280
    },
    monthly: {
      total: 359999,
      orders: 600,
      products: 1200
    }
  };

  const recentOrders = [
    {
      id: 'ORD125',
      customer: 'Rahul Kumar',
      date: '2024-01-20',
      amount: 1499,
      status: 'Processing',
      paymentMethod: 'PhonePe'
    },
    {
      id: 'ORD124',
      customer: 'Priya Singh',
      date: '2024-01-19',
      amount: 2199,
      status: 'Delivered',
      paymentMethod: 'GooglePay'
    },
    {
      id: 'ORD123',
      customer: 'Amit Patel',
      date: '2024-01-18',
      amount: 899,
      status: 'Delivered',
      paymentMethod: 'COD'
    }
  ];

  const topProducts = [
    {
      id: 1,
      name: 'Premium Arabica Coffee',
      sales: 120,
      revenue: 71880
    },
    {
      id: 2,
      name: 'Espresso Blend',
      sales: 95,
      revenue: 66405
    },
    {
      id: 3,
      name: 'Cold Brew Pack',
      sales: 75,
      revenue: 59925
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-success';
      case 'processing':
        return 'status-warning';
      case 'cancelled':
        return 'status-danger';
      default:
        return 'status-info';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Daily Sales</h3>
              <p className="amount">₹{salesData.daily.total}</p>
              <div className="stat-details">
                <span>Orders: {salesData.daily.orders}</span>
                <span>Products: {salesData.daily.products}</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Weekly Sales</h3>
              <p className="amount">₹{salesData.weekly.total}</p>
              <div className="stat-details">
                <span>Orders: {salesData.weekly.orders}</span>
                <span>Products: {salesData.weekly.products}</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Monthly Sales</h3>
              <p className="amount">₹{salesData.monthly.total}</p>
              <div className="stat-details">
                <span>Orders: {salesData.monthly.orders}</span>
                <span>Products: {salesData.monthly.products}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{new Date(order.date).toLocaleDateString('en-IN')}</td>
                        <td>₹{order.amount}</td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <span className={`status ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="top-products">
              <h3>Top Products</h3>
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sales} units</td>
                        <td>₹{product.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="dashboard-orders">
          <h3>All Orders</h3>
          {/* Implement detailed orders view */}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="dashboard-products">
          <h3>Product Management</h3>
          {/* Implement product management view */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;