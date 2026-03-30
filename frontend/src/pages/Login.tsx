import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.post('http://127.0.0.1:8000/users/login/', {
        user_input: email, 
        password: password
      });

      if (response.data.access) {
        login(response.data.access, response.data.refresh);
        toast.success("Tizimga muvaffaqiyatli kirdingiz!");
        navigate('/chat');
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
        </form>
      </div>
    </div>
  );
};

export default Login;
