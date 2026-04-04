import { useContext } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    Settings, 
    ShieldCheck,
    ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Moderatsiya' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Foydalanuvchilar' },
        { path: '/admin/payouts', icon: <CreditCard size={20} />, label: 'To\'lovlar' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Sozlamalar' },
    ];

    if (!user || user.auth_role !== 'admin') {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <h2>Ruxsat berilmagan</h2>
                <Link to="/" className="btn btn-primary">Bosh sahifaga qaytish</Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-main)' }}>
            {/* Sidebar */}
            <aside style={{ 
                width: '280px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                borderRight: '1px solid var(--glass-border)',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', padding: '0 10px' }}>
                    <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>Admin Panel</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path}
                                to={item.path}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    background: isActive ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 500
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {item.icon}
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight size={16} />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
