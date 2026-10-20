# LACOPD MDT — Claude Code Project Guidelines

Bu proje Los Angeles Community Police Department (LACPD) Mobile Data Terminal (MDT) ve resmi web portalı sistemidir.

## Teknoloji Yığını ve Mimari
- **Framework:** Next.js 14 (App Router, Server & Client Components, TypeScript)
- **Veritabanı & ORM:** Supabase PostgreSQL & Prisma ORM (`prisma/schema.prisma`)
- **Kimlik Doğrulama:** Discord OAuth2, HTTP-only JWT oturum çerezleri (`src/lib/session-verify.ts`, `src/middleware.ts`)
- **Stil & Tasarım:** CSS Değişkenleri (`src/app/globals.css`), Tailwind CSS, Font Awesome ikonları, Inter ve Oswald yazı tipleri
- **Önbellek & Performans:** Bellek içi TTL önbellek (`src/lib/api-cache.ts`, `src/lib/session-verify.ts`)

---

## Temel Komutlar
```bash
# Geliştirme sunucusu
npm run dev

# Tip denetimi (TypeScript)
npx tsc --noEmit

# Prodüksiyon derlemesi (Next.js & Prisma generate)
npm run build

# Veritabanı şema senkronizasyonu
npx prisma db push

# Prisma istemcisi üretimi
npx prisma generate
```

---

## ZORUNLU GÖREV BİTİRME VE DEPLOY PROTOKOLÜ (MANDATORY)

Kullanıcının senden istediği herhangi bir değişiklik, özellik veya hata düzeltmesini tamamladığında **HER SEFERİNDE İSTİSNASIZ** şu adımları sırasıyla uygula:

1. **Tip Doğrulaması:**
   `npx tsc --noEmit` çalıştır. Sıfır hata alana kadar devam et.

2. **Prodüksiyon Derleme Doğrulaması:**
   `npm run build` çalıştır. Sayfa derlemeleri ve route'ların kod 0 ile bittiğini doğrula. Derleme hatası varsa asla git push yapma, düzelt.

3. **Git Staging & Commit:**
   Tüm değişen dosyaları stage'le ve Conventional Commit formatında net bir mesajla commit'le:
   ```bash
   git add -A
   git commit -m "feat(scope): net ve açıklayıcı başlık"
   ```

4. **GitHub & Vercel Deploy:**
   Değişikliklerin Vercel tarafından anında canlıya alınması için hem `main` hem `master` dallarına push yap:
   ```bash
   git push origin main && git push origin main:master
   ```

5. **Kullanıcıya Rapor:**
   Hangi dosyaların değiştiğini, derleme sonucunu ve commit hash'ini kısa, net maddelerle bildir.

---

## Güvenlik ve Kod Kuralları
- **Gizli Anahtarlar:** Kod içine asla sabit şifre, gizli anahtar (secret key) veya backdoor uç noktası ekleme. Her zaman ortam değişkenlerini (`process.env`) kullan.
- **Oturum Denetimi:** API rotalarında doğrudan `jose` çağırmak yerine daima `src/lib/session-verify.ts` içindeki `jwtVerify` veya `getAuthedOfficer` fonksiyonlarını kullan.
- **Veritabanı Performansı:** Supabase uzak bağlantı gecikmesini engellemek için oturum doğrulamalarında `session-verify` önbelleğini ve sık okunan verilerde `src/lib/api-cache.ts` mikro-önbelleğini koru.
- **Gereksiz Konuşma:** Yalın, doğrudan, profesyonel ve teknik konuş.
