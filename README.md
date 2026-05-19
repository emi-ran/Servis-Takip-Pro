# Servis Takip

Servis Takip, teknik servis işletmeleri için geliştirilen web tabanlı, çok firmalı bir SaaS uygulamasıdır.

MVP hedefi; müşteri, cihaz, servis kaydı, randevu, personel, fotoğraf, QR/takip linki, basit kasa ve audit log süreçlerini güvenli bir şekilde yönetmektir.

## Dokümanlar

Projeye başlamadan önce şu dosyalar okunmalıdır:

- `PLAN.md` — ürün kapsamı, MVP kararları, route ve teknoloji tercihleri
- `DATABASE_DESIGN.md` — tablo, enum, tenant güvenliği ve veri modelleme kuralları
- `AGENTS.md` — kod ajanları için çalışma kuralları ve kalite kriterleri

`UI_SCREENS.md` kaynak kabul edilmez. UI için `DEMO-APP/` sadece görsel referanstır.

## Planlanan Yapı

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

## Teknoloji Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, next-intl
- Backend: NestJS, TypeScript, PostgreSQL, Prisma, JWT auth
- Tooling: pnpm, ESLint, Prettier, Docker Compose

## Geliştirme İlkeleri

- Tenant verisi her zaman `company_id` ile filtrelenir.
- UI metinleri `messages/tr.json` ve `messages/en.json` üzerinden gelir.
- Kritik write işlemleri audit log üretir.
- Demo kodu üretim kodu sayılmaz; gerektiğinde modüler şekilde `apps/web` altına taşınır.
- Build, lint ve typecheck hatası bırakılmamalıdır.
