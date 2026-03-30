import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, Clock, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'settings'>('services');

  // Profile Form States
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    conf_password: ''
  });

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/products/product-seller-list/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(res.data);
    } catch (err) {
      console.error("Xizmatlaringizni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      }));
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/users/user-change-info/', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Ma'lumotlar yangilandi!");
      await refreshUser(); // Navbardagi ismni yangilash
      setProfileData(prev => ({ ...prev, password: '', conf_password: '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatan ham ushbu xizmatni o'chirib yubormoqchimisiz?")) return;
    
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/products/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Xizmat o'chirildi.");
      setMyProducts(myProducts.filter(p => p.id !== id));
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi.");
    }
  };

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Yuklanmoqda...</div>;

  return (
    <div className="profile-page animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 className="brand-font" style={{ fontSize: '32px' }}>Salom, {user?.username || 'Foydalanuvchi'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>O'z faoliyatingiz va profilingizni shu yerdan boshqaring</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button 
               onClick={() => setActiveTab('services')}
               className={`btn ${activeTab === 'services' ? 'btn-primary' : ''}`}
               style={{ background: activeTab === 'services' ? '' : 'rgba(255,255,255,0.05)' }}
             >
               Xizmatlarim
             </button>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
               style={{ background: activeTab === 'settings' ? '' : 'rgba(255,255,255,0.05)' }}
             >
               Sozlamalar
             </button>
          </div>
        </div>

        {activeTab === 'services' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
               <Link to="/create-product" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Plus size={18} /> Yangi xizmat
               </Link>
            </div>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '20px' }}>Xizmat nomi</th>
                <th style={{ padding: '20px' }}>Narxi</th>
                <th style={{ padding: '20px' }}>Holati</th>
                <th style={{ padding: '20px' }}>Ko'rishlar</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <div style={{ width: '50px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                          {product.main_image && <img src={`http://127.0.0.1:8000${product.main_image}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                       </div>
                       <span style={{ fontWeight: 500 }}>{product.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px', fontWeight: 600 }}>${product.price_standard}</td>
                  <td style={{ padding: '20px' }}>
                    {product.is_active ? (
                      <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '14px', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                        <CheckCircle size={14} /> Approved
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '14px', background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-tertiary)' }}>{product.views_count} marta</td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <Link to={`/product/${product.id}`} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        <ExternalLink size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="btn" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {myProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Sizda hali hech qanday faol xizmatlar mavjud emas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
        ) : (
          <div className="glass-panel" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Profil ma'lumotlarini tahrirlash</h2>
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label>Foydalanuvchi nomi (Username)</label>
                <input 
                  type="text" 
                  value={profileData.username}
                  onChange={e => setProfileData({...profileData, username: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label>Ism</label>
                  <input 
                    type="text" 
                    value={profileData.first_name}
                    onChange={e => setProfileData({...profileData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Sharif</label>
                  <input 
                    type="text" 
                    value={profileData.last_name}
                    onChange={e => setProfileData({...profileData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Yangi Parol (Tasdiqlash uchn shart)</label>
                <input 
                  type="password" 
                  value={profileData.password}
                  onChange={e => setProfileData({...profileData, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="input-group">
                <label>Parolni tasdiqlash</label>
                <input 
                  type="password" 
                  value={profileData.conf_password}
                  onChange={e => setProfileData({...profileData, conf_password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Ma'lumotlarni saqlash</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
