import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Đăng ký thất bại');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📝 Đăng ký</h1>
        <p className="auth-subtitle">Tạo tài khoản để đặt món</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập họ tên" required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" required minLength={6} />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu *</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0912345678" />
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ giao hàng mặc định" />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
