# PLAN.md — Servis Takip SaaS MVP Planı

## 1. Ürün Kararı

Bu proje, teknik servis işletmeleri için geliştirilecek modern, web tabanlı ve çok firmalı bir servis takip SaaS uygulamasıdır.

MVP amacı büyük bir ERP yapmak değildir. İlk hedef; küçük/orta ölçekli teknik servislerin günlük işlerini kaybetmeden, müşteriyi unutmadan, cihaz geçmişini takip ederek ve tahsilatlarını karıştırmadan çalışmasını sağlamaktır.

Ana hedef:

> Firma hiçbir müşteriyi, cihazı, randevuyu, teslimatı, ödemeyi ve personel hareketini unutmasın.

## 2. Görsel ve UI Kararı

Yeni demo uygulamadaki sade panel mantığı korunacaktır. `DEMO-APP/` klasörü görsel başlangıç noktasıdır.

Ancak mevcut demo birebir ürün değildir. Demo uygulama sadece:

- genel yerleşim,
- sol sidebar,
- üst header,
- kartlı dashboard,
- tablo tasarımı,
- sade beyaz/gri/mavi SaaS görünümü,
- buton ve badge hissi

için referans alınacaktır.

Kod ajanları `DEMO-APP/` içindeki UI'ı tamamen çöpe atmamalıdır. Mevcut tasarımı koruyarak gerçek MVP modüllerine bağlamalıdır.

`UI_SCREENS.md` artık kullanılmayacaktır. UI detayları bu dosya, mevcut demo uygulama ve ürün modülleri üzerinden ilerletilecektir.

## 3. MVP Kapsamı

MVP'de yapılacak ana modüller:

1. Kimlik doğrulama ve oturum yönetimi
2. Firma bazlı SaaS yapısı
3. Personel ve rol/yetki sistemi
4. Müşteri yönetimi
5. Müşteri adresleri
6. Cihaz yönetimi
7. Servis kaydı / iş emri yönetimi
8. Randevu ve günlük iş takibi
9. Servis durum geçmişi / timeline
10. Servis notları
11. Fotoğraf / dosya ekleme
12. QR kod / barkod ile kayıt erişimi
13. Müşteri takip linki
14. Parça ve servis maliyeti girişi
15. Basit tahsilat / gider / kasa takibi
16. Audit log sistemi
17. Dashboard / özet durum paneli
18. i18n altyapısı
19. Responsive web tasarım
20. PWA'ya uygun yapı

## 4. MVP Dışı Bırakılacaklar

Aşağıdakiler ilk sürümde yapılmayacaktır:

- E-fatura / e-arşiv entegrasyonu
- WhatsApp Business API entegrasyonu
- SMS entegrasyonu
- Gelişmiş muhasebe
- Tam kapsamlı stok/depo/raf yönetimi
- Gelişmiş rapor motoru
- Yapay zeka otomasyonları
- Native Android/iOS uygulama
- Gelişmiş form builder
- Online ödeme alma
- Müşteri hesabı / müşteri portalı
- Çoklu şube arası stok transferi
- Muhasebe programı entegrasyonları

## 5. Önerilen Teknoloji Stack

### 5.1 Monorepo

- pnpm workspace
- Turborepo kullanılabilir ama zorunlu değildir
- TypeScript her yerde zorunlu

### 5.2 Frontend

- Next.js, App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- React Hook Form
- Zod
- TanStack Table
- TanStack Query veya Next.js server data fetching
- next-intl veya benzeri i18n çözümü
- Recharts, yalnızca basit grafik gerekirse

### 5.3 Backend

- NestJS
- TypeScript
- REST API
- JWT access token
- Refresh token
- Role Based Access Control
- Tenant guard / middleware
- Audit log interceptor
- DTO validation için class-validator veya Zod tabanlı yapı

### 5.4 Database

- PostgreSQL
- Prisma ORM
- UUID primary key
- Her tenant verisinde `company_id`
- Soft delete için `deleted_at`
- Para alanlarında Decimal
- Tarihler UTC saklanır

### 5.5 File Storage

MVP için seçeneklerden biri kullanılabilir:

- Cloudflare R2
- AWS S3
- Supabase Storage
- MinIO, self-hosted gerekirse

