import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Yangi Talab: Websocket ulanish va Toast xabarlarni eshitish uchun markaziy NotificationProvider
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  useEffect(() => {
    // Brauzer localStorage idan token olinadi (Login qilinganda yozilishi kerak)
    const token = localStorage.getItem('access');
    
    // Agar foydalanuvchi tizimga kirmagan bo'lsa ulanish amalga oshirilmaydi
    if (!token) return;

    // Django serveriga ulanuvchi websocket manzili
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);

    socket.onopen = () => {
      console.log('✅ WebSocket muvaffaqiyatli ulandi!');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Backenddan `notification` type dagi xabar kelishi bilan uni ekranga Toast shaklida chiqaramiz
      if (data.type === 'notification') {
        toast.info(
          <div>
            <strong>{data.title}</strong>
            <p style={{ margin: 0, fontSize: '14px' }}>{data.message}</p>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark", // Zamonaviy loyiha uchun dark tema yaxshiroq
          }
        );
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket xatosi:', error);
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket aloqasi uzildi.');
    };

    // Component unmount bo'lganda (sahifa yopilganda) aloqani uzish
    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
};

export default NotificationProvider;
