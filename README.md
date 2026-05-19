# Servis Takip

Servis Takip, teknik servis işletmeleri için geliştirilen web tabanlı, çok firmalı bir SaaS uygulamasıdır.

MVP hedefi; müşteri, cihaz, servis kaydı, randevu, personel, fotoğraf, QR/takip linki, basit kasa ve audit log süreçlerini güvenli bir şekilde yönetmektir.

## Dokümanlar

Projeye başlamadan önce şu dosyalar okunmalıdır:

- `PLAN.md` — ürün kapsamı, MVP kararları, route ve teknoloji tercihleri
- `DATABASE_DESIGN.md` — tablo, enum, tenant güvenliği ve veri modelleme kuralları
- `AGENTS.md` — kod ajanları için çalışma kuralları ve kalite kriterleri

`UI_SCREENS.md` kaynak kabul edilmez. UI için `DEMO-APP/` sadece görsel referanstır.

## Mevcut Depo Yapısı

```text
servis-takip/
  DEMO-APP/
  apps/
    web/
  CHANGELOG.md
  .env.example
  PLAN.md
  DATABASE_DESIGN.md
  AGENTS.md
  package.json
  pnpm-workspace.yaml
  README.md
```

`DEMO-APP/` yalnızca görsel referans ve başlangıç prototipidir; üretim uygulama yapısı değildir.

## Planlanan / Hedef Yapı

PLAN.md içinde tanımlanan uzun vadeli monorepo hedefi aşağıdaki yapıdadır:

```text
servis-takip/
  DEMO-APP/
  apps/
    api/
  packages/
    shared/
    config/
  docker-compose.yml
  README.md
```

## Teknoloji Stack

- Frontend (mevcut): Next.js App Router, React, TypeScript, Tailwind CSS
- i18n (mevcut): JSON dictionary tabanlı
- Frontend (planlanan/target): shadcn/ui
- Backend: NestJS, TypeScript, PostgreSQL, Prisma, JWT auth
- Tooling: pnpm, ESLint, Prettier, Docker Compose

## Geliştirme

```bash
pnpm install
pnpm dev:web
```

Diğer komutlar:

```bash
pnpm build:web
pnpm lint:web
pnpm typecheck:web
```

Notlar:

- Bu komutlar root `package.json` içinde tanımlıdır ve mevcut `apps/web` workspace'ini hedefler.
- `pnpm dev:web` → frontend geliştirme sunucusu
- `pnpm build:web` → frontend üretim derlemesi
- `pnpm lint:web` → frontend lint kontrolü
- `pnpm typecheck:web` → frontend TypeScript kontrolü

## Ortam Değişkenleri

Hedef ortam değişkenleri:

- `NEXT_PUBLIC_API_URL` — gelecekteki backend adresi
- `NEXT_PUBLIC_APP_URL` — public frontend origin / Docker proxy hedefi

VDS veya Docker tabanlı dağıtım, ters proxy arkasında çalışacak şekilde planlanmıştır; Dockerfile varsayımı yapılmaz.

## Geliştirme İlkeleri

- Tenant verisi her zaman `company_id` ile filtrelenir.
- UI metinleri `messages/tr.json` ve `messages/en.json` üzerinden gelir.
- Servis kayıtları araması; takip no, müşteri ve cihaz metinlerinde her zaman çalışır; sorgu yalnızca rakam ve telefon biçim karakterleri içeriyorsa normalize edilmiş telefon numarasında da kısmi eşleşme yapar.
- Servis kayıt listesi satırları ve “Detay” aksiyonu `/[locale]/service-records/[id]` detay rotasına gider.
- Servis kayıt detay ekranı; özet kartları, timeline iskeleti, not/iş kalemi placeholder alanı ve bulunamayan kayıt durumu içerir.
- Kritik write işlemleri audit log üretir.
- Demo kodu üretim kodu sayılmaz; gerektiğinde modüler şekilde `apps/web` altına taşınır.
- Build, lint ve typecheck hatası bırakılmamalıdır.