Servis fotoğrafları public bucket'ta tutulmamalıdır. Kullanıcı yetkisine göre signed URL üretilmelidir.

### 5.6 Deployment

Önerilen ilk deployment:

- Frontend: Vercel veya Docker ile VPS
- Backend: Docker ile VPS / Railway / Render / Fly.io
- Database: Managed PostgreSQL veya VPS PostgreSQL
- Storage: Cloudflare R2 veya Supabase Storage
- Reverse proxy: Caddy veya Nginx
- Local development: Docker Compose

## 6. Sürüm Politikası

Eski sabit sürümlerle proje başlatılmamalıdır. Kurulum sırasında güncel stable sürümler tercih edilmeli, sonrasında lockfile ile sürümler kilitlenmelidir.

Kurulum prensibi:

```bash
node --version
pnpm --version
pnpm create next-app@latest apps/web
pnpm dlx shadcn@latest init
npm i -g @nestjs/cli@latest
nest new apps/api
pnpm add @prisma/client
pnpm add -D prisma
```

Kurallar:

- Node.js güncel LTS kullanılmalı.
- Canary, alpha, beta sürümler kullanılmamalı.
- Deprecated paketler özellikle seçilmemeli.
- Lockfile repoya eklenmeli.
- `.env.example` güncel tutulmalı.

## 7. Repo Yapısı

```text
servis-takip/
  DEMO-APP/
  apps/
    web/
    api/
  packages/
    shared/
    config/
  PLAN.md
  DATABASE_DESIGN.md
  AGENTS.md
  docker-compose.yml
  .env.example
  README.md
```

`DEMO-APP/` mevcut görsel prototip veya Stitch çıktısı için ayrılmıştır. Üretim kodu zamanla `apps/web` içine düzenli şekilde taşınmalıdır.

## 8. Frontend Yapısı

```text
apps/web/
  app/
    [locale]/
      dashboard/
      today/
      service-records/
      customers/
      devices/
      calendar/
      parts/
      cash/
      reports/
      staff/
      audit-logs/
      settings/
    track/[code]/
  components/
    ui/
    layout/
    forms/
    tables/
    status/
  features/
    dashboard/
    service-records/
    customers/
    devices/
    calendar/
    parts/
    cash/
    staff/
    settings/
  lib/
    api/
    auth/
    i18n/
    utils/
  messages/
    tr.json
    en.json
```

## 9. Backend Yapısı

```text
apps/api/src/
  auth/
  companies/
  users/
  roles/
  customers/
  devices/
  service-records/
  appointments/
  parts/
  payments/
  expenses/
  files/
  public-tracking/
  dashboard/
  audit-logs/
  notifications/
  common/
    decorators/
    guards/
    interceptors/
    filters/
    pipes/
    utils/
  prisma/
```

## 10. Ana Kullanıcı Rolleri

MVP'de varsayılan roller:

### Firma Sahibi / Admin

- Her modülü görür.
- Personel ve yetki yönetir.
- Kasa, rapor, log ve ayarları görür.
- Servis kayıtlarını oluşturur, günceller, siler.

### Yönetici

- Operasyonel kayıtları yönetir.
- Personel ataması yapar.
- Teklif, ödeme ve servis durumlarını yönetir.
- Firma genel ayarlarını değiştiremez veya sınırlı değiştirir.

### Tekniker / Usta

- Kendisine atanmış işleri görür.
- Servis durumunu günceller.
- Fotoğraf, not ve işlem ekler.
- Kasa ve yönetici loglarını göremez.

### Çırak / Yardımcı

- Sadece atanmış işleri görür.
- Fotoğraf ve basit not ekleyebilir.
- Fiyat, maliyet, kasa ve raporları göremez.

### Muhasebe / Kasa

- Tahsilat, gider ve cari bilgileri yönetir.
- Teknik detaylara sınırlı erişebilir.

## 11. Ana İş Akışı

