import { ArrowRight, Code, PenTool, Video, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const staticCategories = [
  { name: 'Development & IT', icon: <Code size={24} />, color: 'var(--accent-primary)', jobs: 1240 },
  { name: 'Design & Creative', icon: <PenTool size={24} />, color: '#ec4899', jobs: 843 },
  { name: 'Video & Animation', icon: <Video size={24} />, color: '#8b5cf6', jobs: 423 },
  { name: 'Digital Marketing', icon: <Search size={24} />, color: '#10b981', jobs: 512 }
];

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Backend dan haqiqiy Product larni yuklab olish
    axios.get('http://127.0.0.1:8000/products/product-list/')
      .then(res => {
        // O'zining mahsulotlarini ko'rmasligi uchn filtr qilamiz
        const filtered = user 
          ? res.data.filter((s: any) => s.seller !== user.username) 
          : res.data;
        setFeaturedServices(filtered);
      })
      .catch(err => console.error("Xizmatlarni yuklashda xatolik:", err));
      
    // Backend dan haqiqiy Kategoriyalarni yuklab olish
    axios.get('http://127.0.0.1:8000/products/categories/')
      .then(res => {
        setDbCategories(res.data);
      })
      .catch(err => console.error("Kategoriyalarni yuklashda xatolik:", err));
  }, []);

  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("http")) return imgUrl;
    return `http://127.0.0.1:8000${imgUrl}`;
  };

  // Dinamik fon tanlash funksiyasi
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
          <h1 className="brand-font" style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Find the perfect <span className="text-gradient">freelance</span><br /> services for your business
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Work with talented people at the most affordable price to get the most out of your time and cost.
          </p>
          
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px', background: 'var(--glass-bg)', padding: '8px', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0 24px', outline: 'none', fontSize: '16px' }} 
            />
            <button className="btn btn-primary" style={{ borderRadius: '50px', padding: '12px 32px' }}>
              Search
            </button>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Popular:</span>
            <span className="glass-panel" style={{ padding: '4px 16px', borderRadius: '50px', fontSize: '14px', cursor: 'pointer' }}>Website Design</span>
            <span className="glass-panel" style={{ padding: '4px 16px', borderRadius: '50px', fontSize: '14px', cursor: 'pointer' }}>WordPress</span>
            <span className="glass-panel" style={{ padding: '4px 16px', borderRadius: '50px', fontSize: '14px', cursor: 'pointer' }}>Logo Design</span>
            <span className="glass-panel" style={{ padding: '4px 16px', borderRadius: '50px', fontSize: '14px', cursor: 'pointer' }}>Dropshipping</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 className="brand-font" style={{ fontSize: '32px' }}>Explore by Category</h2>
            <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              All Categories <ArrowRight size={16} />
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {dbCategories.map((cat, idx) => {
              // Har bir kategoriya uchn maxsus default icon va color tuzamiz
              const isTech = cat.name.toLowerCase().includes('react') || cat.name.toLowerCase().includes('django') || cat.name.toLowerCase().includes('app') || cat.name.toLowerCase().includes('data');
              const isDesign = cat.name.toLowerCase().includes('design') || cat.name.toLowerCase().includes('video');
              const isMarketing = cat.name.toLowerCase().includes('marketing') || cat.name.toLowerCase().includes('seo') || cat.name.toLowerCase().includes('copy');
              
              let Icon = Code;
              let color = '#43e97b';
              if (isDesign) { Icon = PenTool; color = '#ec4899'; }
              if (isMarketing) { Icon = Search; color = '#10b981'; }

              return (
              <div key={idx} className="glass-panel" style={{ padding: '32px 24px', cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, marginBottom: '20px' }}>
                  <Icon size={24} />
                </div>
                <h3 className="brand-font" style={{ fontSize: '20px', marginBottom: '8px' }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', lineHeight: 1.4 }}>{cat.description || "Ushbu yo'nalishdagi eng sara xizmatlar"}</p>
              </div>
            )})}
            {dbCategories.length === 0 && <p style={{color: 'var(--text-secondary)'}}>Kategoriyalar maxsus API dan kutilmoqda...</p>}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 className="brand-font" style={{ fontSize: '32px', marginBottom: '40px' }}>Featured Services</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {featuredServices.map((service) => (
              <Link to={`/product/${service.id}`} key={service.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ width: '100%', height: '200px', background: service.main_image ? 'rgba(255,255,255,0.05)' : getRandomGradient(service.id), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {service.main_image ? (
                     <img src={getImageUrl(service.main_image)} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <span style={{color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.8}}>{service.title.substring(0, 15)}...</span>
                  )}
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {service.seller ? service.seller.charAt(0) : "U"}
                    </div>
                    <span style={{ fontWeight: 500 }}>{service.seller || "Sotuvchi"}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4, marginBottom: 'auto', flex: 1 }}>{service.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 10px 0' }}>{service.orders_count || 0} marta buyurtma berilgan ({service.views_count || 0} ko'rish)</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                    <Star size={16} fill="currentColor" />
                    <span style={{ fontWeight: 600 }}>{service.average_rating || 0}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({service.reviews ? service.reviews.length : 0})</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', marginTop: '20px', paddingTop: '20px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Boshlang'ich narx</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>${service.price_standard}</span>
                  </div>
                </div>
              </Link>
            ))}
            {featuredServices.length === 0 && <p className="text-secondary">Bazangizda hozircha hech qanday e'lon qilingan xizmatlar mavjud emas.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
