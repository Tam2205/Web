import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const categoryIcons = {
  'mon-nhau': '🍗', 'tra-sua': '🧋', 'chien': '🍟', 'pho-bun': '🍜',
  'com': '🍚', 'mon-an-vat': '🍢', 'nuoc': '🥤', 'lau': '🍲'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getItemPrice = (item) => {
    const food = item.food;
    return food.isPromotion && food.promotionPrice && new Date(food.promotionEnd) > new Date()
      ? food.promotionPrice
      : food.price;
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Giỏ hàng</h1>
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <p>Giỏ hàng trống</p>
            <Link to="/menu" className="browse-btn">Xem thực đơn</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>🛒 Giỏ hàng ({cartItems.length} món)</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-image">
                  {item.food.image ? (
                    <img src={item.food.image} alt={item.food.name} />
                  ) : (
                    <span className="food-emoji">{categoryIcons[item.food.category] || '🍽️'}</span>
                  )}
                </div>
                <div className="cart-item-info">
                  <h3>{item.food.name}</h3>
                  <p className="cart-item-price">{formatPrice(getItemPrice(item))}</p>
                  {item.note && <p className="cart-item-note">📝 {item.note}</p>}
                </div>
                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(index, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                  </div>
                  <p className="cart-item-subtotal">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(index)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span className="shipping-note">Tính khi thanh toán</span>
            </div>
            <div className="summary-row total">
              <span>Tạm tính:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Đặt hàng
            </button>
            <button className="clear-cart-btn" onClick={clearCart}>
               Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
