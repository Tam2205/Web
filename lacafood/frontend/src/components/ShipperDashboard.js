import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DeliveryMap from './DeliveryMap';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const statusMap = {
  'pending': { label: 'Chờ xác nhận', color: '#f39c12' },
  'confirmed': { label: 'Đã xác nhận', color: '#3498db' },
  'preparing': { label: 'Đang chuẩn bị', color: '#9b59b6' },
  'delivering': { label: 'Đang giao', color: '#1abc9c' },
  'completed': { label: 'Hoàn thành', color: '#27ae60' },
  'cancelled': { label: 'Đã hủy', color: '#e74c3c' }
};

const ShipperDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('delivering');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/shipper-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching shipper orders:', err);
    }
    setLoading(false);
  };

  const handleComplete = async (orderId) => {
    if (!window.confirm('Xác nhận đã giao hàng thành công?')) return;
    try {
      const res = await API.put(`/orders/${orderId}/complete`);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi khi xác nhận');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const deliveringCount = orders.filter(o => o.status === 'delivering').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="shipper-page">
      <div className="container">
        <h1>🚚 Đơn giao hàng của tôi</h1>

        <div className="shipper-stats">
          <div className="shipper-stat-card">
            <span className="stat-number">{deliveringCount}</span>
            <span className="stat-label">Đang giao</span>
          </div>
          <div className="shipper-stat-card completed">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>

        <div className="shipper-filters">
          <button className={`filter-btn ${filter === 'delivering' ? 'active' : ''}`} onClick={() => setFilter('delivering')}>
            Đang giao ({deliveringCount})
          </button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
            Đã hoàn thành ({completedCount})
          </button>
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Tất cả ({orders.length})
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">Không có đơn hàng nào</div>
        ) : (
          <div className="shipper-orders">
            {filteredOrders.map(order => (
              <div key={order._id} className={`shipper-order-card ${order.status}`}>
                <div className="order-header">
                  <div>
                    <span className="order-id">#{order._id.slice(-8)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <span className="order-status" style={{ backgroundColor: statusMap[order.status]?.color }}>
                    {statusMap[order.status]?.label}
                  </span>
                </div>

                <div className="order-customer">
                  <p>👤 {order.user?.name || 'N/A'} | 📞 {order.phone}</p>
                  <p>📍 {order.address}</p>
                  {order.distance > 0 && <p>📏 Khoảng cách: {order.distance}km</p>}
                </div>

                {/* Route map for delivering orders */}
                {order.deliveryLat && order.deliveryLng && order.status === 'delivering' && (
                  <div className="shipper-route-map">
                    <DeliveryMap
                      customerLat={order.deliveryLat}
                      customerLng={order.deliveryLng}
                      customerAddress={order.address}
                      height="220px"
                    />
                  </div>
                )}

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.name} x{item.quantity}</span>
                      {item.note && <span className="item-note">📝 {item.note}</span>}
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <span>💳 {order.paymentMethod === 'cod' ? 'COD - Thu tiền' : 'QR - Đã thanh toán'}</span>
                  <span className="order-total">Tổng: {formatPrice(order.total)}</span>
                </div>

                {order.status === 'delivering' && (
                  <button className="complete-delivery-btn" onClick={() => handleComplete(order._id)}>
                    ✅ Xác nhận đã giao thành công
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;
