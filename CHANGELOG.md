# Değişiklik Günlüğü

## 2026-06-16 (Android Entegrasyonu & Çevrimdışı Mod)

### Eklenen
- Capacitor 6 entegrasyonu ile Android platformu (`android/` projesi) eklendi.
- Bağlantı hatalarında devreye giren otomatik yeniden bağlantı spinner'ı ve ekranı (`public/error.html`) eklendi.
- Çevrimdışı durumda yerel dosyadan sunucuya ping atılarak bağlantı düzeldiğinde uygulamaya otomatik yönlendiren auto-reconnect mekanizması eklendi.
- Android için kapsamlı kurulum, derleme ve sorun giderme adımlarını içeren `docs/android-rehberi.md` rehber dosyası oluşturuldu.

### Değişen
- Android uygulamasının varsayılan paket kimliği (App ID) `com.emiran.servistakip` yerine `com.cettek.servistakip` olarak güncellendi ve tüm Java sınıf/paket referansları taşındı.
- `MainActivity.java` üzerinde WebView hata yakalayıcısı ve yerel asset dosyalarına CORS/file access izni veren WebView ayarları yapılandırıldı.

## 2026-06-14 (İyileştirmeler & Hata Düzeltmeleri)

### Eklenen
- Tahsilat ve Borç (Payment) kayıtlarını güncellemek üzere `/api/payments/[id]` endpoint'ine `PUT` metodu desteği eklendi.
- Servis Kaydı Detay sayfasındaki "Ödemeler ve Borçlar" tablosuna düzenleme ve silme butonları ile bunlara ait onay ve düzenleme modalleri eklendi.
- Müşteri Detay sayfasındaki "Tahsilatlar" tablosuna düzenleme ve silme butonları ile onay ve düzenleme modalleri entegre edildi.
- Ana "Tahsilatlar" sayfasına tahsilat/borç düzenleme butonu ve modalı entegre edilerek tüm listeleme yerlerinde tam düzenleme yeteneği sağlandı.
- Ana "Tahsilatlar" sayfasındaki müşteri isimleri tıklanabilir hale getirilerek ilgili müşterinin detay kartına hızlı yönlendirme sağlandı.
- Servis notlarına "Düzenle" ve "Sil" aksiyonları ile Mantine modal arayüzleri entegre edildi.
- Not yönetimi için yeni `/api/service-records/[id]/notes/[noteId]` endpoint'i (PUT/DELETE) eklendi.

### Değişen
- Durum geçiş kısıtlamaları (durum makinesi) esnetildi; mevcut durum haricindeki tüm diğer durumlara geçişe izin verildi.
- `verifySession` içindeki veritabanı sorgusu `findFirst` yerine `findUnique` kullanacak şekilde optimize edildi, şirket izolasyonu doğrulaması sunucu belleğine çekildi.

### Düzeltilen
- `.env` dosyasındaki `JWT_SECRET` değişkeninde yer alan `$` işaretlerinin Next.js env parser tarafından kırpılması/değişken genişletmesi yapması engellendi (kaçış karakteri `\$` kullanıldı).
- `src/lib/rate-limit.ts` içinde biriken eski/süresi dolmuş IP/e-posta limit kayıtlarının temizlenmesi sağlanarak olası bellek sızıntısı (memory leak) giderildi.
- Middleware (`src/middleware.ts`) üzerinde oturum geçersizleştiğinde `/tr/setup` sayfasına gitmeye çalışan kullanıcıların `/tr/login` sayfasına yönlendirilip kilitlenmesi hatası giderildi.

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
