import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ornek.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "sifre123";
  const companyName = process.env.COMPANY_NAME || "Demo Servis";
  const companySlug = process.env.COMPANY_SLUG || "demo-servis";

  const existing = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existing) {
    console.log("Seed verisi zaten mevcut.");
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
          name: "Admin",
          surname: "Kullanıcı",
          role: "ADMIN",
        },
      },
    },
  });

  console.log(`Şirket oluşturuldu: ${company.name} (${company.id})`);
  console.log(`Admin kullanıcı: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
