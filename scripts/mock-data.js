const { PrismaClient, ServiceStatus, ServicePriority, PaymentType, PaymentMethod, TaskType, TaskStatus } = require("@prisma/client");
const { spawnSync } = require("child_process");
const { mkdirSync, existsSync } = require("fs");
const { join } = require("path");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });

const DEFAULT_COUNTS = {
  customers: 250,
  devices: 500,
  serviceRecords: 1500,
  payments: 1575,
  scheduledTasks: 250,
};

const FIRST_NAMES = [
  "Ahmet", "Mehmet", "Mustafa", "Hüseyin", "Hasan", "İbrahim", "Yusuf", "Murat",
  "Osman", "Salih", "Ömer", "Ali", "Veli", "Recep", "Kemal", "Burak",
  "Cemal", "Orhan", "İsmail", "Hakkı", "Rıza", "Nihat", "Tuncay", "Levent",
  "Erdal", "Mithat", "Süleyman", "Abdullah", "Fikret", "Mahmut",
  "Ayşe", "Fatma", "Zeynep", "Merve", "Elif", "Emine", "Hacer", "Hatice",
  "Gülseren", "Şerife", "Derya", "Songül", "Nazlı", "Pınar", "Sibel", "Aslı",
  "Zehra", "Sedef", "Meral", "Hanife", "Nuran", "Semra", "Fadime", "Sultan",
  "Gülbahar", "Rukiye", "Rabia", "Büşra", "Esra", "Cansu",
];

const LAST_NAMES = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Arslan", "Aydın", "Koç",
  "Özkan", "Polat", "Taş", "Güneş", "Kurt", "Öztürk", "Aksoy", "Kara",
  "Yıldız", "Aslan", "Doğan", "Çetin", "Korkmaz", "Acar", "Sezer", "Bolat",
  "Turan", "Çiçek", "Güler", "Bulut", "Tekin", "Erdoğan",
  "Keskin", "Bilgin", "Can", "Öz", "Uçar", "Sarı", "Duman", "Kılıç",
  "Aktaş", "Tosun", "Özdemir", "Alkan", "Çalışkan", "Gül", "Işık", "Toprak",
  "Varol", "Bayrak", "Sönmez", "Pekkan",
];

const NICKNAMES = [
  null, null, null, null, null, null,
  "Apartman görevlisi", "Site yöneticisi", "Sahibi", "İşletme müdürü",
  "Kafe sahibi", "Hırdavatçı", "Tüpçü", "Bakkal", "Otoparkçı",
  "Kardeşi", "Komşusu", "Kiracı", "Eşi", "Oğlu", "Kızı",
];

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
  "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
  "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
  "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale",
  "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
  "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

