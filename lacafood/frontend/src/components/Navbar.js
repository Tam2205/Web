import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const categories = [
  { key: 'mon-nhau', label: 'Món Nhậu' },
  { key: 'tra-sua', label: 'Trà Sữa' },
  { key: 'chien', label: 'Chiên' },
  { key: 'pho-bun', label: 'Phở & ún'},
  { key: 'com', label: 'Cơm' },
  { key: 'mon-an-vat', label: 'Món Ăn Vặt' },
  { key: 'nuoc', label: 'Nước' },
  { key: 'lau', label: 'Lẩu' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🍊 LacaFood
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          ☰
        </button>

        <div className={`nav-links ${mobileOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Trang chủ</Link>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <Link to="/menu" className="nav-link" onClick={() => setMobileOpen(false)}>
              Thuc don ▾
            </Link>
            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/menu" className="dropdown-item" onClick={() => { setMenuOpen(false); setMobileOpen(false); }}>
                  📋 Tất cả món
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.key}
                    to={`/menu/${cat.key}`}
                    className="dropdown-item"
                    onClick={() => { setMenuOpen(false); setMobileOpen(false); }}
                  >
                    {cat.icon} {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart" className="nav-link cart-link" onClick={() => setMobileOpen(false)}>
            Giỏ hàng
            {getItemCount() > 0 && <span className="cart-badge">{getItemCount()}</span>}
          </Link>

          {user ? (
            <div
              className="nav-dropdown"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <span className="nav-link user-link">
                👤 {user.name} ▾
              </span>
              {userMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/orders" className="dropdown-item" onClick={() => { setUserMenuOpen(false); setMobileOpen(false); }}>
                    📦 Đơn hàng
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => { setUserMenuOpen(false); setMobileOpen(false); }}>
                      ⚙️ Quản trị
                    </Link>
                  )}
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link login-link" onClick={() => setMobileOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
