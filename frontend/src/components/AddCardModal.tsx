import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import VirtualCard from './VirtualCard';

interface AddCardModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddCardModal = ({ onClose, onSuccess }: AddCardModalProps) => {
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({
        card_number: '',
        card_holder: '',
        expiry_date: '',
        cvv: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        if (name === 'card_number') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16);
        } else if (name === 'expiry_date') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardData({ ...cardData, [name]: formattedValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cardData.card_number.length !== 16) return toast.error("Karta raqami 16 ta bo'lishi kerak");
        if (cardData.expiry_date.length !== 5) return toast.error("Amal qilish muddatini kiriting (MM/YY)");
        if (cardData.cvv.length !== 3) return toast.error("CVV kodini kiriting");

        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            await axios.post('http://127.0.0.1:8000/payments/cards/', cardData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Karta muvaffaqiyatli qo'shildi!");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Ma'lumotlarni saqlashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1100, padding: '20px',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="glass-panel animate-scale-in" style={{ maxWidth: '480px', width: '100%', padding: '30px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 className="brand-font" style={{ fontSize: '24px', marginBottom: '10px' }}>Yangi Karta Qo'shish</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Xavfsiz to'lovlar uchun kartangizni bog'lang</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <VirtualCard 
                        cardNumber={cardData.card_number.replace(/(\d{4})/g, '$1 ').trim() || '**** **** **** ****'} 
                        cardHolder={cardData.card_holder || 'CARD HOLDER'} 
                        expiryDate={cardData.expiry_date || 'MM/YY'} 
                    />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label>Karta raqami</label>
                        <div style={{ position: 'relative' }}>
                            <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input 
                                type="text" 
                                name="card_number"
                                value={cardData.card_number}
                                onChange={handleChange}
                                placeholder="0000 0000 0000 0000"
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Karta Egasi</label>
                        <input 
                            type="text" 
                            name="card_holder"
                            value={cardData.card_holder}
                            onChange={handleChange}
                            placeholder="ISM SHARIF"
                            style={{ textTransform: 'uppercase' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Amal qilish muddati</label>
                            <input 
                                type="text" 
                                name="expiry_date"
                                value={cardData.expiry_date}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>CVV</label>
                            <input 
                                type="password" 
                                name="cvv"
                                value={cardData.cvv}
                                onChange={handleChange}
                                placeholder="***"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '10px' }}>
                        <ShieldCheck size={20} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '12px', color: '#10b981' }}>Ma'lumotlaringiz SSL shifrlash orqali xavfsiz saqlanadi</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {loading ? <Loader2 size={20} className="spin" /> : "Kartani Saqlash"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCardModal;
