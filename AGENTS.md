# AGENTS.md — Servis Takip Proje Kuralları

## Proje Hakkında

Self-hosted servis takip uygulaması. Teknisyenlerin müşteri, cihaz, servis kaydı, tahsilat ve planlı iş takibi yapmasını sağlar.

## Teknolojiler

- **Frontend + Backend:** Next.js 15 (App Router, API routes)
- **UI:** Mantine v7 (CSS Modules, responsive)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access token, httpOnly cookie) + bcrypt
- **Form:** react-hook-form + zod
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

## Dizin Yapısı

```
src/
  app/
    [locale]/         # next-intl locale segment
      page.tsx         # Dashboard (Server Component)
      login/page.tsx
      register/page.tsx
      customers/
      devices/
      service-records/
      scheduled-tasks/
      settings/
    api/               # API route'ları
  components/
    ui/                # Küçük, tekrar kullanılabilir UI bileşenleri
    layout/            # AppShell, Sidebar, Header
  features/            # View bileşenleri (sayfa mantığı)
    customers/
    devices/
    service-records/
    scheduled-tasks/
    dashboard/
    settings/
  lib/                 # Utility, config, helpers
    prisma.ts          # Prisma client singleton
    auth.ts            # JWT, bcrypt, cookie helpers
    api.ts             # Client-side fetch wrapper
  types/
    index.ts
```

## Responsive Tasarım

- Mantine responsive props kullanılır (`visibleFrom`, `hiddenFrom`, `maw`, vb.).
- Mobil first yaklaşımı.
- Sidebar mobilde drawer'a dönüşür.
- Tablolar mobilde kart görünümüne dönüşebilir (Mantine `Table` scrollable).
- Touch target minimum 44x44px.

## UI / Tasarım

- AI-slop estetiği yasak (glowing gradient, neon, glassmorphism, blob, sparkle).
- Sade, düzenli, profesyonel görünüm.
- Renk paleti Mantine varsayılanı kullanılır, özel tema gerekiyorsa `mantine-theme.ts`.
- Yükleme durumları için `Skeleton` kullanılır.
- Boş liste durumları için açıklayıcı mesaj + aksiyon butonu.
- Hata durumları için `Alert` bileşeni.
- Toast/notification için `@mantine/notifications`.
- Form hataları inline gösterilir.

## State Management

- Server state: TanStack Query (client-side fetching).
- UI state: React `useState` / `useReducer`.
- Global state: React Context (auth gibi).
- URL state: Next.js searchParams (filtre, sayfa, arama).

## Veritabanı

- PostgreSQL + Prisma.
- Tüm tenant entity'lerinde `companyId` alanı (single-tenant olsa da ileriye dönük).
- `id` alanları `cuid()` ile oluşturulur.
- `createdAt` ve `updatedAt` her modelde olur.
- Soft delete yok, hard delete kullanılır (kullanıcı sayısı az).
- Migrasyonlar `prisma migrate dev` ile oluşturulur.
- `prisma/seed.ts` ile demo data eklenebilir.

## Auth

- JWT access token (15dk) httpOnly cookie'de saklanır.
- Refresh token yok. Süre dolunca tekrar login.
- `middleware.ts` korumasız rotalar: `/login`, `/register`, `/api/auth/*`.
- Admin ve Technician rolleri arasında sadece `role` enum farkı.
- Admin her şeyi yapabilir. Technician müşteri/servis görebilir, düzenleyebilir ama kullanıcı yönetemez.

## Test

- Kritik API route'ları için manuel test yeterli (şimdilik).
- Test framework kurulumu Phase 8'de değerlendirilir.

## Commit

- Türkçe commit mesajları.
- Format: `{phase}: {eylem} — {kısa açıklama}`
- Örnek: `phase-1: kurulum — Next.js + Mantine + Prisma iskeleti`
- `main` branch'ine direkt commit yapılır (tek geliştirici).

## PLAN.md

- `PLAN.md` dosyası mevcut phase durumunu gösterir.
- Tamamlanan maddeler `[x]` ile işaretlenir.
- Yeni feature'lar plana eklenmeden implemente edilmez.
