# 📱 Android Geliştirme ve Dağıtım Rehberi

Bu rehber, Servis Takip uygulamasının Capacitor 8 kullanılarak Android platformuna nasıl derleneceğini, yerel geliştirme ortamının nasıl kurulacağını ve karşılaşılan yaygın sorunların çözümlerini açıklamaktadır.

---

## ⚙️ Ön Gereksinimler

Mobil uygulamayı derlemek ve yerel ortamda test etmek için bilgisayarınızda aşağıdaki araçların kurulu olması gerekir:

1.  **Android Studio:** Güncel sürüm.
2.  **JDK 21:** Windows üzerinde Capacitor 8 derleme işlemleri için JDK 21 gereklidir. Android Studio ile birlikte gelen JBR (JetBrains Runtime) kullanılması önerilir.
3.  **Android SDK ve Sanal/Fiziksel Cihaz:** Android API level 34+ SDK kurulu olmalıdır.

---

## 🛠️ Temel Proje Ayarları

Uygulamanın Android tarafındaki paket ve kimlik ayarları şu şekildedir:
*   **Paket Adı (App ID):** `com.cettek.servistakip`
*   **Uygulama Adı:** `ÇetTek Servis`
*   **Geliştirme Sunucusu Adresi:** `http://localhost:3000`
*   **Dosya Konfigürasyonu:** [capacitor.config.ts](file:///c:/Users/emiran/Desktop/Servis%20Takip/capacitor.config.ts)

---

## 🚀 Derleme ve Çalıştırma Adımları

Mobil uygulamayı derleyip kabloyla bağlı cihazda çalıştırmak için aşağıdaki adımları sırasıyla uygulayın:

### 1. Next.js Derlemesini Alın (Static Export)
Capacitor, uygulamanın statik dosyalarını (`out/` klasörü) paketler. Bu nedenle öncelikle Next.js projesinin build/export çıktısını almalıyız:
```powershell
npm run build
```
*(Not: Statik dosyalar projenin kök dizinindeki `out/` klasörüne yazılır. Build öncesinde `next.config.ts` dosyasındaki `output` değeri `'standalone'` yerine geçici olarak `'export'` olarak değiştirilmelidir. Build tamamlandıktan sonra tekrar `'standalone'` yapmayı unutmayın.)*

### 2. Capacitor Eşitlemesini Yapın
Derlenen statik dosyaları Android projesine kopyalamak ve bağımlılıkları senkronize etmek için:
```powershell
npx cap sync
```

### 3. Uygulamayı Cihazda Çalıştırın
Kabloyla bağlı bir Android cihazda veya emülatörde uygulamayı derleyip çalıştırmak için (Windows PowerShell):
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
npx cap run android
```
*(Not: PowerShell'de `JAVA_HOME` ortam değişkeninin Android Studio JBR dizinini göstermesi Windows üzerindeki derleme hatalarını önler.)*

---

## 📡 Yerel Sunucu Bağlantısı & ADB Yönlendirmesi

Android uygulaması, geliştirme aşamasında bilgisayarınızda çalışan Next.js sunucusuna (`http://localhost:3000`) erişecek şekilde yapılandırılmıştır.

Fiziksel cihazın bilgisayardaki `localhost` adresine erişebilmesi için **ADB Reverse Port Forwarding** yapılmalıdır. Kablo ile bağlı cihaz algılandıktan sonra şu komutu çalıştırın:
```powershell
adb reverse tcp:3000 tcp:3000
```

> [!WARNING]
> ADB sunucusu her yeniden başladığında, USB kablosu sökülüp takıldığında ya da cihaz bağlantısı kesildiğinde port yönlendirme silinir. Uygulama bağlantı hatası veriyorsa bu komutu tekrar çalıştırmanız gerekir.

---

## 🔌 Çevrimdışı Durumu & Otomatik Yeniden Bağlanma (Auto-Reconnect)

Uygulamanın yerel sunucuya (`localhost:3000`) erişemediği durumlarda (sunucunun kapalı olması, ağ hatası vb.) kullanıcı deneyimini iyileştirmek için özel bir hata yakalama mekanizması kurulmuştur.

### Çalışma Mantığı:
1.  **Hata Yakalama (`MainActivity.java`):**
    [MainActivity.java](file:///c:/Users/emiran/Desktop/Servis%20Takip/android/app/src/main/java/com/cettek/servistakip/MainActivity.java) içindeki WebView dinleyicisi bir bağlantı hatası oluştuğunda bunu yakalar ve yerel asset dizinindeki [error.html](file:///c:/Users/emiran/Desktop/Servis%20Takip/public/error.html) dosyasını yükler (`file:///android_asset/public/error.html`).
2.  **Yeniden Bağlanma Spinner'ı (`error.html`):**
    Kullanıcıya sade, modern ve karanlık mod uyumlu bir "Bağlantı Kurulamadı" ekranı gösterilir ve bir yükleme spinner'ı döner.
3.  **Otomatik Yeniden Yükleme (Fetch Ping):**
    `error.html` içerisindeki JavaScript kodu, arka planda her 3 saniyede bir sunucunun `/api/setup` endpoint'ine hafif bir ping (fetch request) atar. Sunucu tekrar yanıt verdiğinde, WebView otomatik olarak `http://localhost:3000` adresine yönlendirilerek uygulamanın açılması sağlanır.

### Android Güvenlik İzinleri:
Yerel dosya sisteminden (`file:///`) yerel sunucuya (`http://localhost:3000`) atılan fetch isteklerinin CORS ve tarayıcı güvenlik engellerine takılmaması için [MainActivity.java](file:///c:/Users/emiran/Desktop/Servis%20Takip/android/app/src/main/java/com/cettek/servistakip/MainActivity.java) üzerinde şu izinler aktif edilmiştir:
```java
webView.getSettings().setAllowFileAccess(true);
webView.getSettings().setAllowFileAccessFromFileURLs(true);
webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
```
ayrıca HTTP (cleartext) bağlantılara izin vermek için [AndroidManifest.xml](file:///c:/Users/emiran/Desktop/Servis%20Takip/android/app/src/main/AndroidManifest.xml) içerisinde `android:usesCleartextTraffic="true"` tanımlanmıştır.
