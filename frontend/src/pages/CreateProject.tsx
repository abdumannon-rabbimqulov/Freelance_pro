import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Briefcase, Info, DollarSign, Clock, Layers } from 'lucide-react';

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/products/category-list/');
        setCategories(res.data);
      } catch (err) {
        toast.error("Kategoriyalarni yuklashda xatolik.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
        toast.warning("Iltimos, kategoriya tanlang!");
        return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/service/', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success("E'lon muvaffaqiyatli saqlandi! Admin tasdiqlashini kuting.");
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "E'lon berishda xatolik yuz berdi.");
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
                style={{ height: '100px' }}
              />
            </div>

            <div className="input-group">
              <label>To'liq tavsif (Talablar va topshiriqlar)</label>
              <textarea 
                placeholder="Loyiha bo'yicha batafsil ma'lumot qoldiring..."
                value={formData.full_description}
                onChange={e => setFormData({...formData, full_description: e.target.value})}
                required
                style={{ height: '180px' }}
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

            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '20px', padding: '15px', fontSize: '18px', background: 'var(--accent-secondary)' }}
                disabled={loading}
            >
              {loading ? "Yuborilmoqda..." : "E'lonni chop etishga yuborish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
