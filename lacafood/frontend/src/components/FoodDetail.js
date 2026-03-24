import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';

const categoryNames = {
  'mon-nhau': 'Món nhậu', 'tra-sua': 'Trà sữa', 'chien': 'Chiên',
  'pho-bun': 'Phở & Bún', 'com': 'Cơm', 'mon-an-vat': 'Món ăn vặt',
  'nuoc': 'Nước', 'lau': 'Lẩu'
};

const categoryIcons = {
  'mon-nhau': '🍗', 'tra-sua': '🧋', 'chien': '🍟', 'pho-bun': '🍜',
  'com': '🍚', 'mon-an-vat': '🍢', 'nuoc': '🥤', 'lau': '🍲'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await API.get(`/foods/${id}`);
        setFood(res.data);
      } catch (err) {
        console.error('Error fetching food:', err);
      }
      setLoading(false);
    };
    fetchFood();
  }, [id]);

  const isPromoActive = () => {
    return food?.isPromotion && food?.promotionPrice && new Date(food.promotionEnd) > new Date();
  };

  const handleAddToCart = () => {
    addToCart(food, quantity, note);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!food) return <div className="empty-state">Không tìm thấy món ăn</div>;

  const currentPrice = isPromoActive() ? food.promotionPrice : food.price;

  return (
    <div className="food-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>

        <div className="food-detail">
          <div className="food-detail-image">
            {food.image ? (
              <img src={food.image} alt={food.name} />
            ) : (
              <span className="food-emoji-large">{categoryIcons[food.category] || '🍽️'}</span>
            )}
            {isPromoActive() && (
              <div className="promo-badge-large">
                GIẢM {Math.round((1 - food.promotionPrice / food.price) * 100)}%
              </div>
            )}
          </div>

          <div className="food-detail-info">
            <span className="food-category-tag">{categoryNames[food.category]}</span>
            <h1>{food.name}</h1>
            <p className="food-detail-desc">{food.description}</p>

            <div className="food-detail-price">
              {isPromoActive() ? (
                <>
                  <span className="price-old-large">{formatPrice(food.price)}</span>
                  <span className="price-new-large">{formatPrice(food.promotionPrice)}</span>
                </>
              ) : (
                <span className="price-current-large">{formatPrice(food.price)}</span>
              )}
            </div>

            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="note-section">
              <label>📝 Ghi chú / Yêu cầu đặc biệt:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Ít cay, thêm rau, không hành..."
                rows={3}
              />
            </div>

            <div className="food-detail-total">
              <span>Tổng: </span>
              <span className="total-price">{formatPrice(currentPrice * quantity)}</span>
            </div>

            <button
              className={`add-cart-btn-large ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? '✓ Đã thêm vào giỏ!' : '🛒 Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
