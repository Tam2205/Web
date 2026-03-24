import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';

const categoryList = [
  { key: 'mon-nhau', label: 'Món nhậu' },
  { key: 'tra-sua', label: 'Trà sữa' },
  { key: 'chien', label: 'Chiên'},
  { key: 'pho-bun', label: 'Phở & bún' },
  { key: 'com', label: 'Cơm'},
  { key: 'mon-an-vat', label: 'Món ăn vặt' },
  { key: 'nuoc', label: 'Nước' },
  { key: 'lau', label: 'Lẩu' }
];

const categoryIcons = {
  'mon-nhau': '🍗', 'tra-sua': '🧋', 'chien': '🍟', 'pho-bun': '🍜',
  'com': '🍚', 'mon-an-vat': '🍢', 'nuoc': '🥤', 'lau': '🍲'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const Home = () => {
  const [promoFoods, setPromoFoods] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [promoEnd, setPromoEnd] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPromoFoods = async () => {
      try {
        const res = await API.get('/foods?promotion=true');
        setPromoFoods(res.data);
        if (res.data.length > 0) {
          const earliest = res.data.reduce((min, food) => {
            const end = new Date(food.promotionEnd);
            return end < min ? end : min;
          }, new Date(res.data[0].promotionEnd));
          setPromoEnd(earliest);
        }
      } catch (err) {
        console.error('Error fetching promo foods:', err);
      }
    };
    fetchPromoFoods();
  }, []);

  useEffect(() => {
    if (!promoEnd) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = promoEnd - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [promoEnd]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>🍊 LacaFood</h1>
            <p>Đặt món ngon — Giao nhanh tận nơi</p>
            <Link to="/menu" className="hero-btn">🍽️ Xem thực đơn</Link>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="hero-feature-icon">🚀</span>
                <span>Giao hàng nhanh</span>
              </div>
              <div className="hero-feature">
                <span className="hero-feature-icon">💰</span>
                <span>Giá tốt nhất</span>
              </div>
              <div className="hero-feature">
                <span className="hero-feature-icon">⭐</span>
                <span>Chất lượng cao</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Section */}
      {promoFoods.length > 0 && (
        <section className="promo-section">
          <div className="container">
            <div className="promo-header">
              <div className="promo-title-group">
                <div className="promo-fire-icon">🔥</div>
                <h2>KHUYẾN MÃI <span>ĐẶC BIỆT</span></h2>
              </div>
              <div className="countdown">
                <span className="countdown-label">Kết thúc sau:</span>
                <div className="countdown-timer">
                  <div className="time-box">
                    <span className="time-number">{String(timeLeft.days || 0).padStart(2, '0')}</span>
                    <span className="time-label">Ngày</span>
                  </div>
                  <div className="time-box">
                    <span className="time-number">{String(timeLeft.hours || 0).padStart(2, '0')}</span>
                    <span className="time-label">Giờ</span>
                  </div>
                  <div className="time-box">
                    <span className="time-number">{String(timeLeft.minutes || 0).padStart(2, '0')}</span>
                    <span className="time-label">Phút</span>
                  </div>
                  <div className="time-box">
                    <span className="time-number">{String(timeLeft.seconds || 0).padStart(2, '0')}</span>
                    <span className="time-label">Giây</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="food-grid">
              {promoFoods.map(food => (
                <div key={food._id} className="food-card promo-card">
                  <div className="promo-badge">-{Math.round((1 - food.promotionPrice / food.price) * 100)}%</div>
                  <Link to={`/food/${food._id}`}>
                    <div className="food-image">
                      {food.image ? <img src={food.image} alt={food.name} /> : <span className="food-emoji">{categoryIcons[food.category] || '🍽️'}</span>}
                    </div>
                  </Link>
                  <div className="food-info">
                    <Link to={`/food/${food._id}`}><h3>{food.name}</h3></Link>
                    <p className="food-desc">{food.description}</p>
                    <div className="food-price">
                      <span className="price-old">{formatPrice(food.price)}</span>
                      <span className="price-new">{formatPrice(food.promotionPrice)}</span>
                    </div>
                    <button className="add-cart-btn" onClick={() => addToCart(food)}>+ Thêm vào giỏ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>📋 Danh mục món ăn</h2>
          <div className="category-grid">
            {categoryList.map(cat => (
              <Link key={cat.key} to={`/menu/${cat.key}`} className="category-card">
                <span className="category-icon">{categoryIcons[cat.key]}</span>
                <span className="category-name">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
