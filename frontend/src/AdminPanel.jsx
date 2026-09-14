/**
* Gelen tüm mesajların tablolanarak görüntülendiği, yetkisiz
erişimlere karşı korunan (Protected Route) ana yönetim merkezidir.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// CANLIYA GEÇİŞ 
// Okulun sunucusuna geçildiğinde 'http://localhost:5000/api' kısmını
// Okulun gerçek sunucu IP adresiyle değiştirilmeli
const API_URL = 'http://localhost:5000/api';

function AdminPanel() {
  const [mesajlar, setMesajlar] = useState([]); // Veritabanından gelen veriler
  const [seciliMesaj, setSeciliMesaj] = useState(null); // Detayı gösterilecek mesaj
  const navigate = useNavigate();

  // Sayfa yüklendiğinde otomatik olarak çalışacak işlemler (Hook)
  useEffect(() => {
    // 1. GÜVENLİK KONTROLÜ: Kullanıcı gerçekten giriş yapmış mı?
    const user = localStorage.getItem('adminUser');
    if (!user) {
      // Giriş yapmamışsa (Linke direkt tıklamaya çalışmışsa) Login ekranına at
      navigate('/admin');
      return;
    }

    // 2. VERİ ÇEKME: Backend üzerinden veritabanındaki mesajları listele
    const fetchMesajlar = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/mesajlar`);
        if (res.data.success) {
          setMesajlar(res.data.data);
        }
      } catch (error) {
        console.error("Mesajlar çekilemedi", error);
      }
    };
    
    fetchMesajlar();
  }, [navigate]);

  // Çıkış yapma (Session sonlandırma) işlemi
  const handleLogout = () => {
    localStorage.removeItem('adminUser'); // Tarayıcı hafızasını sil
    navigate('/admin'); // Login ekranına gönder
  };

  return (
    <div className="container mt-5 pb-5">
      {/* ÜST BİLGİ VE ÇIKIŞ BUTONU */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <img src="/media/logo/THKU.png" alt="THKU Logo" style={{ width: '60px', marginRight: '15px' }} />
          <h2 className="m-0" style={{ color: '#001A72', fontWeight: 'bold' }}>Rektörlüğe Gelen Mesajlar</h2>
        </div>
        <button className="btn btn-danger shadow-sm px-4" onClick={handleLogout}>Güvenli Çıkış</button>
      </div>

      {/* MESAJLAR TABLOSU */}
      <div className="card shadow border-0 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#001A72', color: 'white' }}>
                <tr>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Konu</th>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3">Mesaj (Tıklayın)</th>
                </tr>
              </thead>
              <tbody>
                {mesajlar.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">Henüz hiç mesaj bulunmuyor.</td>
                  </tr>
                ) : (
                  mesajlar.map((msg) => (
                    // Satıra tıklandığında modalı açan yapı
                    <tr 
                      key={msg.id} 
                      onClick={() => setSeciliMesaj(msg)} 
                      style={{ cursor: 'pointer' }}
                      title="Detayları görmek için tıklayın"
                    >
                      <td className="px-4 py-3">{new Date(msg.tarih).toLocaleString('tr-TR')}</td>
                      <td className="px-4 py-3">
                        {/* Konuya göre renkli rozet (Badge) tasarımı */}
                        <span className={`badge rounded-pill ${msg.konu === 'Şikayet' ? 'bg-danger' : msg.konu === 'Öneri' ? 'bg-success' : 'bg-primary'}`}>
                          {msg.konu}
                        </span>
                      </td>
                      <td className="px-4 py-3 fw-bold">{msg.ad_soyad}</td>
                      <td className="px-4 py-3 text-secondary">{msg.eposta}</td>
                      <td className="px-4 py-3 text-truncate" style={{ maxWidth: '300px' }}>
                        {msg.mesaj}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MESAJ DETAY PENCERESİ (MODAL) */}
      {/* Tablodan bir satıra tıklandığında ekrana gelir */}
      {seciliMesaj && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-0 px-4 pt-4">
                <h5 className="modal-title fw-bold" style={{ color: '#001A72' }}>Mesaj Detayı</h5>
                <button type="button" className="btn-close" onClick={() => setSeciliMesaj(null)}></button>
              </div>
              <div className="modal-body px-4 pb-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className="small text-muted mb-1">Gönderen</p>
                    <p className="fw-bold mb-0">{seciliMesaj.ad_soyad}</p>
                    <p className="text-secondary small">{seciliMesaj.eposta}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="small text-muted mb-1">Tarih ve IP</p>
                    <p className="mb-0">{new Date(seciliMesaj.tarih).toLocaleString('tr-TR')}</p>
                    <p className="text-muted small">IP: {seciliMesaj.ip_adresi}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className={`badge rounded-pill mb-2 ${seciliMesaj.konu === 'Şikayet' ? 'bg-danger' : seciliMesaj.konu === 'Öneri' ? 'bg-success' : 'bg-primary'}`}>
                    {seciliMesaj.konu}
                  </span>
                </div>
                <div className="p-4 rounded-3 bg-light" style={{ minHeight: '150px', whiteSpace: 'pre-wrap' }}>
                  {seciliMesaj.mesaj}
                </div>
              </div>
              <div className="modal-footer border-0 px-4 pb-4">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setSeciliMesaj(null)}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="text-center mt-5 pb-3">
        <hr className="mb-4 opacity-25" />
        <p className="text-muted small mb-0">
          Developed by <a href='https://www.linkedin.com/in/bora-avcu-b75a26204/' target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#001A72' }}><strong>Bora Avcu</strong></a>
        </p>
        <p className="text-muted" style={{ fontSize: '10px' }}>&copy; 2026 | Sürüm 1.0.0</p>
      </footer>
    </div>
  );
}

export default AdminPanel;