const DISTRICTS = {
  İstanbul: ["Kadıköy", "Üsküdar", "Beşiktaş", "Şişli", "Fatih", "Maltepe", "Beylikdüzü", "Küçükçekmece", "Bağcılar", "Esenler", "Esenyurt", "Sarıyer", "Beyoğlu", "Gaziosmanpaşa", "Pendik"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan", "Altındağ", "Etimesgut", "Gölbaşı", "Pursaklar"],
  İzmir: ["Karşıyaka", "Bornova", "Konak", "Buca", "Balçova", "Çiğli", "Menemen", "Torbalı"],
  "default": ["Merkez", "Cumhuriyet", "Atatürk", "Zafer", "Yeni", "Hürriyet", "Sanayi", "Barbaros", "Fatih", "Kocatepe"],
};

const STREET_NAMES = [
  "Cumhuriyet Cad.", "Atatürk Cad.", "İnönü Cad.", "Barbaros Cad.", "Mithatpaşa Cad.",
  "Gazi Mustafa Kemal Cad.", "Fatih Cad.", "Yıldırım Cad.", "Zafer Cad.", "Hürriyet Cad.",
  "Mareşal Fevzi Çakmak Cad.", "İstasyon Cad.", "Lise Cad.", "Okul Cad.", "Hastane Cad.",
  "Sanayi Cad.", "Çarşı Cad.", "Sahil Yolu", "Bahçe Sok.", "Çiçek Sok.",
  "Menekşe Sok.", "Gül Sok.", "Lale Sok.", "Karanfil Sok.", "Papatya Sok.",
  "Zambak Sok.", "Akasya Sok.", "Defne Sok.", "Çam Sok.", "Kavak Sok.",
  "Söğüt Sok.", "Çınar Sok.", "Şehitler Cad.", "Eski Yol Cad.", "Köy Yolu",
  "Dereboyu Cad.", "Meydan Cad.", "Pazar Cad.", "Kışla Cad.", "Sokakbaşı Cad.",
];

const APARTMENT_NAMES = [
  "Güneş Apt.", "Yıldız Apt.", "Deniz Apt.", "Barış Apt.", "Özlem Apt.",
  "Mutlu Apt.", "Bahar Apt.", "Yeni Apt.", "Büyük Apt.", "Aslan Apt.",
  "Mavi Apt.", "Park Apt.", "Site Apt.", "Uğur Apt.", "Çağrı Apt.",
];

const CATEGORY_BRAND_MODELS = {
  Buzdolabı: {
    brands: { Arçelik: ["2450", "2451", "2570", "2800", "2900"], Bosch: ["KGN36", "KGN39", "KGN56", "KGE49"], Vestel: ["BD-300", "BD-400", "BD-500"], LG: ["GN-B202", "GN-B302", "GN-B402"] },
  },
  "Çamaşır Makinesi": {
    brands: { Arçelik: ["9103", "9104", "10120", "10130", "12144"], Bosch: ["WAN28", "WAN24", "WGB2440"], Vestel: ["CM-500", "CM-700", "CM-900"], LG: ["F2J3", "F4J5", "F4V5"] },
  },
  "Bulaşık Makinesi": {
    brands: { Arçelik: ["6233", "6234", "6345", "6555"], Bosch: ["SMS4", "SMS6", "SMV4"], Vestel: ["BM-400", "BM-500", "BM-600"], LG: ["D1462", "D2532"] },
  },
  Televizyon: {
    brands: { Samsung: ["UE43", "UE50", "UE55", "UE65", "QN55", "QN65"], LG: ["43LM", "50LM", "55LM", "65LM", "OLED55", "OLED65"], Sony: ["KD43", "KD55", "KD65"], Philips: ["43PUS", "50PUS", "55PUS", "65PUS"], Vestel: ["43U", "50U", "55U", "65U"] },
  },
  Telefon: {
    brands: { Apple: ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone 12 Pro", "iPhone 14 Pro"], Samsung: ["Galaxy S22", "Galaxy S23", "Galaxy S24", "Galaxy A52", "Galaxy A55"], Xiaomi: ["Redmi Note 12", "Redmi Note 13", "Mi 13"], Oppo: ["Reno 10", "Reno 11", "Find X5"] },
  },
  Laptop: {
    brands: { Apple: ["MacBook Air M1", "MacBook Air M2", "MacBook Air M3", "MacBook Pro M1", "MacBook Pro M3"], HP: ["Pavilion 15", "Pavilion 14", "ProBook 450", "EliteBook 840"], Lenovo: ["ThinkPad X1", "ThinkPad T14", "IdeaPad 5", "Legion 5"], Dell: ["XPS 13", "XPS 15", "Inspiron 15", "Latitude 5440"], Asus: ["TUF Gaming F15", "ZenBook 14", "ROG Zephyrus"], Casper: ["Nirvana", "Excel", "Travel"] },
  },
  Tablet: {
    brands: { Apple: ["iPad 9", "iPad 10", "iPad Air M2", "iPad Pro M4"], Samsung: ["Galaxy Tab A7", "Galaxy Tab A9", "Galaxy Tab S9", "Galaxy Tab S9 FE"], Huawei: ["MatePad 11", "MatePad SE"], Lenovo: ["Tab M10", "Tab P12"] },
  },
  Klima: {
    brands: { Vestel: ["KLM-9000", "KLM-12000", "KLM-18000", "KLM-24000"], Arçelik: ["4106", "6103", "7105", "12240"], Bosch: ["CL6000", "CL9000", "CL12000"], LG: ["S09", "S12", "S18", "Dual Cool"], Mitsubishi: ["MSZ-SF", "MSZ-FH", "MSZ-HR"] },
  },
  "Kombi / Isıtma": {
    brands: { Bosch: ["Condens 2000", "Condens 2300", "Condens 2500", "Condens 3000"], Vaillant: ["ecoCOMPACT", "ecoTEC", "turboMAX"], ECA: ["Calora", "Combi 3", "Combi 4"], Baymak: ["Falke", "Lambert", "Duotec"], DemirDöküm: ["Nitromix", "Atron", "Neva"] },
  },
  Mikrodalga: {
    brands: { Arçelik: ["MD 600", "MD 800"], Vestel: ["MD-20", "MD-30"], Bosch: ["BFV24", "BFV28"], Samsung: ["MS23", "MG23"] },
  },
  Fırın: {
    brands: { Arçelik: ["Fırın 6031", "Fırın 8031", "Steam 9031"], Bosch: ["HBG5780", "HBG6780"], Vestel: ["FRN-600", "FRN-700"], LG: ["FQ2T", "FQ3T"] },
  },
};

const FAULTS = [
  "Açılmıyor / güç gelmiyor", "Ekran kırık / çatlak", "Ekranda leke / çizik var",
  "Şarj olmuyor", "Şarj girişi arızalı", "Pil süresi çok azaldı",
  "Ses gelmiyor / ses bozuk", "Hoparlör cızırtılı", "Kulaklık girişi çalışmıyor",
  "Tuş takımı çalışmıyor", "Dokunmatik tepki vermiyor", "Donma / kilitlenme sorunu",
  "Reset atıp duruyor", "Isınıp kapanıyor", "Su almış / sıvı teması",
  "Soğutma yapmıyor", "Soğutma az / yetersiz", "Don olayı var",
  "Su kaçırıyor", "Su tahliye etmiyor", "Ses yapıyor / gürültülü çalışıyor",
  "Koku yapıyor", "Sızdırma yapıyor", "Kapağı kapanmıyor",
  "Program tamamlamıyor", "Döndürmüyor / tambur dönmüyor", "Sıkma yapmıyor",
  "Görüntü yok / görüntü gelmiyor", "Görüntüde gölge / çizgi var", "Renkler bozuk",
  "Kanal arama yapmıyor", "Uzaktan kumanda çalışmıyor", "Wifi bağlanmıyor",
  "Bluetooth bağlanmıyor", "Yazılım güncelleme sorunu", "Yavaş çalışıyor",
  "Yanma kokusu geliyor", "Fan çalışmıyor", "Fan sesi yüksek / vızıltı",
  "Soğutucu akışkan kaçağı", "Cihaz çok gürültülü", "Titreşim yapıyor",
  "Termostat arızalı", "Doğalgaz kokusu", "Alev gelmiyor / ateşleme yok",
  "Basınç düşük", "Kombi su doldurmuyor", "Petekler ısınmıyor",
  "Bağlantı kopuyor / donuyor", "Sürekli uyarı veriyor", "Çalışıyor ama sonuç vermiyor",
];

const NOTE_TEMPLATES = [
  "Müşteri cihazı bıraktı.",
  "Arıza tespiti yapıldı.",
  "Yedek parça sipariş edildi.",
  "Müşteri bilgilendirildi.",
  "Fiyat teklifi verildi.",
  "Müşteri onayı bekleniyor.",
  "Cihaz onarıma alındı.",
  "Tamirat başladı.",
  "Yedek parça geldi, montaj yapılacak.",
  "Cihaz test ediliyor.",
  "Test başarılı, müşteri arandı.",
  "Ödeme için müşteri beklentide.",
  "Cihaz teslim edildi.",
  "Arıza tespit edilemedi, bir gün daha test.",
  "Parça değişimi yapıldı.",
  "Servis çağrısı beklentide.",
  "Müşteri randevuyu ertelemek istedi.",
  "Adreste kimse yoktu, tekrar aranacak.",
];

const TASK_TITLES = [
  "Cihaz alınacak", "Cihaz teslim edilecek", "Periyodik bakım", "Filtre temizliği",
  "Yazılım güncellemesi", "Kurulum / montaj", "Kontrol / keşif", "Garanti değerlendirme",
  "Arıza tespit randevusu", "Parça değişimi", "Basınç kontrolü", "Gaz kaçağı testi",
  "Su tesisatı kontrolü", "Şarj girişi tamiri", "Ekran koruyucu değişimi",
  "Müşteri bilgilendirme ziyareti", "Ücret tahsilatı", "İade süreci", "Nakliye / taşıma",
];

const TUNABLES = {
  nicknameRatio: 0.35,
  emailDomain: ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com", "@yandex.com", "@icloud.com", "@protonmail.com"],
  // service record odds: 0-1 range, higher = more common
  statusHistoryPerRecord: { min: 1, max: 5 },
  notePerRecord: 0.55,
  paymentPerServiceRecord: { min: 1, max: 3 },
  paymentAlonePerCustomer: 0.6,
  autoDateDaysAgo: { min: 0, max: 150 },
  scheduledTaskDays: { min: -15, max: 45 },
};

function createRng(seed = Date.now()) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return function next() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function pickWeighted(entries, rng) {
  const usableEntries = entries.filter((entry) => entry && typeof entry.weight === "number");
  const total = usableEntries.reduce((s, e) => s + e.weight, 0);
  let r = rng() * total;
  for (const entry of usableEntries) {
    r -= entry.weight;
    if (r <= 0) return entry.value;
  }
  return usableEntries[usableEntries.length - 1].value;
}

function randomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomDecimal(min, max, decimals, rng) {
  return Number((rng() * (max - min) + min).toFixed(decimals));
}

function formatDate(daysAgo, rng, base = new Date()) {
  const date = new Date(base);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 19, rng), randomInt(0, 59, rng), randomInt(0, 59, rng), 0);
  return date;
}

