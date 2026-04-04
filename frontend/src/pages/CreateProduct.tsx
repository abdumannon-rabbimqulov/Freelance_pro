import React, { useState, useEffect } from 'react';
import api from '../api/api';
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

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Kategoriya ro'yxatini yuklash
  useEffect(() => {
    api.get('products/categories/')
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
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalImages = [...images, ...selectedFiles].slice(0, 5); // Maks 5 ta
      
      setImages(totalImages);
      
      const newPreviews = totalImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      
      if (selectedFiles.length + images.length > 5) {
        toast.info("Maksimal 5 ta rasm yuklash mumkin.");
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.warning("Iltimos xizmatingiz uchun kamida 1 ta rasm yuklang!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Xizmat yaratilmoqda, A.I. rasmlarni tahlil qilmoqda...");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Birinchi rasm main_image bo'ladi
      data.append('main_image', images[0]);
      
      // Qolganlari gallereya uchn
      images.forEach((img) => {
        data.append('images', img);
      });

      await api.post('products/products/', data, {
        headers: {
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
        <p className="auth-subtitle">Mahoratingizni mijozlarga soting (Maks 5 ta rasm)</p>

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
            <label>Gallereya Rasmlari (Maks 5 ta, birinchisi asosiy bo'ladi)</label>
            <div 
              style={{
                border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '30px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'rgba(255,255,255,0.02)', position: 'relative', marginBottom: '15px'
              }}
            >
              <input 
                type="file" multiple accept="image/*" onChange={handleImageChange}
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Rasmlarni tanlang ({images.length}/5)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
               {previews.map((src, idx) => (
                 <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                   <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.7)', color: '#fff', border: 'none', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                   >X</button>
                 </div>
               ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {loading ? <><Loader className="spin" size={20}/> Saqlanmoqda...</> : "Xizmatni Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
