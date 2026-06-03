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
- Auth/session ve RBAC henüz tamamlanmadı; yetkilendirme yalnızca buton gizleme ile değil her zaman server-side zorlanmalıdır.
- Public tracking kodları tahmin edilemez/token tabanlı olmalı; iç notlar, maliyetler ve personel logları kesinlikle sızdırılmamalıdır.
- Dosya ve fotoğraflar public bucket/URL ile servis edilmemeli; authorization-aware signed URL yaklaşımı kullanılmalıdır.
- UI metinleri `messages/tr.json` ve `messages/en.json` üzerinden gelir.
- Servis kayıtları araması; takip no, müşteri ve cihaz metinlerinde her zaman çalışır; sorgu yalnızca rakam ve telefon biçim karakterleri içeriyorsa normalize edilmiş telefon numarasında da kısmi eşleşme yapar.
- Servis kayıt listesi satırları ve “Detay” aksiyonu `/[locale]/service-records/[id]` detay rotasına gider.
- Servis kayıt detay ekranı; özet kartları, timeline iskeleti, not/iş kalemi placeholder alanı ve bulunamayan kayıt durumu içerir.
- `/[locale]/service-records/new` rotası, servis kaydını müşteriye bağlı açacak şekilde güncellenmiştir; mevcut müşteri arama-seçme, müşteriye bağlı cihaz seçimi, inline yeni müşteri/cihaz ekleme, doğrulama hataları ve mock tracking kodu üretimi içerir.
- Yeni servis kaydı müşteri seçimi, inline tüm müşteri listesini kaldıran modal arama akışına taşınmıştır; en az 2 karakter ile sınırlı sonuç gösterimi ve daha fazla eşleşme için arama daraltma yönlendirmesi içerir.
- Yeni servis kaydı create modeli ID bazlıdır: mevcut müşteri seçilirse `customerId`, mevcut cihaz seçilirse `deviceId` gönderilir; yeni müşteri/cihaz senaryosunda backend önce müşteri kaydını oluşturup dönen müşteri ID'siyle cihazı, ardından servis kaydını oluşturmalıdır.
- Yeni kayıt formunun select seçenekleri ve mock submit adaptörü UI dışında `apps/web/lib/api/service-records.ts` içinde tutulur.
- `/[locale]/customers` müşteri listesi aktif hale getirildi; ad/telefon/e-posta araması, müşteri bazlı cihaz ve açık servis sayısı özetleri, boş durum ve müşteri detayına navigasyon içerir.
- `/[locale]/customers` ekranına erişilebilir "Yeni müşteri oluştur" modal akışı eklendi; zorunlu alanlar ad soyad + telefon + açık adres olarak doğrulanır, başarıda geçici mock müşteri kimliği döner ve bu fazda kalıcı olmadığını açıkça belirtir.
- `/[locale]/customers/[id]` müşteri detay ekranı aktif hale getirildi; iletişim kartı artık açık adres bilgisini içerir, bağlı cihaz listesi ve servis geçmişi (takip kodu-durum-cihaz-tarih) korunur.
- Müşteri detayındaki bağlı cihazlar için müşteri kapsamlı cihaz detay modalı eklendi; marka/model/seri, cihaz sahibi ve sadece o cihaza ait servis geçmişi görüntülenir, eşleşmeyen cihaz kimliği engellenir.
- Müşteri modülü mock veri katmanı `apps/web/lib/api/customers.ts` içinde tutulur; müşteri listesi arama helper'ı, mock create helper'ı, müşteri detail helper'ı ve customer-scope device detail helper'ı UI dışından sağlanır.
- `/[locale]/devices` placeholder kaldırıldı; cihaz listesi aktif hale getirildi. Marka/model/seri/IMEI/müşteri adı/telefon araması, müşteri sahipliği görünürlüğü, boş durum ve cihaz detayına yönlendirme eklendi.
- `/[locale]/devices/[id]` cihaz detay rotası eklendi; cihaz özeti, müşteri sahibi kartı (iletişim + adres), cihaza ait servis geçmişi (takip kodu/durum/tarih) ve erişilebilir bulunamadı durumu hazırlandı.
- Cihaz modülü müşteriye bağlılık kuralını mock API katmanında korur; cihaz listesi ve detay helper'ları sadece geçerli müşteri sahibi bağlamıyla veri döndürür.
- `/[locale]/today` placeholder kaldırıldı; Bugünün İşleri ekranı aktif hale getirildi. Günlük özet kartları, filtreler (tümü/randevular/acil/tamamlanan), bugünkü randevu listesi (saat, müşteri, cihaz, adres, personel, durum) ve aksiyon bekleyen servis kayıtları (detay + müşteri/cihaz linkleri) eklendi.
- `/[locale]/cash` placeholder kaldırıldı; Kasa & Cari ekranı aktif hale getirildi. Günlük özet kartları (tahsilat, gider, net kasa, bekleyen alacak), işlem filtreleri (tümü/tahsilat/gider/bekleyen), müşteri-servis bağlantılı hareket listesi ve filtreye özel boş durum eklendi.
- `/[locale]/staff` placeholder kaldırıldı; Personel ekranı aktif hale getirildi. Personel özet kartları (toplam personel, aktif teknisyen, bugün atanan iş, müsait olmayan), rol/durum + arama filtreleri, kişi bazlı açık atama/bugünkü atama metrikleri ve son atamaların servis detayına linkleri eklendi.
- `/[locale]/staff` ekranına mock personel oluşturma modalı eklendi; ad soyad + rol zorunlu, telefon/e-posta opsiyonel, varsayılan durum aktif ve başarıda kalıcı olmayan demo personel kimliği döndürülüyor.
- Personel kartlarından açılan detay modalı; iletişim bilgileri, açık atama/bugünkü atama metrikleri, son servis atamaları ve servis kaydı deep link'leri ile aktif hale getirildi.
- Personel detayında profil/durum/rol düzenleme akışı yalnızca mock oturum görünümünü günceller; backend create/update endpoint'i, audit log ve gerçek kullanıcı üyeliği akışı henüz bağlı değildir.
- Personel detayında rol/izin matrisi taslak UI olarak gösterilir; bu yüzey gerçek güvenlik sağlamaz ve server-side RBAC guard'ları uygulanmadan yetki enforcement varmış gibi değerlendirilmemelidir.
- Operasyon ekranlarında (Bugünün İşleri, Servis Kayıtları, Özet Durum) müşteri/cihaz/servis referansları, ilgili ID mevcutsa detay rotalarına deep link olarak gösterilir; ID yoksa metin plain olarak kalır.
- Bugünün İşleri mock veri katmanı `apps/web/lib/api/today.ts` altında tutulur; açık kayıt ve öncelik hesapları mevcut servis kayıtları mock katmanından türetilir.
- Sidebar navigasyonuna Bugünün İşleri modülü eklendi (`/[locale]/today`); nested route'larda (`/[locale]/service-records/[id]`, `settings/*` gibi) ilgili menü öğesi active-state korur.
- Kasa/Cari mock veri katmanı `apps/web/lib/api/cash.ts` altında tutulur; UI, günlük özet ve hareket listesini bu katmandan alır.
- Kasa/Cari ekranındaki müşteri ve servis referansları ID varsa sırasıyla `/[locale]/customers/[id]` ve `/[locale]/service-records/[id]` rotalarına deep link verir; ID yoksa plain metin gösterilir.
- Müşteri detayındaki "servis kaydı aç" aksiyonu `/[locale]/service-records/new?customerId=<id>` desenini kullanır ve formu müşteri ön-seçimi ile açar.
- Cihaz detayındaki "servis kaydı aç" aksiyonu `/[locale]/service-records/new?customerId=<ownerId>&deviceId=<deviceId>` desenini kullanır; form müşteri+cihaz ön-seçimi ile açılır.
- `/[locale]/service-records/new` rotası `customerId` ve `deviceId` query parametrelerini doğrular; geçerli eşleşmelerde ön-seçim uygulanır, sadece `deviceId` geldiğinde cihaz sahibinden müşteri güvenli şekilde türetilir, geçersiz/uyumsuz kimliklerde seçim uygulanmaz ve lokalize uyarı gösterilir.
- Yeni servis kaydı akışında müşteri arama-seçim sürecindeki "yeni müşteri" aksiyonu, müşteriler ekranındaki ortak oluşturma modalını kullanır; başarılı mock oluşturma sonrası müşteri formda otomatik seçilir ve akış yeni cihaz moduna geçer.
- Yeni servis kaydı akışında mevcut cihaz seçimi inline select yerine müşteri kapsamlı cihaz seçici modalı ile yapılır; modal varsayılan olarak müşterinin tüm cihazlarını listeler ve varsa kayıt tarihini gösterir.
- Kritik write işlemleri audit log üretir.
- Demo kodu üretim kodu sayılmaz; gerektiğinde modüler şekilde `apps/web` altına taşınır.
- Build, lint ve typecheck hatası bırakılmamalıdır.