function newDateForward(minDays, maxDays, rng, base = new Date()) {
  return formatDate(-randomInt(minDays, maxDays, rng), rng, base);
}

function generateEmail(name, surname, index, rng) {
  const domain = pick(TUNABLES.emailDomain, rng);
  const fmt = pick(["ad.soyad", "adisoyadi", "adi.soyadi", "ad", "soyad", "adisoyadi.sayi"], rng);
  const a = name.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "");
  const b = surname.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "");
  switch (fmt) {
    case "ad.soyad": return `${a}.${b}${domain}`;
    case "adisoyadi": return `${a}${b}${domain}`;
    case "adi.soyadi": return `${a.slice(0, 2)}.${b}${domain}`;
    case "ad": return `${a}${index}${domain}`;
    case "soyad": return `${b}${randomInt(1, 99, rng)}${domain}`;
    default: return `${a}.${b}${randomInt(1, 99, rng)}${domain}`;
  }
}

function generatePhone(rng) {
  const operator = pick(["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"], rng);
  const p3 = String(randomInt(100, 999, rng));
  const p4 = String(randomInt(10, 99, rng));
  const p5 = String(randomInt(10, 99, rng));
  return `05${operator}${p3}${p4}${p5}`;
}

function generateAddress(rng) {
  const city = pick(CITIES, rng);
  const districts = DISTRICTS[city] || DISTRICTS.default;
  const district = pick(districts, rng);
  const street = pick(STREET_NAMES, rng);
  const apt = pick(APARTMENT_NAMES, rng);
  const no = randomInt(1, 120, rng);
  const door = randomInt(1, 20, rng);
  return `${street} No:${no} ${apt} D:${door}, ${district} / ${city}`;
}

