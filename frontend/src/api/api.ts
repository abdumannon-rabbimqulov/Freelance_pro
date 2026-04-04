import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

// Request Interceptor: Her bir so'rovga avtomatik ravishda Bearer tokenni qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 (Unauthorized) xatoligini ushlash va tokenni yangilashga harakat qilish
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Agar xatolik 401 bo'lsa va bu so'rov hali qayta yuborilmagan bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');

      if (refreshToken) {
        try {
          // Refresh token orqali yangi access token olish
          const response = await axios.post('http://127.0.0.1:8000/users/refresh-token/', {
            refresh: refreshToken,
          });

          if (response.data.access) {
            const newAccessToken = response.data.access;
            localStorage.setItem('access', newAccessToken);

            // Yangi token bilan original so'rovni qayta yuborish
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Agar refresh ham xato bersa (masalan, refresh token muddati tugagan bo'lsa)
          console.error('Refresh token muddati tugagan yoki xato:', refreshError);
          
          // Foydalanuvchini login sahifasiga yo'naltirish
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
      } else {
        // Refresh token mavjud bo'lmasa, login sahifasiga
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
