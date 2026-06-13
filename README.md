# Servis Takip

Self-hosted servis takip uygulaması. Teknisyenlerin müşteri, cihaz, servis kaydı, tahsilat ve planlı iş takibi yapmasını sağlar.

## Teknolojiler

- **Frontend + Backend:** Next.js 16 (App Router, API routes)
- **UI:** Mantine v9.3.1 + Tabler Icons
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (jose) + bcryptjs, httpOnly cookie
- **Form:** Mantine form (uncontrolled) + zod
- **Data Fetching:** TanStack Query
- **i18n:** next-intl (şimdilik sadece tr, İngilizce altyapısı hazır)
- **Deploy:** Docker (multi-stage build)

## Gereksinimler

- Node.js 20+
- PostgreSQL (mevcut bir PostgreSQL sunucusu)

## Kurulum

### 1. Environment değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env
```

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `JWT_SECRET` | JWT imzalama anahtarı (en az 32 karakter) |
| `ADMIN_EMAIL` | İlk kurulumda oluşturulacak admin e-posta |
| `ADMIN_PASSWORD` | Admin şifresi |
| `ADMIN_NAME` | Admin adı |
| `ADMIN_SURNAME` | Admin soyadı |
| `COMPANY_NAME` | Şirket adı |
| `COMPANY_SLUG` | Şirket URL slug |
| `NEXT_PUBLIC_APP_URL` | Uygulama URL'si (ör. `http://localhost:3000`) |

### 2. Bağımlılıkları yükleme

```bash
npm install
```

### 3. Veritabanı şemasını oluşturma

```bash
npx prisma db push
```

### 4. Geliştirme sunucusunu başlatma

```bash
npm run dev
```

İlk çalıştırmada `.env`'deki admin bilgileriyle kullanıcı ve şirket otomatik oluşturulur, ardından login sayfasına yönlendirilirsiniz.

## Docker ile deploy

```bash
docker build -t servis-takip .
docker run -p 3000:3000 --env-file .env servis-takip
```

## Proje Yapısı

```
src/
  app/
    [locale]/login/           # Login sayfası
    [locale]/(app)/           # AppShell'li sayfalar
      dashboard/
        page.tsx
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
    api/                      # API route'ları
      auth/
      customers/
      devices/
      service-records/
      payments/
      scheduled-tasks/
      setup/
  components/
    providers/                # Auth, Query provider
      auth-provider.tsx
      query-provider.tsx
    layout/                   # AppShell, Sidebar, Header, ThemeToggle
    ui/                       # Ortak UI bileşenleri
  features/                   # Feature bazlı component'ler
    customers/
    dashboard/
    devices/
    service-records/
    scheduled-tasks/
    settings/
  lib/                        # Utility, config
    prisma.ts, auth.ts, api.ts, phone.ts, env.ts, i18n.ts, routing.ts, navigation.ts
  types/
    index.ts
  theme.ts
```

## Geliştirme

```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript kontrolü
npm run db:push    # Prisma şema değişikliklerini uygula
npm run db:studio  # Prisma Studio (veritabanı görüntüleyici)
```
