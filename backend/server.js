/**
 * ============================================================================
 * PROJE      : T.C. THKÜ Rektöre Mesaj Sistemi (Modernizasyon)
 * GELİŞTİRİCİ: Bora Avcu (Bilgisayar Mühendisliği)
 * TARİH      : Nisan 2026
 * AÇIKLAMA   : PHP monolitik yapıdan React & Node.js mimarisine taşınmış; 
 * LDAP, reCAPTCHA ve PostgreSQL entegrasyonları yapılarak 
 * kurumsal standartlarda uçtan uca (Full-Stack) yenilenmiştir.
 * ============================================================================
 */

// Gerekli sistem kütüphanelerinin (modüllerin) projeye dahil edilmesi
const express = require('express');
const cors = require('cors'); // Farklı portlar arası iletişime izin vermek için
const { Pool } = require('pg'); // PostgreSQL veritabanı sürücüsü
const axios = require('axios'); // Dış API'lere (Google reCAPTCHA) istek atmak için
const ldap = require('ldapjs'); // Active Directory / LDAP bağlantısı için
require('dotenv').config(); // Gizli şifreleri .env dosyasından okumak için
const nodemailer = require('nodemailer'); // SMTP üzerinden E-posta göndermek için

const app = express();
app.use(cors());
app.use(express.json()); // Gelen isteklerdeki JSON verilerini ayrıştırmak için

/**
 * ----------------------------------------------------------------------------
 * 1. VERİTABANI (POSTGRESQL) BAĞLANTISI
 * ----------------------------------------------------------------------------
 * Güvenlik nedeniyle bağlantı bilgileri kod içine gömülmemiş, .env dosyasından 
 * dinamik olarak çekilmiştir.
 */
