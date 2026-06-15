# 💻 Geliştirici Kılavuzu & Katkıda Bulunma

Servis Takip projesine katkıda bulunmak veya yerel ortamınızda geliştirmek için bu kılavuzu kullanabilirsiniz.

---

## 🛠️ Yerel Geliştirme Ortamı

Yerel geliştirme ortamını kurmak için aşağıdaki adımları izleyin.

### Ön Gereksinimler

*   **Node.js:** v20 veya üzeri
*   **PostgreSQL:** Çalışan bir PostgreSQL veritabanı sunucusu

### Kurulum Adımları

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Ortam Değişkenlerini Yapılandırın:**
    `.env.example` dosyasını `.env` adıyla kopyalayın ve veritabanı bağlantı bilgileriniz ile JWT anahtarınızı güncelleyin:
    ```bash
    cp .env.example .env
    ```

3.  **Veritabanı Şemasını Uygulayın:**
    Prisma şemasını veritabanına uygulayarak tabloları oluşturun:
    ```bash
    npx prisma db push
    ```

4.  **Uygulamayı Geliştirme Modunda Başlatın:**
    ```bash
    npm run dev
    ```
    Uygulama `http://localhost:3000` adresinde çalışacaktır. İlk girişte veritabanı boş olacağından `/setup` sayfasına yönlendirileceksiniz. Buradan ilk şirket ve yönetici hesabını oluşturabilirsiniz.

---

## ⚙️ Geliştirme Komutları

Geliştirme sürecinde kullanabileceğiniz NPM scriptleri şunlardır:

| Komut | Açıklama |
| :--- | :--- |
| `npm run dev` | Geliştirme sunucusunu başlatır. |
| `npm run build` | Canlı ortam (production) için derleme yapar. |
| `npm run start` | Derlenmiş production sunucusunu başlatır. |
| `npm run lint` | ESLint ile kod standartlarını kontrol eder. |
| `npm run typecheck` | TypeScript derleme ve tip kontrollerini çalıştırır. |
| `npm run db:push` | `schema.prisma` dosyasındaki değişiklikleri doğrudan veritabanına yansıtır. |
| `npm run db:studio` | Prisma Studio'yu açarak veritabanı verilerini arayüz üzerinden görmenizi sağlar. |
| `npm run db:seed` | Seed scriptini çalıştırarak temel/sabit verileri yükler. |
| `npm run db:mock` | **Tehlikeli:** Test ve geliştirme için sahte veriler üretir (çalıştırmadan önce onay ve yedek sorar). |

---

## 🏗️ Proje Yapısı

Proje genel olarak Next.js App Router standartlarına ve bileşen bazlı mimariye uygun tasarlanmıştır:

*   [`prisma/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/prisma): Veritabanı modelleri (`schema.prisma`) ve mock/seed scriptleri.
*   [`messages/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/messages): Dil çeviri dosyaları (next-intl için `tr.json`).
*   [`src/app/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/src/app): Next.js sayfaları ve API route'ları (`api/`).
*   [`src/components/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/src/components): Ortak UI bileşenleri, layout elemanları ve provider'lar.
*   [`src/lib/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/src/lib): Yardımcı kütüphaneler, auth helpers, rate limit ve prisma client singleton'ı.
*   [`src/types/`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/src/types): Global TypeScript tipleri.

---

## 🎨 Kodlama Standartları & Mimari Kurallar

Katkı sağlarken lütfen aşağıdaki teknik kararlara ve kurallara uyun:

*   **TypeScript:** Strict mode etkindir. `any` tipi kullanmak kesinlikle yasaktır, bilinmeyen yapılar için `unknown` tercih edilmelidir.
*   **React Server Components (RSC):** Mümkün olan her yerde sunucu tarafı render tercih edilmelidir. `"use client"` direktifi yalnızca etkileşim (state, event handler) gerektiren bileşenlerde kullanılmalıdır.
*   **Mantine UI:** Arayüz bileşenlerinde Mantine v9 kullanılmaktadır. Yeni bir bileşen eklemeden önce mutlaka [Mantine Dokümantasyonu](https://mantine.dev/) incelenmelidir.
*   **Yorum Satırları:** Çok zorunlu olmadıkça kod içine Türkçe veya İngilizce yorum satırı eklenmemelidir; temiz ve kendini açıklayan kod yazılması esastır.
*   **Bileşen İsimlendirmeleri:** React bileşenleri arrow function yerine `function` anahtar kelimesi kullanılarak yazılmalı ve named export ile dışa aktarılmalıdır.
*   **i18n (Uluslararasılaştırma):** Arayüzdeki hiçbir metin hardcoded olmamalıdır. Tüm metinler `messages/tr.json` dosyasına eklenmeli ve `useTranslations` hook'u ile kullanılmalıdır.

---

## 🚀 Commit Kuralları

Projeye yapılan commit'lerin düzenli olması için aşağıdaki format kullanılmaktadır:

Format: `{phase}: {eylem} — {kısa açıklama}`

*   *Örnek:* `phase-8: dökümantasyon — geliştirici kılavuzu oluşturuldu`

Detaylı proje kuralları ve anayasası için [`AGENTS.md`](file:///c:/Users/[SANSURLENDI]/Desktop/Servis%20Takip/AGENTS.md) dosyasını inceleyebilirsiniz.