function generateBrandAndModel(category, rng) {
  const catData = CATEGORY_BRAND_MODELS[category];
  if (!catData) return { brand: "Bilinmiyor", model: "Model-X" };

  const brand = pick(Object.keys(catData.brands), rng);
  const model = pick(catData.brands[brand], rng);
  return { brand, model };
}

function generateSerialNo(category, index, rng) {
  const prefix = category.slice(0, 2).toUpperCase();
  const year = String(randomInt(2019, 2026, rng));
  const num = String(index).padStart(6, "0");
  return `${prefix}${year}${num}`;
}

function generateNickname(name, surname, rng) {
  const base = pick(NICKNAMES, rng);
  if (!base) return null;
  if (rng() > 0.4) return base;
  return `${base} ${name}`;
}

function pickUsableStatuses() {
  return [
    ServiceStatus.KAYIT_ACILDI,
    ServiceStatus.TAMIRATTA,
    ServiceStatus.FIYAT_TEKLIFI_VERILDI,
    ServiceStatus.HAZIR,
    ServiceStatus.ODEME_BEKLIYOR,
    ServiceStatus.TESLIM_EDILDI,
    ServiceStatus.IPTAL_EDILDI,
    ServiceStatus.MUSTERI_REDDETTI,
  ];
}

// ---------- UI HELPERS ----------

function logo() {
  const l = `
  ╔══════════════════════════════════════════╗
  ║         SERVİS TAKİP - MOCK DATA         ║
  ║         Test verisi oluşturucu           ║
  ╚══════════════════════════════════════════╝`;
  return l;
}

function box(title, lines) {
  const width = 46;
  const top = `╔═ ${title} ${"═".repeat(Math.max(0, width - title.length - 3))}╗`;
  const body = lines.map((l) => `║ ${l}${" ".repeat(Math.max(0, width - l.length - 1))}║`);
  const bot = `╚${"═".repeat(width)}╝`;
  return [top, ...body, bot].join("\n");
}

function stat(label, value, width = 46) {
  const v = String(value);
  const pad = width - label.length - v.length - 2;
  return `${label}${" ".repeat(Math.max(0, pad - 1))}${v}`;
}

function divider() {
  return "─".repeat(46);
}

// ---------- MAIN ----------

