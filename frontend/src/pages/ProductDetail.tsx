import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Star, Clock, RefreshCw, MessageCircle, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/products/product/${id}/`)
      .then(res => {
        setProduct(res.data.data);
        setActiveImage(res.data.data.main_image);
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

  const handleDelete = async () => {
    if (!window.confirm("Haqiqatan ham ushbu xizmatni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/products/product/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Xizmat o'chirildi");
      navigate('/');
    } catch (error) {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleOrder = async () => {
    if (!user) {
        toast.warning("Buyurtma berish uchun tizimga kiring");
        navigate('/login');
        return;
    }
    const requirements = window.prompt("Iltimos, ish bo'yicha talablaringizni yozing:");
    if (requirements === null) return;

    try {
      const token = localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/orders/', {
        product: product.id,
        requirements: requirements
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Buyurtma muvaffaqiyatli qabul qilindi!");
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Xatolik yuz berdi");
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
          
          <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
            <h1 className="brand-font" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '20px' }}>{product.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {product.seller ? product.seller.charAt(0) : "U"}
               </div>
               <div>
                  <div style={{ fontWeight: 600 }}>{product.seller || "Sotuvchi"}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '14px' }}>
                        <Star size={14} fill="currentColor" /> {product.average_rating || "5.0"} 
                        <span style={{ color: 'var(--text-tertiary)' }}>({product.reviews?.length || 0})</span>
                     </div>
                     <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 500, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {product.seller_completed_orders}ta muvaffaqiyatli
                     </div>
                     {product.seller_cancelled_orders > 0 && (
                        <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                           {product.seller_cancelled_orders}ta bekor qilingan
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Banner va Galereya */}
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', aspectRatio: '16/9', marginBottom: '15px' }}>
                 {activeImage ? (
                    <img src={getImageUrl(activeImage)} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: '24px' }}>
                       Maxsus Xizmat 🎨
                    </div>
                 )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                 {/* Asosiy rasm doim birinchi thumbnail bo'ladi */}
                 <div 
                    onClick={() => setActiveImage(product.main_image)}
                    style={{ width: '80px', height: '60px', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', border: activeImage === product.main_image ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)' }}
                 >
                    <img src={getImageUrl(product.main_image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
                 {/* Gallereyadagi qolgan rasmlar */}
                 {product.images?.map((img: any) => (
                    <div 
                       key={img.id}
                       onClick={() => setActiveImage(img.image)}
                       style={{ width: '80px', height: '60px', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', border: activeImage === img.image ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)' }}
                    >
                       <img src={getImageUrl(img.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                 ))}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
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
                 {user?.username === product.seller ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            onClick={() => navigate(`/edit-product/${product.id}`)} 
                            className="btn" 
                            style={{ width: '100%', padding: '16px', background: 'var(--accent-primary)', color: '#fff' }}
                        >
                            Tahrirlash
                        </button>
                        <button 
                            onClick={handleDelete} 
                            className="btn" 
                            style={{ width: '100%', padding: '16px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid #ff4444' }}
                        >
                            O'chirish
                        </button>
                    </div>
                 ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            onClick={handleOrder} 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 600 }}
                        >
                            Buyurtma Berish (${product.price_standard})
                        </button>
                        <button 
                            onClick={handleStartChat} 
                            disabled={startingChat}
                            className="btn" 
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', border: '1px solid var(--glass-border)' }}
                        >
                            <MessageCircle size={20} /> 
                            {startingChat ? "Sotuvchiga ulanmoqda..." : "Sotuvchiga xabar yozish"}
                        </button>
                    </div>
                 )}
                 <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                    {user?.username === product.seller ? "Siz ushbu xizmat egasisiz." : "Xavfsiz to'lov va kafolatlangan natija."}
                 </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
