import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/products/admin-product-list/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingProducts(res.data);
    } catch (err) {
      console.error("Tasdiq kutilayotgan xizmatlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('access');
      await axios.post(`http://127.0.0.1:8000/products/product/${id}/approve/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Xizmat tasdiqlandi va chop etildi!");
      setPendingProducts(pendingProducts.filter(p => p.id !== id));
    } catch (err) {
      toast.error("Tasdiqlashda xatolik yuz berdi.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Admin sifatida ushbu xizmatni butunlay o'chirib yubormoqchimisiz?")) return;
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/products/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Xizmat o'chirildi.");
      setPendingProducts(pendingProducts.filter(p => p.id !== id));
    } catch (err) {
      toast.error("O'chirishda xatolik.");
    }
  };

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Admin ma'lumotlari yuklanmoqda...</div>;

  return (
    <div className="admin-dashboard-page animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <ShieldAlert size={40} style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <h1 className="brand-font" style={{ fontSize: '32px' }}>Admin Boshqaruv Paneli</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Yangi e'lon qilingan xizmatlarni tasdiqlash va moderatsiya qilish</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '20px' }}>Sotuvchi</th>
                <th style={{ padding: '20px' }}>Xizmat nomi</th>
                <th style={{ padding: '20px' }}>Narxi</th>
                <th style={{ padding: '20px' }}>Sana</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 600 }}>{product.seller || "Noma'lum"}</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <div style={{ width: '40px', height: '30px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                          {product.main_image && <img src={`http://127.0.0.1:8000${product.main_image}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                       </div>
                       <span style={{ fontWeight: 500 }}>{product.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>${product.price_standard}</td>
                  <td style={{ padding: '20px', color: 'var(--text-tertiary)', fontSize: '14px' }}>{product.created_at?.substring(0, 10)}</td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <Link to={`/product/${product.id}`} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        <ExternalLink size={18} />
                      </Link>
                      <button onClick={() => handleApprove(product.id)} className="btn" style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Hozircha tasdiq kutilayotgan hech qanday yangi xizmatlar mavjud emas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
