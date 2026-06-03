# Değişiklik Günlüğü

## Unreleased

- `/[locale]/reports` placeholder kaldırıldı ve Reports overview ekranı aktif hale getirildi; tarih aralığı mock filtreleri (bugün / bu hafta / bu ay / son 30 gün), operasyon özet kartları, finans özet kartları, servis durum dağılımı ve kategori/cihaz/servis tipi kırılımı eklendi.
- Reports ekranında finans metrikleri ile personel iş yükü/performance alanları permission-sensitive mock olarak işaretlendi; gerçek görünürlük, tenant scope ve RBAC enforcement olmadığı özellikle belirtildi.
- Export readiness paneli ve mock “Raporu / export'u hazırla” aksiyonu eklendi; gerçek PDF/Excel üretimi yapılmıyor, yalnızca non-persistent başarı/readiness mesajı gösteriliyor.
- `apps/web/lib/api/reports.ts` mock veri katmanı eklendi; tarih aralığına göre değişen rapor dataset'leri ve mock export hazırlık helper'ı UI dışına taşındı.
- `apps/web/lib/api/shell.ts`, `apps/web/components/layout/app-sidebar.tsx`, `apps/web/messages/tr.json` ve `apps/web/messages/en.json` reports rotası/navigasyon etiketi ve caveat metinleriyle güncellendi.
- Backend backlog notu reports modülü için genişletildi: gerçek aggregation, tenant filtering, server-side RBAC ve export/audit logging olmadan bu ekranın güvenli raporlama yüzeyi sayılmaması gerekir.

- `/[locale]/parts` placeholder kaldırıldı ve Stok & Parça overview ekranı aktif hale getirildi; toplam parça, düşük stok, ayrılmış adet ve mock/hassas satış değeri özet kartları eklendi.
- Parça ekranına SKU/parça adı/marka/cihaz tipi araması, stok durumu + kategori filtreleri, mobil uyumlu parça kartları ve maliyet görünürlüğü için permission-sensitive mock uyarısı eklendi.
- Düşük stok uyarı paneli ve son stok hareketleri listesi eklendi; servis kaydı referansı olan hareketler `/[locale]/service-records/[id]` rotasına deep link veriyor.
- Mock “Servis için ayır” modal akışı eklendi; seçili parça + servis kaydı ile non-persistent rezervasyon/hareket üretiliyor, görünürdeki reserved quantity güncelleniyor ve başarı mesajı backend audit log/RBAC/tenant enforcement gereksinimini açıkça belirtiyor.
- `apps/web/lib/api/parts.ts` mock veri katmanı eklendi; parça listesi, hareketler, düşük stok uyarıları, servis kaydı seçenekleri ve mock rezervasyon helper'ı UI dışına taşındı.
- `apps/web/messages/tr.json` ve `apps/web/messages/en.json` parts ekranı metinleri, filtreler, uyarılar ve mock güvenlik notlarıyla güncellendi.

- `/[locale]/settings` placeholder kaldırıldı ve Genel Ayarlar ekranı aktif hale getirildi; firma profili kartı, şube/operasyon özeti, bildirim readiness alanı ve güvenlik checklist'i aynı görünümde toplandı.
- Ayarlar ekranında firma adı, vergi numarası, telefon, e-posta, varsayılan dil/para birimi/saat dilimi için mock düzenleme + mock kaydet akışı eklendi; başarı mesajı açıkça kalıcı olmadığını belirtir ve veri yalnızca istemci görünümünde güncellenir.
- `apps/web/lib/api/settings.ts` mock veri katmanı eklendi; ayar overview verisi ve non-persistent mock save helper'ı UI dışına taşındı.
- Güvenlik/readiness checklist'i salt okunur bırakıldı; gerçek auth, RBAC, tenant guard, audit log ve signed file URL enforcement için backend implementasyonu gerektiği UI ve dokümantasyonda açıkça belirtildi.
- `apps/web/messages/tr.json` ve `apps/web/messages/en.json` settings ekranı metinleri, validasyon uyarıları ve mock/backend caveat notlarıyla güncellendi.

