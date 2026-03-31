import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, Loader, Save, ArrowLeft } from 'lucide-react';
import './Auth.css';

const EditProject = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        full_description: '',
        price_standard: '',
        delivery_standard: '',
        revisions_standard: '1'
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, projectRes] = await Promise.all([
                    api.get('products/categories/'),
                    api.get(`service/${slug}/`)
                ]);
                setCategories(catsRes.data);
                const p = projectRes.data;
                setFormData({
                    title: p.title,
                    category: p.category ? p.category.id.toString() : '',
                    description: p.description,
                    full_description: p.full_description,
                    price_standard: p.price_standard.toString(),
                    delivery_standard: p.delivery_standard.toString(),
                    revisions_standard: p.revisions_standard.toString()
                });
                if (p.main_image) {
                    setPreviews([`http://127.0.0.1:8000${p.main_image}`]);
                }
            } catch (err) {
                toast.error("Ma'lumotlarni yuklashda xatolik");
                navigate('/');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [slug, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const totalImages = [...images, ...selectedFiles].slice(0, 5);
            setImages(totalImages);
            const newPreviews = totalImages.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            if (images.length > 0) {
                data.append('main_image', images[0]);
                images.forEach((img) => data.append('images', img));
            }

            await api.put(`service/${slug}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("E'lon muvaffaqiyatli yangilandi!");
            navigate(`/project/${slug}`);
        } catch (err: any) {
            toast.error("Yangilashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="container py-10 text-center">Yuklanmoqda...</div>;

    return (
        <div className="create-product-page animate-fade-in" style={{ padding: '60px 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate(-1)} className="btn mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'var(--text-secondary)' }}>
                    <ArrowLeft size={18} /> Orqaga
                </button>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h2 className="brand-font mb-4">E'lonni Tahrirlash</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label>Sarlavha</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Kategoriya</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
                            >
                                <option value="" style={{ background: '#1a1a1a' }}>Kategoriyani tanlang</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a' }}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Qisqa tavsif</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required style={{ height: '100px' }} />
                        </div>
                        <div className="input-group">
                            <label>To'liq tavsif</label>
                            <textarea value={formData.full_description} onChange={e => setFormData({ ...formData, full_description: e.target.value })} required style={{ height: '180px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label>Byudjet ($)</label>
                                <input type="number" value={formData.price_standard} onChange={e => setFormData({ ...formData, price_standard: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Muddat (kun)</label>
                                <input type="number" value={formData.delivery_standard} onChange={e => setFormData({ ...formData, delivery_standard: e.target.value })} required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Gallereya (Birinchisi asosiy bo'ladi)</label>
                            <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative' }}>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                <Upload size={24} style={{ color: 'var(--accent-secondary)' }} />
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Yangi rasmlar yuklash</p>
                            </div>
                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                {previews.map((p, i) => (
                                    <img key={i} src={p} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="p" />
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn" disabled={loading} style={{ background: 'var(--accent-secondary)', color: '#fff', padding: '15px' }}>
                            {loading ? <Loader className="spin" size={20} /> : <Save size={20} />} O'zgarishlarni Saqlash
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProject;
