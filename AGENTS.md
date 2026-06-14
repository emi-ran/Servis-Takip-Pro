# AGENTS.md — Servis Takip Proje Kuralları

## Proje Hakkında

Self-hosted servis takip uygulaması. Teknisyenlerin müşteri, cihaz, servis kaydı, tahsilat ve planlı iş takibi yapmasını sağlar.

## Teknolojiler

- **Frontend + Backend:** Next.js 16 (App Router, API routes)
- **UI:** Mantine v9.3.1 + Tabler Icons
  - **Önemli:** Herhangi bir Mantine bileşeni kullanmadan önce https://mantine.dev/llms.txt adresinden ilgili bileşenin dokümantasyonunu kontrol et. Doğru prop'ları, kullanım şeklini ve versiyon farklılıklarını teyit etmeden kod yazma.
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (jose) + bcryptjs, httpOnly cookie
- **Form:** Mantine form (uncontrolled mode) + zod
- **Data Fetching:** TanStack Query
- **i18n:** next-intl (şimdilik sadece `tr`, altyapı `en` için hazır)
- **Deploy:** Docker (multi-stage build, mevcut PostgreSQL'e bağlanır)

## Dil

- Tüm UI metinleri `messages/tr.json` dosyasından çekilir.
- `next-intl` kullanılır. `useTranslations()` hook'u ile erişilir.
- Hardcoded kullanıcıya gösterilen metin **kesinlikle yasak**.

## Kod Stili

- TypeScript strict mode.
- `any` kullanımı yasak. Bilinmeyen tipler için `unknown` kullanılır.
- React Server Components (RSC) mümkün olan her yerde tercih edilir.
- "use client" direktifi sadece interactivity gerektiğinde kullanılır.
- Fonksiyon componentleri, arrow function değil `function` keyword ile yazılır.
- Props tipleri inline değil, ayrı `interface` veya `type` olarak tanımlanır.
- `interface` tercih edilir, `type` sadece union/intersection gerektiğinde kullanılır.
- CSS Modules kullanılır (`.module.css`). Inline style yasak.
- Yorum eklenmez (çok zorunlu değilse).
- Export default kullanılmaz, named export kullanılır.
- Mutasyonlu fonksiyonlarda `void` operatörü kullanılır (`void deleteUser(id)`).

## Mimarî Kurallar

- API route'ları doğrudan Prisma çağırır. Ayrı bir service katmanı yok.
- Her API route dosyası en fazla 200 satır olur. Aşarsa ayrı `lib/` dosyasına taşınır.
- Server Components veriyi doğrudan Prisma ile çeker, Client Componentlere prop geçer.
- Client Componentler TanStack Query ile veri çeker.
- Form validation şeması (`zod`) API route'una yakın tanımlanır (örn. aynı dosyada).
- `.env`'den okunan değerler `src/lib/env.ts`'de tek merkezden validate edilir.
- `prisma/schema.prisma` tüm modelleri içerir, Phase'ler ekledikçe büyür.
- İlk kurulum `/setup` ekranından yapılır; bu ekran ve API sadece veritabanında hiç kullanıcı yoksa çalışır.
- Authenticated sayfalar `(app)` route group'u altında, login sayfası bunun dışında.

## Dizin Yapısı

```
src/
    app/
      layout.tsx               # Root layout (html, body, renk modu script)
      page.tsx                 # Root redirect → [locale]
      globals.css              # Global stiller
      icon.svg                 # Favicon / app ikonu
      [locale]/                # next-intl locale segment
        layout.tsx             # Mantine + intl + QueryProvider
        page.tsx               # Locale root redirect → dashboard
        setup/page.tsx         # İlk kurulum ekranı
        login/page.tsx         # Standalone login (AppShell yok)
        (app)/                 # Route group — AppShell'li sayfalar
          layout.tsx           # AppShell wrapper
          dashboard/page.tsx
          customers/
            page.tsx
            [id]/page.tsx
          devices/
            page.tsx
            [id]/page.tsx
          service-records/
            page.tsx
            [id]/page.tsx
          payments/
            page.tsx
          scheduled-tasks/
            page.tsx
          staff/
            page.tsx
      api/                     # API route'ları
        auth/
          login/route.ts
          me/route.ts
          logout/route.ts
          users/route.ts
          users/[id]/route.ts
        setup/route.ts
        customers/
          route.ts
          [id]/route.ts
          [id]/balance/route.ts
        dashboard/route.ts
        devices/
          route.ts
          [id]/route.ts
          options/route.ts
        service-records/
          route.ts
          [id]/route.ts
          [id]/status/route.ts
          [id]/notes/route.ts
          [id]/notes/[noteId]/route.ts
        payments/
          route.ts
          [id]/route.ts
        scheduled-tasks/
          route.ts
          [id]/route.ts
  components/
    providers/                 # Auth, Query provider
      auth-provider.tsx
      query-provider.tsx
    layout/                    # AppShell, Sidebar, Header, ThemeToggle
    ui/                        # Ortak UI (logo-mark.tsx)
    features/                  # Presentational UI bileşenleri
      customers/
        google-address-input.tsx
        google-address-input.module.css
  features/                    # Feature component'ler (boş — hazırlık)
    customers/
    dashboard/
    devices/
    service-records/
    scheduled-tasks/
  lib/                         # Utility, config, helpers
    prisma.ts                  # Prisma client singleton
    auth.ts                    # JWT, bcrypt, cookie helpers
    api.ts                     # Client-side fetch wrapper
    phone.ts                   # Telefon normalize/validate
    env.ts                     # .env validation
    i18n.ts                    # next-intl config
    routing.ts                 # Locale routing config
    navigation.ts              # next-intl navigation helpers
    rate-limit.ts              # Login hız sınırlama
  middleware.ts                # Route koruma middleware
  types/
    index.ts
  theme.ts                     # Mantine theme
```

## Responsive Tasarım

- Mantine responsive props kullanılır (`visibleFrom`, `hiddenFrom`, `maw`, vb.).
- Mobil first yaklaşımı.
- Sidebar mobilde drawer'a dönüşür (Burger menü ile).
- Tablolar mobilde scrollable yapılır.
- Touch target minimum 44x44px.

## UI / Tasarım

- AI-slop estetiği yasak (glowing gradient, neon, glassmorphism, blob, sparkle).
- Sade, düzenli, profesyonel görünüm.
- Renk paleti Mantine varsayılanı kullanılır.
- Yükleme durumları için `Skeleton` kullanılır.
- Boş liste durumları için açıklayıcı mesaj + aksiyon butonu.
- Hata durumları için `Alert` bileşeni.
- Toast/notification için `@mantine/notifications`.
- Form hataları inline gösterilir.

## State Management

- Server state: TanStack Query (client-side fetching).
- UI state: React `useState` / `useReducer`.
- Global state: AuthProvider (kullanıcı bilgisi).
- URL state: Next.js searchParams (filtre, sayfa, arama).

## CSS / Renk Modu

- `ColorSchemeScript` renk modu flash'ını önlemek için `<head>` içine inline `<script>` olarak yerleştirilir (`src/components/layout/color-scheme-script.tsx`).
- Renk modu toggle'ı hydration mismatch'ını önlemek için `ThemeToggle` component'inde `useState+mounted` pattern'i kullanılır (SSR'da boş placeholder render eder).
- `MantineProvider`'a `defaultColorScheme="auto"` eklenir.

### Tarih Seçici (DatePickerInput)

- `@mantine/dates` bileşenleri root layout'ta `DatesProvider` ile sarılır: `locale="tr"`, `firstDayOfWeek={1}`.
- `@mantine/dates/styles.css` global olarak import edilir.
- `dayjs/locale/tr` import edilir.

## Veritabanı

- PostgreSQL + Prisma 6.
- Tüm tenant entity'lerinde `companyId` alanı.
- `id` alanları `cuid()` ile oluşturulur.
- `createdAt` ve `updatedAt` her modelde olur.
- Soft delete yok, hard delete kullanılır.
- Şema değişiklikleri `prisma db push` ile uygulanır (geliştirme aşaması).
- Şema değişiklikleri için `prisma db push` yeterli (geliştirme aşaması).

## Auth

- JWT access token (1 gün) httpOnly cookie'de saklanır.
- Refresh token yok. Süre dolunca tekrar login.
- İlk kurulum: `/setup` ekranı ilk şirketi ve admin kullanıcısını oluşturur; setup API sadece `User` tablosu boşsa çalışır.
- Admin ve Technician rolleri arasında sadece `role` enum farkı.
- Admin her şeyi yapabilir. Technician müşteri/servis görebilir, düzenleyebilir ama kullanıcı yönetemez.

## Test

- Kritik API route'ları için manuel test yeterli (şimdilik).
- Test framework kurulumu Phase 8'de değerlendirilir.

## Commit

- Türkçe commit mesajları.
- Format: `{phase}: {eylem} — {kısa açıklama}`
- Örnek: `phase-1: kurulum — Next.js + Mantine + Prisma iskeleti`
- `master` branch'ine direkt commit yapılır (tek geliştirici).

## PLAN.md

- `PLAN.md` dosyası mevcut phase durumunu gösterir.
- Tamamlanan maddeler `[x]` ile işaretlenir.
- Yeni feature'lar plana eklenmeden implemente edilmez.

## SECURITY_REVIEW.md

- `SECURITY_REVIEW.md` dosyası güvenlik denetim bulgularını ve çözümlerini kaydeder.
- Yeni güvenlik açıkları veya düzeltmeler bu dosyaya eklenir.
