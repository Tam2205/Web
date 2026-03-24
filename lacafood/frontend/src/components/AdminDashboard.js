import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const categoryNames = {
  'mon-nhau': 'Món nhậu', 'tra-sua': 'Trà sữa', 'chien': 'Chiên',
  'pho-bun': 'Phở & Bún', 'com': 'Cơm', 'mon-an-vat': 'Món ăn vặt',
  'nuoc': 'Nước', 'lau': 'Lẩu'
};

const statusMap = {
  'pending': { label: 'Chờ xác nhận', color: '#f39c12' },
  'confirmed': { label: 'Đã xác nhận', color: '#3498db' },
  'preparing': { label: 'Đang chuẩn bị', color: '#9b59b6' },
  'delivering': { label: 'Đang giao', color: '#1abc9c' },
  'completed': { label: 'Hoàn thành', color: '#27ae60' },
  'cancelled': { label: 'Đã hủy', color: '#e74c3c' }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('foods');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipperForm, setShipperForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [shipperError, setShipperError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, ordersRes, shippersRes] = await Promise.all([
        API.get('/foods'),
        API.get('/orders'),
        API.get('/orders/shippers')
      ]);
      setFoods(foodsRes.data);
      setOrders(ordersRes.data);
      setShippers(shippersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
    setLoading(false);
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món ăn này?')) return;
    try {
      await API.delete(`/foods/${id}`);
      setFoods(foods.filter(f => f._id !== id));
    } catch (err) {
      alert('Lỗi khi xóa món ăn');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleAddShipper = async (e) => {
    e.preventDefault();
    setShipperError('');
    try {
      const res = await API.post('/orders/shippers', shipperForm);
      setShippers([...shippers, { ...res.data, activeDeliveries: 0, completedDeliveries: 0 }]);
      setShipperForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      setShipperError(err.response?.data?.msg || 'Lỗi khi thêm shipper');
    }
  };

  const handleDeleteShipper = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa shipper này?')) return;
    try {
      await API.delete(`/orders/shippers/${id}`);
      setShippers(shippers.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi khi xóa shipper');
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1>⚙️ Quản trị</h1>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            🍽️ Quản lý món ăn ({foods.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Quản lý đơn hàng ({orders.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'shippers' ? 'active' : ''}`}
            onClick={() => setActiveTab('shippers')}
          >
            🚚 Nhân viên giao hàng ({shippers.length})
          </button>
        </div>

        {activeTab === 'foods' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Danh sách món ăn</h2>
              <Link to="/admin/food/new" className="add-btn">+ Thêm món mới</Link>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên món</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Khuyến mãi</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
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
                          <span className="badge badge-normal">Không</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${food.available !== false ? 'badge-available' : 'badge-unavailable'}`}>
                          {food.available !== false ? 'Còn hàng' : 'Hết hàng'}
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
            <h2>Danh sách đơn hàng</h2>

            <div className="admin-orders">
              {orders.length === 0 ? (
                <div className="empty-state">Chưa có đơn hàng nào</div>
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
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="preparing">Đang chuẩn bị</option>
                        <option value="delivering">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                    <div className="order-customer">
                      <p>👤 {order.user?.name || 'N/A'} | 📞 {order.phone} | 📍 {order.address}</p>
                      {order.shipper && (
                        <p className="order-shipper-info">🚚 Shipper: {order.shipper.name} {order.shipper.phone ? `| 📞 ${order.shipper.phone}` : ''}</p>
                      )}
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
                      {order.shippingFee > 0 && (
                        <span className="shipping-fee-tag">🚚 Ship: {formatPrice(order.shippingFee)} ({order.distance}km)</span>
                      )}
                      <span className="order-total">Tổng: {formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'shippers' && (
          <div className="admin-section">
            <h2>Thêm nhân viên giao hàng</h2>
            {shipperError && <div className="error-msg">{shipperError}</div>}
            <form className="shipper-form" onSubmit={handleAddShipper}>
              <div className="shipper-form-grid">
                <input
                  type="text"
                  placeholder="Tên nhân viên *"
                  value={shipperForm.name}
                  onChange={(e) => setShipperForm({ ...shipperForm, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email đăng nhập *"
                  value={shipperForm.email}
                  onChange={(e) => setShipperForm({ ...shipperForm, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu *"
                  value={shipperForm.password}
                  onChange={(e) => setShipperForm({ ...shipperForm, password: e.target.value })}
                  required
                  minLength={6}
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={shipperForm.phone}
                  onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                />
              </div>
              <button type="submit" className="add-btn">+ Thêm shipper</button>
            </form>

            <h2 style={{ marginTop: '30px' }}>Danh sách nhân viên giao hàng</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Đang giao</th>
                    <th>Đã hoàn thành</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {shippers.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Chưa có nhân viên giao hàng</td></tr>
                  ) : (
                    shippers.map(s => (
                      <tr key={s._id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.email}</td>
                        <td>{s.phone || '—'}</td>
                        <td>
                          <span className={`badge ${s.activeDeliveries > 0 ? 'badge-promo' : 'badge-available'}`}>
                            {s.activeDeliveries} đơn
                          </span>
                        </td>
                        <td>{s.completedDeliveries} đơn</td>
                        <td>
                          <button onClick={() => handleDeleteShipper(s._id)} className="delete-btn">🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
