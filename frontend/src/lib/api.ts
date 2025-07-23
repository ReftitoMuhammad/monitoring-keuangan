import axios from 'axios';
import Cookies from 'js-cookie';

// Membuat instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Menambahkan interceptor untuk setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari cookies
    const token = Cookies.get('token');
    
    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;