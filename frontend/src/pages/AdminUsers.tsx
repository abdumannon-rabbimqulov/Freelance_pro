import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, UserCheck, Shield, ShoppingBag, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const res = await axios.get('http://127.0.0.1:8000/users/user-list/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            toast.error("Foydalanuvchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><Shield size={14} /> Admin</span>;
            case 'seller':
                return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><ShoppingBag size={14} /> Sotuvchi</span>;
            default:
                return <span style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><Briefcase size={14} /> Xaridor</span>;
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Yuklanmoqda...</div>;

    return (
        <div className="admin-users-page animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="brand-font" style={{ fontSize: '28px', margin: 0 }}>Foydalanuvchilar</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0' }}>Sizning platformangizdagi barcha foydalanuvchilar ro'yxati</p>
                </div>
                <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>Jami: {users.length}</span>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '15px' }}>Foydalanuvchi</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Telefon</th>
                            <th style={{ padding: '15px' }}>Rol</th>
                            <th style={{ padding: '15px' }}>Balans</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '40px', height: '40px', borderRadius: '10px', 
                                            background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {user.photo ? <img src={`http://127.0.0.1:8000${user.photo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCheck size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.username}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>ID: {user.id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <Mail size={14} style={{ opacity: 0.5 }} /> {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <Phone size={14} style={{ opacity: 0.5 }} /> {user.phone || '—'}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>{getRoleBadge(user.auth_role)}</td>
                                <td style={{ padding: '15px', fontWeight: 700, color: '#10b981' }}>${user.balance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
