import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';

const categories = [
  { key: '', label: 'Tất cả', icon: '📋' },
  { key: 'mon-nhau', label: 'Món nhậu', icon: '🍗' },
  { key: 'tra-sua', label: 'Trà sữa', icon: '🧋' },
  { key: 'chien', label: 'Chiên', icon: '🍟' },
  { key: 'pho-bun', label: 'Phở & Bún', icon: '🍜' },
  { key: 'com', label: 'Cơm', icon: '🍚' },
  { key: 'mon-an-vat', label: 'Món ăn vặt', icon: '🍢' },
  { key: 'nuoc', label: 'Nước', icon: '🥤' },
  { key: 'lau', label: 'Lẩu', icon: '🍲' }
];

const categoryIcons = {
  'mon-nhau': '🍗', 'tra-sua': '🧋', 'chien': '🍟', 'pho-bun': '🍜',
  'com': '🍚', 'mon-an-vat': '🍢', 'nuoc': '🥤', 'lau': '🍲'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'd';
};

const Menu = () => {
  const { category: urlCategory } = useParams();
  const [foods, setFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState(urlCategory || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
    else setActiveCategory('');
  }, [urlCategory]);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory) params.append('category', activeCategory);
        if (search) params.append('search', search);

        const res = await API.get(`/foods?${params.toString()}`);
        setFoods(res.data);
      } catch (err) {
        console.error('Error fetching foods:', err);
      }
      setLoading(false);
    };
    fetchFoods();
  }, [activeCategory, search]);

  const isPromoActive = (food) => {
    return food.isPromotion && food.promotionPrice && new Date(food.promotionEnd) > new Date();
  };

  return (
    <div className="menu-page">
      <div className="container">
        <h1>🍽️ Thực đơn</h1>

        <div className="menu-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`category-pill ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : foods.length === 0 ? (
          <div className="empty-state">Không tìm thấy món ăn nào</div>
        ) : (
          <div className="food-grid">
            {foods.map(food => (
              <div key={food._id} className={`food-card ${isPromoActive(food) ? 'promo-card' : ''}`}>
                {isPromoActive(food) && (
                  <div className="promo-badge">
                    -{Math.round((1 - food.promotionPrice / food.price) * 100)}%
                  </div>
                )}
                <Link to={`/food/${food._id}`}>
                  <div className="food-image">
                    {food.image ? <img src={food.image} alt={food.name} /> : <span className="food-emoji">{categoryIcons[food.category] || '🍽️'}</span>}
                  </div>
                </Link>
                <div className="food-info">
                  <Link to={`/food/${food._id}`}><h3>{food.name}</h3></Link>
                  <p className="food-desc">{food.description}</p>
                  <div className="food-price">
                    {isPromoActive(food) ? (
                      <>
                        <span className="price-old">{formatPrice(food.price)}</span>
                        <span className="price-new">{formatPrice(food.promotionPrice)}</span>
                      </>
                    ) : (
                      <span className="price-current">{formatPrice(food.price)}</span>
                    )}
                  </div>
                  <button className="add-cart-btn" onClick={() => addToCart(food)}>+ Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
