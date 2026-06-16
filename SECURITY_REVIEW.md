# Güvenlik Denetimi

## 2026-06-14 — İyileştirmeler

### JWT_SECRET $ Karakteri Kaçışı
- **Sorun:** `.env` dosyasındaki `JWT_SECRET` değerinde yer alan `$` işaretleri Next.js env parser tarafından değişken genişletmesine tabi tutuluyor, secret değer bozuluyordu.
- **Çözüm:** `$` işaretleri `\$` ile kaçış karakteri kullanılarak escape edildi.

### Rate Limit Bellek Sızıntısı
- **Sorun:** `src/lib/rate-limit.ts` içinde biriken süresi dolmuş IP/e-posta limit kayıtları temizlenmiyor, zamanla bellek şişiyordu.
- **Çözüm:** Eski kayıtların periyodik temizlenmesi eklendi.

### Middleware Yönlendirme Kilidi
- **Sorun:** Oturum geçersizleştiğinde `/tr/setup` sayfasına gitmeye çalışan kullanıcılar `/tr/login` sayfasına yönlendirilip kilitleniyordu.
- **Çözüm:** Middleware yönlendirme mantığı düzeltildi, setup ve login sayfaları arasında döngü engellendi.
