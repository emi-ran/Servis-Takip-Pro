const { PrismaClient, ServiceStatus, ServicePriority, PaymentType, PaymentMethod, TaskType, TaskStatus } = require("@prisma/client");
const { spawnSync } = require("child_process");
const { mkdirSync, existsSync } = require("fs");
const { join } = require("path");
const readline = require("readline");

const prisma = new PrismaClient();

const DEFAULT_COUNTS = {
  customers: 250,
  devicesPerCustomer: 2,
  serviceRecordsPerDevice: 3,
  paymentsPerCustomer: 2,
  tasksPerCustomer: 1,
};

const FIRST_NAMES = [
  "Ahmet",
  "Mehmet",
  "Ayşe",
  "Fatma",
  "Ali",
  "Merve",
  "Can",
  "Deniz",
  "Elif",
  "Serkan",
  "Zeynep",
  "Hakan",
  "Ece",
  "Berk",
  "Derya",
  "Umut",
];

const LAST_NAMES = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Şahin",
  "Çelik",
  "Arslan",
  "Aydın",
  "Koç",
  "Özkan",
  "Polat",
  "Taş",
  "Güneş",
];

const COMPANIES = [
  "Teknik Servis",
  "Tamir Merkezi",
  "Elektronik Çözüm",
  "Beyaz Eşya Servisi",
  "Mobil Destek",
];

const CATEGORIES = ["Laptop", "Buzdolabı", "Çamaşır Makinesi", "Televizyon", "Klima", "Tablet", "Telefon"];
const BRANDS = ["Samsung", "Arçelik", "Bosch", "LG", "Vestel", "Apple", "HP", "Lenovo", "Sony", "Philips"];
const FAULTS = [
  "Açılmıyor",
  "Ekran problemi",
  "Ses gelmiyor",
  "Kapanıyor",
  "Isınma sorunu",
  "Su kaçırıyor",
  "Güç almıyor",
  "Yavaş çalışma",
  "Bağlantı kopuyor",
  "Fan sesi yüksek",
];

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

function randomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function formatDate(daysAgo, rng) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 18, rng), randomInt(0, 59, rng), randomInt(0, 59, rng), 0);
  return date;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirmDanger(stage, message) {
  console.log("");
  console.log(`DİKKAT ${stage}/4: BU İŞLEM TEHLİKELİDİR.`);
  console.log(message);
  const answer = await ask(`Devam etmek için EXACT olarak "${stage}" yaz: `);
  if (answer !== String(stage)) {
    throw new Error("Onay verilmedi.");
  }
}

