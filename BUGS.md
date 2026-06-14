# Bilinen Sorunlar

## Lint Hataları

- `src/components/layout/theme-toggle.tsx` — Önceden var olan lint hatası (`useEffect` içinde `setState`), mevcut çalışmayı etkilemez.
- `src/components/providers/auth-provider.tsx` — Önceden var olan lint hatası (`useEffect` içinde `setState`), mevcut çalışmayı etkilemez.
- `prisma/seed.js` — CommonJS modülü olduğu için `require()` kullanımı lint hatası verir, çalışmayı etkilemez.
- `scripts/docker-entrypoint.js` — CommonJS modülü olduğu için `require()` kullanımı lint hatası verir, çalışmayı etkilemez.
- `scripts/mock-data.js` — CommonJS modülü olduğu için `require()` kullanımı lint hatası verir, çalışmayı etkilemez.

## Uyarılar

- Next.js middleware uyarısı: `"middleware" file convention is deprecated. Please use "proxy" instead.` — İşlevsel etkisi yok, Next.js 16'daki yeni yönlendirme. Gelecekte `src/proxy.ts`'ye geçiş yapılabilir.

## Düzeltilen Hatalar

- .env: `JWT_SECRET` değişkeninde yer alan `$` işaretlerinin Next.js env parser tarafından kırpılması/değişken genişletmesi yapması engellendi (kaçış karakteri `\$` kullanıldı).
- Rate Limit: `src/lib/rate-limit.ts` içinde biriken eski/süresi dolmuş IP/e-posta limit kayıtlarının temizlenmesi sağlanarak olası bellek sızıntısı (memory leak) giderildi.
- Middleware: `src/middleware.ts` üzerinde oturum geçersizleştiğinde `/tr/setup` sayfasına gitmeye çalışan kullanıcıların `/tr/login` sayfasına yönlendirilip kilitlenmesi hatası giderildi.
- Mock-data.js: `pick()` çağrısında `rng` parametresi eksikti → `rng is not a function` hatası. Servis kaydı oluşturma aşamasında ödeme eklerken patlıyordu. (Düzeltildi)
- Mock-data.js: `pickWeighted()` içine `null` entry giriyordu → `Cannot read properties of null (reading 'weight')`. Planlı iş açıklama üretiminde yaklaşık %86 progress'te patlıyordu. (Düzeltildi — helper artık null/undefined entry'leri filtreliyor)
- Mock-data.js: `generatePhone()` 12 haneli telefon üretiyordu (ör. `055210297349`). API validation'dan geçmeyen bu telefonlar listede ham halde görünüyordu. (Düzeltildi — 11 haneye indirildi)
- Mock-data.js: Servis kaydı ödemeleri hedef sayıyı aşabiliyordu. `counts.payments` ile tam eşleşme garantisi yoktu. (Düzeltildi — `progress.payments < counts.payments` kontrolü eklendi)
- Mock-data.js: `repairDescription` alanı Prisma schema'da yoktu. (Düzeltildi — kaldırıldı)
- Mock-data.js: `paymentMethod` required alanı Payment.create'te eksikti. (Düzeltildi — eklendi)
- Mock-data.js: `TaskType.ZIYARET`/`KONTROL`/`TAHESILAT` schema'da yok. (Düzeltildi — geçerli enum değerleri kullanıldı)
- Mock-data.js: `TaskStatus.IPTAL_EDILDI` schema'da yok, doğru değer `IPTAL`. (Düzeltildi)
- Mock-data.js: Kullanılmayan `generateStatusHistory`, `generateShortAddress`, `pressEnter` fonksiyonları temizlendi.
