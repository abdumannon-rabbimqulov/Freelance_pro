import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, Clock, Plus, ExternalLink, Briefcase, Layout, Wallet, ArrowUpCircle, AlertCircle, Send, CreditCard, PlusCircle, ArrowDownCircle, History, ShieldCheck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import VirtualCard from '../components/VirtualCard';
import AddCardModal from '../components/AddCardModal';
import { Loader2 } from 'lucide-react';

const Profile = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [myItems, setMyItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'transactions' | 'settings'>('listings');

    // Wallet & Card states
    const [cards, setCards] = useState<any[]>([]);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositing, setDepositing] = useState(false);

    // Payout states
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);

    // Proposal Management
    const [proposals, setProposals] = useState<any[]>([]);
    const [showProposalDetails, setShowProposalDetails] = useState<any | null>(null);
    const [accepting, setAccepting] = useState(false);

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
            const [transRes, payoutRes] = await Promise.all([
                api.get('payments/transactions/'),
                api.get('payments/payouts/')
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
            await api.post('payments/payouts/', { amount: payoutAmount });
            toast.success("So'rov yuborildi. Admin ko'rib chiqishini kuting.");
            setShowPayoutModal(false);
            setPayoutAmount('');
            fetchFinancials();
        } catch (err: any) {
            toast.error(err.response?.data?.amount || "Xatolik yuz berdi");
        }
    };

    const fetchCards = async () => {
        try {
            const res = await api.get('payments/cards/');
            setCards(res.data);
            if (res.data.length > 0) setSelectedCardId(res.data[0].id);
        } catch (err) {
            console.error("Kartalarni yuklashda xatolik:", err);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCardId) return toast.error("Karta tanlang");
        if (!depositAmount || parseFloat(depositAmount) < 1) return toast.error("Minimal to'ldirish miqdori $1");
        
        setDepositing(true);
        try {
            await api.post('payments/deposit/', {
                card_id: selectedCardId,
                amount: depositAmount
            });
            toast.success("Balans muvaffaqiyatli to'ldirildi!");
            setShowTopUpModal(false);
            setDepositAmount('');
            await refreshUser();
            fetchFinancials();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "To'lovda xatolik yuz berdi");
        } finally {
            setDepositing(false);
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (!window.confirm("Kartani o'chirib yubormoqchimisiz?")) return;
        try {
            await api.delete(`payments/cards/${id}/`);
            toast.success("Karta o'chirildi");
            fetchCards();
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    const fetchMyItems = async () => {
        setLoading(true);
        try {
            const endpoint = isSeller 
                ? 'products/product-seller-list/' 
                : 'service/my-projects/';
            
            const res = await api.get(endpoint);
            setMyItems(res.data);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProposals = async () => {
        try {
            const res = await api.get('service/p/proposals/');
            setProposals(res.data);
        } catch (err) {
            console.error("Takliflarni yuklashda xatolik:", err);
        }
    };

    const handleAcceptProposal = async (proposalId: number) => {
        if (!window.confirm("Ushbu taklifni qabul qilmoqchimisiz? Bu sizning balansizdan ko'rsatilgan miqdorni bloklaydi.")) return;
        
        setAccepting(true);
        try {
            const res = await api.post(`service/p/proposals/${proposalId}/accept/`, {});
            toast.success(res.data.message || "Taklif qabul qilindi!");
            setShowProposalDetails(null);
            fetchProposals();
            fetchMyItems();
            refreshUser();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Taklifni qabul qilishda xatolik");
        } finally {
            setAccepting(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyItems();
            fetchFinancials();
            fetchCards();
            fetchProposals();
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
            await api.post('users/user-change-info/', profileData);
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
            const endpoint = isSeller 
                ? `products/product/${id}/` 
                : `service/${id}/`;

            await api.delete(endpoint);
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
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`btn ${activeTab === 'transactions' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'transactions' ? '' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Wallet size={18} /> Balans
                        </button>
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
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowTopUpModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: '#10b981' }}>
                                <ArrowDownCircle size={20} /> Balansni To'ldirish
                            </button>
                            {isSeller && (
                                <button onClick={() => setShowPayoutModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px' }}>
                                    <ArrowUpCircle size={20} /> Pulni yechish
                                </button>
                            )}
                        </div>
                    </div>

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
                                        <React.Fragment key={item.id}>
                                            <tr style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
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
                                            {!isSeller && proposals.filter(p => p.project === item.id).length > 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '10px 20px 20px 20px', background: 'rgba(255,255,255,0.01)' }}>
                                                        <div style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(108, 99, 255, 0.2)', background: 'rgba(108, 99, 255, 0.05)' }}>
                                                            <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <MessageCircle size={14} /> Ushbu loyihaga kelib tushgan takliflar ({proposals.filter(p => p.project === item.id).length}):
                                                            </p>
                                                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                                                {proposals.filter(p => p.project === item.id).map(p => (
                                                                    <div 
                                                                        key={p.id} 
                                                                        onClick={() => setShowProposalDetails(p)}
                                                                        style={{ flex: '0 0 200px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.seller_name}</span>
                                                                            <span style={{ color: p.status === 'accepted' ? '#10b981' : 'var(--primary)', fontWeight: 700 }}>${p.price}</span>
                                                                        </div>
                                                                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.delivery_time} kun • {p.status}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                        {/* Card Management Side */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="glass-panel" style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CreditCard size={22} /> Mening Kartalarim
                                    </h3>
                                    <button onClick={() => setShowAddCardModal(true)} className="btn" style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <PlusCircle size={18} /> Yangi Karta
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                    {cards.map(card => (
                                        <div key={card.id} style={{ position: 'relative', maxWidth: '380px' }}>
                                            <VirtualCard 
                                                cardNumber={card.card_number} 
                                                cardHolder={card.card_holder} 
                                                expiryDate={card.expiry_date} 
                                            />
                                            <button 
                                                onClick={() => handleDeleteCard(card.id)}
                                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {cards.length === 0 && (
                                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '2px dashed var(--glass-border)' }}>
                                            <AlertCircle size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                            <p>Hali kartalar qo'shilmagan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transaction History Sub-Section */}
                            <div className="glass-panel" style={{ padding: '30px' }}>
                                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <History size={22} /> Tranzaksiyalar tarixi
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {transactions.map(t => (
                                        <div key={t.id} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: (t.transaction_type === 'deposit' || t.transaction_type === 'order_payment' || t.transaction_type === 'commission') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (t.transaction_type === 'deposit' || t.transaction_type === 'order_payment' || t.transaction_type === 'commission') ? '#10b981' : '#ef4444' }}>
                                                    {(t.transaction_type === 'deposit' || t.transaction_type === 'order_payment' || t.transaction_type === 'commission') ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600 }}>{t.transaction_type === 'deposit' ? "Balansni to'ldirish" : t.transaction_type === 'order_payment' ? "Xizmat uchun to'lov" : t.transaction_type === 'commission' ? "Platforma komissiyasi" : "Mablag' yechish/bloklash"}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontWeight: 700, color: (t.transaction_type === 'deposit' || t.transaction_type === 'order_payment' || t.transaction_type === 'commission') ? '#10b981' : '#ef4444' }}>
                                                    {(t.transaction_type === 'deposit' || t.transaction_type === 'order_payment' || t.transaction_type === 'commission') ? '+' : '-'}${t.amount}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Hali tranzaksiyalar yo'q.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Payout & Info Side */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="glass-panel" style={{ padding: '30px' }}>
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
                {showTopUpModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(5px)' }}>
                        <div className="glass-panel animate-scale-in" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 15px' }}>
                                    <ArrowDownCircle size={32} />
                                </div>
                                <h2 className="brand-font">Balansni to'ldirish</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Mavjud balans: ${user?.balance}</p>
                            </div>
                            
                            <form onSubmit={handleDeposit}>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label>Kartani tanlang</label>
                                    <select 
                                        value={selectedCardId} 
                                        onChange={(e) => setSelectedCardId(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', color: '#fff' }}
                                        required
                                    >
                                        {cards.length === 0 && <option value="">Karta qo'shilmagan</option>}
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>{c.card_number} ({c.card_holder})</option>
                                        ))}
                                    </select>
                                    {cards.length === 0 && (
                                        <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '5px' }}>⚠️ Avval karta qo'shishingiz kerak.</p>
                                    )}
                                </div>

                                <div className="input-group" style={{ marginBottom: '25px' }}>
                                    <label>To'ldirish miqdori ($)</label>
                                    <input 
                                        type="number" 
                                        step="1"
                                        min="1"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="Min $1"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button type="submit" disabled={depositing || cards.length === 0} className="btn btn-primary" style={{ flex: 1, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {depositing ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                                        {depositing ? "To'lanmoqda..." : "Tasdiqlash"}
                                    </button>
                                    <button type="button" onClick={() => setShowTopUpModal(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>Bekor qilish</button>
                                </div>
                            </form>
                        </div>
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

                {/* Add Card Modal */}
                {showAddCardModal && (
                    <AddCardModal 
                        onClose={() => setShowAddCardModal(false)} 
                        onSuccess={() => fetchCards()} 
                    />
                )}
                {/* Proposal Detail Modal */}
                {showProposalDetails && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(5px)' }}>
                        <div className="glass-panel animate-scale-in" style={{ maxWidth: '450px', width: '100%', padding: '30px', borderTop: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <h3 className="brand-font">{showProposalDetails.seller_name} - Taklif</h3>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', margin: 0 }}>{new Date(showProposalDetails.created_at).toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>${showProposalDetails.price}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{showProposalDetails.delivery_time} kun muddat</div>
                                    <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{showProposalDetails.seller_completed_orders}ta muvaffaqiyatli</span>
                                        {showProposalDetails.seller_cancelled_orders > 0 && (
                                            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>{showProposalDetails.seller_cancelled_orders}ta bekor qilingan</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '25px', maxHeight: '200px', overflowY: 'auto' }}>
                                {showProposalDetails.description}
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                {showProposalDetails.status === 'pending' && (
                                    <button 
                                        onClick={() => handleAcceptProposal(showProposalDetails.id)} 
                                        disabled={accepting}
                                        className="btn btn-primary" 
                                        style={{ flex: 1, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {accepting ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                                        Taklifni qabul qilish
                                    </button>
                                )}
                                <button onClick={() => setShowProposalDetails(null)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>Yopish</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