async function confirmBackupChoice() {
  console.log("");
  const answer = await ask("İşlemden önce otomatik yedek alınsın mı? (evet/hayır): ");
  return answer.toLowerCase() === "evet";
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
  console.log(`Yedek alınıyor: ${filePath}`);

  const result = spawnSync("pg_dump", ["--format=plain", "--no-owner", "--no-privileges", "--file", filePath, `--dbname=${dbUrl}`], {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error("pg_dump başarısız oldu.");
  }

  return filePath;
}

async function main() {
  const rng = createRng();
  const customersCount = Number(process.env.MOCK_CUSTOMERS || DEFAULT_COUNTS.customers);
  const devicesPerCustomer = Number(process.env.MOCK_DEVICES_PER_CUSTOMER || DEFAULT_COUNTS.devicesPerCustomer);
  const serviceRecordsPerDevice = Number(process.env.MOCK_SERVICE_RECORDS_PER_DEVICE || DEFAULT_COUNTS.serviceRecordsPerDevice);
  const paymentsPerCustomer = Number(process.env.MOCK_PAYMENTS_PER_CUSTOMER || DEFAULT_COUNTS.paymentsPerCustomer);
  const tasksPerCustomer = Number(process.env.MOCK_TASKS_PER_CUSTOMER || DEFAULT_COUNTS.tasksPerCustomer);

  console.log("Bu script çok tehlikelidir ve veritabanını büyük miktarda test verisi ile doldurur.");
  console.log("Yanlış veritabanında çalıştırırsan geri dönüş zor olabilir.");
  console.log("Yedek almak isteyip istemediğin ayrıca sorulacak, ama yine de dikkatli ol.");
  console.log("Bu son uyarıdır.");

  await confirmDanger(1, "Veritabanına binlerce mock kayıt yazılacak.");
  await confirmDanger(2, "Bu işlem mevcut veriyi silmez ama ciddi miktarda yeni satır oluşturur.");
  await confirmDanger(3, "İşlemden önce yedek almak isteyip istemediğin sorulacak.");
  await confirmDanger(4, "Yanlış DB bağlantısı varsa bunu sonra geri almak zor olabilir.");

  const shouldBackup = await confirmBackupChoice();
  if (shouldBackup) {
    const backupFile = backupDatabase();
    console.log(`Yedek tamamlandı: ${backupFile}`);
  } else {
    console.log("Yedek atlandı; dikkatli ol.");
  }

  const company = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
    include: { users: true },
  });

  if (!company) {
    throw new Error("Önce seed ile en az bir company/admin oluşturmalısın.");
  }

  const users = company.users;
  if (users.length === 0) {
    throw new Error("Company altında kullanıcı bulunamadı.");
  }

  const customers = [];
  const devices = [];
  const serviceRecords = [];
  const payments = [];
  const scheduledTasks = [];

  for (let i = 0; i < customersCount; i += 1) {
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        name: pick(FIRST_NAMES, rng),
        surname: pick(LAST_NAMES, rng),
        phone: `05${randomInt(10, 99, rng)} ${randomInt(100, 999, rng)} ${randomInt(10, 99, rng)} ${randomInt(10, 99, rng)}`,
        email: `musteri${i + 1}@ornek.com`,
        address: `${randomInt(1, 400, rng)}. Sokak No:${randomInt(1, 40, rng)} / İstanbul`,
        nickname: rng() > 0.7 ? `K${i + 1}` : null,
      },
    });
    customers.push(customer);

    for (let d = 0; d < devicesPerCustomer; d += 1) {
      const device = await prisma.device.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          category: pick(CATEGORIES, rng),
          brand: pick(BRANDS, rng),
          model: `Model-${randomInt(100, 999, rng)}`,
          serialNo: `SN-${i + 1}-${d + 1}-${randomInt(100000, 999999, rng)}`,
          notes: rng() > 0.5 ? "Test verisi" : null,
        },
      });
      devices.push(device);

      for (let s = 0; s < serviceRecordsPerDevice; s += 1) {
        const statusPool = [
          ServiceStatus.KAYIT_ACILDI,
          ServiceStatus.TAMIRATTA,
          ServiceStatus.FIYAT_TEKLIFI_VERILDI,
          ServiceStatus.HAZIR,
          ServiceStatus.ODEME_BEKLIYOR,
          ServiceStatus.TESLIM_EDILDI,
          ServiceStatus.IPTAL_EDILDI,
          ServiceStatus.MUSTERI_REDDETTI,
        ];
        const status = pick(statusPool, rng);
        const record = await prisma.serviceRecord.create({
          data: {
            companyId: company.id,
            customerId: customer.id,
            deviceId: device.id,
            faultDescription: pick(FAULTS, rng),
            status,
            priority: pick(Object.values(ServicePriority), rng),
            assignedUserId: pick(users, rng).id,
            pricing: rng() > 0.3 ? Number(randomInt(250, 15000, rng)).toFixed(2) : null,
          },
        });
        serviceRecords.push(record);

        await prisma.serviceStatusHistory.create({
          data: {
            serviceRecordId: record.id,
            fromStatus: null,
            toStatus: status,
            changedById: pick(users, rng).id,
          },
        });

        if (rng() > 0.4) {
          await prisma.serviceNote.create({
            data: {
              serviceRecordId: record.id,
              content: `Otomatik test notu #${record.trackingNo}`,
              isCustomerVisible: rng() > 0.5,
              authorId: pick(users, rng).id,
            },
          });
        }

        if (rng() > 0.5) {
          payments.push(
            await prisma.payment.create({
              data: {
                companyId: company.id,
                customerId: customer.id,
                serviceRecordId: record.id,
                type: PaymentType.BORC,
                amount: Number(randomInt(200, 9000, rng)).toFixed(2),
                paymentMethod: pick(Object.values(PaymentMethod), rng),
                date: formatDate(randomInt(0, 120, rng), rng),
                description: "Test borcu",
              },
            })
          );

          if (rng() > 0.5) {
            payments.push(
              await prisma.payment.create({
                data: {
                  companyId: company.id,
                  customerId: customer.id,
                  serviceRecordId: record.id,
                  type: PaymentType.TAHSILAT,
                  amount: Number(randomInt(100, 7000, rng)).toFixed(2),
                  paymentMethod: pick(Object.values(PaymentMethod), rng),
                  date: formatDate(randomInt(0, 90, rng), rng),
                  description: "Test tahsilatı",
                },
              })
            );
          }
        }
      }
    }

    for (let p = 0; p < paymentsPerCustomer; p += 1) {
      payments.push(
        await prisma.payment.create({
          data: {
            companyId: company.id,
            customerId: customer.id,
            type: pick([PaymentType.BORC, PaymentType.TAHSILAT], rng),
            amount: Number(randomInt(100, 12000, rng)).toFixed(2),
            paymentMethod: pick(Object.values(PaymentMethod), rng),
            date: formatDate(randomInt(0, 180, rng), rng),
            description: "Bağımsız test kaydı",
          },
        })
      );
    }

    for (let t = 0; t < tasksPerCustomer; t += 1) {
      scheduledTasks.push(
        await prisma.scheduledTask.create({
          data: {
            companyId: company.id,
            customerId: customer.id,
            title: `${pick(["Cihaz alınacak", "Cihaz bırakılacak", "Bakım", "Kurulum", "Kontrol"], rng)}`,
            description: "Mock planlı iş",
            taskType: pick(Object.values(TaskType), rng),
            date: formatDate(randomInt(-10, 30, rng), rng),
            status: pick(Object.values(TaskStatus), rng),
            assignedUserId: pick(users, rng).id,
          },
        })
      );
    }
  }

  console.log("Mock veri yüklendi.");
  console.log({
    customers: customers.length,
    devices: devices.length,
    serviceRecords: serviceRecords.length,
    payments: payments.length,
    scheduledTasks: scheduledTasks.length,
  });
}

main()
  .catch((error) => {
    console.error("[mock-data]", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
