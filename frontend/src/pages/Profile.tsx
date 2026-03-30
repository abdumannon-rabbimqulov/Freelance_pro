import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, Clock, Plus, ExternalLink, Briefcase, Layout, Wallet, ArrowUpCircle, AlertCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [myItems, setMyItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'transactions' | 'settings'>('listings');

    // Payout states
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);

    // Profile Form States
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        conf_password: ''
    });

    const isSeller = user?.auth_role === 'seller';

    const fetchFinancials = async () => {
        try {
            const token = localStorage.getItem('access');
            const [transRes, payoutRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/payments/transactions/', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://127.0.0.1:8000/payments/payouts/', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTransactions(transRes.data);
            setPayoutRequests(payoutRes.data);
        } catch (err) {
            console.error("Moliyaviy ma'lumotlarda xatolik:", err);
        }
    };

    const handlePayoutRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payoutAmount || parseFloat(payoutAmount) <= 0) return toast.error("To'g'ri miqdor kiriting");
        
        try {
            const token = localStorage.getItem('access');
            await axios.post('http://127.0.0.1:8000/payments/payouts/', { amount: payoutAmount }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("So'rov yuborildi. Admin ko'rib chiqishini kuting.");
            setShowPayoutModal(false);
            setPayoutAmount('');
            fetchFinancials();
        } catch (err: any) {
            toast.error(err.response?.data?.amount || "Xatolik yuz berdi");
        }
    };

    const fetchMyItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const endpoint = isSeller 
                ? 'http://127.0.0.1:8000/products/product-seller-list/' 
                : 'http://127.0.0.1:8000/service/my-projects/';
            
            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyItems(res.data);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyItems();
            fetchFinancials();
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
            await refreshUser();
            setProfileData(prev => ({ ...prev, password: '', conf_password: '' }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id: number) => {
        const itemType = isSeller ? "xizmatni" : "e'lonni";
        if (!window.confirm(`Haqiqatan ham ushbu ${itemType} o'chirib yubormoqchimisiz?`)) return;

        try {
            const token = localStorage.getItem('access');
            const endpoint = isSeller 
                ? `http://127.0.0.1:8000/products/product/${id}/` 
                : `http://127.0.0.1:8000/service/${id}/`;

            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Muvaffaqiyatli o'chirildi.");
            setMyItems(myItems.filter(p => p.id !== id));
        } catch (err) {
            toast.error("O'chirishda xatolik yuz berdi.");
        }
    };

    if (loading) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Yuklanmoqda...</div>;

    return (
        <div className="profile-page animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 className="brand-font" style={{ fontSize: '32px' }}>Salom, {user?.username || 'Foydalanuvchi'}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isSeller ? "Sotuvchi sifatidagi faoliyatingizni boshqaring" : "Xaridor sifatidagi e'lonlaringizni boshqaring"}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`btn ${activeTab === 'listings' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'listings' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isSeller ? <Layout size={18} /> : <Briefcase size={18} />}
                            {isSeller ? "Mening Xizmatlarim" : "Mening E'lonlarim"}
                        </button>
                        {(isSeller || user?.auth_role === 'admin') && (
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`btn ${activeTab === 'transactions' ? 'btn-primary' : ''}`}
                                style={{ background: activeTab === 'transactions' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Wallet size={18} /> Balans
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'settings' ? '' : 'rgba(255,255,255,0.05)' }}
                        >
                            Sozlamalar
                        </button>
                    </div>
                </div>

                {/* Balance Summary Card */}
                {(isSeller || user?.auth_role === 'admin') && (
                    <div className="glass-panel animate-slide-up" style={{ marginBottom: '30px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(108, 99, 255, 0.05) 100%)', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <Wallet size={32} />
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Joriy Balans</p>
                                <h2 style={{ margin: 0, fontSize: '28px' }}>${user?.balance || '0.00'}</h2>
                            </div>
                        </div>
                        {isSeller && (
                            <button onClick={() => setShowPayoutModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px' }}>
                                <ArrowUpCircle size={20} /> Pulni yechish
                            </button>
                        )}
                        {user?.auth_role === 'admin' && (
                             <div style={{ textAlign: 'right' }}>
                                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Platforma komissiyasi jami</p>
                                 <span style={{ color: '#10b981', fontWeight: 600 }}>Daromad hisoblanmoqda...</span>
                             </div>
                        )}
                    </div>
                )}

                {activeTab === 'listings' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <Link to={isSeller ? "/create-product" : "/create-project"} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Plus size={18} /> {isSeller ? "Yangi xizmat" : "Yangi e'lon"}
                            </Link>
                        </div>
                        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '20px' }}>{isSeller ? "Xizmat nomi" : "E'lon nomi"}</th>
                                        <th style={{ padding: '20px' }}>{isSeller ? "Narxi" : "Budjeti"}</th>
                                        <th style={{ padding: '20px' }}>Holati</th>
                                        <th style={{ padding: '20px' }}>Ko'rishlar</th>
                                        <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myItems.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    {isSeller && (
                                                        <div style={{ width: '50px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                                                            {item.main_image && <img src={`http://127.0.0.1:8000${item.main_image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                        </div>
                                                    )}
                                                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px', fontWeight: 600 }}>${item.price_standard}</td>
                                            <td style={{ padding: '20px' }}>
                                                {item.is_active ? (
                                                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '14px', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                                        <CheckCircle size={14} /> Approved
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '14px', background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                                        <Clock size={14} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px', color: 'var(--text-tertiary)' }}>{item.views_count} marta</td>
                                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                    <Link to={isSeller ? `/product/${item.id}` : `/project/${item.slug}`} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                                        <ExternalLink size={18} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="btn" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {myItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                                Sizda hali hech qanday faol {isSeller ? "xizmatlar" : "e'lonlar"} mavjud emas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : activeTab === 'transactions' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                        {/* Transaction History */}
                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={20} /> Tranzaksiyalar tarixi
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {transactions.map(t => (
                                    <div key={t.id} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500 }}>{t.transaction_type === 'order_payment' ? "Buyurtma uchun to'lov" : t.transaction_type === 'commission' ? "Komissiya" : "Pul yechish"}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: 600, color: t.transaction_type === 'withdrawal' || t.transaction_type === 'commission' ? '#ef4444' : '#10b981' }}>
                                                {t.transaction_type === 'withdrawal' || t.transaction_type === 'commission' ? '-' : '+'}${t.amount}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Hali tranzaksiyalar yo'q.</p>}
                            </div>
                        </div>

                        {/* Payout Requests */}
                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ArrowUpCircle size={20} /> Yechib olish so'rovlari
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {payoutRequests.map(p => (
                                    <div key={p.id} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 600 }}>${p.amount}</span>
                                            <span style={{ 
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '50px',
                                                background: p.status === 'pending' ? 'rgba(245,158,11,0.1)' : p.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: p.status === 'pending' ? '#f59e0b' : p.status === 'approved' ? '#10b981' : '#ef4444'
                                            }}>
                                                {p.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {p.status === 'rejected' && (
                                            <div style={{ display: 'flex', gap: '5px', fontSize: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '8px', marginTop: '5px' }}>
                                                <AlertCircle size={14} /> {p.rejection_reason}
                                            </div>
                                        )}
                                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '5px' }}>{new Date(p.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {payoutRequests.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>So'rovlar yo'q.</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '20px' }}>Profil ma'lumotlarini tahrirlash</h2>
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-group">
                                <label>Foydalanuvchi nomi (Username)</label>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group">
                                    <label>Ism</label>
                                    <input
                                        type="text"
                                        value={profileData.first_name}
                                        onChange={e => setProfileData({ ...profileData, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Sharif</label>
                                    <input
                                        type="text"
                                        value={profileData.last_name}
                                        onChange={e => setProfileData({ ...profileData, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Yangi Parol (Tasdiqlash uchn shart)</label>
                                <input
                                    type="password"
                                    value={profileData.password}
                                    onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Parolni tasdiqlash</label>
                                <input
                                    type="password"
                                    value={profileData.conf_password}
                                    onChange={e => setProfileData({ ...profileData, conf_password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Ma'lumotlarni saqlash</button>
                        </form>
                    </div>
                )}

                {/* Payout Modal */}
                {showPayoutModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="glass-panel animate-scale-in" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 15px' }}>
                                    <Send size={32} />
                                </div>
                                <h2 className="brand-font">Pulni yechish</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Mavjud balans: ${user?.balance}</p>
                            </div>
                            
                            <form onSubmit={handlePayoutRequest}>
                                <div className="input-group" style={{ marginBottom: '25px' }}>
                                    <label>Yechish miqdori ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>🚀 So'rov admin tomonidan sifatga qarab tasdiqlanadi.</p>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Yuborish</button>
                                    <button type="button" onClick={() => setShowPayoutModal(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>Bekor qilish</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
