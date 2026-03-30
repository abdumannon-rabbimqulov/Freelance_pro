import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tokens collected throughout the steps
  const [tokens, setTokens] = useState({ access: '', refresh: '' });

  // Form states
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'seller' | 'client'>('seller');
  const [code, setCode] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [conf_password, setConfPassword] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

  // === STEP 1: POCHTA VA ROL ===
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/users/signup/', {
        email: email,
        auth_role: role
      });
      // Backend qaytargan tokenlarni tutamiz, sababi keyingi qadamlar bu tokensiz ishlamaydi!
      setTokens({ access: res.data.access, refresh: res.data.refresh });
      toast.success(res.data.message || "Pochtatingizga tasdiqlash kodi yuborildi!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // === STEP 2: TASDIQLASH KODI ===
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/users/code-verify/', 
        { code: code },
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );
      // Yangilangan (statusi o'zgargan) tokenlar keladi
      setTokens({ access: res.data.access, refresh: res.data.refresh });
      toast.success(res.data.message || "Kodingiz tasdiqlandi!");
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Kodingiz xato yoki eskirgan");
    } finally {
      setLoading(false);
    }
  };

  // === STEP 3: TO'LIQ MA'LUMOT VA PAROL ===
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== conf_password) {
      return toast.warning("Parollar mos emas!");
    }
    setLoading(true);
    try {
      const res = await axios.put('http://127.0.0.1:8000/users/user-change-info/', 
        {
          first_name,
          last_name,
          username,
          password,
          conf_password
        },
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );
      toast.success(res.data[0]?.message || "Siz muvaffaqiyatli ro'yxatdan o'tdingiz!");
      // Nihoyat tizim bo'ylab foydalanuvchini Login qildiramiz (AuthContext)
      login(tokens.access, tokens.refresh);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || "Kiritilgan ma'lumotlarda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ maxWidth: '450px' }}>
        
        {/* Step Indicators */}
        <div className="step-indicator" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[1, 2, 3].map((num) => (
             <div 
               key={num} 
               style={{
                 flex: 1, 
                 height: '6px', 
                 borderRadius: '3px',
                 background: step >= num ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
               }}
             />
          ))}
        </div>

        <h2 className="auth-title">Ro'yxatdan o'tish</h2>
        <p className="auth-subtitle">
          {step === 1 && "Yangi akkaunt yaratish uchun email kiritng"}
          {step === 2 && "Pochtanggizga yuborilgan 4 xonali kodni tering"}
          {step === 3 && "Shaxsiy profilingizni yakunlang"}
        </p>

        {step === 1 && (
          <form onSubmit={handleStep1} className="auth-form animate-fade-in">
            <div className="input-group">
              <label>Siz kimsiz?</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as 'seller' | 'client')}
                required
                style={{
                  padding: '14px 16px', borderRadius: '12px', background: 'rgba(26,26,26,0.4)',
                  color: '#fff', border: '1px solid var(--border-color)', outline: 'none'
                }}
              >
                <option value="seller">Frilanser (Pul ishlash uchun)</option>
                <option value="client">Mijoz (Ish berish uchun)</option>
              </select>
            </div>
            
            <div className="input-group mt-3">
              <label>Elektron pochta (Email)</label>
              <input 
                type="email" 
                placeholder="misol@gmai.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4">
              {loading ? "Kutilmoqda..." : "Davom etish"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="auth-form animate-fade-in">
            <div className="input-group">
              <label>Tasdiqlash Kodi</label>
              <input 
                type="text" 
                placeholder="0 0 0 0" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }}
                required 
              />
            </div>
            <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4">
               {loading ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="auth-form animate-fade-in">
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Ism</label>
                <input required type="text" value={first_name} onChange={(e) => setFirstName(e.target.value)}/>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Familiya</label>
                <input required type="text" value={last_name} onChange={(e) => setLastName(e.target.value)}/>
              </div>
            </div>

            <div className="input-group">
              <label>Tizim uchun taxallus (Username)</label>
              <input required type="text" placeholder="Eng kamida 7 harf/raqam" value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>

            <div className="input-group">
              <label>Yangi Parol</label>
              <input required type="password" placeholder="Min. 8 ta belgi" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Parolni Tasdiqlang</label>
              <input required type="password" placeholder="Yuqoridagini qaytaring" value={conf_password} onChange={(e) => setConfPassword(e.target.value)} />
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary auth-submit mt-4">
              {loading ? "Saqlanmoqda..." : "Tugatish"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
