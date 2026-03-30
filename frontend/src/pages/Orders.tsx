import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, Loader, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab ] = useState<'buying' | 'selling'>('buying');
    
    // Completion Modal States
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    
    // Delivery Modal States
    const [showDeliverModal, setShowDeliverModal] = useState(false);
    const [deliveryText, setDeliveryText] = useState('');
    const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
    const [delivering, setDelivering] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const res = await axios.get('http://127.0.0.1:8000/orders/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            toast.error("Buyurtmalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCompleteRequest = (orderId: string) => {
        setSelectedOrderId(orderId);
        setShowModal(true);
    };

    const updateStatus = async (orderId: string, newStatus: string, metadata = {}) => {
        try {
            const token = localStorage.getItem('access');
            await axios.patch(`http://127.0.0.1:8000/orders/${orderId}/`, {
                status: newStatus,
                ...metadata
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Muvaffaqiyatli yangilandi");
            setShowModal(false);
            setRating(5);
            setFeedback('');
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Xatolik yuz berdi");
        }
    };

    const handleDeliver = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderId) return;
        
        setDelivering(true);
        try {
            const token = localStorage.getItem('access');
            const formData = new FormData();
            formData.append('delivery_text', deliveryText);
            if (deliveryFile) formData.append('delivery_file', deliveryFile);

            await axios.post(`http://127.0.0.1:8000/orders/${selectedOrderId}/deliver/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success("Ish muvaffaqiyatli topshirildi!");
            setShowDeliverModal(false);
            setDeliveryText('');
            setDeliveryFile(null);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Xatolik yuz berdi");
        } finally {
            setDelivering(false);
        }
    };

    const filteredOrders = orders.filter(o => 
        activeTab === 'buying' ? o.client_name === user?.username : o.seller_name === user?.username
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'rgba(255, 191, 0, 0.1)', color: '#ffbf00' };
            case 'in_progress': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' };
            case 'delivered': return { bg: 'rgba(155, 89, 182, 0.1)', color: '#9b59b2' };
            case 'completed': return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
            case 'cancelled': return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
            default: return { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
        }
    };

    return (
        <div className="orders-page py-10" style={{ minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="brand-font" style={{ fontSize: '36px' }}>Buyurtmalar Boshqaruvi</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Barcha xaridlar va sotuvlaringizni shu yerda kuzatib boring</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
                    <button 
                        onClick={() => setActiveTab('buying')}
                        className={`btn ${activeTab === 'buying' ? 'btn-primary' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: activeTab === 'buying' ? 'none' : '1px solid var(--glass-border)' }}
                    >
                        <ShoppingBag size={20} /> Mening Xaridlarim
                    </button>
                    <button 
                        onClick={() => setActiveTab('selling')}
                        className={`btn ${activeTab === 'selling' ? 'btn-primary' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: activeTab === 'selling' ? 'none' : '1px solid var(--glass-border)', background: activeTab === 'selling' ? 'var(--accent-secondary)' : 'transparent', color: '#fff' }}
                    >
                        <Briefcase size={20} /> Menga Kelgan Buyurtmalar
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" size={40} /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                        <XCircle size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <p>Hozircha buyurtmalar mavjud emas.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {filteredOrders.map(order => {
                            const st = getStatusStyle(order.status);
                            return (
                                <div key={order.id} className="glass-panel animate-slide-up" style={{ padding: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {order.product ? <ShoppingBag size={30} style={{ color: 'var(--primary)' }} /> : <Briefcase size={30} style={{ color: 'var(--accent-secondary)' }} />}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>{order.product_title || order.project_title || "Loyiha"}</h3>
                                            <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                {activeTab === 'buying' ? `Sotuvchi: ${order.seller_name}` : `Mijoz: ${order.client_name}`}
                                            </p>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> ${order.price}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {order.delivery_time} kun</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '50px', background: st.bg, color: st.color, fontSize: '13px', fontWeight: 600, marginBottom: '15px' }}>
                                            {order.status_display.toUpperCase()}
                                        </div>
                                        
                                        {activeTab === 'selling' && order.status !== 'completed' && order.status !== 'cancelled' && (
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                {order.status === 'pending' && (
                                                    <button onClick={() => updateStatus(order.id, 'in_progress')} className="btn" style={{ padding: '8px 12px', fontSize: '12px', background: '#3498db', color: '#fff' }}>Qabul qilish</button>
                                                )}
                                                {order.status === 'in_progress' && (
                                                    <button 
                                                        onClick={() => { setSelectedOrderId(order.id); setShowDeliverModal(true); }} 
                                                        className="btn" style={{ padding: '8px 12px', fontSize: '12px', background: '#9b59b2', color: '#fff' }}
                                                    >
                                                        Ishni topshirish
                                                    </button>
                                                )}
                                                <button onClick={() => updateStatus(order.id, 'cancelled')} className="btn" style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#ff4444' }}>Bekor qilish</button>
                                            </div>
                                        )}
                                        
                                        {activeTab === 'buying' && order.status === 'delivered' && (
                                            <button onClick={() => handleCompleteRequest(order.id)} className="btn" style={{ padding: '8px 20px', background: '#2ecc71', color: '#fff' }}>
                                                <CheckCircle size={16} /> Yakunlash
                                            </button>
                                        )}
                                    </div>

                                    {order.requirements && (
                                        <div style={{ width: '100%', marginTop: '15px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <strong>Mijoz talablari:</strong> {order.requirements}
                                        </div>
                                    )}

                                    {(order.delivery_text || order.delivery_file) && (
                                        <div style={{ width: '100%', marginTop: '15px', padding: '15px', borderRadius: '12px', background: 'rgba(155, 89, 182, 0.05)', border: '1px solid rgba(155, 89, 182, 0.2)', fontSize: '14px' }}>
                                            <div style={{ color: '#9b59b2', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={16} /> Topshirilgan ish natijasi:
                                            </div>
                                            {order.delivery_text && <p style={{ margin: '0 0 10px 0', color: '#fff' }}>{order.delivery_text}</p>}
                                            {order.delivery_file && (
                                                <a 
                                                    href={`http://127.0.0.1:8000${order.delivery_file}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12px', background: 'rgba(155, 89, 182, 0.2)', color: '#fff', border: '1px solid rgba(155, 89, 182, 0.4)' }}
                                                >
                                                    Faylni yuklab olish
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {order.status === 'completed' && order.rating && (
                                        <div style={{ width: '100%', marginTop: '15px', padding: '15px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '14px' }}>
                                            <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <CheckCircle size={14} /> Baholangan: {order.rating} / 5
                                            </div>
                                            {order.feedback && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>"{order.feedback}"</p>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Rating Modal */}
                {showModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="glass-panel animate-scale-in" style={{ maxWidth: '500px', width: '100%', padding: '30px' }}>
                            <h2 className="brand-font" style={{ marginBottom: '10px' }}>Ishni qabul qilish</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>Iltimos, bajarilgan ish sifatini baholang. Bu ma'lumot admin uchun muhim.</p>
                            
                            <div className="input-group" style={{ marginBottom: '20px' }}>
                                <label>Sifat darajasi (1-5)</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setRating(num)}
                                            style={{ 
                                                width: '45px', height: '45px', borderRadius: '12px', 
                                                border: rating === num ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                background: rating === num ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
                                                color: rating === num ? 'var(--primary)' : 'var(--text-secondary)',
                                                fontWeight: 600, transition: 'all 0.2s'
                                            }}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '25px' }}>
                                <label>Izoh (Ixtiyoriy)</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Ish haqida o'z fikringizni qoldiring..."
                                    style={{ height: '100px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={() => updateStatus(selectedOrderId!, 'completed', { rating, feedback })}
                                    className="btn btn-primary" style={{ flex: 1 }}
                                >
                                    Tasdiqlash va Yakunlash
                                </button>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery Modal */}
                {showDeliverModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="glass-panel animate-scale-in" style={{ maxWidth: '500px', width: '100%', padding: '30px' }}>
                            <h2 className="brand-font" style={{ marginBottom: '10px' }}>Ishni topshirish</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>Ish natijasini matn yoki fayl ko'rinishida yuboring.</p>
                            
                            <form onSubmit={handleDeliver}>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label>Xulosa / Habar (Ixtiyoriy)</label>
                                    <textarea 
                                        value={deliveryText}
                                        onChange={(e) => setDeliveryText(e.target.value)}
                                        placeholder="Bajarilgan ish haqida qisqacha ma'lumot..."
                                        style={{ height: '100px' }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: '30px' }}>
                                    <label>Fayl biriktirish (Ixtiyoriy)</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                                        style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', color: '#fff' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button 
                                        type="submit"
                                        disabled={delivering || (!deliveryText && !deliveryFile)}
                                        className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {delivering ? <Loader size={18} className="spin" /> : <Briefcase size={18} />}
                                        {delivering ? "Yuborilmoqda..." : "Ishni topshirish"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowDeliverModal(false)}
                                        className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        Bekor qilish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
