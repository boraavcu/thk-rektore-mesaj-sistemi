/**
 * Admin Paneline geçiş yapmasını sağlayan güvenlik kapısıdır.
 */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// CANLIYA GEÇİŞ 
// Okulun sunucusuna geçildiğinde 'http://localhost:5000/api' kısmını
// Okulun gerçek sunucu IP adresiyle değiştirilmeli
const API_URL = 'http://localhost:5000/api';

function AdminLogin() {
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const navigate = useNavigate(); // Sayfalar arası yönlendirme aracı

  // Giriş yap butonuna tıklandığında tetiklenen fonksiyon
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend'e giriş isteği gönderilir
      const res = await axios.post(`${API_URL}/admin/login`, { eposta, sifre });
      
      if (res.data.success) {
        // Giriş başarılıysa, kullanıcı bilgisini tarayıcı hafızasına (Local Storage) kaydet
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        // Panele yönlendir
        navigate('/admin/panel');
      }
    } catch (err) {
      // Şifre hatalıysa sunucudan gelen hatayı ekrana bas
      setHata(err.response?.data?.message || 'Giriş başarısız!');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src="/media/logo/THKU.png" alt="Logo" style={{ width: '80px' }} />
          <h4 className="mt-3">Yönetici Girişi</h4>
        </div>
        
        {/* Hata Mesajı Alanı */}
        {hata && <div className="alert alert-danger text-center p-2">{hata}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">E-posta</label>
            <input type="email" className="form-control" value={eposta} onChange={(e) => setEposta(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Şifre</label>
            <input type="password" className="form-control" value={sifre} onChange={(e) => setSifre(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2">Sisteme Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;