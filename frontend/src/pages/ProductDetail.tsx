import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Star, Clock, RefreshCw, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    // Backend API dan xizmatni batafsil o'qib kelish (Bu views ni 1 taga oshiradi)
    axios.get(`http://127.0.0.1:8000/products/product/${id}/`)
      .then(res => {
        setProduct(res.data.data);
      })
      .catch(err => {
        console.error("Xizmatni yuklashda xatolik:", err);
        toast.error("Bunday xizmat topilmadi");
        navigate('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("http")) return imgUrl;
    return `http://127.0.0.1:8000${imgUrl}`;
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.warning("Sotuvchiga yozishdan oldin tizimga kiring!");
      navigate('/login');
      return;
    }

    setStartingChat(true);
    try {
      const token = localStorage.getItem('access');
      // Backend api ni ishga tushirib Chat Room o'rnatamiz
      await axios.post(`http://127.0.0.1:8000/products/message-start/${id}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Chat ulandi! Endi Muloqot qilishingiz mumkin");
      navigate('/chat');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.detail || "Chat yaratishda xatolik yuz berdi";
      toast.error(msg);
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>;
  }

  if (!product) return null;

  return (
    <div className="product-detail-page animate-fade-in" style={{ padding: '40px 0', minHeight: '100vh' }}>
      <div className="container">
        
        <button onClick={() => navigate(-1)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'transparent', color: 'var(--text-secondary)' }}>
           <ArrowLeft size={18} /> Orqaga
        </button>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          
          {/* Chap Tomon: Asosiy Ma'lumot va Rasm */}
          <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
            <h1 className="brand-font" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '20px' }}>{product.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {product.seller ? product.seller.charAt(0) : "U"}
               </div>
               <div>
                  <div style={{ fontWeight: 600 }}>{product.seller || "Sotuvchi"}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '14px' }}>
                    <Star size={14} fill="currentColor" /> {product.average_rating || "5.0"} 
                    <span style={{ color: 'var(--text-tertiary)' }}>({product.reviews?.length || 0} baholash)</span>
                  </div>
               </div>
            </div>

            {/* Banner Rasm */}
            <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', aspectRatio: '16/9' }}>
               {product.main_image ? (
                  <img src={getImageUrl(product.main_image)} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: '24px' }}>
                     Maxsus Xizmat 🎨
                  </div>
               )}
            </div>

            <div style={{ marginTop: '40px' }}>
               <h2 className="brand-font" style={{ fontSize: '24px', marginBottom: '20px' }}>Xizmat haqida to'liq ma'lumot</h2>
               <div className="glass-panel" style={{ padding: '30px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {product.full_description}
               </div>
            </div>
          </div>

          {/* O'ng tomon: Narxlash va Chat Panel */}
          <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
             <div className="glass-panel" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <span style={{ fontSize: '20px', fontWeight: 600 }}>Boshlang'ich Narx</span>
                   <span className="text-gradient" style={{ fontSize: '32px', fontWeight: 700 }}>${product.price_standard}</span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: 1.6 }}>
                   {product.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                      <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{product.delivery_time_standard} kunda yetkazib berish</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                      <RefreshCw size={20} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{product.revisions_standard} marta qayta ishlash</span>
                   </div>
                </div>

                {/* Xarid yoki Chat boshlash */}
                <button 
                  onClick={handleStartChat} 
                  disabled={startingChat}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px' }}
                >
                  <MessageCircle size={20} /> 
                  {startingChat ? "Sotuvchiga ulanmoqda..." : "Sotuvchiga xabar yozish"}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                   Sotuvchidan loyiha haqida batafsil ma'lumot olish uchn bog'laning.
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