const pool = new Pool({
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Veritabanı bağlantısının test edilmesi
pool.connect()
    .then(() => console.log('✅ PostgreSQL Bağlantısı Başarılı'))
    .catch(err => console.error('❌ Bağlantı Hatası:', err.stack));


/**
 * ----------------------------------------------------------------------------
 * 2. KURUMSAL KİMLİK (LDAP) DOĞRULAMA FONKSİYONU
 * ----------------------------------------------------------------------------
 * Bu fonksiyon, formu dolduran kişinin gerçekten üniversitemize kayıtlı 
 * aktif bir öğrenci olup olmadığını Active Directory üzerinden denetler.
 * @param {string} email - Doğrulanacak öğrenci e-posta adresi
 * @returns {Promise} - Öğrenci bulunursa resolve(true), bulunamazsa reject(hata) döner
 */
function verifyLdapUser(email) {
    return new Promise((resolve, reject) => {
        // Geliştirici/Test modundaysak LDAP sunucusunu yormadan direkt onay verilir
        if (process.env.MOCK_LDAP === 'true') {
            console.log(`⚠️ Geliştirici Modu: ${email} için LDAP doğrulaması atlandı.`);
            return resolve(true);
        }

        const client = ldap.createClient({ url: process.env.LDAP_URL });

        // Adım 1: LDAP sunucusuna yetkili servis hesabıyla giriş (Bind) yapılır
        client.bind(process.env.LDAP_BIND_USER, process.env.LDAP_BIND_PASSWORD, (err) => {
            if (err) {
                console.error("LDAP Giriş Hatası:", err);
                client.unbind();
                return reject(new Error("LDAP sunucusuna bağlanılamadı. Sistem yöneticisine bildirin."));
            }

            // Adım 2: Gelen e-posta adresini dizin (Directory) içinde arama ayarları
            const opts = {
                filter: `(mail=${email})`, 
                scope: 'sub',
                attributes: ['dn', 'mail']
            };

            // Adım 3: Arama işleminin başlatılması
            client.search(process.env.LDAP_SEARCH_BASE, opts, (err, res) => {
                if (err) {
                    client.unbind();
                    return reject(err);
                }

                let isFound = false;

                // Eşleşen bir kayıt bulunduğunda bayrak (flag) true yapılır
                res.on('searchEntry', (entry) => {
                    isFound = true; 
                });

                // Arama işlemi bittiğinde bağlantı koparılır ve sonuç bildirilir
                res.on('end', (result) => {
                    client.unbind();
                    if (isFound) {
                        resolve(true); // E-posta sistemde kayıtlı
                    } else {
                        reject(new Error("Bu e-posta adresi üniversite sisteminde bulunamadı."));
                    }
                });
            });
        });
    });
}


/**
 * ----------------------------------------------------------------------------
 * 3. ANA API ROTASI: ÖĞRENCİDEN REKTÖRLÜĞE MESAJ GÖNDERİMİ
 * ----------------------------------------------------------------------------
 * Frontend'den gelen form verilerini alır, 3 aşamalı güvenlik testinden geçirir, 
 * veritabanına kaydeder ve Rektörlüğe SMTP üzerinden e-posta olarak iletir.
 */
app.post('/api/mesaj-gonder', async (req, res) => {
    try {
        const { konu, unvan, ad_soyad, eposta, mesaj, captchaToken } = req.body;

        // Kötü niyetli kullanımları engellemek için kullanıcının gerçek IP adresi alınır
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        /* --- GÜVENLİK DUVARI 1: Google reCAPTCHA Doğrulaması (Bot Koruması) --- */
        if (!captchaToken) {
            return res.status(400).json({ success: false, message: "Lütfen robot olmadığınızı doğrulayın." });
        }
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}&remoteip=${userIP}`;
        const googleResponse = await axios.post(googleVerifyUrl);
        if (!googleResponse.data.success) {
            return res.status(400).json({ success: false, message: "reCAPTCHA doğrulaması başarısız oldu." });
        }

        /* --- GÜVENLİK DUVARI 2: Kurumsal LDAP Doğrulaması (Kimlik Koruması) --- */
        // Sadece öğrenci uzantılı e-postalar işleme alınır
        if (!eposta.endsWith('@stu.thk.edu.tr')) {
            return res.status(400).json({ success: false, message: "Sadece @stu.thk.edu.tr uzantılı e-posta adresleri kabul edilmektedir." });
        }
        try {
            await verifyLdapUser(eposta);
        } catch (ldapError) {
            return res.status(400).json({ success: false, message: ldapError.message });
        }

        /* --- İŞLEM 1: Veritabanına Arşivleme --- */
        const queryText = "INSERT INTO mesajlar (konu, unvan, ad_soyad, eposta, mesaj, ip_adresi) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
        const values = [konu, unvan, ad_soyad, eposta, mesaj, userIP];
        const yeniMesaj = await pool.query(queryText, values);

        /* --- İŞLEM 2: SMTP Üzerinden Rektörlüğe Kurumsal E-posta Gönderimi --- */
        try {
            let transporter;

            // .env içindeki MOCK_SMTP ayarına göre Test veya Canlı sunucu seçimi yapılır
            if (process.env.MOCK_SMTP === 'true') {
                console.log("⚠️ Geliştirici Modu: Ethereal (Test) SMTP sunucusu oluşturuluyor...");
                let testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: { user: testAccount.user, pass: testAccount.pass },
                });
            } else {
                // CANLI ORTAM: Kurum içi (Port 25) SMTP ayarları (Şifresiz yönlendirme)
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: false,
                    tls: { rejectUnauthorized: false } // İç ağ güvenliği için yetki reddi iptali
                });
            }

            // Gidecek e-postanın HTML tasarımı ve içeriği kurgulanır
            let mailOptions = {
                from: `"THK Rektöre Mesaj Sistemi" <${process.env.SMTP_USER}>`,
                to: process.env.EMAIL_TO,
                subject: `YENİ MESAJ [${konu}] - Gönderen: ${ad_soyad}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #004b87;">T.C. Türk Hava Kurumu Üniversitesi</h2>
                        <h3>Rektörlüğe Yeni Bir Mesaj İletildi</h3>
                        <p><b>Konu Tipi:</b> ${konu}</p>
                        <p><b>Gönderen:</b> ${ad_soyad} (${unvan || 'Belirtilmedi'})</p>
                        <p><b>Öğrenci E-postası:</b> ${eposta}</p>
                        <hr>
                        <p><b>Mesaj İçeriği:</b></p>
                        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${mesaj}</p>
                    </div>
                `
            };

            let info = await transporter.sendMail(mailOptions);
            console.log("📧 E-posta başarıyla gönderildi!");
            
            // Test modundaysa mailin önizleme linkini terminale yazdırır
            if (process.env.MOCK_SMTP === 'true') {
                console.log("🔍 Mailin nasıl göründüğünü test etmek için şu linke tıklayın (CTRL + Click):");
                console.log(nodemailer.getTestMessageUrl(info));
            }

        } catch (mailError) {
            console.error("❌ E-posta gönderme hatası:", mailError);
        }

        // Tüm süreç başarıyla tamamlandığında Frontend'e onay mesajı dönülür
        res.json({ 
            success: true, 
            message: "Mesajınız başarıyla iletildi ve güvenli şekilde kaydedildi.",
            data: yeniMesaj.rows[0] 
        });

    } catch (err) {
        console.error("Sunucu Hatası:", err.message);
        res.status(500).json({ success: false, message: "Sistemde bir hata oluştu." });
    }
});


/**
 * ============================================================================
 * 4. YÖNETİCİ (ADMIN) PANELİ İÇİN API ROTALARI
 * ==============================================================
 */

// Yönetici Giriş (Login) Doğrulaması
app.post('/api/admin/login', async (req, res) => {
    try {
        const { eposta, sifre } = req.body;
        
        // Veritabanında e-posta eşleşmesi ve şifrenin MD5 (hash) kontrolü yapılır
        const queryText = "SELECT id, ad, soyad, rol FROM kullanicilar WHERE eposta = $1 AND sifre = md5($2)";
        const result = await pool.query(queryText, [eposta, sifre]);

        if (result.rows.length > 0) {
            // Şifre doğruysa, güvenli kullanıcı bilgileri (şifre hariç) panele gönderilir
            res.json({ success: true, user: result.rows[0], message: "Giriş başarılı! Yönlendiriliyorsunuz..." });
        } else {
            // Şifre veya e-posta hatalıysa erişim reddedilir (401 Unauthorized)
            res.status(401).json({ success: false, message: "E-posta veya şifre hatalı!" });
        }
    } catch (err) {
        console.error("Login Hatası:", err.message);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
});

// Yöneticiler İçin Veritabanından Mesajları Listeleme
app.get('/api/admin/mesajlar', async (req, res) => {
    try {
        // Gelen mesajlar tarihe göre sondan başa (en yeniden en eskiye) doğru çekilir
        const queryText = "SELECT * FROM mesajlar ORDER BY tarih DESC";
        const result = await pool.query(queryText);
        
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Mesaj Çekme Hatası:", err.message);
        res.status(500).json({ success: false, message: "Mesajlar yüklenemedi." });
    }
});
// ==============================================================

// Sunucunun ayağa kaldırılması ve dinlemeye başlaması
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda aktif.`));