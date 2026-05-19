# Değişiklik Günlüğü

## Unreleased

- `/[locale]/service-records` placeholder ekranı kaldırıldı; demo görsel diline uyumlu gerçek servis kayıt listesi, arama, durum/öncelik filtreleri ve boş durum davranışı eklendi.
- `apps/web/lib/api/service-records.ts` altında mock veri katmanı oluşturuldu ve “Yeni Kayıt” aksiyonları `/[locale]/service-records/new` planlı rotasına bağlandı.

## 2026-05-19

### 0.1.0 — İlk frontend fazı
- `apps/web` altında pnpm workspace uyumlu Next.js frontend kuruldu.
- Locale prefix route yapısı eklendi: `/tr/*`, `/en/*`.
- Public takip rotası hazırlandı: `/track/[code]`.
- Demo ile uyumlu app shell, dashboard, placeholder sayfalar ve i18n mesajları eklendi.
- Ortam değişkeni örnekleri (`.env.example`) güncellendi.

### 0.0.0 — İlk repo iskeleti
- Proje planı, veritabanı tasarım notları ve çalışma kuralları eklendi.
- Demo uygulama referansı ve temel klasör yapısı oluşturuldu.
