import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, AlertCircle, User } from 'lucide-react';
import './Auth.css';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedPayout, setSelectedPayout] = useState<any>(null);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const res = await axios.get('http://127.0.0.1:8000/payments/payouts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayouts(res.data);
        } catch (err) {
            toast.error("So'rovlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleApprove = async (id: string) => {
        if (!window.confirm("Haqiqatan ham ushbu to'lovni tasdiqlamoqchimisiz?")) return;
        try {
            const token = localStorage.getItem('access');
            await axios.post(`http://127.0.0.1:8000/payments/payouts/${id}/approve/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Muvaffaqiyatli tasdiqlandi");
            fetchPayouts();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Xatolik yuz berdi");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return toast.error("Rad etish sababini kiriting");
        try {
            const token = localStorage.getItem('access');
            await axios.post(`http://127.0.0.1:8000/payments/payouts/${selectedPayout.id}/reject/`, {
                rejection_reason: rejectionReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("So'rov rad etildi");
            setSelectedPayout(null);
            setRejectionReason('');
            fetchPayouts();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Xatolik yuz berdi");
        }
    };

    return (
        <div className="admin-payouts-page">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="brand-font" style={{ fontSize: '36px' }}>Pul yechish so'rovlari</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sotuvchilar tomonidan yuborilgan moliya so'rovlarini boshqarish</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div></div>
                ) : payouts.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '80px' }}>
                        <Clock size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                        <p style={{ color: 'var(--text-tertiary)' }}>Hozircha yangi so'rovlar yo'q.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {payouts.map(p => (
                            <div key={p.id} className="glass-panel animate-slide-up" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>{p.seller_name}</h3>
                                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                Yuborilgan vaqt: {new Date(p.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h2 style={{ margin: 0, color: '#10b981' }}>${p.amount}</h2>
                                        <span style={{ 
                                            fontSize: '12px', padding: '4px 12px', borderRadius: '50px',
                                            background: p.status === 'pending' ? 'rgba(245,158,11,0.1)' : p.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: p.status === 'pending' ? '#f59e0b' : p.status === 'approved' ? '#10b981' : '#ef4444',
                                            fontWeight: 600, display: 'inline-block', marginTop: '5px'
                                        }}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {p.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button 
                                            onClick={() => handleApprove(p.id)}
                                            className="btn" 
                                            style={{ flex: 1, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <CheckCircle size={18} /> Tasdiqlash
                                        </button>
                                        <button 
                                            onClick={() => setSelectedPayout(p)}
                                            className="btn" 
                                            style={{ flex: 1, background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <XCircle size={18} /> Rad etish
                                        </button>
                                    </div>
                                )}

                                {p.status === 'rejected' && (
                                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px', color: '#ef4444' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '5px' }}>
                                            <AlertCircle size={16} /> Rad etish sababi:
                                        </div>
                                        "{p.rejection_reason}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            {/* Rejection Modal */}
            {selectedPayout && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-panel animate-scale-in" style={{ maxWidth: '450px', width: '100%', padding: '30px' }}>
                        <h2 className="brand-font" style={{ marginBottom: '10px' }}>So'rovni rad etish</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{selectedPayout.seller_name} ga nima uchun pul yechish rad etilganini tushuntiring.</p>
                        
                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label>Rad etish sababi</label>
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Masalan: Ish sifati pastligi yoki qoidabuzarlik..."
                                style={{ height: '120px' }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={handleReject} className="btn" style={{ flex: 1, background: '#ef4444', color: '#fff' }}>Rad etishni yakunlash</button>
                            <button onClick={() => { setSelectedPayout(null); setRejectionReason(''); }} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>Bekor qilish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayouts;
