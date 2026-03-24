import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🍊 LacaFood</h3>
            <p>Nền tảng đặt đồ ăn trực tuyến hàng đầu. Giao hàng nhanh chóng, chất lượng đảm bảo, giá cả hợp lý.</p>
          </div>
          <div className="footer-links">
            <h4>Khám phá</h4>
            <Link to="/menu">Thực đơn</Link>
            <Link to="/menu/mon-nhau">Món nhậu</Link>
            <Link to="/menu/tra-sua">Trà sữa</Link>
            <Link to="/menu/lau">Lẩu</Link>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ</h4>
            <Link to="/">Trang chủ</Link>
            <Link to="/cart">Giỏ hàng</Link>
            <Link to="/orders">Đơn hàng</Link>
            <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LacaFood. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
