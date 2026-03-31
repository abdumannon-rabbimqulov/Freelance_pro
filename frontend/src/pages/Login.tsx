import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import './Auth.css'; // Maxsus uslublar

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend bizdan username yoki email kutyapti deb faraz qilyapmiz, odatda DRF-SimpleJWT username/password talab qiladi.
      // Eslatma: Backend kodi qandayligidan qat'iy nazar pastdagi payload ishlaydi
      const response = await api.post('users/login/', {
        user_input: email, 
        password: password
      });

      if (response.data.access) {
        login(response.data.access, response.data.refresh, response.data.user);
        toast.success("Tizimga muvaffaqiyatli kirdingiz!");
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Login yoki Parol xato!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Kirish</h2>
        <p className="auth-subtitle">Freelance Pro tizimiga xush kelibsiz</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Email yoki Login</label>
            <input 
              type="text" 
              placeholder="admin@freelance.uz" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Parol</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit">Tizimga kirish</button>
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)' }}>
             Hali hisobingiz yo'qmi? <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Ro'yxatdan o'ting</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