- `/[locale]/staff` ekranına mock personel oluşturma modalı eklendi; ad soyad + rol zorunlu alan doğrulaması, varsayılan aktif durum, üretilmiş demo personel kimliği ve kalıcı olmadığını açıkça belirten başarı mesajı sağlandı.
- Personel kartlarından açılan detay modalı eklendi; profil özeti, telefon/e-posta, açık atama + bugün atanan sayaçları ve son servis atamalarının detay link'leri gösteriliyor.
- Personel detayında mock düzenleme modu eklendi; ad soyad, rol, iletişim bilgileri ve durum sadece istemci oturum görünümünde güncelleniyor, backend write/audit/RBAC enforcement olmadığı açıkça belirtiliyor.
- Rol/izin taslak UI'sı eklendi; servis kayıtları, müşteriler, cihazlar, kasa ve personel/ayarlar modülleri için rol bazlı planlanan erişim matrisi gösteriliyor ancak gerçek güvenlik olarak sunulmuyor.
- `apps/web/lib/api/staff.ts` mock veri katmanı create/detail/update ve rol-izin taslak şablonlarıyla genişletildi; UI bileşenlerine gömülü mock personel verisi eklenmedi.
- `apps/web/messages/tr.json` ve `apps/web/messages/en.json` personel create/detail/permission draft metinleri ve RBAC caveat uyarılarıyla güncellendi.

- Yeni servis kaydı formunda müşteri arama-seçim akışındaki "yeni müşteri" aksiyonu, `/customers` ekranındaki ortak `CreateCustomerModal` bileşeniyle birleştirildi; başarılı mock oluşturma sonrası müşteri otomatik seçiliyor ve cihaz adımı otomatik olarak "yeni cihaz" moduna geçiyor.
- Yeni servis kaydı formunda mevcut cihaz seçimi inline dropdown yerine müşteri kapsamlı cihaz seçici modalına taşındı; modal müşteriye bağlı tüm cihazları varsayılan olarak listeliyor, marka/model + seri/IMEI + kayıt tarihi (varsa `registeredAt`) gösteriyor.
- `apps/web/lib/api/service-records.ts` mock cihaz modeli `registeredAt` alanı ile genişletildi; cihaz seçici ve form özeti bu alanı lokalize tarih formatıyla gösteriyor.

- `/[locale]/staff` placeholder kaldırıldı ve Personel ekranı aktif hale getirildi; özet kartları (toplam personel, aktif teknisyen, bugün atanan iş, müsait olmayan) eklendi.
- Personel ekranına arama + rol/durum filtreleri, mobil uyumlu personel kartları, açık atama/bugünkü atama sayaçları ve son atamaları servis kayıt detayına bağlayan linkler eklendi.
- Yeni mock API katmanı `apps/web/lib/api/staff.ts` eklendi; personel listesi, durum/rol bilgisi, atama özetleri ve ekran metrikleri UI dışına taşındı.
- Personel modülü bu fazda read-only bırakıldı; RBAC/kullanıcı yönetiminin henüz uygulanmadığına dair güvenlik/backlog notu UI ve dokümantasyonla hizalandı.
- i18n sözlükleri (`apps/web/messages/tr.json` ve `apps/web/messages/en.json`) staff ekranı metinleriyle güncellendi.
- Security backlog notu eklendi: auth/session + RBAC server-side zorlanmalı, multi-tenant sorgular `company_id` ile sınırlandırılmalı, public tracking kodları tokenized/non-guessable olmalı ve dosya/fotoğraflar signed URL ile yetkilendirilmelidir.
- `/[locale]/cash` placeholder kaldırıldı ve Kasa & Cari ekranı aktif hale getirildi; günlük özet kartları (tahsilat, gider, net kasa, bekleyen alacak) eklendi.
- Kasa & Cari ekranına filtre sekmeleri (tümü, tahsilat, gider, bekleyen), filtreye bağlı boş durum davranışı ve mobil uyumlu liste düzeni eklendi.
- Hareket listesi satırları işlem tipi, tutar, tarih/saat, yöntem ve not alanlarıyla genişletildi; müşteri ve servis kaydı referansları mevcut ID'lerde detay rotalarına linklendi.
- Yeni mock API katmanı `apps/web/lib/api/cash.ts` eklendi; kasa özeti ve hareket verisi UI bileşeninden ayrıldı.
- i18n sözlükleri (`apps/web/messages/tr.json` ve `apps/web/messages/en.json`) cash ekranı metinleriyle güncellendi.
- `/[locale]/today` placeholder kaldırıldı ve Bugünün İşleri ekranı aktif hale getirildi; günlük özet kartları (aksiyon bekleyen, açık kayıt, acil/yüksek, tamamlanan) eklendi.
- Bugünün İşleri için filtre sekmeleri (tümü, randevular, acil, tamamlanan), boş durum davranışı ve mobil uyumlu iki kolonlu içerik düzeni eklendi.
- Bugünkü randevu listesi saat, müşteri, cihaz, adres, atanan personel ve durum bilgileriyle; ilgili servis kaydı aksiyonu ile birlikte eklendi.
- Aksiyon bekleyen servis kayıtları bölümü eklendi; servis detayına, mevcutsa müşteri detayına ve cihaz detayına linkler bağlandı.
- Global UX kuralı uygulandı: operasyon ekranlarındaki müşteri/cihaz/servis referansları (Özet Durum + Servis Kayıtları dahil) ID mevcutsa hover ile belirgin deep link olarak davranır, ID yoksa plain metin olarak kalır.
- Yeni mock API katmanı `apps/web/lib/api/today.ts` eklendi; bugünün özeti ve dikkat gerektiren kayıtlar `service-records` mock katmanından türetilerek UI dışına taşındı.
- `apps/web/lib/api/service-records.ts` list öğeleri müşteri ve cihaz detay linklerini desteklemek için opsiyonel `customerId`/`deviceId` alanlarıyla genişletildi.
- Sidebar navigasyonuna Bugünün İşleri modülü eklendi (`apps/web/lib/api/shell.ts`, `apps/web/components/layout/app-sidebar.tsx`).
- Sidebar active-state davranışı düzeltildi; nested rotalarda ilgili üst menü öğesi seçili görünmeye devam eder.
- i18n sözlükleri (`apps/web/messages/tr.json` ve `apps/web/messages/en.json`) today ekran metinleri ve navigation label'larıyla güncellendi.

