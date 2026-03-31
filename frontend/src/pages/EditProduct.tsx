import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, Loader, Save } from 'lucide-react';
import './Auth.css';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    price_standard: '',
    delivery_time_standard: '',
    revisions_standard: '',
    category: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, productRes] = await Promise.all([
          api.get('products/categories/'),
          api.get(`products/product/${id}/`)
        ]);
        
        setCategories(catsRes.data);
        const p = productRes.data.data;
        setFormData({
            title: p.title,
            description: p.description,
            full_description: p.full_description,
            price_standard: p.price_standard.toString(),
            delivery_time_standard: p.delivery_time_standard.toString(),
            revisions_standard: p.revisions_standard.toString(),
            category: p.category_id ? p.category_id.toString() : p.category.toString(),
        });
        
        if (p.main_image) {
            setPreviews([`http://127.0.0.1:8000${p.main_image}`]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalImages = [...images, ...selectedFiles].slice(0, 5);
      setImages(totalImages);
      const newPreviews = totalImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("O'zgarishlar saqlanmoqda...");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      if (images.length > 0) {
        data.append('main_image', images[0]);
        images.forEach((img) => data.append('images', img));
      }

      await api.put(`products/product/${id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.update(toastId, { render: "Muvaffaqiyatli yangilandi!", type: "success", isLoading: false, autoClose: 3000 });
      navigate(`/product/${id}`);
    } catch (error: any) {
      toast.update(toastId, { render: "Xatolik yuz berdi", type: "error", isLoading: false, autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="container py-10 text-center">Yuklanmoqda...</div>;

  return (
    <div className="auth-container py-5" style={{ minHeight: '100vh', alignItems: 'flex-start' }}>
      <div className="auth-card glass-panel" style={{ maxWidth: '600px', width: '100%', marginTop: '40px' }}>
        <h2 className="auth-title">Xizmatni Tahrirlash</h2>
        
        <form onSubmit={handleSubmit} className="auth-form mt-4">
          <div className="input-group">
            <label>Sarlavha</label>
            <input name="title" required type="text" value={formData.title} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Kategoriya</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Narx ($)</label>
              <input name="price_standard" type="number" value={formData.price_standard} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Qisqacha Tavsif</label>
            <textarea name="description" required rows={3} value={formData.description} onChange={handleChange}
              style={{ padding: '14px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none' }}
            ></textarea>
          </div>

          <div className="input-group">
            <label>Gallereya (Yangi rasmlar yuklash ixtiyoriy)</label>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '20px', textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '5px' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Yangi rasmlar tanlang</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {previews.map((p, i) => (
                    <img key={i} src={p} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="preview" />
                ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {loading ? <Loader className="spin" size={20}/> : <Save size={20} />} Saqlash
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
