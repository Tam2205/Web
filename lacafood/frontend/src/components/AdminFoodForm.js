import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const categories = [
  { key: 'mon-nhau', label: 'Món nhậu' },
  { key: 'tra-sua', label: 'Trà sữa' },
  { key: 'chien', label: 'Chiên' },
  { key: 'pho-bun', label: 'Phở & Bún' },
  { key: 'com', label: 'Cơm' },
  { key: 'mon-an-vat', label: 'Món ăn vặt' },
  { key: 'nuoc', label: 'Nước' },
  { key: 'lau', label: 'Lẩu' }
];

const AdminFoodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', image: '', category: 'mon-nhau',
    isPromotion: false, promotionPrice: '', promotionEnd: '', available: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchFood = async () => {
        try {
          const res = await API.get(`/foods/${id}`);
          const food = res.data;
          setFormData({
            name: food.name,
            description: food.description || '',
            price: food.price,
            image: food.image || '',
            category: food.category,
            isPromotion: food.isPromotion || false,
            promotionPrice: food.promotionPrice || '',
            promotionEnd: food.promotionEnd ? new Date(food.promotionEnd).toISOString().slice(0, 16) : '',
            available: food.available !== false
          });
        } catch (err) {
          setError('Không tìm thấy món ăn');
        }
      };
      fetchFood();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        promotionPrice: formData.isPromotion ? Number(formData.promotionPrice) : undefined,
        promotionEnd: formData.isPromotion ? formData.promotionEnd : undefined
      };

      if (isEdit) {
        await API.put(`/foods/${id}`, data);
      } else {
        await API.post('/foods', data);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div className="admin-form-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/admin')}>← Quay lại</button>
        <h1>{isEdit ? '✏️ Sửa món ăn' : '➕ Thêm món mới'}</h1>

        {error && <div className="error-msg">{error}</div>}

        <form className="admin-food-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên món ăn *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên món ăn" required />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả món ăn" rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá (VND) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" min="0" required />
            </div>

            <div className="form-group">
              <label>Danh mục *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>URL hình ảnh</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="isPromotion" checked={formData.isPromotion} onChange={handleChange} />
              Đang khuyến mãi
            </label>
          </div>

          {formData.isPromotion && (
            <div className="form-row">
              <div className="form-group">
                <label>Giá khuyến mãi (VND)</label>
                <input type="number" name="promotionPrice" value={formData.promotionPrice} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>Kết thúc khuyến mãi</label>
                <input type="datetime-local" name="promotionEnd" value={formData.promotionEnd} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
              Còn hàng
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm món')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFoodForm;
