CREATE TABLE mesajlar (
    id SERIAL PRIMARY KEY,
    konu VARCHAR(255) NOT NULL,
    unvan VARCHAR(255) NOT NULL,
    ad_soyad VARCHAR(255) NOT NULL,
    eposta VARCHAR(255) NOT NULL,
    mesaj TEXT NOT NULL,
    ip_adresi VARCHAR(50),
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    soyad VARCHAR(255) NOT NULL,
    eposta VARCHAR(191) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('admin', 'superadmin')) NOT NULL
);

INSERT INTO kullanicilar (ad, soyad, eposta, sifre, rol)
VALUES 
    ('Funda', 'Yılmaz', 'fuyilmaz@thk.edu.tr', md5('SAdmin2024**'), 'superadmin'),
    ('Bora', 'Avcu', 's250444902@stu.thk.edu.tr', md5('SAdmin2026**'), 'superadmin');