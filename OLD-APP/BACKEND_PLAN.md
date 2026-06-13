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

### Faz 1: Proje Kurulumu ve Altyapı (Giriş) [TAMAMLANDI]
1. `[x]` **NestJS Başlatılması**: `apps/api` klasörü altında NestJS projesi oluşturuldu.
2. `[x]` **Monorepo Entegrasyonu**: Root `package.json` dosyasına api script'leri eklendi.
3. `[x]` **Environment Setup**: ConfigModule ve dotenv paketleri yüklenerek `.env` okuma entegre edildi.

### Faz 2: Veritabanı ve Prisma Kurulumu [TAMAMLANDI]
1. `[x]` **Prisma Entegrasyonu**: Prisma CLI ve Client kurulumu (v6.19.3) yapıldı.
2. `[x]` **Schema Tanımlama**: `schema.prisma` veritabanı şeması oluşturuldu.
3. `[x]` **Docker Compose Setup**: Yerel PostgreSQL bağlantısı sağlandı.
4. `[x]` **İlk Göç (Migration)**: Göç başarıyla tamamlandı ve tablolar oluşturuldu.
5. `[x]` **Seed Dosyası**: `.env`'den okuyan dinamik seed script'i hazırlandı ve başarıyla seed edildi.

### Faz 3: Temel Güvenlik ve Yetkilendirme [KISMEN TAMAMLANDI]
1. `[x]` **Auth Modülü**: Giriş ve JWT token üretim servisleri yazıldı.
2. `[x]` **Demo Modu Entegrasyonu**: Giriş sayfasında mock verilerle çalışan demo modu ve gerçek mod ayrımı yapıldı.
3. `[x]` **RBAC Guard**: `@Permissions(...)` decorator'ü ve dynamic database tabanlı `PermissionsGuard` kodlandı.
4. `[ ]` **Audit Log Interceptor**: Yazma işlemlerinde audit log üreten interceptor (Faz 4/6 sırasında eklenecek).

### Faz 4: Modüllerin Adım Adım Kodlanması [DEVAM EDİYOR]
1. `[ ]` **Firma & Personel Modülü**: Firma ayarları ve personel listeleme.
2. `[x]` **Müşteriler & Adresler Modülü**: Müşteri CRUD ve default adres kayıt işlemleri.
3. `[x]` **Cihazlar Modülü**: Cihaz tanımlama ve müşteri cihaz eşleşmeleri.
4. `[x]` **Servis Kayıtları & Timeline**: Servis kaydı açma, durum değişimi, timeline takibi.
5. `[ ]` **Stok & Parça Modülü**: Parça tanımları, stok güncelleme.
6. `[ ]` **Kasa & Cari Modülü**: Tahsilat ve gider hareketleri.
7. `[ ]` **Raporlar Modülü**: Tarih ve duruma göre istatistiksel veri toplama.
8. `[ ]` **Public Tracking**: Müşteri sorgulama takip linki.

### Faz 5: Frontend Entegrasyonu [DEVAM EDİYOR]
1. `[x]` **API Client Tanımlanması**: dynamic `fetchWithAuth` (SSR ve Client uyumlu) helper'ı [client.ts](file:///c:/Users/emiran/Desktop/Servis%20Takip/apps/web/lib/api/client.ts) altına yazıldı.
2. `[x]` **Oturum Yönetimi**: JWT token'larının cookie'de saklanması ve middleware entegrasyonu tamamlandı.
3. `[ ]` **Sayfaların Bağlanması**: 
   - Giriş & Oturum: `[x]`
   - Müşteriler: `[x]`
   - Cihazlar: `[x]` (Müşteri detayındaki cihazlar)
   - Servis Kayıtları: `[x]`
   - Diğer Sayfalar: `[ ]`

### Faz 6: Dosya Depolama ve Canlıya Geçiş (R2)
1. `[ ]` **Cloudflare R2/S3 Entegrasyonu**: Servis fotoğraflarının signed URL ile yüklenip gösterilmesi.
2. `[ ]` **Manifest & PWA**: PWA özelliklerinin tamamlanması.
