# Security Review

Tarih: 2026-06-14
Kapsam: Mevcut Next.js uygulaması, auth akışı, middleware, setup, API route yetkilendirmesi
Durum: Manuel kod incelemesi; kritik bulgular için düzeltmeler uygulandı

## Özet

Bu proje internete açık kullanılacaksa session iptali, ilk kurulum akışı ve brute-force koruması dikkatle korunmalıdır.

Uygulanan düzeltmeler:

1. JWT session her istekte DB'deki güncel kullanıcı kaydıyla doğrulanıyor.
2. `/api/setup` endpoint'i sadece veritabanında hiç kullanıcı yoksa çalışacak şekilde sınırlandırıldı.
3. Middleware token imzasını/süresini doğruluyor ve geçersiz cookie'yi siliyor.
4. Login endpoint'ine IP + email bazlı rate limit eklendi.
5. Secret ve admin şifre minimumları güçlendirildi.

---

## 1. Session Revocation Eksikliği

Durum: RESOLVED (çözüldü)

İlgili dosyalar:

- `src/lib/auth.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/users/route.ts`
- `src/app/api/auth/users/[id]/route.ts`
- Session'a güvenen diğer API route'ları

### Sorun

JWT token içinde `userId`, `companyId`, `role` tutuluyor. `verifySession()` token imzasını doğruladıktan sonra payload'ı doğrudan güvenilir kabul ediyor. Kullanıcı daha sonra:

- silinirse
- rolü `ADMIN`'den `TECHNICIAN`'a düşürülürse
- farklı şirket bağlantısına geçirilirse

mevcut token süresi dolana kadar eski yetkileri kullanmaya devam edebilir.

### Etki

- Yetkisi kaldırılan admin bir süre daha admin endpoint'lerini kullanabilir.
- Silinmiş kullanıcı aktif token ile işlem yapmaya devam edebilir.
- İnternete açık sistemde bu kabul edilemeyecek kadar zayıf bir yetki iptal modelidir.

### Kanıt

- `src/lib/auth.ts` içindeki `verifySession()` sadece cookie'den token okuyup `jwtVerify()` ile doğruluyor.
- Çok sayıda API route karar verirken sadece `session.role` ve `session.companyId` kullanıyor.
- Her istekte DB'den güncel kullanıcı durumu çekilmiyor.

### Öneri

- `verifySession()` sonrası kullanıcıyı DB'den tekrar çekin.
- Yetki kritik route'larda güncel kullanıcı kaydı üzerinden karar verin.
- Alternatif olarak session version / token invalidation mekanizması ekleyin.
- Minimum hedef: `userId`, `companyId`, `role` her istekte DB ile doğrulansın.

---

## 2. Setup Endpoint ve Otomatik Kurulum Tasarımı

Durum: RESOLVED (çözüldü — setup API sadece kullanıcı yoksa çalışır)

İlgili dosyalar:

- `src/middleware.ts`
- `prisma/seed.js`

### Sorun

Uygulamanın ilk kurulumu HTTP endpoint üzerinden yapılabilir, ancak endpoint yalnızca `User` tablosu boşsa işlem yapar.

### Etki

- İlk kurulum yalnızca kullanıcı yokken yapılabilir.
- Mevcut kullanıcı bulunan veritabanlarında setup endpoint 409 döner.
- Docker başlangıcında veri sıfırlama veya otomatik schema push yapılmaz.

### Kanıt

- Setup API route'u kullanıcı sayısını kontrol ediyor.
- Middleware `/setup` yolunu oturumsuz erişime açıyor, ancak oturumlu kullanıcıları dashboard'a yönlendiriyor.
- İlk şirket/admin bilgileri `.env` yerine kurulum formundan alınır.

### Öneri

- Mevcut çözüm korunmalı: setup işlemi sadece veritabanında hiç kullanıcı yoksa çalışmalıdır.

---

## 3. Middleware Cookie Varlığına Bakarak Auth Kararı Veriyor

Durum: RESOLVED (çözüldü — token doğrulaması eklendi)

İlgili dosya:

- `src/middleware.ts`

### Sorun

Middleware sadece `session` cookie'sinin varlığına bakıyor; token'in geçerliliğini, süresini veya imzasını doğrulamıyor.

### Etki

- Geçersiz veya süresi dolmuş token taşıyan kullanıcı middleware'den geçebilir.
- Sonrasında sayfa veya API seviyesinde 401/404 gibi dağınık hatalar görülebilir.
- Auth akışı tutarsızlaşır.

### Kanıt

- `src/middleware.ts` içinde `request.cookies.get("session")` dışında verification yok.

### Öneri

- Middleware içinde token doğrulaması yapın.
- Geçersiz token varsa cookie'yi temizleyip login'e yönlendirin.

---

## 4. Zayıf Secret ve Admin Şifre Politikası

Durum: RESOLVED (çözüldü — minimumlar güçlendirildi)

İlgili dosya:

- `src/lib/env.ts`

### Sorun

`JWT_SECRET` için minimum 8 karakter, `ADMIN_PASSWORD` için minimum 4 karakter zorunluluğu var.

### Etki

- Üretim ortamında zayıf secret kullanımı daha olası olur.
- Admin hesabı kaba kuvvet saldırılarına karşı daha zayıf kalır.

### Kanıt

- `src/lib/env.ts` zod kuralları bunu açıkça gösteriyor.

### Öneri

- `JWT_SECRET`: minimum 32 karakter
- `ADMIN_PASSWORD`: minimum 8 veya tercihen 12 karakter
- Mümkünse complexity yerine uzunluk odaklı kural kullanın.

---

## 5. Login Endpoint'te Rate Limit Yok

Durum: RESOLVED (çözüldü — rate limit eklendi)

İlgili dosya:

- `src/app/api/auth/login/route.ts`

### Sorun

Başarısız giriş denemeleri için hız sınırlama veya geçici bloklama bulunmuyor.

### Etki

- İnternete açık kullanımda brute-force denemelerine açık kalır.
- Özellikle zayıf şifrelerle birleşince risk artar.

### Kanıt

- Endpoint sadece credential kontrolü yapıyor; deneme sayısı / IP / email bazlı sınırlama yok.

### Öneri

- IP + email bazlı rate limit ekleyin.
- Reverse proxy seviyesinde ek koruma düşünün.
- Tekrarlayan başarısız denemeler için geçici yavaşlatma veya bloklama uygulayın.

---

## Pozitif Noktalar

- API route'ların büyük çoğunluğunda `companyId` izolasyonu uygulanmış.
- Admin-only kullanıcı yönetimi API tarafında da korunuyor.
- Şifreler hash'leniyor, plain text saklanmıyor.
- Session cookie `httpOnly` ve `sameSite=lax`.
- Birçok endpoint input validation için `zod` kullanıyor.

---

## Öncelik Sırası

1. Session revocation / güncel kullanıcı doğrulaması
2. Public setup akışının kaldırılması veya sert şekilde korunması
3. Login rate limiting
4. Middleware token verification
5. Secret ve parola politikası sertleştirme

---

## Not

Bu dosya manuel kod incelemesine dayanır. Dinamik penetration test, dependency taraması ve production reverse proxy/infra ayarları bu kapsamın dışındadır.
