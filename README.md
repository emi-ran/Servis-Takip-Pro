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

# 4. İlk şirket ve admin kullanıcısını oluşturun
npm run db:seed

# 5. Geliştirme sunucusunu başlatın
npm run dev
```

Seed komutu `.env`'deki admin bilgileriyle ilk kullanıcı ve şirket hesabını oluşturur. Tarayıcınızda `http://localhost:3000` adresine gidip giriş yapmanız yeterli.

### 📝 Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|---|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı adresi | ✅ |
| `JWT_SECRET` | JWT imzalama anahtarı (en az 32 karakter) | ✅ |
| `ADMIN_EMAIL` | Admin e-posta adresi | ✅ |
| `ADMIN_PASSWORD` | Admin şifresi (en az 12 karakter) | ✅ |
| `ADMIN_NAME` | Admin adı | ✅ |
| `ADMIN_SURNAME` | Admin soyadı | ✅ |
| `COMPANY_NAME` | Şirket adı | ✅ |
| `COMPANY_SLUG` | Şirket URL kısayolu | ✅ |
| `NEXT_PUBLIC_APP_URL` | Uygulama adresi | ✅ |

---

## 🐳 Docker ile Dağıtım

```bash
# Build
docker build -t servis-takip .

# Çalıştır
docker run -p 3000:3000 --env-file .env servis-takip
```

> 💡 Mevcut PostgreSQL sunucunuza bağlanmak için `DATABASE_URL` değerini Docker ağına göre düzenleyin (örneğin `host.docker.internal` kullanarak).

---

## 📁 Proje Yapısı

```
📦 servis-takip/
├── prisma/
│   ├── schema.prisma          Veritabanı modelleri
├── messages/
│   └── tr.json                Türkçe UI metinleri
├── src/
│   ├── app/
│   │   ├── [locale]/login/    Giriş sayfası
│   │   ├── [locale]/(app)/    Ana uygulama
│   │   │   ├── dashboard/     Genel görünüm
│   │   │   ├── customers/     Müşteriler
│   │   │   ├── devices/       Cihazlar
│   │   │   ├── service-records/  Servis kayıtları
│   │   │   ├── payments/      Tahsilatlar
│   │   │   ├── scheduled-tasks/  Planlı işler
│   │   │   └── staff/          Personel
│   │   └── api/               API route'ları
│   ├── components/
│   │   ├── providers/         Auth, Query sağlayıcıları
│   │   ├── layout/            AppShell, Sidebar, Header
│   │   └── ui/                Ortak bileşenler
│   ├── features/              Özellik bazlı bileşenler
│   ├── lib/                   Yardımcı kütüphaneler
│   ├── types/                 Tip tanımları
│   └── theme.ts               Mantine tema
├── Dockerfile
└── .env.example
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
| `npm run db:seed` | Seed scriptini çalıştır |
| `npm run db:mock` | Çok tehlikeli test verisi scripti (önce yedek alır) |

> ⚠️ `npm run db:mock` sadece geliştirme/test veritabanında çalıştırılmalıdır. Çalıştırmadan önce birkaç kez onay ister ve otomatik yedek alır.

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
