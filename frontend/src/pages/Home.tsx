import { ArrowRight, Code, PenTool, Video, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Development & IT', icon: <Code size={24} />, color: 'var(--accent-primary)', jobs: 1240 },
  { name: 'Design & Creative', icon: <PenTool size={24} />, color: '#ec4899', jobs: 843 },
  { name: 'Video & Animation', icon: <Video size={24} />, color: '#8b5cf6', jobs: 423 },
  { name: 'Digital Marketing', icon: <Search size={24} />, color: '#10b981', jobs: 512 }
];

const featuredServices = [
  {
    id: 1,
    title: "I will design an amazing React website",
    seller: "Alex Doe",
    price: 150,
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    id: 2,
    title: "I will create a stunning logo design",
    seller: "Sarah Smith",
    price: 85,
    rating: 5.0,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    id: 3,
    title: "I will build a custom Django backend API",
    seller: "John Dev",
    price: 250,
    rating: 4.8,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=300"
  }
];

const Home = () => {
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
            {categories.map((cat, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '32px 24px', cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, marginBottom: '20px' }}>
                  {cat.icon}
                </div>
                <h3 className="brand-font" style={{ fontSize: '20px', marginBottom: '8px' }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>{cat.jobs} projects available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 className="brand-font" style={{ fontSize: '32px', marginBottom: '40px' }}>Featured Services</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {featuredServices.map((service) => (
              <div key={service.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={service.image} alt={service.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {service.seller.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{service.seller}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4, marginBottom: 'auto', flex: 1 }}>{service.title}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#fbbf24' }}>
                    <Star size={16} fill="currentColor" />
                    <span style={{ fontWeight: 600 }}>{service.rating}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({service.reviews})</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', marginTop: '20px', paddingTop: '20px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Starting at</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>${service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
