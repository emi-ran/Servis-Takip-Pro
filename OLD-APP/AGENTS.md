# AGENTS.md — Kod Ajanları İçin Geliştirme Talimatları

## 1. Proje Amacı

Bu repository teknik servis işletmeleri için modern, web tabanlı, çok firmalı bir Servis Takip SaaS uygulamasıdır.

MVP; müşteri, cihaz, servis kaydı, randevu, personel, fotoğraf, QR/takip linki, basit kasa ve audit log süreçlerini kapsar.

Ajanların görevi küçük, güvenli, sürdürülebilir ve mevcut demo tasarımını bozmayan değişiklikler yapmaktır.

## 2. Mutlaka Okunacak Dosyalar

Her ajan işe başlamadan önce ilgili kapsam kadar şu dosyaları okumalıdır:

```text
PLAN.md
DATABASE_DESIGN.md
AGENTS.md
```

UI ile ilgili bir iş yapılacaksa ayrıca `DEMO-APP/` klasörü incelenmelidir.

`UI_SCREENS.md` artık kullanılmayacaktır. Varsa bile kaynak kabul edilmemelidir.

## 3. DEMO-APP Kullanım Kuralı

`DEMO-APP/` klasörü görsel referans ve başlangıç prototipidir.

Ajanlar:

- mevcut sade dashboard hissini korumalı,
- sidebar/header yapısını koruyarak geliştirmeli,
- gereksiz yeniden tasarım yapmamalı,
- demo içindeki kodu doğrudan üretim kodu sanmamalı,
- gerekirse parçalayarak `apps/web/features/*` ve `components/*` altına taşımalı,
- UI metinlerini i18n'e dönüştürmeli,
- demo verilerini gerçek API client veya mock katmanına ayırmalıdır.

Demo uygulama tek dosyaya yığılmışsa bu yapı kabul edilmez. Üretim tarafına taşınırken dosyalar modüler hale getirilmelidir.

## 4. Genel Davranış Kuralları

1. Gereksiz dosya okuma yapma.
2. Değişiklikleri küçük ve odaklı tut.
3. Bir işi bitirmeden başka işe geçme.
4. Tek dosyaya yüzlerce satır logic yığma.
5. Her modül kendi klasöründe olmalı.
6. Ortak kodları `packages/shared`, `apps/web/lib` veya `apps/api/src/common` altına taşı.
7. UI metinlerini hardcode etme. i18n kullan.
8. Backend'de yetki ve tenant kontrolünü asla atlama.
9. Demo verisi ile production logic'i karıştırma.
10. Build, lint ve typecheck hatası bırakma.
11. Deprecated paketleri özellikle seçme.
12. Canary, alpha, beta sürüm kullanma.
13. Her write işleminde audit log gerekliliğini kontrol et.
14. Kullanılmayan kod, import ve component bırakma.
15. Route, tablo, enum ve DTO adlarını dokümanlarla tutarlı tut.

## 5. Teknoloji Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- React Hook Form
- Zod
- TanStack Table
- TanStack Query veya Next.js data fetching
- next-intl veya eşdeğer i18n çözümü

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT auth
- Refresh token
- Role/permission guard
- Tenant guard
- Audit log interceptor

### Tooling

- pnpm tercih edilir.
- ESLint kullanılmalı.
- Prettier kullanılmalı.
- Docker Compose local development için kullanılmalı.
- `.env.example` güncel tutulmalı.

## 6. Monorepo Yapısı

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

## 7. Frontend Organizasyonu

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

## 8. Frontend Kuralları

- Sayfa dosyaları ince kalmalıdır.
- Business logic `features/*` altına taşınmalıdır.
- API istekleri `lib/api` veya feature-specific client içinde olmalıdır.
- Form validasyonu Zod ile yapılmalıdır.
- React Hook Form kullanılmalıdır.
- Tablo için TanStack Table kullanılabilir.
- Loading, error, empty state her liste ekranında olmalıdır.
- Mobil görünüm desteklenmelidir.
- Sidebar masaüstünde açık, mobilde drawer olarak çalışmalıdır.
- Renkler ve spacing mevcut demo ile uyumlu olmalıdır.
- UI textleri i18n dosyasından gelmelidir.

Yanlış:

```tsx
<button>Yeni Kayıt</button>
```

Doğru:

