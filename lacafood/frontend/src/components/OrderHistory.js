import React, { useState, useEffect } from 'react';
import API from '../api/axios';

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

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1>📦 Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="empty-state">Bạn chưa có đơn hàng nào</div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">#{order._id.slice(-8)}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <span
                    className="order-status"
                    style={{ backgroundColor: statusMap[order.status]?.color || '#999' }}
                  >
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span>Thanh toán: {order.paymentMethod === 'cod' ? '💵 COD' : '📱 QR Code'}</span>
                  <div className="order-total-info">
                    {order.shippingFee > 0 && (
                      <span className="shipping-fee-tag">🚚 Phí ship: {formatPrice(order.shippingFee)} ({order.distance}km)</span>
                    )}
                    <span className="order-total">Tổng: {formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
