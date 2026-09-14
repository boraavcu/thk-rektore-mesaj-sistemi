/*
 * reCAPTCHA doğrulaması ve form doğrulama (validation) işlemleri burada yapılır.
 */
import { useState } from 'react';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";

// CANLIYA GEÇİŞ 
// Okulun sunucusuna geçildiğinde 'http://localhost:5000/api' kısmını
// Okulun gerçek sunucu IP adresiyle değiştirilmeli
const API_URL = 'http://localhost:5000/api';

function OgrenciFormu() {
  // Form içindeki verileri tutan hafıza (State) birimleri
  const [formData, setFormData] = useState({
    konu: '', 
    unvan: 'Öğrenci | Student', 
    ad_soyad: '', 
    eposta: '', 
    mesaj: ''
  });
  
  const [captchaToken, setCaptchaToken] = useState(null); // Google reCAPTCHA anahtarı
  const [bildirim, setBildirim] = useState({ tip: '', metin: '' }); // Başarı/Hata mesajları
  const [emailHata, setEmailHata] = useState(false); // E-posta uzantı kontrolü

  // Kullanıcı forma yazı yazdıkça hafızayı güncelleyen fonksiyon
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(e.target.name === 'eposta') setEmailHata(false); // E-posta yazılırken hatayı gizle
  };

  // reCAPTCHA kutucuğu işaretlendiğinde tetiklenen fonksiyon
  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // Form "Gönder" butonuna basıldığında çalışan ana motor
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    
    // Güvenlik Kuralı 1: E-posta uzantısı kontrolü (Frontend tarafı)
    if (!formData.eposta.endsWith('@stu.thk.edu.tr')) {
      setEmailHata(true);
      return;
    }
    
    // Güvenlik Kuralı 2: Robot kontrolü
    if (!captchaToken) {
      setBildirim({ tip: 'warning', metin: 'Lütfen robot olmadığınızı doğrulayın.' });
      return;
    }

    try {
      // Backend (Sunucu) tarafına verilerin paketlenip gönderilmesi
      const response = await axios.post(`${API_URL}/mesaj-gonder`, {
        ...formData,
        captchaToken
      });
      
      // Sunucudan "Başarılı" yanıtı gelirse formu temizle ve teşekkür mesajı göster
      if (response.data.success) {
        setBildirim({ tip: 'success', metin: response.data.message });
        setFormData({ konu: '', unvan: 'Öğrenci | Student', ad_soyad: '', eposta: '', mesaj: '' });
      }
    } catch (error) {
      // Sunucudan (LDAP, reCAPTCHA veya Veritabanı) hata dönerse ekrana bas
      setBildirim({ tip: 'danger', metin: error.response?.data?.message || 'Bağlantı hatası!' });
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* BAŞLIK KISMI */}
      <header className="bg-white py-4 shadow-sm text-center">
        <img src="/media/logo/THKU.png" alt="THKU Logo" style={{ maxWidth: '200px' }} />
      </header>
      
      {/* ANA İÇERİK: FORM VE GÖRSEL */}
      <main className="container flex-grow-1 my-5">
        <div className="row align-items-stretch g-4">
          
          {/* SOL TARAF: FORM BÖLÜMÜ */}
          <div className="col-lg-6 d-flex">
            <div className="card shadow-sm border-0 flex-grow-1">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title mb-4 text-dark" style={{ fontWeight: '600' }}>
                  Rektöre Mesaj | Message to the Rector
                </h3>
                
                {/* Dinamik Bildirim Ekranı (Başarı/Hata) */}
                {bildirim.metin && (
                  <div className={`alert alert-${bildirim.tip} fade show`}>{bildirim.metin}</div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Konu | Subject</label>
                    <select name="konu" className="form-select" value={formData.konu} onChange={handleChange} required>
                      <option value="">Lütfen Konu Seçiniz. | Please Select a Subject</option>
                      <option value="Görüş">Görüş | Opinion</option>
                      <option value="Öneri">Öneri | Suggestion</option>
                      <option value="Şikayet">Şikayet | Complaint</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Ünvanınız | Title</label>
                    <input type="text" name="unvan" className="form-control bg-light" value={formData.unvan} readOnly />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Ad Soyad | Name Surname</label>
                    <input type="text" name="ad_soyad" className="form-control" value={formData.ad_soyad} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">E-Posta Adresi | E - Mail Address</label>
                    <input type="email" name="eposta" className="form-control" placeholder="Üniversite e-posta adresinizi giriniz" value={formData.eposta} onChange={handleChange} required />
                    {emailHata && (
                      <small className="text-danger mt-1 d-block">E-posta adresiniz @stu.thk.edu.tr ile bitmelidir.</small>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold text-secondary">Mesaj | Message</label>
                    <textarea name="mesaj" className="form-control" rows="4" value={formData.mesaj} onChange={handleChange} required></textarea>
                  </div>
                  
                  {/* Google reCAPTCHA v2 Kutucuğu */}
                  {/* CANLIYA ÇIKARKEN SİTEKEY'İ OKULUN ORİJİNAL KEY'İ İLE DEĞİŞTİR */}
                  {/* 6LeblpcqAAAAAAxDYJYPwZWLeJGaGeRy7okjsCkO */}
                  <div className="mb-4 d-flex justify-content-center">
                    <ReCAPTCHA
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={onCaptchaChange}
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">Gönder | Send</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* SAĞ TARAF: REKTÖR GÖRSELİ */}
          <div className="col-lg-6 d-flex">
            <div className="card shadow-sm border-0 flex-grow-1 p-3 d-flex align-items-center justify-content-center bg-white">
              <img src="/media/rektor.jpg" alt="Rektör" className="img-fluid rounded" style={{ maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </main>
      
      {/* ALT BİLGİ (FOOTER) KISMI */}
      <footer className="mt-auto" style={{ backgroundColor: '#87CEEB', padding: '30px 0', color: '#001A72' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h5 className="fw-bold mb-3">İLETİŞİM</h5>
              <p className="mb-1">Türk Hava Kurumu Üniversitesi</p>
              <p className="mb-3">Bahçekapı Mahallesi Okul Sk. No:11 06790 Etimesgut ANKARA</p>
              <div className="d-flex flex-column">
                <a href="tel:00904448458" style={{ color: '#001A72', textDecoration: 'none', fontWeight: '500' }}>+90 444 THKU (8458)</a>
                <a href="mailto:bilgiedinme@thk.edu.tr" style={{ color: '#001A72', textDecoration: 'none', fontWeight: '500' }}>bilgiedinme@thk.edu.tr</a>
              </div>
            </div>
            <div className="col-md-6 d-flex flex-column align-items-md-end justify-content-center text-md-end">
              <p className="mb-1 fw-bold">THKU BİM Tüm Hakları Saklıdır.</p>
              <p className="mb-2">&copy; 2026</p>
              <a href="https://www.thk.edu.tr" target="_blank" rel="noreferrer" style={{ color: '#001A72', textDecoration: 'none' }}>Üniversite Anasayfası</a>
              <a href="https://www.thk.edu.tr/tr/idari/bilgi-islem-mudurlugu" target="_blank" rel="noreferrer" style={{ color: '#001A72', textDecoration: 'none' }}>BİM Anasayfası</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OgrenciFormu;