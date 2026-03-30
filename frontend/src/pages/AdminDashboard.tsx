import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, ExternalLink, ShieldAlert, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [pendingProducts, setPendingProducts] = useState<any[]>([]);
    const [pendingProjects, setPendingProjects] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'sellers' | 'customers'>('sellers');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const headers = { Authorization: `Bearer ${token}` };

            const [productsRes, projectsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/products/admin-product-list/', { headers }),
                axios.get('http://127.0.0.1:8000/service/admin-list/', { headers })
            ]);

            setPendingProducts(productsRes.data);
            setPendingProjects(projectsRes.data);
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
        <div className="admin-dashboard-page animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ShieldAlert size={40} style={{ color: 'var(--accent-secondary)' }} />
                        <div>
                            <h1 className="brand-font" style={{ fontSize: '32px' }}>Admin Boshqaruv Paneli</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Moderatsiya so'rovlarini boshqarish</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setActiveTab('sellers')}
                            className={`btn ${activeTab === 'sellers' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'sellers' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Users size={18} /> Sotuvchilar
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`btn ${activeTab === 'customers' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'customers' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Briefcase size={18} /> Xaridorlar
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '20px' }}>{activeTab === 'sellers' ? 'Sotuvchi' : 'Xaridor'}</th>
                                <th style={{ padding: '20px' }}>Nomi</th>
                                <th style={{ padding: '20px' }}>Narxi/Budjeti</th>
                                <th style={{ padding: '20px' }}>Sana</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'sellers' ? pendingProducts : pendingProjects).map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ fontWeight: 600 }}>{item.seller || item.customer || "Noma'lum"}</div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {activeTab === 'sellers' && (
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
                                            <Link to={activeTab === 'sellers' ? `/product/${item.id}` : `/project/${item.slug}`} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                                <ExternalLink size={18} />
                                            </Link>
                                            <button onClick={() => activeTab === 'sellers' ? handleApproveProduct(item.id) : handleApproveProject(item.id)} className="btn" style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === 'sellers' ? pendingProducts : pendingProjects).length === 0 && (
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
        </div>
    );
};

export default AdminDashboard;
