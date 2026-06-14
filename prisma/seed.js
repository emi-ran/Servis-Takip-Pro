const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function optionalEnv(name) {
  return process.env[name];
}

async function main() {
  const adminEmail = optionalEnv("ADMIN_EMAIL");
  const adminPassword = optionalEnv("ADMIN_PASSWORD");
  const adminName = optionalEnv("ADMIN_NAME");
  const adminSurname = optionalEnv("ADMIN_SURNAME");
  const companyName = optionalEnv("COMPANY_NAME");
  const companySlug = optionalEnv("COMPANY_SLUG");

  if (!adminEmail || !adminPassword || !adminName || !adminSurname || !companyName || !companySlug) {
    console.log("Seed atlandı. İlk kurulumu web arayüzündeki /tr/setup ekranından tamamlayın.");
    return;
  }

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD en az 12 karakter olmalıdır");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log(`Seed atlandi, mevcut admin bulundu: ${existingAdmin.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      slug: companySlug,
      users: {
        create: {
          email: adminEmail,
          passwordHash,
          name: adminName,
          surname: adminSurname,
          role: "ADMIN",
        },
      },
    },
    include: {
      users: true,
    },
  });

  console.log(`Şirket oluşturuldu: ${company.name} (${company.id})`);
  console.log(`Admin kullanıcı oluşturuldu: ${company.users[0].email}`);
}

main()
  .catch((error) => {
    console.error("[seed]", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
