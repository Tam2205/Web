import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const categories = [
  { key: 'mon-nhau', label: 'Mon nhau' },
  { key: 'tra-sua', label: 'Tra sua' },
  { key: 'chien', label: 'Chien' },
  { key: 'pho-bun', label: 'Pho & Bun' },
  { key: 'com', label: 'Com' },
  { key: 'mon-an-vat', label: 'Mon an vat' },
  { key: 'nuoc', label: 'Nuoc' },
  { key: 'lau', label: 'Lau' }
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
          setError('Khong tim thay mon an');
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
      setError(err.response?.data?.msg || 'Co loi xay ra');
    }
    setLoading(false);
  };

  return (
    <div className="admin-form-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/admin')}>← Quay lai</button>
        <h1>{isEdit ? '✏️ Sua mon an' : '➕ Them mon moi'}</h1>

        {error && <div className="error-msg">{error}</div>}

        <form className="admin-food-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ten mon an *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ten mon an" required />
          </div>

          <div className="form-group">
            <label>Mo ta</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mo ta mon an" rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gia (VND) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" min="0" required />
            </div>

            <div className="form-group">
              <label>Danh muc *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>URL hinh anh</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="isPromotion" checked={formData.isPromotion} onChange={handleChange} />
              Dang khuyen mai
            </label>
          </div>

          {formData.isPromotion && (
            <div className="form-row">
              <div className="form-group">
                <label>Gia khuyen mai (VND)</label>
                <input type="number" name="promotionPrice" value={formData.promotionPrice} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>Ket thuc khuyen mai</label>
                <input type="datetime-local" name="promotionEnd" value={formData.promotionEnd} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
              Con hang
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Dang xu ly...' : (isEdit ? 'Cap nhat' : 'Them mon')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFoodForm;
