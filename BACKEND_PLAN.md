# BACKEND_PLAN.md — Backend Geçiş ve Geliştirme Yol Haritası

Bu yol haritası, mevcut mock veri katmanına sahip Next.js frontend uygulamasını gerçek bir NestJS backend ve PostgreSQL veritabanına bağlamak için adım adım uygulanacak fazları tanımlar.

---

## 1. Ortam Değişkenleri Şablonu (.env)

Geliştirme sürecinde backend ve veritabanı bağlantısı için hem root klasörde hem de `apps/api` altında aşağıdaki `.env` değişkenleri kullanılacaktır:

```env
# Server Config
PORT=3001
NODE_ENV=development

# Database Config (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=servis_takip
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# JWT Authentication
JWT_SECRET="change-this-to-a-secure-key-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-this-to-a-secure-refresh-key"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudflare R2 Storage (Phase 5 - Dosya Yükleme)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=servis-takip-assets
```

---

## 2. Geliştirme Fazları ve Adımlar

### Faz 1: Proje Kurulumu ve Altyapı (Giriş)
1. **NestJS Başlatılması**: `apps/api` klasörü altında yeni bir NestJS projesi oluşturulması.
   ```bash
   npx -y @nestjs/cli@latest new apps/api --package-manager pnpm
   ```
2. **Monorepo Entegrasyonu**: Root `package.json` dosyasına api'yi çalıştıracak script'lerin eklenmesi (`dev:api`, `build:api`, `typecheck:api`).
3. **Environment Setup**: ConfigModule ve dotenv paketleri yüklenerek `.env` okuma mekanizmasının NestJS'e entegre edilmesi.

### Faz 2: Veritabanı ve Prisma Kurulumu
1. **Prisma Entegrasyonu**: `apps/api` içinde Prisma CLI ve Client kurulumunun yapılması.
2. **Schema Tanımlama**: [DATABASE_DESIGN.md](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/DATABASE_DESIGN.md) dosyasına birebir sadık kalınarak `schema.prisma` dosyasının oluşturulması (Tablolar, Enum'lar ve İlişkiler).
3. **Docker Compose Setup**: Yerel geliştirme için PostgreSQL veritabanını ayaklandıracak `docker-compose.yml` dosyasının hazırlanması.
4. **İlk Göç (Migration)**: Veritabanı tablolarının oluşturulması ve Prisma Client'ın generate edilmesi.
5. **Seed Dosyası**: Testler için default rolleri, yetkileri ve ilk admin kullanıcısını oluşturacak veritabanı seed script'inin yazılması.

### Faz 3: Temel Güvenlik ve Tenant Altyapısı
1. **Auth Modülü**: Kullanıcı kayıt, giriş (login) ve JWT access/refresh token üretim servislerinin yazılması.
2. **Tenant Guard / Interceptor**: Gelen isteklerde firmanın izole edilmesi amacıyla, `company_id` filtresini Prisma sorgularına otomatik uygulayacak global guard ve Prisma middleware/extension yapısının kurulması.
3. **RBAC Guard**: Kullanıcının rollerine göre endpoint'lere erişimini sınırlayan `@Roles` ve `@Permissions` decorator ve guard yapılarının kodlanması.
4. **Audit Log Interceptor**: Yazma (POST, PUT, DELETE) işlemlerinde kimin hangi veriyi değiştirdiğini kaydedecek loglama interceptor'ının eklenmesi.

### Faz 4: Modüllerin Adım Adım Kodlanması
Her modül için Controller, Service, DTO validasyonları ve tenant filtresi yazılacaktır:
1. **Firma & Personel Modülü**: Firma ayarları ve personel listeleme/yönetimi.
2. **Müşteriler & Adresler Modülü**: Müşteri CRUD ve adres kayıt işlemleri.
3. **Cihazlar Modülü**: Cihaz tanımlama ve müşteri cihaz eşleşmeleri.
4. **Servis Kayıtları & Timeline**: Servis kaydı açma, durum değiştirme, atama yapma ve durum geçmişi (Timeline).
5. **Stok & Parça Modülü**: Parça tanımları, stok güncelleme ve servis kaydı rezervasyonları.
6. **Kasa & Cari Modülü**: Tahsilat ve gider hareketlerinin kaydı.
7. **Raporlar Modülü**: Tarih ve duruma göre istatistiksel veri toplama (Aggregation).
8. **Public Tracking**: Müşterinin şifresiz ve sidebar olmadan sadece kendi cihazının durumunu görebileceği public tracking endpoint'i.

### Faz 5: Frontend Entegrasyonu
1. **API Client Tanımlanması**: `apps/web` altında mock fonksiyonlar yerine Axios/Fetch ile `NEXT_PUBLIC_API_URL` adresine istek atan api client'ın yazılması.
2. **Oturum Yönetimi**: JWT token'larının cookie'de saklanması ve frontend route koruma (middleware) işlemlerinin yapılması.
3. **Sayfaların Bağlanması**: Tüm mock sayfaların (dashboard, service-records, customers, parts, cash vb.) gerçek API isteklerine bağlanması.

### Faz 6: Dosya Depolama ve Canlıya Geçiş (R2)
1. **Cloudflare R2/S3 Entegrasyonu**: Servis fotoğraflarının yüklenmesi ve sadece yetkili kullanıcılara imzalı URL (Signed URL) üretilerek gösterilmesi.
2. **Manifest & PWA**: Eksik kalan `manifest.webmanifest` ve PWA özelliklerinin tamamlanması.
