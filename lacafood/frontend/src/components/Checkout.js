import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const getItemPrice = (item) => {
    const food = item.food;
    return food.isPromotion && food.promotionPrice && new Date(food.promotionEnd) > new Date()
      ? food.promotionPrice
      : food.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!address.trim() || !phone.trim()) {
      setError('Vui long dien day du dia chi va so dien thoai');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        food: item.food._id,
        name: item.food.name,
        price: getItemPrice(item),
        quantity: item.quantity,
        note: item.note
      }));

      const res = await API.post('/orders', {
        items: orderItems,
        total: getTotal(),
        paymentMethod,
        address: address.trim(),
        phone: phone.trim()
      });

      setOrderSuccess(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.msg || 'Co loi xay ra khi dat hang');
    }
    setLoading(false);
  };

  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h1>Đặt hàng thành công!</h1>
            <p>Mã đơn hàng: <strong>{orderSuccess._id}</strong></p>
            <p>Phương thức thanh toán: <strong>{orderSuccess.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'QR Code'}</strong></p>
            <p>Tổng tiền: <strong>{formatPrice(orderSuccess.total)}</strong></p>

            {orderSuccess.paymentMethod === 'qr' && (
              <div className="qr-payment-section">
                <h2>Quét mã QR để thanh toán</h2>
                <div className="qr-code-box">
                  <QRCodeSVG
                    value={`LacaFood|DH${orderSuccess._id.slice(-8)}|${orderSuccess.total}|Thanh toan don hang LacaFood`}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="qr-info">Nội dung chuyển khoản: <strong>LF{orderSuccess._id.slice(-8)}</strong></p>
                <p className="qr-info">Số tiền: <strong>{formatPrice(orderSuccess.total)}</strong></p>
              </div>
            )}

            <div className="success-actions">
              <button onClick={() => navigate('/orders')} className="view-orders-btn">Xem đơn hàng</button>
              <button onClick={() => navigate('/menu')} className="continue-btn">Tiếp tục đặt món</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-state">
            Giỏ hàng trống. <Link to="/menu">Quay lại thực đơn</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>📋 Thanh toán</h1>

        {error && <div className="error-msg">{error}</div>}

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>📍 Thông tin giao hàng</h2>
              <div className="form-group">
                <label>Địa chỉ giao hàng *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ chi tiết..."
                  rows={2}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại liên hệ"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>💳 Phương thức thanh toán</h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💵</span>
                    <div>
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">📱</span>
                    <div>
                      <strong>Thanh toán QR Code</strong>
                      <p>Chuyển khoản bằng quét mã QR</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : `Đặt hàng - ${formatPrice(getTotal())}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Đơn hàng của bạn</h2>
            {cartItems.map((item, index) => (
              <div key={index} className="summary-item">
                <span className="summary-item-name">
                  {item.food.name} x{item.quantity}
                  {item.note && <small> (📝 {item.note})</small>}
                </span>
                <span>{formatPrice(getItemPrice(item) * item.quantity)}</span>
              </div>
            ))}
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
