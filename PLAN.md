# Servis Takip — Uygulama Planı

Self-hosted servis takip uygulaması. Docker + PostgreSQL + Next.js full-stack.

---

## Teknik Kararlar

| Karar | Seçim |
|---|---|
| **Stack** | Next.js 16 (App Router) — API routes + Frontend tek uygulama |
| **Database** | PostgreSQL + Prisma ORM |
| **UI** | Mantine v9.3.1 + Tabler Icons |
| **Auth** | JWT (jose) + bcryptjs, httpOnly cookie |
| **Form** | Mantine form + zod |
| **Data Fetching** | TanStack Query |
| **i18n** | next-intl (şimdilik sadece tr, İngilizce altyapısı hazır) |
| **Deploy** | Docker (multi-stage build, mevcut PostgreSQL'e bağlanır) |
| **Kullanıcı** | Çok kullanıcılı (ADMIN / TECHNICIAN rolleri) |
| **İlk Kurulum** | `.env`'den otomatik (manuel register yok) |

---

## Phase 1: Proje İskeleti ✅

- [x] Next.js 16 kurulumu (TypeScript, App Router)
- [x] Mantine v9.3.1 kurulumu (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/form`, `@mantine/dates`)
- [x] Prisma kurulumu + PostgreSQL bağlantısı (`DATABASE_URL`)
- [x] Tüm DB modellerinin `schema.prisma`'ya yazılması
- [x] `next-intl` kurulumu + `/messages/tr.json`
- [x] Proje klasör yapısının oluşturulması
- [x] `Dockerfile` (Next.js standalone output, multi-stage build)
- [x] `.env.example` (DATABASE_URL, admin bilgileri, şirket adı, port, JWT_SECRET)
- [x] ESLint + TypeScript strict config
- [x] AGENTS.md oluşturma

---

## Phase 2: Kimlik Doğrulama & Ana İskelet ✅

- [x] Auth API: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- [x] Login sayfası (Mantine form, zod validation)
- [x] JWT middleware: API route'larda auth kontrolü (cookie bazlı)
- [x] `middleware.ts` ile route koruması (login kontrolü)
- [x] AppShell layout: sidebar + header + main content
- [x] Sidebar navigasyonu (responsive — mobilde burger drawer)
- [x] AuthProvider context (kullanıcı bilgisi, logout)
- [x] Header (kullanıcı adı + avatar + logout menüsü)
- [x] İlk kurulum akışı (`.env`'den otomatik setup, sonra login'e yönlendir)

---

## Phase 3: Müşteri Yönetimi

- [x] Müşteri API: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/[id]`
- [x] Müşteri listesi sayfası (arama, sıralama, sayfalama, sayfalama)
- [x] Müşteri detay sayfası (bilgiler, adres, bağlı cihazlar, servis geçmişi)
- [x] Müşteri ekleme/düzenleme modalı (ad, soyad, telefon, email, adres)
- [x] Servis geçmişi özeti müşteri detayında
- [x] Boş / hata / yükleniyor durumları

---

## Phase 4: Cihaz Yönetimi

- [x] Cihaz API: `GET/POST /api/devices`, `GET/PUT/DELETE /api/devices/[id]`
- [x] Cihaz listesi sayfası (marka/model/seri no/müşteri arama)
- [x] Cihaz detay sayfası (bilgiler, müşteri kartı, servis geçmişi)
- [x] Cihaz ekleme/düzenleme formu (müşteri seçimli)
- [x] Müşteri detayında bağlı cihazlar listesi (Phase 3'te yapıldı)
- [x] Boş / hata / yükleniyor durumları

---

## Phase 5: Servis Kayıtları ✅

- [x] Servis API: CRUD + durum güncelleme + notlar + timeline
- [x] Servis kaydı oluşturma (müşteri seç → cihaz seç → arıza → öncelik)
- [x] Durum makinası ve geçişleri:
      ```
      KAYIT_ACILDI → TAMIRATTA → FIYAT_TEKLIFI_VERILDI → HAZIR → TESLIM_EDILDI
                          ↘            ↘                    ↘
                       IPTAL_EDILDI   MUSTERI_REDDETTI    ODEME_BEKLIYOR
      ```
- [x] Status timeline (kronolojik durum değişimleri)
- [x] Not sistemi (ekleme, listeleme, müşteriye görünür opsiyonu)
- [x] Cihaz detayında geçmiş servis kayıtları
- [x] Müşteri detayında servis kayıtları
- [x] Listeleme + filtreleme (durum, müşteri, arama)
- [x] Tracking numarası ile hızlı arama

---

## Phase 6: Tahsilat & Borç Yönetimi ✅

- [x] Ödeme API: `GET/POST /api/payments`, `DELETE /api/payments/[id]`, `GET /api/customers/[id]/balance`
- [x] `GET /api/dashboard` — günlük tahsilat, bekleyen borç, servis ve cihaz istatistikleri
- [x] Müşteri detayında güncel bakiye (borç - tahsilat farkı)
- [x] Müşteri detayındaki balance card'dan doğrudan borç/tahsilat ekleme
- [x] Borç ekleme (servis kaydına bağlı veya bağımsız — description + opsiyonel serviceRecordId)
- [x] Tahsilat ekleme (tutar, ödeme tipi, tarih, not)
- [x] Müşteri bazında ödeme geçmişi tablosu
- [x] Dashboard'da günlük tahsilat özeti + toplam tahsil edilmemiş borç
- [x] Tahsilatlar sayfası (filtreleme, arama, sayfalama, silme)
- [x] Sidebar'da Tahsilatlar linki

---

## Phase 7: Planlanmış İşler / Takvim

- [ ] Planlı iş API: `GET/POST /api/scheduled-tasks`, `PUT/DELETE /api/scheduled-tasks/[id]`
- [ ] İş tipleri: Cihaz Alınacak, Cihaz Bırakılacak, Bakım, Kurulum, Diğer
- [ ] Takvim/günlük liste görünümü
- [ ] Müşteri seçme zorunlu (adres ve konum bilgisi için)
- [ ] İş durumları: PLANLANDI, DEVAM_EDIYOR, TAMAMLANDI, IPTAL
- [ ] Müşteri detayında planlı işler listesi

---

## Phase 8: Dashboard & Ayarlar

- [ ] Dashboard sayfası:
  - Bekleyen servis sayısı
  - Bugünkü planlı işler
  - Tahsil edilmemiş borç toplamı
  - Hazır olup teslim edilmeyen cihazlar
  - Son 10 servis kaydı
- [ ] Settings sayfası:
  - Şirket adı düzenleme
  - Profil düzenleme (ad, email, şifre)
  - Kullanıcı yönetimi (admin teknisyen ekleyip silebilir)
- [ ] Responsive son kontroller (mobil + tablet + masaüstü)
- [ ] Production build testi
- [ ] README.md (kurulum talimatları)

---

## Veritabanı Şeması

```
Company        (id, name, slug, createdAt)
User           (id, email, passwordHash, name, surname, role, companyId, createdAt)
Customer       (id, companyId, name, surname, phone, email?, address?, createdAt)
Device         (id, customerId, companyId, category, brand, model, serialNo, notes?, createdAt)
ServiceRecord  (id, companyId, customerId, deviceId, trackingNo, status, priority,
                faultDescription, assignedUserId?, pricing?, createdAt)
StatusHistory  (id, serviceRecordId, fromStatus, toStatus, changedById, createdAt)
ServiceNote    (id, serviceRecordId, content, isCustomerVisible, authorId, createdAt)
Payment        (id, companyId, customerId, serviceRecordId?, type, amount, paymentMethod, date, description, createdAt)
ScheduledTask  (id, companyId, customerId, title, description, taskType, date, status, assignedUserId?, createdAt, updatedAt)
```

---

## Klasör Yapısı

```
servis-takip/
  prisma/
    schema.prisma
  messages/
    tr.json
  src/
    app/
      [locale]/
        layout.tsx               # Mantine + intl + QueryProvider
        page.tsx                 # Dashboard (redirect) — her sayfayı (app) altına aldık
        login/page.tsx           # Standalone login (AppShell yok)
        (app)/                   # Route group — AppShell'li sayfalar
          layout.tsx             # AppShell wrapper
          dashboard/page.tsx
          customers/
            page.tsx
            [id]/page.tsx
          devices/
            page.tsx
            [id]/page.tsx
          service-records/
            page.tsx
            new/page.tsx
            [id]/page.tsx
          scheduled-tasks/
            page.tsx
          settings/
            page.tsx
      api/
        auth/
          login/route.ts
          me/route.ts
          logout/route.ts
          users/route.ts
        setup/route.ts           # .env'den otomatik kurulum
        customers/route.ts
        customers/[id]/route.ts
        devices/route.ts
        devices/[id]/route.ts
        devices/options/route.ts
        service-records/route.ts
        service-records/[id]/route.ts
        service-records/[id]/status/route.ts
        service-records/[id]/notes/route.ts
        payments/route.ts
        payments/[id]/route.ts
        scheduled-tasks/route.ts
        scheduled-tasks/[id]/route.ts
    components/
      providers/
        auth-provider.tsx
        query-provider.tsx
      layout/
        app-shell.tsx
        sidebar.tsx
        header.tsx
        color-scheme-script.tsx
        theme-toggle.tsx
    features/                # Boş — feature bazlı component'ler için hazır
      customers/
      dashboard/
      devices/
      scheduled-tasks/
      service-records/
      settings/
    lib/
      prisma.ts
      auth.ts
      api.ts
      phone.ts
      env.ts
      i18n.ts
      routing.ts
      navigation.ts
    types/
      index.ts
    theme.ts
  Dockerfile
  .env.example
  next.config.ts
```