```text
Müşteri arar
  ↓
Müşteri kaydı açılır veya mevcut müşteri bulunur
  ↓
Cihaz kaydı oluşturulur veya mevcut cihaz seçilir
  ↓
Servis kaydı / iş emri açılır
  ↓
Randevu tarihi ve personel atanır
  ↓
Yerinde servis veya cihaz teslim alma süreci başlar
  ↓
Arıza tespiti, fotoğraf, not ve parça ihtiyacı girilir
  ↓
Fiyat teklifi verilir
  ↓
Müşteri onayı beklenir
  ↓
Onarım yapılır
  ↓
Tahsilat alınır
  ↓
Cihaz teslim edilir
  ↓
Kayıt geçmişte saklanır
```

## 12. Servis Durumları

MVP durumları:

```text
NEW
APPOINTMENT_SCHEDULED
ASSIGNED
IN_PROGRESS
WAITING_PART
WAITING_CUSTOMER_APPROVAL
REPAIRING
READY_FOR_DELIVERY
DELIVERED
CANCELLED
UNREACHABLE
UNPAID
```

Türkçe karşılıklar i18n dosyasında tutulmalıdır.

## 13. Ana Ekranlar

Mevcut demo tasarımı korunarak aşağıdaki sayfalar oluşturulmalıdır:

```text
/login
/onboarding
/dashboard
/today
/service-records
/service-records/new
/service-records/[id]
/customers
/customers/new
/customers/[id]
/devices
/devices/[id]
/calendar
/parts
/cash
/reports
/staff
/audit-logs
/settings
/track/[code]
```

`/dashboard` istatistik ekranı gibi değil, operasyon merkezi gibi çalışmalıdır.

Dashboard'da en az:

- Bugünkü işler
- Bekleyen cihazlar
- Parça bekleyenler
- Onay bekleyenler
- Teslime hazır olanlar
- Geciken / acil işler
- Günlük tahsilat / gider
- Son servis kayıtları

bulunmalıdır.

## 14. i18n Kuralları

- Varsayılan dil Türkçe olmalıdır.
- İngilizce destek altyapısı kurulmalıdır.
- UI metinleri hardcode edilmemelidir.
- Backend enum değerleri İngilizce kalmalı, frontend çeviriyi i18n'den almalıdır.
- Para birimi MVP'de TRY varsayılan olmalıdır.
- Tarihler `Europe/Istanbul` gösterimine göre formatlanmalıdır.
- Uygulama route'ları locale prefix ile çalışmalıdır: `/tr/dashboard`, `/en/dashboard`.
- Varsayılan Türkçe locale için `/dashboard` gibi prefix'siz route gelirse `/tr/dashboard` adresine yönlendirilmelidir.

## 14.1 PWA Minimum Beklentisi

MVP'de PWA kapsamı sınırlı tutulacaktır. Beklenen minimumlar:

- `manifest.webmanifest` tanımlı olmalıdır.
- Uygulama adı, kısa ad, ikonlar, `theme_color`, `background_color` ve `display` alanları bulunmalıdır.
- Mobil tarayıcıda ana ekrana ekleme desteklenmelidir.
- Offline çalışma zorunlu değildir; ancak bağlantı yokken kullanıcıya anlaşılır offline fallback gösterilmelidir.
- Kritik servis verileri tarayıcıda kalıcı ve şifresiz cache'lenmemelidir.

## 15. Güvenlik Kuralları

- Kullanıcı sadece bağlı olduğu firmaların verisini görebilir.
- Her tenant verisi `company_id` ile filtrelenir.
- Backend'de tenant kontrolü atlanamaz.
- Role/permission kontrolü sadece frontend'e bırakılmaz.
- Public takip linki tahmin edilebilir olmamalıdır.
- Fotoğraflar public URL ile açık edilmemelidir.
- Her kritik write işleminde audit log oluşturulur.
- Şifreler hashlenir; plain text saklanmaz.

## 16. MVP Başarı Kriterleri

MVP başarılı sayılırsa:

- Firma yeni servis kaydı açabilir.
- Müşteri ve cihaz geçmişini görebilir.
- Bugünün işlerini takip edebilir.
- Personel görevlendirebilir.
- Durum güncelleyebilir.
- Fotoğraf ekleyebilir.
- QR/takip kodu üretebilir.
- Müşteri public linkten durum görebilir.
- Tahsilat/gider girebilir.
- Yönetici kimin ne yaptığını audit logda görebilir.
- Uygulama mobil ve masaüstünde rahat kullanılabilir.
