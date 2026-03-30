import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '80px', padding: '60px 0 30px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <h3 className="brand-font" style={{ fontSize: '24px', marginBottom: '20px' }}>
            <span className="text-gradient">Freelance</span>Pro
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Connect with top freelancers around the world and get your projects done beautifully.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>For Clients</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>How to hire</Link>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Project Catalog</Link>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Enterprise</Link>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>For Freelancers</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>How to find work</Link>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Direct Contracts</Link>
            <Link to="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Community</Link>
          </div>
        </div>

      </div>
      <div className="container" style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
        © {new Date().getFullYear()} FreelancePro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
