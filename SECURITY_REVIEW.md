# Security Review

Tarih: 2026-06-14
Kapsam: Mevcut Next.js uygulamasi, auth akisi, middleware, setup, API route yetkilendirmesi
Durum: Manuel kod incelemesi; kritik bulgular icin duzeltmeler uygulandi

## Ozet

Bu proje internete acik kullanilacaksa mevcut haliyle ozellikle session iptali, public setup akisi ve brute-force korumasi tarafinda guclendirilmeli.

Uygulanan duzeltmeler:

1. JWT session her istekte DB'deki guncel kullanici kaydiyla dogrulaniyor.
2. Public `/api/setup` endpoint'i kaldirildi; ilk kurulum `npm run db:seed` ile yapiliyor.
3. Middleware token imzasini/suresini dogruluyor ve gecersiz cookie'yi siliyor.
4. Login endpoint'ine IP + email bazli rate limit eklendi.
5. Secret ve admin sifre minimumlari guclendirildi.

---

## 1. Session Revocation Eksikligi

Durum: RESOLVED

Ilgili dosyalar:

- `src/lib/auth.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/users/route.ts`
- `src/app/api/auth/users/[id]/route.ts`
- Session'a guvenen diger API route'lari

### Sorun

JWT token icinde `userId`, `companyId`, `role` tutuluyor. `verifySession()` token imzasini dogruladiktan sonra payload'i dogrudan guvenilir kabul ediyor. Kullanici daha sonra:

- silinirse
- rolu `ADMIN`'den `TECHNICIAN`'a dusurulurse
- farkli sirket baglantisina gecirilirse

mevcut token suresi dolana kadar eski yetkileri kullanmaya devam edebilir.

### Etki

- Yetkisi kaldirilan admin bir sure daha admin endpoint'lerini kullanabilir.
- Silinmis kullanici aktif token ile islem yapmaya devam edebilir.
- Internete acik sistemde bu kabul edilemeyecek kadar zayif bir yetki iptal modelidir.

### Kanit

- `src/lib/auth.ts` icindeki `verifySession()` sadece cookie'den token okuyup `jwtVerify()` ile dogruluyor.
- Cok sayida API route karar verirken sadece `session.role` ve `session.companyId` kullaniyor.
- Her istekte DB'den guncel kullanici durumu cekilmiyor.

### Oneri

- `verifySession()` sonrasi kullaniciyi DB'den tekrar cekin.
- Yetki kritik route'larda guncel kullanici kaydi uzerinden karar verin.
- Alternatif olarak session version / token invalidation mekanizmasi ekleyin.
- Minimum hedef: `userId`, `companyId`, `role` her istekte DB ile dogrulansin.

---

## 2. Public Setup Endpoint ve Otomatik Kurulum Tasarimi

Durum: HIGH RISK

Ilgili dosyalar:

- `src/middleware.ts`
- `prisma/seed.ts`

### Sorun

Uygulamanin ilk kurulumu public erisilebilir HTTP endpoint uzerinden calisiyordu. Bu akış kaldirildi.

### Etki

- Ilk kurulum artik HTTP yuzeyinden tetiklenemez.
- Kurulum `npm run db:seed` ile deploy/bootstrap asamasinda yapilir.
- Public setup endpoint saldiri yuzeyi kaldirildi.

### Kanit

- Setup API route'u silindi.
- Middleware setup kontrolu yapmiyor.
- Seed script `.env` degerlerini validate edip ilk sirket/admin kaydini idempotent sekilde olusturuyor.

### Oneri

- Mevcut cozum korunmali: ilk kurulum sadece seed/bootstrap akisiyle yapilmali.

---

## 3. Middleware Cookie Varligina Bakarak Auth Karari Veriyor

Durum: REVISE

Ilgili dosya:

- `src/middleware.ts`

### Sorun

Middleware sadece `session` cookie'sinin varligina bakiyor; token'in gecerliligini, suresini veya imzasini dogrulamiyor.

### Etki

- Gecersiz veya suresi dolmus token tasiyan kullanici middleware'den gecebilir.
- Sonrasinda sayfa veya API seviyesinde 401/404 gibi daginik hatalar gorulebilir.
- Auth akisi tutarsizlasir.

### Kanit

- `src/middleware.ts` icinde `request.cookies.get("session")` disinda verification yok.

### Oneri

- Middleware icinde token dogrulamasi yapin.
- Gecersiz token varsa cookie'yi temizleyip login'e yonlendirin.

---

## 4. Zayif Secret ve Admin Sifre Politikasi

Durum: REVISE

Ilgili dosya:

- `src/lib/env.ts`

### Sorun

`JWT_SECRET` icin minimum 8 karakter, `ADMIN_PASSWORD` icin minimum 4 karakter zorunlulugu var.

### Etki

- Uretim ortaminda zayif secret kullanimi daha olasi olur.
- Admin hesabi kaba kuvvet saldirilarina karsi daha zayif kalir.

### Kanit

- `src/lib/env.ts` zod kurallari bunu acikca gosteriyor.

### Oneri

- `JWT_SECRET`: minimum 32 karakter
- `ADMIN_PASSWORD`: minimum 8 veya tercihen 12 karakter
- Mumkunse complexity yerine uzunluk odakli kural kullanin.

---

## 5. Login Endpoint'te Rate Limit Yok

Durum: REVISE

Ilgili dosya:

- `src/app/api/auth/login/route.ts`

### Sorun

Basarisiz giris denemeleri icin hiz sinirlama veya gecici bloklama bulunmuyor.

### Etki

- Internete acik kullanimda brute-force denemelerine acik kalir.
- Ozellikle zayif sifrelerle birlesince risk artar.

### Kanit

- Endpoint sadece credential kontrolu yapiyor; deneme sayisi / IP / email bazli sinirlama yok.

### Oneri

- IP + email bazli rate limit ekleyin.
- Reverse proxy seviyesinde ek koruma dusunun.
- Tekrarlayan basarisiz denemeler icin gecici yavaslatma veya bloklama uygulayin.

---

## Pozitif Noktalar

- API route'larin buyuk cogunlugunda `companyId` izolasyonu uygulanmis.
- Admin-only kullanici yonetimi API tarafinda da korunuyor.
- Sifreler hash'leniyor, plain text saklanmiyor.
- Session cookie `httpOnly` ve `sameSite=lax`.
- Bircok endpoint input validation icin `zod` kullaniyor.

---

## Oncelik Sirasi

1. Session revocation / guncel kullanici dogrulamasi
2. Public setup akisinin kaldirilmasi veya sert sekilde korunmasi
3. Login rate limiting
4. Middleware token verification
5. Secret ve parola politikasi sertlestirme

---

## Not

Bu dosya manuel kod incelemesine dayanir. Dinamik penetration test, dependency taramasi ve production reverse proxy/infra ayarlari bu kapsamin disindadir.
