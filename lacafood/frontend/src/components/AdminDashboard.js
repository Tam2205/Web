import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const categoryNames = {
  'mon-nhau': 'Mon nhau', 'tra-sua': 'Tra sua', 'chien': 'Chien',
  'pho-bun': 'Pho & Bun', 'com': 'Com', 'mon-an-vat': 'Mon an vat',
  'nuoc': 'Nuoc', 'lau': 'Lau'
};

const statusMap = {
  'pending': { label: 'Cho xac nhan', color: '#f39c12' },
  'confirmed': { label: 'Da xac nhan', color: '#3498db' },
  'preparing': { label: 'Dang chuan bi', color: '#9b59b6' },
  'delivering': { label: 'Dang giao', color: '#1abc9c' },
  'completed': { label: 'Hoan thanh', color: '#27ae60' },
  'cancelled': { label: 'Da huy', color: '#e74c3c' }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('foods');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, ordersRes] = await Promise.all([
        API.get('/foods'),
        API.get('/orders')
      ]);
      setFoods(foodsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
    setLoading(false);
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Ban co chac muon xoa mon an nay?')) return;
    try {
      await API.delete(`/foods/${id}`);
      setFoods(foods.filter(f => f._id !== id));
    } catch (err) {
      alert('Loi khi xoa mon an');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
    } catch (err) {
      alert('Loi khi cap nhat trang thai');
    }
  };

  if (loading) return <div className="loading">Dang tai...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1>⚙️ Quan tri</h1>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            🍽️ Quan ly mon an ({foods.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Quan ly don hang ({orders.length})
          </button>
        </div>

        {activeTab === 'foods' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Danh sach mon an</h2>
              <Link to="/admin/food/new" className="add-btn">+ Them mon moi</Link>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ten mon</th>
                    <th>Danh muc</th>
                    <th>Gia</th>
                    <th>Khuyen mai</th>
                    <th>Trang thai</th>
                    <th>Hanh dong</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map(food => (
                    <tr key={food._id}>
                      <td><strong>{food.name}</strong></td>
                      <td>{categoryNames[food.category] || food.category}</td>
                      <td>{formatPrice(food.price)}</td>
                      <td>
                        {food.isPromotion ? (
                          <span className="badge badge-promo">{formatPrice(food.promotionPrice)}</span>
                        ) : (
                          <span className="badge badge-normal">Khong</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${food.available !== false ? 'badge-available' : 'badge-unavailable'}`}>
                          {food.available !== false ? 'Con hang' : 'Het hang'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/admin/food/${food._id}/edit`} className="edit-btn">✏️</Link>
                          <button onClick={() => handleDeleteFood(food._id)} className="delete-btn">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>Danh sach don hang</h2>

            <div className="admin-orders">
              {orders.length === 0 ? (
                <div className="empty-state">Chua co don hang nao</div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="admin-order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-id">#{order._id.slice(-8)}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="status-select"
                        style={{ borderColor: statusMap[order.status]?.color }}
                      >
                        <option value="pending">Cho xac nhan</option>
                        <option value="confirmed">Da xac nhan</option>
                        <option value="preparing">Dang chuan bi</option>
                        <option value="delivering">Dang giao</option>
                        <option value="completed">Hoan thanh</option>
                        <option value="cancelled">Da huy</option>
                      </select>
                    </div>
                    <div className="order-customer">
                      <p>👤 {order.user?.name || 'N/A'} | 📞 {order.phone} | 📍 {order.address}</p>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.name} x{item.quantity}</span>
                          {item.note && <span className="item-note">📝 {item.note}</span>}
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span>💳 {order.paymentMethod === 'cod' ? 'COD' : 'QR Code'}</span>
                      <span className="order-total">Tong: {formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
