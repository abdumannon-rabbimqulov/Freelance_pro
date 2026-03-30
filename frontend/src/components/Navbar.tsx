import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, Wallet, Settings, CreditCard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="logo brand-font">
          <span className="text-gradient">Freelance</span>Pro
        </Link>

        <div className="nav-search_desktop">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Find services..." className="search-input" />
            <button className="btn btn-primary search-btn">Search</button>
          </div>
        </div>

        <div className="nav-links desktop-only">
          <Link to="/explore" className="nav-link">Explore</Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {user.auth_role === 'admin' && (
                <>
                  <Link to="/admin-payouts" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                    <CreditCard size={18} /> Moliya
                  </Link>
                  <Link to="/admin-settings" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Settings size={18} /> Sozlamalar
                  </Link>
                </>
              )}
              {user.auth_role === 'seller' ? (
                <Link to="/create-product" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  + Xizmat Qo'shish
                </Link>
              ) : (
                <Link to="/create-project" className="btn btn-primary" style={{ padding: '8px 16px', background: 'var(--accent-secondary)' }}>
                  + E'lon Berish
                </Link>
              )}
              <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> 
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.username}</span>
                  {(user.auth_role === 'seller' || user.auth_role === 'admin') && (
                    <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Wallet size={10} /> ${user.balance || '0.00'}
                    </span>
                  )}
                </div>
              </Link>
              <Link to="/chat" className="nav-link">Chat</Link>
              <Link to="/orders" className="nav-link">Buyurtmalar</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-primary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', color: '#fff' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Join Now</Link>
            </>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu glass-panel animate-fade-in">
          <div className="nav-search_mobile">
            <input type="text" placeholder="Find services..." className="input-field" style={{ marginBottom: '16px' }} />
          </div>
          <Link to="/explore" className="nav-link">Explore</Link>
          {user ? (
            <>
              {user.auth_role === 'admin' && (
                <>
                  <Link to="/admin-payouts" className="nav-link" style={{ color: '#10b981' }}>Moliya (Payouts)</Link>
                  <Link to="/admin-settings" className="nav-link">Platforma Sozlamalari</Link>
                </>
              )}
              {user.auth_role === 'seller' ? (
                <Link to="/create-product" className="btn btn-primary" style={{ width: '100%', marginTop: '5px' }}>+ Xizmat Qo'shish</Link>
              ) : (
                <Link to="/create-project" className="btn btn-primary" style={{ width: '100%', marginTop: '5px', background: 'var(--accent-secondary)' }}>+ E'lon Berish</Link>
              )}
              <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><User size={18} /> Profil ({user.username})</span>
                {(user.auth_role === 'seller' || user.auth_role === 'admin') && <span style={{ color: '#10b981' }}>${user.balance || '0.00'}</span>}
              </Link>
              <Link to="/chat" className="nav-link">Chat</Link>
              <Link to="/orders" className="nav-link">Buyurtmalar</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--primary)', color: '#fff' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Join Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
