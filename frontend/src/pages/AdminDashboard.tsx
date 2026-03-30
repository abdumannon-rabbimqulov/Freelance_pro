import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, ExternalLink, ShieldAlert, Users, TrendingUp, CircleDollarSign, BarChart3, Activity, Award, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [pendingProducts, setPendingProducts] = useState<any[]>([]);
    const [pendingProjects, setPendingProjects] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'moderation' | 'finances'>('finances');
    const [subTab, setSubTab] = useState<'sellers' | 'customers'>('sellers');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const headers = { Authorization: `Bearer ${token}` };

            const [productsRes, projectsRes, statsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/products/admin-product-list/', { headers }),
                axios.get('http://127.0.0.1:8000/service/admin-list/', { headers }),
                axios.get('http://127.0.0.1:8000/payments/admin-stats/', { headers })
            ]);

            setPendingProducts(productsRes.data);
            setPendingProjects(projectsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveProduct = async (id: number) => {
        try {
            const token = localStorage.getItem('access');
            await axios.post(`http://127.0.0.1:8000/products/product/${id}/approve/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Xizmat tasdiqlandi!");
            setPendingProducts(pendingProducts.filter(p => p.id !== id));
        } catch (err) {
            toast.error("Xatolik yuz berdi.");
        }
    };

    const handleApproveProject = async (id: number) => {
        try {
            const token = localStorage.getItem('access');
            await axios.post(`http://127.0.0.1:8000/service/approve/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("E'lon tasdiqlandi!");
            setPendingProjects(pendingProjects.filter(p => p.id !== id));
        } catch (err) {
            toast.error("Xatolik yuz berdi.");
        }
    };

    if (loading) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Admin ma'lumotlari yuklanmoqda...</div>;

    return (
        <div className="admin-dashboard-page animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ShieldAlert size={40} style={{ color: 'var(--accent-secondary)' }} />
                        <div>
                            <h1 className="brand-font" style={{ fontSize: '32px' }}>Admin Boshqaruv Paneli</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Moliya va moderatsiya boshqaruvi</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setActiveTab('finances')}
                            className={`btn ${activeTab === 'finances' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'finances' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <BarChart3 size={18} /> Moliya
                        </button>
                        <button
                            onClick={() => setActiveTab('moderation')}
                            className={`btn ${activeTab === 'moderation' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'moderation' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Activity size={18} /> Moderatsiya
                        </button>
                    </div>
                </div>

                {activeTab === 'finances' && stats && (
                    <div className="animate-scale-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <TrendingUp size={30} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>Umumiy Aylanma</p>
                                    <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>${stats.total_turnover}</h2>
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                    <CircleDollarSign size={30} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>Platforma Foydasi</p>
                                    <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>${stats.total_commission}</h2>
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                                    <Wallet size={30} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>Jami User Balanslari</p>
                                    <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>${stats.total_user_balances}</h2>
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                    <Users size={30} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>Jami Foydalanuvchilar</p>
                                    <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{stats.users.length}ta</h2>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '0', overflowY: 'auto', maxHeight: '500px' }}>
                            <h3 className="brand-font" style={{ padding: '20px', margin: 0, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>Foydalanuvchilar va Balanslar</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '15px 20px' }}>Foydalanuvchi</th>
                                        <th style={{ padding: '15px 20px' }}>Roli</th>
                                        <th style={{ padding: '15px 20px' }}>Muvaffaqiyatli</th>
                                        <th style={{ padding: '15px 20px' }}>Bekor qilingan</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'right' }}>Balans</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.users.map((u: any) => (
                                        <tr key={u.username} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '15px 20px', fontWeight: 600 }}>{u.username}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{u.role}</span>
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                                                    <Award size={14} /> {u.completed_orders}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <div style={{ color: '#ef4444' }}>{u.cancelled_orders}</div>
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>${u.balance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div className="animate-scale-in">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setSubTab('sellers')}
                                className={`btn ${subTab === 'sellers' ? 'btn-primary' : ''}`}
                                style={{ background: subTab === 'sellers' ? '' : 'rgba(255,255,255,0.05)', fontSize: '14px', padding: '8px 20px' }}
                            >
                                Xizmatlar Moderatsiyasi ({pendingProducts.length})
                            </button>
                            <button
                                onClick={() => setSubTab('customers')}
                                className={`btn ${subTab === 'customers' ? 'btn-primary' : ''}`}
                                style={{ background: subTab === 'customers' ? '' : 'rgba(255,255,255,0.05)', fontSize: '14px', padding: '8px 20px' }}
                            >
                                E'lonlar Moderatsiyasi ({pendingProjects.length})
                            </button>
                        </div>

                        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '20px' }}>{subTab === 'sellers' ? 'Sotuvchi' : 'Xaridor'}</th>
                                        <th style={{ padding: '20px' }}>Nomi</th>
                                        <th style={{ padding: '20px' }}>Narxi/Budjeti</th>
                                        <th style={{ padding: '20px' }}>Sana</th>
                                        <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(subTab === 'sellers' ? pendingProducts : pendingProjects).map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ fontWeight: 600 }}>{item.seller || item.customer || "Noma'lum"}</div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    {subTab === 'sellers' && (
                                                        <div style={{ width: '40px', height: '30px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                                                            {item.main_image && <img src={`http://127.0.0.1:8000${item.main_image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                        </div>
                                                    )}
                                                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px' }}>${item.price_standard}</td>
                                            <td style={{ padding: '20px', color: 'var(--text-tertiary)', fontSize: '14px' }}>{item.created_at?.substring(0, 10)}</td>
                                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                    <Link to={subTab === 'sellers' ? `/product/${item.id}` : `/project/${item.slug}`} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                                        <ExternalLink size={18} />
                                                    </Link>
                                                    <button onClick={() => subTab === 'sellers' ? handleApproveProduct(item.id) : handleApproveProject(item.id)} className="btn" style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                        <Check size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(subTab === 'sellers' ? pendingProducts : pendingProjects).length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                                Hozircha tasdiq kutilayotgan hech qanday so'rovlar mavjud emas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default AdminDashboard;
