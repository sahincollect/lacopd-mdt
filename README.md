# LAPD MDT — Kurulum Kılavuzu

## Gereksinimler
- Node.js 18+
- MySQL 8.0+ veritabanı
- npm

## Kurulum Adımları

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla
`.env.example` dosyasını `.env` olarak kopyala ve doldur:
```bash
cp .env.example .env
```

`.env` içeriği:
```
DATABASE_URL="mysql://KULLANICI:SIFRE@HOST:3306/lapd_mdt"
JWT_SECRET="guclu-ve-uzun-bir-secret-buraya"
```

### 3. Veritabanı Tablolarını Oluştur
```bash
npx prisma migrate deploy
# veya ilk kurulumda:
npx prisma db push
```

### 4. Prisma Client Oluştur
```bash
npx prisma generate
```

### 5. İlk Admin Hesabı Oluştur
Tarayıcıdan `/api/setup` endpoint'ini ziyaret et (sadece bir kez çalışır).

### 6. Production Build Al
```bash
npm run build
npm run start
```

## Sunucuya Deploy (PM2)
```bash
npm run build
pm2 start npm --name "lapd-mdt" -- start
pm2 save
```

## Önemli Notlar
- `JWT_SECRET` güçlü ve gizli olmalı: `openssl rand -hex 32`
- `.env` dosyasını asla git'e yükleme
- `standalone` output modu aktif — `.next/standalone` klasörü deploy edilebilir
