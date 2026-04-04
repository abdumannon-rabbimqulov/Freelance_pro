import { ArrowRight, Code, PenTool, Video, Search, Star, Briefcase, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'projects'>('services');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'services' 
        ? 'products/product-list/' 
        : 'service/';
      
      const res = await api.get(endpoint, {
        params: { category: selectedCategory }
      });

      // O'zining mahsulotlarini filtr qilish (agar login qilgan bo'lsa)
      let data = res.data;
      if (activeTab === 'projects' && res.data.results) {
        data = res.data.results; // paginated response handling
      } else if (activeTab === 'projects' && !res.data.results) {
        data = res.data;
      }

      const filtered = user 
        ? data.filter((s: any) => s.seller !== user.username) 
        : data;
      
      setItems(filtered);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    // Kategoriyalarni yuklash
    api.get('products/categories/')
      .then(res => setDbCategories(res.data))
      .catch(err => console.error("Kategoriyalarni yuklashda xatolik:", err));
  }, []);

  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("http")) return imgUrl;
    return `http://127.0.0.1:8000${imgUrl}`;
  };

  const getRandomGradient = (id: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[id % gradients.length];
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '80px 0', textAlign: 'center', position: 'relative' }}>
        <div className="container">
          <h1 className="brand-font" style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Find the perfect <span className="text-gradient">freelance</span><br /> 
            {activeTab === 'services' ? 'services' : 'projects'} for your business
          </h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
             <button 
                onClick={() => {setActiveTab('services'); setSelectedCategory(null);}}
                className={`btn ${activeTab === 'services' ? 'btn-primary' : 'glass-panel'}`}
                style={{ padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px' }}
             >
                <LayoutGrid size={18} /> Xizmatlar (Seller)
             </button>
             <button 
                onClick={() => {setActiveTab('projects'); setSelectedCategory(null);}}
                className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'glass-panel'}`}
                style={{ padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px' }}
             >
                <Briefcase size={18} /> E'lonlar (Client)
             </button>
          </div>
          
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px', background: 'var(--glass-bg)', padding: '8px', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
            <input 
              type="text" 
              placeholder={activeTab === 'services' ? "Xizmatlarni qidiring..." : "Loyihalarni qidiring..."}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0 24px', outline: 'none', fontSize: '16px' }} 
            />
            <button className="btn btn-primary" style={{ borderRadius: '50px', padding: '12px 32px' }}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories Toolbar */}
      <section style={{ padding: '20px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{ 
                padding: '8px 20px', borderRadius: '50px', 
                background: selectedCategory === null ? 'var(--accent-primary)' : 'transparent',
                border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              Hammasi
            </button>
            {dbCategories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{ 
                  padding: '8px 20px', borderRadius: '50px', 
                  background: selectedCategory === cat.id ? 'var(--accent-primary)' : 'transparent',
                  border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content List */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 className="brand-font" style={{ fontSize: '32px' }}>
               {activeTab === 'services' ? 'Top Xizmatlar' : 'Yangi E’lonlar'}
            </h2>
            <span style={{ color: 'var(--text-tertiary)' }}>{items.length} ta natija</span>
          </div>
          
          {loading ? (
             <div style={{ textAlign: 'center', padding: '100px 0' }}>Yuklanmoqda...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {items.map((item) => (
                <Link 
                  to={activeTab === 'services' ? `/product/${item.id}` : `/project/${item.slug}`} 
                  key={item.id} className="glass-panel" 
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }} 
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ width: '100%', height: '200px', background: item.main_image ? 'rgba(255,255,255,0.05)' : getRandomGradient(item.id), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {item.main_image ? (
                       <img src={getImageUrl(item.main_image)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <span style={{color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.8}}>{item.title.substring(0, 15)}...</span>
                    )}
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {item.seller ? item.seller.charAt(0) : "U"}
                      </div>
                      <span style={{ fontWeight: 500 }}>{item.seller || "User"}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4, marginBottom: 'auto', flex: 1 }}>{item.title}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 10px 0' }}>{item.orders_count || 0} marta band qilingan ({item.views_count || 0} ko'rish)</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                      <Star size={16} fill="currentColor" />
                      <span style={{ fontWeight: 600 }}>{item.average_rating || 0}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>({item.reviews ? item.reviews.length : 0})</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', marginTop: '20px', paddingTop: '20px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{activeTab === 'services' ? 'Boshlang\'ich narx' : 'Taklif qilingan byudjet'}</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>${item.price_standard}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {items.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                   Hozircha bu turdagi e'lonlar mavjud emas.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
