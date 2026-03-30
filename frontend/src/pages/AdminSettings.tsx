import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Percent, Save, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import './Auth.css';

const AdminSettings = () => {
    const [commission, setCommission] = useState<string>('10.00');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const res = await axios.get('http://127.0.0.1:8000/payments/settings/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommission(res.data.commission_percent);
        } catch (err) {
            toast.error("Sozlamalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('access');
            await axios.patch('http://127.0.0.1:8000/payments/settings/', {
                commission_percent: commission
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Komissiya foizi yangilandi!");
            fetchSettings();
        } catch (err: any) {
            toast.error("Yangilashda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-settings-page">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="brand-font" style={{ fontSize: '36px' }}>Platforma Sozlamalari</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Moliyaviy komissiya va platforma qoidalarini boshqarish</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><RefreshCw className="spin" size={40} /></div>
                ) : (
                    <div className="glass-panel animate-scale-in" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <Percent size={28} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Xizmat haqi (Commission)</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Har bir muvaffaqiyatli buyurtmadan olinadigan foiz</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="input-group" style={{ marginBottom: '25px' }}>
                                <label>Komissiya foizi (%)</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={commission}
                                        onChange={(e) => setCommission(e.target.value)}
                                        style={{ paddingRight: '40px', fontSize: '20px', fontWeight: 600 }}
                                        required
                                    />
                                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '18px', fontWeight: 600 }}>%</span>
                                </div>
                            </div>

                            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.05)', border: '1px solid rgba(52, 152, 219, 0.2)', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <AlertCircle size={20} style={{ color: '#3498db', marginTop: '2px' }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#3498db', fontWeight: 600 }}>Maslahat</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            Komissiya foizi o'zgartirilishi faqat shundan keyin yaratilgan buyurtmalar uchun amal qiladi. 
                                            Joriy komissiya: <strong>{commission}%</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                                {saving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
                            </button>
                        </form>

                        <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-tertiary)', fontSize: '13px', justifyContent: 'center' }}>
                            <TrendingUp size={14} /> Oxirgi yangilanish: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                )}
        </div>
    );
};

export default AdminSettings;
