import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link to="/chat" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={18} /> {user.username || 'User'}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-primary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', color: '#fff' }}>
                Logout <LogOut size={16} />
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
              <Link to="/chat" className="nav-link"><User size={18} /> Profil ({user.username})</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Logout</button>
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