```tsx
<Button>{t("serviceRecords.actions.new")}</Button>
```

Yanlış:

```tsx
fetch("http://localhost:3001/service-records")
```

Doğru:

```tsx
api.serviceRecords.list(params)
```

Yanlış:

```tsx
const statusLabel = status === "NEW" ? "Yeni Kayıt" : "Diğer";
```

Doğru:

```tsx
t(`serviceStatuses.${status}`)
```

## 9. Backend Organizasyonu

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
  payments/
  expenses/
  parts/
  files/
  public-tracking/
  dashboard/
  audit-logs/
  notifications/
  common/
    guards/
    decorators/
    interceptors/
    filters/
    pipes/
    utils/
  prisma/
```

Her modülde ideal yapı:

```text
module-name/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  dto/
  types/
  policies/
```

## 10. Backend Kuralları

1. Controller ince olmalıdır.
2. Business logic service içinde olmalıdır.
3. Prisma query'lerinde tenant tablolarında `company_id` filtresi zorunludur.
4. DTO validation zorunludur.
5. Role/permission kontrolü guard veya policy ile yapılmalıdır.
6. Public tracking endpointleri özel guard ve sınırlı veri döndürmelidir.
7. Password hash dışında şifre tutulmamalıdır.
8. Soft delete gereken tablolarda `deleted_at` kullanılmalıdır.
9. Audit log gerektiren write işlemleri loglanmalıdır.
10. Hata mesajları kullanıcıya veri sızdırmamalıdır.

## 11. i18n Kuralları

- Varsayılan dil Türkçe.
- İngilizce destek altyapısı kurulacak.
- UI metinleri `messages/tr.json` ve `messages/en.json` üzerinden gelir.
- Backend enumları İngilizce kalır.
- Frontend enum label'larını i18n'den gösterir.
- Para, tarih ve saat locale'e göre formatlanır.

Örnek:

```json
{
  "navigation": {
    "dashboard": "Özet Durum",
    "today": "Bugünün İşleri",
    "serviceRecords": "Servis Kayıtları"
  }
}
```

## 12. Audit Log Kuralları

Aşağıdaki işlemler audit log üretmelidir:

- müşteri oluşturma/güncelleme/silme
- cihaz oluşturma/güncelleme/silme
- servis kaydı oluşturma/güncelleme/silme
- servis durum değişimi
- personel atama
- ödeme/tahsilat ekleme
- gider ekleme
- dosya/fotoğraf yükleme
- firma ayarı güncelleme
- yetki/rol değişimi

Log minimum alanları:

```text
company_id (tenant loglarında zorunlu; sadece sistem loglarında null olabilir)
actor_user_id
action
entity_type
entity_id
old_values
new_values
ip_address
user_agent
created_at
```

## 13. UI Öncelikleri

Mevcut demo tasarımından hareketle öncelik sırası:

1. Sidebar ve header iskeleti
2. Dashboard kartları ve son kayıtlar
3. Servis kayıtları listesi
4. Servis kayıt detayı ve timeline
5. Yeni servis kaydı formu
6. Müşteri listesi ve detayı
7. Cihaz detayı
8. Bugünün işleri
9. Kasa ekranı
10. Personel ve ayarlar

## 14. Yapılmaması Gerekenler

- Tüm uygulamayı tek `page.tsx` içine yazma.
- Demo verilerini componentlerin içine gömme.
- Yetki kontrolünü sadece buton gizleyerek yapma.
- Tenant filtresi olmadan sorgu yazma.
- Fotoğraf URL'lerini public ve tahmin edilebilir yapma.
- UI'da Türkçe metinleri doğrudan yazma.
- Kullanıcının yetkisi olmayan kasa, maliyet, log verisini döndürme.
- Müşteri takip sayfasında iç notları, parça alış fiyatını veya personel loglarını gösterme.

## 15. Commit / İş Tamamlama Kriteri

Bir görev tamamlandığında:

- TypeScript hatası olmamalı.
- Lint hatası olmamalı.
- Build alınabilmeli.
- İlgili sayfa mobilde bozulmamalı.
- Yeni UI metinleri i18n dosyasına eklenmiş olmalı.
- Gerekirse `.env.example` güncellenmiş olmalı.
- Değişiklik gerektiriyorsa docs güncellenmiş olmalı.
