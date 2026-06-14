<div align="center">

# 🛠️ Servis Takip

**Self-hosted servis ve teknik ekip yönetim platformu. Müşteri, cihaz, servis kaydı, tahsilat ve planlı işler — tek çatı altında.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Mantine](https://img.shields.io/badge/Mantine-v9-339af0?style=flat-square&logo=mantine)](https://mantine.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)]()

[Özellikler](#-özellikler) · [Hızlı Başlangıç](#-hızlı-başlangıç) · [Docker](#-docker-ile-dağıtım) · [Yapı](#-proje-yapısı) · [Geliştirme](#-geliştirme-komutları)

</div>

---

## 👀 Neden Servis Takip?

Teknisyen ekibiniz için **müşteri yönetimi, cihaz envanteri, servis akışı, tahsilat ve planlama** gibi günlük operasyonları tek bir panoda toplar. Kendi sunucunuzda çalışır, verileriniz size aittir.

---

## ✨ Özellikler

### 👥 Müşteri Yönetimi
Müşteri kaydı, iletişim bilgileri, bağlı cihazlar ve geçmiş servisler — hepsi tek ekranda. Arama, sıralama ve sayfalama ile hızlı erişim.

### 📟 Cihaz Takibi
Marka, model, seri numarası ve kategori bazında cihaz envanteri. Her cihazın müşterisine ve servis geçmişine anında ulaşın.

### 🔧 Servis Kayıtları
Tam durum makinası ile servis akışı:
```
📥 Kayıt Açıldı → 🔧 Tamiratta → 💰 Fiyat Teklifi Verildi → ✅ Hazır → 📦 Teslim Edildi
                    ↘ 🚫 İptal          ↘ 👎 Müşteri Reddetti    ↘ ⏳ Ödeme Bekliyor
```
Tracking numarası, öncelik yönetimi, zaman çizelgesi, müşteriye görünür notlar.

### 💳 Tahsilat & Borç Yönetimi
Servise bağlı veya bağımsız borç/tahsilat girişi. Müşteri bazında güncel bakiye, ödeme geçmişi ve dashboard özeti.

### 📅 Planlı İşler
Cihaz alım/bırakma, bakım, kurulum gibi iş tipleri. Takvim ve günlük liste görünümü.

### 👮 Rol Tabanlı Erişim
**Admin** — tam yetki. **Teknisyen** — müşteri, cihaz, servis işlemleri. Kullanıcı yönetimi sadece admin'e özel.

---

## 🧱 Teknoloji Yığını

| Katman | Seçim |
|---|---|
| ⚛️ **Framework** | Next.js 16 (App Router, API routes) |
| 🎨 **UI** | Mantine v9.3.1 + Tabler Icons |
| 🗄️ **Veritabanı** | PostgreSQL + Prisma ORM |
| 🔐 **Auth** | JWT (jose) + bcryptjs, httpOnly cookie |
| 📋 **Form** | Mantine Form + Zod |
| 📡 **Data Fetching** | TanStack Query |
| 🌍 **i18n** | next-intl (Türkçe hazır, İngilizce alt yapısı mevcut) |
| 🐳 **Deploy** | Docker (multi-stage build) |

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

| Gereksinim | Versiyon |
|---|---|
| Node.js | v20+ |
| PostgreSQL | Çalışan bir sunucu (yerel veya uzak) |

### Adım Adım Kurulum

```bash
# 1. Ortam değişkenlerini ayarlayın
cp .env.example .env

# 2. Bağımlılıkları yükleyin
npm install

# 3. Veritabanı şemasını oluşturun
npx prisma db push

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

Veritabanı şeması hazırlandıktan sonra tarayıcınızda `http://localhost:3000` adresine gidin. Veritabanında kullanıcı yoksa ilk kurulum ekranı açılır ve şirket/yönetici bilgileri buradan oluşturulur.

### 📝 Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|---|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı adresi | ✅ |
| `JWT_SECRET` | JWT imzalama anahtarı (en az 32 karakter) | ✅ |
| `PORT` | Uygulama portu | Hayır |
| `NEXT_PUBLIC_APP_URL` | Uygulama adresi | Hayır |

---

## 🐳 Docker ile Dağıtım

```bash
# Build
docker build -t servis-takip .

# Çalıştır
docker run -p 3000:3000 --env-file .env servis-takip
```

Compose kullanımı:

```bash
docker compose up --build
```

> 💡 Mevcut PostgreSQL sunucunuza bağlanmak için `DATABASE_URL` değerini Docker ağına göre düzenleyin (örneğin `host.docker.internal` kullanarak).
> 💡 Docker başlangıcında veritabanında hiç tablo bulunamazsa, `npx prisma db push` otomatik olarak çalıştırılarak veritabanı şeması kurulur.

---

## 📁 Proje Yapısı

```
📦 servis-takip/
├── prisma/
│   ├── schema.prisma              Veritabanı modelleri
│   └── seed.js                    Opsiyonel seed scripti
├── messages/
│   └── tr.json                    Türkçe UI metinleri
├── src/
│   ├── app/
│   │   ├── layout.tsx             Root layout (html, body, renk modu)
│   │   ├── page.tsx               Root redirect → [locale]
│   │   ├── globals.css            Global stiller
│   │   ├── icon.svg               Favicon / app ikonu
│   │   ├── [locale]/              next-intl locale segment
│   │   │   ├── setup/             İlk kurulum ekranı
│   │   │   │   ├── page.tsx
│   │   │   │   ├── page.module.css
│   │   │   │   └── setup-form.tsx
│   │   │   ├── login/             Giriş sayfası
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   └── (app)/             Ana uygulama (AppShell)
│   │   │       ├── dashboard/     Genel görünüm
│   │   │       ├── customers/     Müşteriler
│   │   │       ├── devices/       Cihazlar
│   │   │       ├── service-records/  Servis kayıtları
│   │   │       ├── payments/      Tahsilatlar
│   │   │       ├── scheduled-tasks/  Planlı işler
│   │   │       └── staff/         Personel
│   │   └── api/                   API route'ları
│   │       ├── setup/             İlk kurulum
│   │       ├── auth/              Kimlik doğrulama
│   │       ├── customers/         Müşteri CRUD + bakiye
│   │       ├── devices/           Cihaz CRUD + seçenekler
│   │       ├── service-records/   Servis kaydı + durum + notlar
│   │       ├── payments/          Ödeme CRUD
│   │       ├── dashboard/         Dashboard istatistikleri
│   │       └── scheduled-tasks/   Planlı iş CRUD
│   ├── components/
│   │   ├── providers/             Auth, Query sağlayıcıları
│   │   ├── layout/                AppShell, Sidebar, Header, ThemeToggle
│   │   ├── ui/                    Ortak bileşenler
│   │   │   ├── logo-mark.tsx      SVG logo bileşeni
│   │   │   └── pagination.tsx     Paylaşılan sayfalama bileşeni
│   │   └── features/              UI bileşenleri (presentational)
│   │       └── customers/         Google Adres giriş bileşeni
│   ├── features/                  Özellik bazlı bileşen katalogları (boş — hazırlık)
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── devices/
│   │   ├── scheduled-tasks/
│   │   └── service-records/
│   ├── lib/                       Yardımcı kütüphaneler
│   │   ├── prisma.ts, auth.ts, api.ts, phone.ts
│   │   ├── env.ts, i18n.ts, routing.ts, navigation.ts
│   │   ├── rate-limit.ts          Login hız sınırlama
│   ├── types/                     Tip tanımları
│   ├── middleware.ts               Route koruma middleware
│   └── theme.ts                   Mantine tema
├── scripts/
│   ├── mock-data.js               Test verisi oluşturma scripti
│   └── docker-entrypoint.js       Docker başlangıç scripti
├── public/
│   └── maps.html                  Google Maps iframe sayfası
├── backups/                       Otomatik yedekler (pg_dump)
├── SECURITY_REVIEW.md             Güvenlik denetim kaydı
├── AGENTS.md                      Proje kuralları
├── PLAN.md                        Uygulama planı ve phase takibi
├── BUGS.md                        Bilinen sorunlar
├── Dockerfile
├── .env.example
└── next.config.ts                 Next.js yapılandırması
```

---

## 🛠️ Geliştirme Komutları

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |
| `npm run lint` | ESLint kod denetimi |
| `npm run typecheck` | TypeScript tip kontrolü |
| `npm run db:push` | Prisma şemasını DB'ye uygula |
| `npm run db:studio` | Prisma Studio (veritabanı görüntüleyici) |
| `npm run db:seed` | Opsiyonel seed scriptini çalıştır |
| `npm run db:mock` | Çok tehlikeli test verisi scripti (önce yedek sorar) |

> ⚠️ `npm run db:mock` sadece geliştirme/test veritabanında çalıştırılmalıdır. Çalıştırmadan önce birkaç kez onay ister ve isteğe bağlı yedek alır (`pg_dump` gerektirir).

---

## 📋 Feature Durumu

| Özellik | Durum |
|---|---|
| 🏗️ Proje iskeleti & kurulum | ✅ Tamam |
| 🔐 Kimlik doğrulama & yetkilendirme | ✅ Tamam |
| 👥 Müşteri yönetimi | ✅ Tamam |
| 📟 Cihaz yönetimi | ✅ Tamam |
| 🔧 Servis kayıtları (durum makinası, notlar, timeline) | ✅ Tamam |
| 💳 Tahsilat & borç yönetimi | ✅ Tamam |
| 📅 Planlı işler / takvim | ✅ Tamam |
| 📊 Dashboard (kartlar + son kayıtlar) | ✅ Tamam |
| 👥 Personel yönetimi | ✅ Tamam |

---

<div align="center">

**Servis Takip** — Verileriniz size ait. 🛡️

</div>
