# Değişiklik Günlüğü

## 2026-06-14

### Eklenen
- Mock-data.js tamamen yeniden yazıldı: TUI, pg_dump yedek, progress bar, 60 isim + 50 soyisim + 81 şehir + 50 arıza + 11 kategori ile zengin veri
- Google Maps adres bileşeni (`components/features/customers/google-address-input.tsx`)
- Telefon formatlama helper'ları (`src/lib/phone.ts`: `normalizePhone`, `formatPhone`, `formatPhoneInput`)
- Logo sistemi (`ui/logo-mark.tsx`, `icon.svg`)
- Renk modu flash önleme (`color-scheme-script.tsx`, `globals.css`)
- Docker Compose (`docker-compose.yml`)
- Güvenli ilk kurulum akışı (`/setup` sayfası, `Serializable` transaction)
- Rate limit (`src/lib/rate-limit.ts`, login endpoint)
- Müşteri detayında güncel bakiye kartı
- Dashboard API (`GET /api/dashboard`)
- Personel yönetimi sayfası (sadece ADMIN)
- Tarayıcı sekme başlıkları (route bazında `document.title`)

### Değişen
- Müşteri ekleme/düzenleme modalı kart bazlı tasarıma geçirildi (summary card + iki kolonlu kart grid + tam genişlik adres)
- Setup form metinleri temizlendi (teknik DB/dış bağlantı detayları kaldırıldı)
- Dockerfile basitleştirildi; prisma CLI kaldırıldı, `SKIP_ENV_VALIDATION` build-only
- `.env` sadece runtime değişkenlerini içerir (admin/company env vars kaldırıldı)
- `prisma/seed.js` opsiyonel hale getirildi (eksik env vars'ta sessiz çıkış)

### Düzeltilen
- Mock-data.js: `pick()`'te eksik `rng` parametresi → `rng is not a function` hatası
- Mock-data.js: `pickWeighted()`'te null entry → `Cannot read properties of null`
- Mock-data.js: `generatePhone()` 11 haneli olacak şekilde düzeltildi
- Mock-data.js: servis kaydı ödemeleri `counts.payments` hedefini aşmayacak şekilde sınırlandı
- Mock-data.js: `repairDescription`, `TaskType.ZIYARET/KONTROL/TAHESILAT`, `TaskStatus.IPTAL_EDILDI` schema uyumsuzlukları düzeltildi
- Mock-data.js: kullanılmayan fonksiyonlar temizlendi
- Koyu renk modu flash'ı (FOUC) düzeltildi

### Dokümantasyon
- `AGENTS.md`, `PLAN.md`, `README.md`, `SECURITY_REVIEW.md`, `BUGS.md` denetlendi ve güncellendi
- `SECURITY_REVIEW.md`'deki Türkçe karakter sorunları düzeltildi
