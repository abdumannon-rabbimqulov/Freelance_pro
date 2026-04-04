import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Briefcase, Info, DollarSign, Clock, Layers, Upload, Loader } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    full_description: '',
    price_standard: '',
    delivery_standard: '',
    revisions_standard: '1'
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('products/categories/');
        setCategories(res.data);
      } catch (err) {
        toast.error("Kategoriyalarni yuklashda xatolik.");
      }
    };
    fetchCategories();
  }, []);

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
    if (!formData.category) {
        toast.warning("Iltimos, kategoriya tanlang!");
        return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      if (images.length > 0) {
        data.append('main_image', images[0]);
        images.forEach((img) => {
           data.append('images', img);
        });
      }

      await api.post('service/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("E'lon muvaffaqiyatli saqlandi! Admin tasdiqlashini kuting.");
      navigate('/profile');
    } catch (err: any) {
      let errorMsg = "E'lon berishda xatolik yuz berdi.";
      if (err.response?.data) {
        if (err.response.data.message) {
            errorMsg = err.response.data.message;
        } else {
            const firstKey = Object.keys(err.response.data)[0];
            const firstError = err.response.data[firstKey];
            errorMsg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product-page animate-fade-in" style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Briefcase size={48} style={{ color: 'var(--accent-secondary)', marginBottom: '15px' }} />
          <h1 className="brand-font" style={{ fontSize: '36px' }}>Yangi Loyiha E'loni</h1>
          <p style={{ color: 'var(--text-secondary)' }}>O'zingizga kerakli xizmat bo'yicha e'lon qoldiring va mutaxassislarni toping</p>
        </div>

        <div className="glass-panel" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} /> Loyiha sarlavhasi
              </label>
              <input 
                type="text" 
                placeholder="Masalan: Logotip tayyorlash uchn dizayner kerak"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} /> Kategoriya (Majburiy)
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>Kategoriyani tanlang</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a' }}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Qisqa tavsif</label>
              <textarea 
                placeholder="Loyihaning umumiy mazmuni..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
                style={{ height: '100px', width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
              />
            </div>

            <div className="input-group">
              <label>To'liq tavsif (Talablar va topshiriqlar)</label>
              <textarea 
                placeholder="Loyiha bo'yicha batafsil ma'lumot qoldiring..."
                value={formData.full_description}
                onChange={e => setFormData({...formData, full_description: e.target.value})}
                required
                style={{ height: '180px', width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} /> Tahminiy Budjet ($)
                </label>
                <input 
                  type="number" 
                  placeholder="50"
                  value={formData.price_standard}
                  onChange={e => setFormData({...formData, price_standard: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} /> Muddat (kun)
                </label>
                <input 
                  type="number" 
                  placeholder="3"
                  value={formData.delivery_standard}
                  onChange={e => setFormData({...formData, delivery_standard: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="input-group mt-2">
              <label>Loyihaga oid rasmlar (Ixtiyoriy, maks 5 ta)</label>
              <div 
                style={{
                  border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '30px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.02)', position: 'relative', marginBottom: '15px'
                }}
              >
                <input 
                  type="file" multiple accept="image/*" onChange={handleImageChange}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={36} style={{ color: 'var(--accent-secondary)', marginBottom: '10px' }} />
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

            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '20px', padding: '15px', fontSize: '18px', background: 'var(--accent-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                disabled={loading}
            >
              {loading ? <><Loader className="spin" size={20}/> Yuborilmoqda...</> : "E'lonni chop etishga yuborish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
