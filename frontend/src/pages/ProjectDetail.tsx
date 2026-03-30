import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, MessageCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/service/${slug}/`)
      .then(res => {
        setProject(res.data);
        setActiveImage(res.data.main_image);
      })
      .catch(err => {
        console.error("Loyihani yuklashda xatolik:", err);
        toast.error("Bunday loyiha topilmadi");
        navigate('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, navigate]);

  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("http")) return imgUrl;
    return `http://127.0.0.1:8000${imgUrl}`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Haqiqatan ham ushbu e'lonni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/service/${slug}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("E'lon o'chirildi");
      navigate('/');
    } catch (error) {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.warning("Loyihaga ariza topshirishdan oldin tizimga kiring!");
      navigate('/login');
      return;
    }
    const requirements = window.prompt("Iltimos, taklifingiz haqida qisqacha yozing (Masalan: Men buni 2 kunda qilaman):");
    if (requirements === null) return;

    try {
      const token = localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/orders/orders/', {
        project: project.id,
        requirements: requirements
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Taklifingiz yuborildi!");
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>;
  }

  if (!project) return null;

  return (
    <div className="product-detail-page animate-fade-in" style={{ padding: '40px 0', minHeight: '100vh' }}>
      <div className="container">
        
        <button onClick={() => navigate(-1)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'transparent', color: 'var(--text-secondary)' }}>
           <ArrowLeft size={18} /> Orqaga
        </button>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '50px', background: 'var(--accent-secondary)20', color: 'var(--accent-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '15px' }}>
               MIJOZ E'LONI
            </div>
            <h1 className="brand-font" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '20px' }}>{project.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {project.seller ? project.seller.charAt(0) : "U"}
               </div>
               <div>
                  <div style={{ fontWeight: 600 }}>{project.seller || "Mijoz"}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    Sarlavha: {project.category_name || "Loyiha"}
                  </div>
               </div>
            </div>

            {/* Banner va Galereya */}
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', aspectRatio: '16/9', marginBottom: '15px' }}>
                 {activeImage ? (
                    <img src={getImageUrl(activeImage)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', fontSize: '24px' }}>
                       Loyiha Detallari 📝
                    </div>
                 )}
              </div>
              
              {project.images && project.images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    <div 
                        onClick={() => setActiveImage(project.main_image)}
                        style={{ width: '80px', height: '60px', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', border: activeImage === project.main_image ? '2px solid var(--accent-secondary)' : '1px solid var(--glass-border)' }}
                    >
                        <img src={getImageUrl(project.main_image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {project.images.map((img: any) => (
                        <div 
                        key={img.id}
                        onClick={() => setActiveImage(img.image)}
                        style={{ width: '80px', height: '60px', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', border: activeImage === img.image ? '2px solid var(--accent-secondary)' : '1px solid var(--glass-border)' }}
                        >
                        <img src={getImageUrl(img.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
               <h2 className="brand-font" style={{ fontSize: '24px', marginBottom: '20px' }}>Loyiha talablari</h2>
               <div className="glass-panel" style={{ padding: '30px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {project.full_description}
               </div>
            </div>
          </div>

          <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
             <div className="glass-panel" style={{ padding: '30px', position: 'sticky', top: '100px', borderLeft: '4px solid var(--accent-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <span style={{ fontSize: '20px', fontWeight: 600 }}>Byudjet</span>
                   <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-secondary)' }}>${project.price_standard}</span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: 1.6 }}>
                   {project.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                      <Clock size={20} style={{ color: 'var(--accent-secondary)' }} />
                      <span style={{ fontWeight: 500 }}>Muddat: {project.delivery_standard} kun</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                      <DollarSign size={20} style={{ color: 'var(--accent-secondary)' }} />
                      <span style={{ fontWeight: 500 }}>Ruxsat etilgan budjet</span>
                   </div>
                </div>

                {/* Ariza topshirish yoki Tahrirlash */}
                {user?.username === project.seller ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            onClick={() => navigate(`/edit-project/${project.slug}`)} 
                            className="btn" 
                            style={{ width: '100%', padding: '16px', background: 'var(--accent-secondary)', color: '#fff' }}
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
                    <button 
                        onClick={handleApply} 
                        disabled={startingChat}
                        className="btn" 
                        style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', background: 'var(--accent-secondary)', color: '#fff' }}
                    >
                        <MessageCircle size={20} /> 
                        {startingChat ? "Bog'lanilmoqda..." : "Ariza topshirish"}
                    </button>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
