import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DeliveryMap, { STORE_LOCATION } from './DeliveryMap';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

// Haversine formula for straight-line distance (km)
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [distance, setDistance] = useState(0);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const debounceRef = useRef(null);

  // Geocode address → coordinates + calculate distance
  const geocodeAddress = useCallback(async (addr) => {
    if (!addr || addr.trim().length < 5) {
      setDeliveryCoords(null);
      setDistance(0);
      setGeocodeError('');
      return;
    }

    setGeocoding(true);
    setGeocodeError('');

    try {
      const query = addr.includes('Hồ Chí Minh') || addr.includes('HCM') || addr.includes('TP.HCM')
        ? addr
        : addr + ', Hồ Chí Minh, Việt Nam';

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'vi' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setDeliveryCoords({ lat, lng });

        // Try OSRM for road distance, fallback to Haversine
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${STORE_LOCATION.lng},${STORE_LOCATION.lat};${lng},${lat}?overview=false`;
          const osrmRes = await fetch(osrmUrl);
          const osrmData = await osrmRes.json();
          if (osrmData.routes && osrmData.routes.length > 0) {
            const roadDist = osrmData.routes[0].distance / 1000;
            setDistance(Math.round(roadDist * 10) / 10);
          } else {
            setDistance(Math.round(haversineDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, lat, lng) * 10) / 10);
          }
        } catch {
          setDistance(Math.round(haversineDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, lat, lng) * 10) / 10);
        }
        setGeocodeError('');
      } else {
        setDeliveryCoords(null);
        setDistance(0);
        setGeocodeError('Không tìm thấy địa chỉ. Vui lòng nhập chi tiết hơn (số nhà, đường, quận...)');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setGeocodeError('Lỗi khi tìm địa chỉ. Vui lòng thử lại.');
    }
    setGeocoding(false);
  }, []);

  // Debounced address change
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      geocodeAddress(val);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const getShippingFee = () => {
    const km = distance || 0;
    if (km <= 5) return 0;
    return Math.ceil(km - 5) * 10000;
  };

  const getFinalTotal = () => {
    return getTotal() + getShippingFee();
  };

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
      setError('Vui lòng điền đầy đủ địa chỉ và số điện thoại');
      return;
    }

    if (!deliveryCoords) {
      setError('Không tìm thấy tọa độ địa chỉ. Vui lòng nhập địa chỉ chi tiết hơn.');
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
        total: getFinalTotal(),
        paymentMethod,
        address: address.trim(),
        phone: phone.trim(),
        distance: distance || 0,
        shippingFee: getShippingFee(),
        deliveryLat: deliveryCoords?.lat || null,
        deliveryLng: deliveryCoords?.lng || null
      });

      setOrderSuccess(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra khi đặt hàng');
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
                <h2>📱 Quét mã QR để thanh toán</h2>
                <div className="qr-code-box">
                  <QRCodeSVG
                    value={`LacaFood|DH${orderSuccess._id.slice(-8)}|${orderSuccess.total}|Thanh toan don hang LacaFood`}
                    size={200}
                    level="H"
                  />
                </div>
                <div className="bank-info">
                  <div className="bank-info-row">
                    <span>Ngân hàng:</span>
                    <span>VpBank</span>
                  </div>
                  <div className="bank-info-row">
                    <span>Chủ tài khoản:</span>
                    <span>Vũ Xuân Tâm</span>
                  </div>
                  <div className="bank-info-row">
                    <span>Số tài khoản:</span>
                    <span>0397203124</span>
                  </div>
                  <div className="bank-info-row">
                    <span>Nội dung CK:</span>
                    <span>LF{orderSuccess._id.slice(-8)}</span>
                  </div>
                  <div className="bank-info-row">
                    <span>Số tiền:</span>
                    <span>{formatPrice(orderSuccess.total)}</span>
                  </div>
                </div>
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
                  onChange={handleAddressChange}
                  placeholder="Nhập địa chỉ chi tiết (số nhà, đường, quận, TP.HCM)..."
                  rows={2}
                  required
                />
                {geocoding && <small className="geocoding-hint">🔍 Đang tìm vị trí...</small>}
                {geocodeError && <small className="geocode-error">{geocodeError}</small>}
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

              {/* Auto-calculated distance info */}
              {deliveryCoords && distance > 0 && (
                <div className="distance-info-box">
                  <div className="distance-result">
                    <span className="distance-label">📏 Khoảng cách:</span>
                    <span className="distance-value">{distance} km</span>
                  </div>
                  <div className="shipping-fee-result">
                    <span>🚚 Phí giao hàng:</span>
                    <span className={getShippingFee() === 0 ? 'free-shipping' : ''}>
                      {getShippingFee() === 0
                        ? 'Miễn phí (dưới 5km)'
                        : `${formatPrice(getShippingFee())} (${Math.ceil(distance - 5)}km x 10.000đ)`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Delivery route map preview */}
              {deliveryCoords && (
                <div className="checkout-map-preview">
                  <h3>🗺️ Quãng đường giao hàng</h3>
                  <DeliveryMap
                    customerLat={deliveryCoords.lat}
                    customerLng={deliveryCoords.lng}
                    customerAddress={address}
                    height="250px"
                  />
                </div>
              )}
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

              {paymentMethod === 'qr' && (
                <div className="qr-preview">
                  <h3>📱 Mã QR thanh toán sẽ hiển thị sau khi đặt hàng</h3>
                  <div className="bank-info">
                    <div className="bank-info-row">
                      <span>Ngân hàng:</span>
                      <span>VpBank</span>
                    </div>
                    <div className="bank-info-row">
                      <span>Chủ tài khoản:</span>
                      <span>Vũ Xuân Tâm</span>
                    </div>
                    <div className="bank-info-row">
                      <span>Số tài khoản:</span>
                      <span>0397203124</span>
                    </div>
                    <div className="bank-info-row">
                      <span>Số tiền:</span>
                      <span>{formatPrice(getFinalTotal())}</span>
                    </div>
                  </div>
                  <p>Mã QR sẽ được tạo tự động sau khi bạn xác nhận đặt hàng</p>
                </div>
              )}
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : `Đặt hàng - ${formatPrice(getFinalTotal())}`}
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
              <span>{getShippingFee() > 0 ? formatPrice(getShippingFee()) : 'Miễn phí'}</span>
            </div>
            {getShippingFee() > 0 && distance > 0 && (
              <div className="summary-row shipping-detail">
                <span>({distance}km - miễn phí 5km đầu)</span>
                <span>{Math.ceil(distance - 5)}km x 10.000đ</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(getFinalTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
