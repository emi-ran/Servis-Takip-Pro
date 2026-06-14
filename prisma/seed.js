const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} gerekli`);
  }
  return value;
}

async function main() {
  const adminEmail = requireEnv("ADMIN_EMAIL");
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const adminName = requireEnv("ADMIN_NAME");
  const adminSurname = requireEnv("ADMIN_SURNAME");
  const companyName = requireEnv("COMPANY_NAME");
  const companySlug = requireEnv("COMPANY_SLUG");

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
