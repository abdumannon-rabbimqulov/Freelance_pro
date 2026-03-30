import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, Loader } from 'lucide-react';
import './Auth.css'; // Qulaylik uchn ayni vizual kodlarni foydalanamiz

const CreateProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    price_standard: '',
    delivery_time_standard: '',
    revisions_standard: '',
    category: '', // API orqali olamiz
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Kategoriya ro'yxatini yuklash
  React.useEffect(() => {
    axios.get('http://127.0.0.1:8000/products/categories/')
      .then(res => {
        setCategories(res.data);
        if (res.data && res.data.length > 0) {
           setFormData(f => ({ ...f, category: res.data[0].id.toString() }));
        }
      })
      .catch(err => console.error("Kategoriyalarni yuklashda xatolik:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.warning("Iltimos xizmatingiz uchun Asosiy Rasm yuklang!");
      return;
    }

    setLoading(true);
    // Vektorlash vaqtini inobatga olib maxsus Toast ishlatamiz
    const toastId = toast.loading("Xizmat yaratilmoqda, A.I. rasmni tahlil qilmoqda...");

    try {
      const token = localStorage.getItem('access');
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append('main_image', image);

      await axios.post('http://127.0.0.1:8000/products/products/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.update(toastId, { render: "Muvaffaqiyatli saqlandi!", type: "success", isLoading: false, autoClose: 3000 });
      navigate('/');
    } catch (error: any) {
      let errorMsg = "Xatolik yuz berdi";
      if (error.response?.data) {
         if (error.response.data.message) {
            errorMsg = error.response.data.message;
         } else {
            // DRF Validation Errorni formatlash (Masalan: category: "Object doesn't exist")
            const firstKey = Object.keys(error.response.data)[0];
            const firstError = error.response.data[firstKey];
            errorMsg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
         }
      }
      toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 5000 });
      console.error(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container py-5" style={{ minHeight: '100vh', alignItems: 'flex-start' }}>
      <div className="auth-card glass-panel" style={{ maxWidth: '600px', width: '100%', marginTop: '40px' }}>
        <h2 className="auth-title">Yangi Xizmat (Gig)</h2>
        <p className="auth-subtitle">Mahoratingizni mijozlarga soting</p>

        <form onSubmit={handleSubmit} className="auth-form mt-4">
          <div className="input-group">
            <label>Sarlavha (Nima narsa bera olasiz?)</label>
            <input 
              name="title" required type="text" placeholder="Men Siz uchun ajoyib veb dizayn chizaman" 
              value={formData.title} onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Kategoriya</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                style={{
                  padding: '14px 16px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)',
                  color: '#fff', border: '1px solid var(--border-color)', outline: 'none'
                }}
              >
                 {categories.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
                 {categories.length === 0 && <option value="">Kategoriya topilmadi</option>}
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Narx ($)</label>
              <input name="price_standard" type="number" placeholder="50.00" value={formData.price_standard} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Muddati (Kunlar)</label>
              <input name="delivery_time_standard" type="number" placeholder="Masalan: 5" value={formData.delivery_time_standard} onChange={handleChange} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Qaytadan ishlash (Revision)</label>
              <input name="revisions_standard" type="number" placeholder="Masalan: 3 marta" value={formData.revisions_standard} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Qisqacha Tavsif</label>
            <textarea 
              name="description" required rows={3} placeholder="Xizmatingiz qanday foyda beradi?"
              style={{ padding: '14px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none' }}
              value={formData.description} onChange={handleChange}
            ></textarea>
          </div>

          <div className="input-group">
            <label>To'liq Ma'lumot</label>
            <textarea 
              name="full_description" required rows={5} placeholder="Barcha detallar, qoidalar va kutilmalar"
              style={{ padding: '14px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none' }}
              value={formData.full_description} onChange={handleChange}
            ></textarea>
          </div>

          <div className="input-group mt-2">
            <label>Asosiy Rasm (Banner)</label>
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              ) : (
                <>
                  <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Rasmni tanlang yoxud shu yerga torting</p>
                </>
              )}
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {loading ? <><Loader className="spin" size={20}/> Tahlil qilinmoqda...</> : "Saqlash va Chop etish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