- `/[locale]/service-records/new` formuna query param preselect desteği eklendi: `customerId` geçerliyse müşteri ön-seçilir, `customerId+deviceId` eşleşiyorsa cihaz da ön-seçilir, sadece `deviceId` geldiğinde cihaz sahibinden müşteri güvenli şekilde türetilir.
- Geçersiz veya müşteri-cihaz eşleşmesi bozuk query kimliklerinde ön-seçim uygulanmıyor; form içinde lokalize, non-blocking uyarı mesajı gösteriliyor.
- Müşteri detayındaki servis kaydı aksiyonu `?customerId=<id>` ile; cihaz detayındaki aksiyon `?customerId=<ownerId>&deviceId=<deviceId>` ile güncellendi.
- `apps/web/lib/api/service-records.ts` içine form ön-seçim çözümleyici helper eklendi; query doğrulama ve müşteri-cihaz bağ kontrolü UI dışına taşındı.
- `/[locale]/devices` placeholder kaldırıldı; gerçek cihaz listesi eklendi. Arama (marka/model/seri/IMEI/müşteri adı/telefon), özet metrikler, boş durum ve cihaz detayına yönlendirme hazırlandı.
- `/<locale>/devices/[id]` cihaz detay rotası eklendi; cihaz özeti, müşteri sahibi kartı, cihaza ait servis geçmişi, servis kaydı aç aksiyonu ve erişilebilir bulunamadı durumu sağlandı.
- `apps/web/lib/api/customers.ts` cihaz modülü için genişletildi: cihaz tip/IMEI alanları, `searchDevices` list helper'ı ve `getDeviceDetail` owner-context detail helper'ı eklendi.
- Sidebar navigasyonuna Cihazlar modülü eklendi (`apps/web/lib/api/shell.ts`, `apps/web/components/layout/app-sidebar.tsx`).
- i18n sözlükleri (`apps/web/messages/tr.json` ve `apps/web/messages/en.json`) devices list/detail metinleri ve navigation label'larıyla güncellendi.
- `/[locale]/customers` listesine "Yeni müşteri oluştur" aksiyonu ve erişilebilir modal akışı eklendi; ad soyad, telefon ve açık adres zorunlu alan doğrulaması ile mock create başarı mesajı/kimliği sağlandı.
- Yeni müşteri oluşturma akışında kayıtların bu fazda kalıcı olmadığı başarı mesajı ve dokümantasyon notu ile açıklandı.
- `apps/web/lib/api/customers.ts` create input/type sözleşmesi genişletildi; müşteri modeline açık adres alanı eklendi ve mock `createMockCustomer` helper'ı tanımlandı.
- `/<locale>/customers/[id]` detay ekranında müşteri iletişim kartı açık adresi gösterecek şekilde güncellendi.
- Müşteri detayındaki bağlı cihazlar için erişilebilir cihaz detay modalı eklendi; marka/model/seri, müşteri bağlamı ve cihaza özel servis geçmişi görüntüleniyor.
- Cihaz detayını çeken müşteri kapsamlı helper (`getCustomerDeviceDetail`) eklendi; eşleşmeyen veya başka müşteriye ait cihaz kimlikleri için veri gösterimi engellendi.
- `/[locale]/customers` placeholder kaldırıldı; müşteri listesi, ad/telefon/e-posta araması, cihaz/açık servis özet metrikleri, boş durum ve müşteri detayına yönlendirme eklendi.
- `/<locale>/customers/[id]` detay rotası eklendi; iletişim özeti, bağlı cihazlar, servis geçmişi (takip kodu, durum, cihaz, tarih), servis kaydı açma aksiyonu ve erişilebilir bulunamadı durumu hazırlandı.
- `apps/web/lib/api/customers.ts` mock veri katmanı eklendi; müşteri arama/list helper'ı ile müşteri+cihaz+servis geçmişi detail helper'ı UI bileşenlerinden ayrıldı.
- Yeni servis kaydı formunda mevcut müşteri seçimi inline liste yerine erişilebilir modal arama akışına taşındı; varsayılan olarak tüm müşteri listesi gösterimi kaldırıldı, en az 2 karakter şartı ve sınırlı sonuç + aramayı daraltma ipucu eklendi.
- Yeni müşteri seçici boş durum kartı, modal içi "yeni müşteri ekle" aksiyonu ve cihaz seçiminde "önce müşteri seç" yönlendirmesi eklendi; müşteri-cihaz bağ modeli korunarak doğrulama davranışı güncellendi.
- `apps/web/lib/api/service-records.ts` içine `searchMockCustomers` helper'ı eklendi; limitli sonuç, toplam eşleşme ve `hasMore` bilgisi mock veri katmanına taşındı.
- Yeni servis kaydı akışı müşteri-cihaz ilişki modeline göre düzeltildi: mevcut müşteri arama/seçme, seçilen müşteriye ait cihazları listeleme, inline yeni müşteri ve yeni cihaz ekleme modları eklendi.
- `apps/web/lib/api/service-records.ts` mock tipleri ve create input sözleşmesi `customerId/newCustomer` ile `deviceId/newDevice` yapısına geçirildi; müşteri ve cihaz mock seçenekleri UI dışı veri katmanında tutuldu.
- Yeni kayıt akışının ID bazlı backend sıralaması dokümante edildi: mevcut kayıtlar `customerId/deviceId` ile bağlanır; yeni müşteri/cihaz durumunda önce müşteri, sonra o müşteri ID'sine bağlı cihaz, sonra servis kaydı oluşturulmalıdır.
- `/[locale]/service-records/new` placeholder ekranı kaldırıldı; form iskeleti `apps/web/features/service-records/new-service-record-form.tsx` bileşenine taşındı.
- Yeni servis kaydı formuna müşteri, cihaz, arıza özeti, öncelik/durum, atanan personel ve iç not alanları ile erişilebilir doğrulama durumları eklendi.
- Form submit akışı için `apps/web/lib/api/service-records.ts` içinde mock seçenek sağlayıcıları ve tracking kodu dönen create adaptörü eklendi.
- i18n sözlükleri (`apps/web/messages/tr.json` ve `apps/web/messages/en.json`) yeni form metinleri ve doğrulama/success mesajlarıyla güncellendi.
- `/[locale]/service-records` placeholder ekranı kaldırıldı; demo görsel diline uyumlu gerçek servis kayıt listesi, arama, durum/öncelik filtreleri ve boş durum davranışı eklendi.
- `apps/web/lib/api/service-records.ts` altında mock veri katmanı oluşturuldu ve “Yeni Kayıt” aksiyonları `/[locale]/service-records/new` planlı rotasına bağlandı.
- `/<locale>/service-records/[id]` detay rotası eklendi; servis özeti, müşteri/cihaz kartları, mock timeline geçmişi, not/iş kalemi placeholder alanı ve erişilebilir bulunamadı durumu hazırlandı.
- Servis kayıt listesine detay navigasyonu eklendi (takip no linki + satır aksiyonu) ve i18n sözlükleri (`tr/en`) detay ekranı metinleriyle güncellendi.

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