async function main() {
  console.log(logo());
  console.log("");

  const isDanger = await ask("🔴 Bu script veritabanına MOCK (test) verisi ekler.\nMevcut verileri silmez. Yine de veritabanı yedeği almanız önerilir.\n\nVeritabanı adını doğrulayın. Devam? (evet/hayır): ");

  if (isDanger !== "evet") {
    console.log("İptal edildi.");
    rl.close();
    process.exit(0);
  }

  // -- CONFIGURE COUNTS --

  console.log("");
  console.log(box("Varsayılan Kayıt Sayıları", [
    stat("Müşteri", DEFAULT_COUNTS.customers),
    stat("Cihaz", DEFAULT_COUNTS.devices),
    stat("Servis Kaydı", DEFAULT_COUNTS.serviceRecords),
    stat("Ödeme", DEFAULT_COUNTS.payments),
    stat("Planlı İş", DEFAULT_COUNTS.scheduledTasks),
  ]));
  console.log("");

  const customize = await ask("Sayıları değiştirmek ister misiniz? (evet/hayır): ");
  const counts = { ...DEFAULT_COUNTS };

  if (customize === "evet") {
    console.log("");
    console.log("Her biri için istediğiniz sayıyı girin (boş bırakırsanız varsayılan kullanılır):");
    console.log("");

    const rawCust = await ask(`  Müşteri sayısı [${counts.customers}]: `);
    if (rawCust && !isNaN(Number(rawCust))) counts.customers = Math.max(1, Number(rawCust));

    const rawDev = await ask(`  Cihaz sayısı [${counts.devices}]: `);
    if (rawDev && !isNaN(Number(rawDev))) counts.devices = Math.max(1, Number(rawDev));

    const rawSr = await ask(`  Servis kaydı sayısı [${counts.serviceRecords}]: `);
    if (rawSr && !isNaN(Number(rawSr))) counts.serviceRecords = Math.max(1, Number(rawSr));

    const rawPay = await ask(`  Ödeme sayısı [${counts.payments}]: `);
    if (rawPay && !isNaN(Number(rawPay))) counts.payments = Math.max(1, Number(rawPay));

    const rawTask = await ask(`  Planlı iş sayısı [${counts.scheduledTasks}]: `);
    if (rawTask && !isNaN(Number(rawTask))) counts.scheduledTasks = Math.max(1, Number(rawTask));

    console.log("");
    console.log(box("Seçilen Kayıt Sayıları", [
      stat("Müşteri", counts.customers),
      stat("Cihaz", counts.devices),
      stat("Servis Kaydı", counts.serviceRecords),
      stat("Ödeme", counts.payments),
      stat("Planlı İş", counts.scheduledTasks),
    ]));
  }

  // -- BACKUP CONFIRMATION --
  console.log("");
  console.log(box("Yedekleme", [
    "İsterseniz pg_dump ile otomatik yedek alabilirim.",
    "Yedek ./backups/ klasörüne kaydedilir.",
  ]));

  const shouldBackup = await ask("\nYedek alınsın mı? (evet/hayır): ");
  let backupFile = null;
  if (shouldBackup === "evet") {
    try {
      backupFile = backupDatabase();
      console.log(`✅ Yedek tamamlandı: ${backupFile}`);
    } catch (e) {
      console.log(`⚠️  Yedek alınamadı: ${e.message}`);
      console.log("Devam etmek istiyor musunuz?");
      const cont = await ask("(evet/hayır): ");
      if (cont !== "evet") {
        console.log("İptal edildi.");
        rl.close();
        process.exit(0);
      }
    }
  } else {
    console.log("⚠️  Yedek alınmadı.");
  }

  // -- FIND COMPANY --
  console.log("");
  console.log("🔍 Veritabanı taranıyor...");

  const company = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
    include: { users: { take: 20 } },
  });

  if (!company) {
    console.log("❌ Veritabanında hiç şirket bulunamadı. Önce /tr/setup ile bir şirket ve admin oluşturun.");
    rl.close();
    process.exit(1);
  }

  console.log(`   Şirket: ${company.name}`);
  console.log(`   Kullanıcı: ${company.users.length} adet`);

  const users = company.users;
  if (users.length === 0) {
    console.log("❌ Şirket altında hiç kullanıcı yok.");
    rl.close();
    process.exit(1);
  }

  // -- FINAL WARNING --
  console.log("");
  console.log(box("⚠️  SON UYARI", [
    "Bu işlem veritabanına toplam:",
    ...Object.entries(counts).map(([k, v]) => `  • ${v} ${getLabel(k)}`),
    "",
    "ekleyecek. (İlişkisel tablolar dahil)",
  ]));
  console.log("");

  const finalOk = await ask("Onaylıyor musunuz? (evet/hayır): ");
  if (finalOk !== "evet") {
    console.log("İptal edildi.");
    rl.close();
    process.exit(0);
  }

  // -- GENERATE --
  const rng = createRng();
  console.log("\n⏳ Veri oluşturuluyor...\n");

  const progress = { customers: 0, devices: 0, serviceRecords: 0, payments: 0, scheduledTasks: 0 };
  let totalToCreate = counts.customers + counts.devices + counts.serviceRecords + counts.payments + counts.scheduledTasks;
  let doneSoFar = 0;

  function showProgress() {
    const pct = totalToCreate > 0 ? Math.round((doneSoFar / totalToCreate) * 100) : 0;
    const barLen = 30;
    const filled = Math.round((barLen * pct) / 100);
    const bar = "█".repeat(filled) + "░".repeat(barLen - filled);
    process.stdout.write(`\r  [${bar}] %${pct}`);
  }

  // Determine target counts
  // We'll generate customers sequentially, and per customer distribute devices, service records, payments, tasks

  // Let's compute: how many devices per customer, service records per customer, etc.
  // We'll distribute them randomly across customers to match the totals

  // Simple approach: generate customers first, then randomly assign devices to customers until we hit device count,
  // then service records to devices, etc.

  showProgress();

  const createdCustomers = [];
  for (let i = 0; i < counts.customers; i += 1) {
    const name = pick(FIRST_NAMES, rng);
    const surname = pick(LAST_NAMES, rng);
    const nickname = generateNickname(name, surname, rng);

    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        name,
        surname,
        phone: generatePhone(rng),
        email: generateEmail(name, surname, i + 1, rng),
        address: generateAddress(rng),
        nickname,
      },
    });
    createdCustomers.push(customer);
    progress.customers += 1;
    doneSoFar += 1;
    if (doneSoFar % 25 === 0) showProgress();
  }

  // Devices
  const createdDevices = [];
  const customerIdsForDevices = [];
  for (let i = 0; i < counts.customers; i += 1) {
    const times = Math.ceil(counts.devices / counts.customers);
    for (let d = 0; d < times; d += 1) {
      customerIdsForDevices.push(createdCustomers[i].id);
    }
  }
  // shuffle and take first `counts.devices`
  for (let i = customerIdsForDevices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [customerIdsForDevices[i], customerIdsForDevices[j]] = [customerIdsForDevices[j], customerIdsForDevices[i]];
  }
  const selectedCustForDev = customerIdsForDevices.slice(0, counts.devices);

  for (let i = 0; i < selectedCustForDev.length; i += 1) {
    const custId = selectedCustForDev[i];
    const category = pick(Object.keys(CATEGORY_BRAND_MODELS), rng);
    const { brand, model } = generateBrandAndModel(category, rng);

    const device = await prisma.device.create({
      data: {
        companyId: company.id,
        customerId: custId,
        category,
        brand,
        model,
        serialNo: generateSerialNo(category, i + 1, rng),
        notes: rng() > 0.55 ? pickWeighted([
          { value: "İkinci el cihaz", weight: 2 },
          { value: "Garantili", weight: 3 },
          { value: "Garanti süresi dolmuş", weight: 3 },
          { value: "Sıfır cihaz", weight: 2 },
          { value: "Yedek cihaz", weight: 1 },
          { value: "Faturalı", weight: 2 },
          { value: "Elden teslim alındı", weight: 1 },
          { value: "Kutusuyla birlikte", weight: 1 },
        ], rng) : null,
      },
    });
    createdDevices.push(device);
    progress.devices += 1;
    doneSoFar += 1;
    if (doneSoFar % 25 === 0) showProgress();
  }

  // Service Records
  const createdRecords = [];
  const deviceIdsForSr = [];
  for (let i = 0; i < createdDevices.length; i += 1) {
    const times = Math.ceil(counts.serviceRecords / createdDevices.length);
    for (let d = 0; d < times; d += 1) {
      deviceIdsForSr.push(createdDevices[i].id);
    }
  }
  for (let i = deviceIdsForSr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [deviceIdsForSr[i], deviceIdsForSr[j]] = [deviceIdsForSr[j], deviceIdsForSr[i]];
  }
  const selectedDeviceIdsForSr = deviceIdsForSr.slice(0, counts.serviceRecords);

  // We need a map of device -> customerId quickly
  const deviceCustomerMap = {};
  for (const d of createdDevices) {
    deviceCustomerMap[d.id] = d.customerId;
  }

  const statusesAvailable = pickUsableStatuses();
  for (let i = 0; i < selectedDeviceIdsForSr.length; i += 1) {
    const deviceId = selectedDeviceIdsForSr[i];
    const custId = deviceCustomerMap[deviceId];

    const status = pick(statusesAvailable, rng);
    const fault = pick(FAULTS, rng);

    const record = await prisma.serviceRecord.create({
      data: {
        companyId: company.id,
        customerId: custId,
        deviceId,
        faultDescription: fault,
        status,
        priority: pickWeighted([
          { value: ServicePriority.DUSUK, weight: 2 },
          { value: ServicePriority.NORMAL, weight: 5 },
          { value: ServicePriority.YUKSEK, weight: 2 },
          { value: ServicePriority.ACIL, weight: 1 },
        ], rng),
        assignedUserId: pick(users, rng).id,
        pricing: rng() > 0.25 ? randomDecimal(150, 18000, 2, rng) : null,
        createdAt: formatDate(randomInt(0, 120, rng), rng),
      },
    });
    createdRecords.push(record);
    progress.serviceRecords += 1;
    doneSoFar += 1;
    if (doneSoFar % 25 === 0) showProgress();

    // Status history
    let lastStatus = ServiceStatus.KAYIT_ACILDI;
    const historyEntries = [{ fromStatus: null, toStatus: lastStatus }];

    if (lastStatus !== status && rng() > 0.2) {
      const possibleNext = statusesAvailable.filter((s) => s !== lastStatus);
      const nextStatus = pick(possibleNext, rng);
      if (nextStatus !== lastStatus) {
        historyEntries.push({ fromStatus: lastStatus, toStatus: nextStatus });
        lastStatus = nextStatus;
      }
    }
    if (lastStatus !== status) {
      historyEntries.push({ fromStatus: lastStatus, toStatus: status });
      lastStatus = status;
    }

    for (let h = 0; h < historyEntries.length; h += 1) {
      await prisma.serviceStatusHistory.create({
        data: {
          serviceRecordId: record.id,
          fromStatus: historyEntries[h].fromStatus,
          toStatus: historyEntries[h].toStatus,
          changedById: pick(users, rng).id,
          createdAt: formatDate(randomInt(2, 80, rng), rng),
        },
      });
    }

    // Service notes
    if (rng() > 0.4) {
      const noteCount = randomInt(1, 3, rng);
      for (let n = 0; n < noteCount; n += 1) {
        await prisma.serviceNote.create({
          data: {
            serviceRecordId: record.id,
            content: pick(NOTE_TEMPLATES, rng),
            isCustomerVisible: rng() > 0.4,
            authorId: pick(users, rng).id,
            createdAt: formatDate(randomInt(0, 60, rng), rng),
          },
        });
      }
    }

    // Payments linked to service record
    if (progress.payments < counts.payments && rng() > 0.35) {
      const payCount = randomInt(1, 2, rng);
      for (let p = 0; p < payCount && progress.payments < counts.payments; p += 1) {
        const isDebt = p === 0 || rng() > 0.5;
        await prisma.payment.create({
          data: {
            companyId: company.id,
            customerId: custId,
            serviceRecordId: record.id,
            type: isDebt ? PaymentType.BORC : PaymentType.TAHSILAT,
            paymentMethod: pick(Object.values(PaymentMethod), rng),
            amount: isDebt ? randomDecimal(250, 12000, 2, rng) : randomDecimal(100, 8000, 2, rng),
            date: formatDate(randomInt(0, 90, rng), rng),
            description: isDebt ? pick(["Servis ücreti", "Tamir ücreti", "Parça bedeli", "İşçilik ücreti", "Keşif ücreti"], rng) : pick(["Nakit tahsilat", "Kredi kartı tahsilat", "Havale/EFT"], rng),
          },
        });
        progress.payments += 1;
        doneSoFar += 1;
        if (doneSoFar % 25 === 0) showProgress();
      }
    }
  }

  // Remaining payments (standalone, not linked to any service record)
  const remainingPayments = counts.payments - progress.payments;
  if (remainingPayments > 0) {
    const payCustIds = [];
    for (let i = 0; i < remainingPayments; i += 1) {
      payCustIds.push(pick(createdCustomers, rng).id);
    }
    for (let i = 0; i < payCustIds.length; i += 1) {
      const custId = payCustIds[i];
      const isDebt = rng() > 0.4;
      await prisma.payment.create({
          data: {
            companyId: company.id,
            customerId: custId,
            type: isDebt ? PaymentType.BORC : PaymentType.TAHSILAT,
            paymentMethod: pick(Object.values(PaymentMethod), rng),
            amount: isDebt ? randomDecimal(100, 15000, 2, rng) : randomDecimal(50, 10000, 2, rng),
            date: formatDate(randomInt(0, 180, rng), rng),
            description: isDebt ? pick(["Genel borç", "Vade farkı", "Önceki hizmet", "Cari hesap"], rng) : pick(["Elden ödeme", "Kart ile ödeme", "Havale/EFT"], rng),
        },
      });
      progress.payments += 1;
      doneSoFar += 1;
      if (doneSoFar % 25 === 0) showProgress();
    }
  }

  // Scheduled Tasks
  const taskCustIds = [];
  for (let i = 0; i < counts.scheduledTasks; i += 1) {
    taskCustIds.push(pick(createdCustomers, rng).id);
  }
  for (let i = 0; i < taskCustIds.length; i += 1) {
    const custId = taskCustIds[i];
    const title = pick(TASK_TITLES, rng);
    await prisma.scheduledTask.create({
      data: {
        companyId: company.id,
        customerId: custId,
        title,
        description: rng() > 0.3 ? pickWeighted([
          { value: "Müşteriyle iletişime geçildi, randevu bekleniyor.", weight: 2 },
          { value: "Yedek parça sipariş edildi.", weight: 2 },
          { value: "Adreste kimse olmadı, yeniden planlanacak.", weight: 1 },
          { value: "Ön keşif yapıldı, fiyat teklifi hazırlanacak.", weight: 1 },
          { value: "Müşteri onayı alındı.", weight: 2 },
          null,
        ], rng) : null,
        taskType: pickWeighted([
          { value: TaskType.CIHAZ_ALINACAK, weight: 2 },
          { value: TaskType.CIHAZ_BIRAKILACAK, weight: 2 },
          { value: TaskType.BAKIM, weight: 3 },
          { value: TaskType.KURULUM, weight: 2 },
          { value: TaskType.DIGER, weight: 1 },
        ], rng),
        date: newDateForward(TUNABLES.scheduledTaskDays.min, TUNABLES.scheduledTaskDays.max, rng),
        status: pickWeighted([
          { value: TaskStatus.PLANLANDI, weight: 4 },
          { value: TaskStatus.DEVAM_EDIYOR, weight: 2 },
          { value: TaskStatus.TAMAMLANDI, weight: 3 },
          { value: TaskStatus.IPTAL, weight: 1 },
        ], rng),
        assignedUserId: pick(users, rng).id,
      },
    });
    progress.scheduledTasks += 1;
    doneSoFar += 1;
    if (doneSoFar % 50 === 0) showProgress();
  }

  showProgress();
  console.log("\n");

  // -- SUMMARY --
  const actualCounts = {
    customers: await prisma.customer.count(),
    devices: await prisma.device.count(),
    serviceRecords: await prisma.serviceRecord.count(),
    payments: await prisma.payment.count(),
    scheduledTasks: await prisma.scheduledTask.count(),
  };

  console.log("");
  console.log(box("✅ İşlem Tamamlandı", [
    "Kayıt sayıları:",
    divider(),
    stat("Müşteri", actualCounts.customers),
    stat("Cihaz", actualCounts.devices),
    stat("Servis Kaydı", actualCounts.serviceRecords),
    stat("Ödeme", actualCounts.payments),
    stat("Planlı İş", actualCounts.scheduledTasks),
    "",
    `Toplam: ${actualCounts.customers + actualCounts.devices + actualCounts.serviceRecords + actualCounts.payments + actualCounts.scheduledTasks} kayıt`,
  ]));

  if (backupFile) {
    console.log(box("Yedek", [`📍 ${backupFile}`]));
  }

  console.log("");
  console.log("Mock veri oluşturma tamamlandı.");
  rl.close();
}

function getLabel(key) {
  const labels = {
    customers: "Müşteri",
    devices: "Cihaz",
    serviceRecords: "Servis Kaydı",
    payments: "Ödeme",
    scheduledTasks: "Planlı İş",
  };
  return labels[key] || key;
}

function getDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL gerekli");
  }
  return url;
}

function backupDatabase() {
  const dbUrl = getDbUrl();
  const backupsDir = join(process.cwd(), "backups");
  if (!existsSync(backupsDir)) {
    mkdirSync(backupsDir, { recursive: true });
  }

  const filePath = join(backupsDir, `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
  console.log(`📦 Yedek alınıyor: ${filePath}`);

  const result = spawnSync("pg_dump", ["--format=plain", "--no-owner", "--no-privileges", "--file", filePath, `--dbname=${dbUrl}`], {
    stdio: "inherit",
    shell: false,
    timeout: 120000,
  });

  if (result.status !== 0) {
    throw new Error("pg_dump başarısız oldu.");
  }

  return filePath;
}

main()
  .catch((error) => {
    console.error("\n❌ Hata:", error.message || error);
    console.error(error.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
