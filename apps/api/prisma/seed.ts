import { PrismaClient, UserStatus, CompanyStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const permissionsData = [
  { key: "service.create", module: "service", description: "Yeni servis kaydı oluşturma" },
  { key: "service.read", module: "service", description: "Servis kayıtlarını görüntüleme" },
  { key: "service.update", module: "service", description: "Servis kayıtlarını güncelleme" },
  { key: "service.delete", module: "service", description: "Servis kayıtlarını silme" },

  { key: "customer.create", module: "customer", description: "Yeni müşteri oluşturma" },
  { key: "customer.read", module: "customer", description: "Müşteri bilgilerini görüntüleme" },
  { key: "customer.update", module: "customer", description: "Müşteri bilgilerini güncelleme" },
  { key: "customer.delete", module: "customer", description: "Müşteri bilgilerini silme" },

  { key: "device.create", module: "device", description: "Yeni cihaz oluşturma" },
  { key: "device.read", module: "device", description: "Cihaz bilgilerini görüntüleme" },
  { key: "device.update", module: "device", description: "Cihaz bilgilerini güncelleme" },
  { key: "device.delete", module: "device", description: "Cihaz bilgilerini silme" },

  { key: "cash.create", module: "cash", description: "Kasa tahsilat/gider kaydı ekleme" },
  { key: "cash.read", module: "cash", description: "Kasa ve cari durumunu görüntüleme" },
  { key: "cash.update", module: "cash", description: "Kasa kayıtlarını düzenleme" },
  { key: "cash.delete", module: "cash", description: "Kasa kayıtlarını silme" },

  { key: "part.create", module: "part", description: "Yeni stok/parça tanımlama" },
  { key: "part.read", module: "part", description: "Stok/parça listesini görüntüleme" },
  { key: "part.update", module: "part", description: "Stok/parça miktarı ve fiyatı güncelleme" },
  { key: "part.delete", module: "part", description: "Stok/parça silme" },

  { key: "staff.create", module: "staff", description: "Yeni personel ekleme/davet etme" },
  { key: "staff.read", module: "staff", description: "Personel listesi ve performansını görme" },
  { key: "staff.update", module: "staff", description: "Personel bilgilerini/rollerini güncelleme" },
  { key: "staff.delete", module: "staff", description: "Personel çıkarma" },

  { key: "settings.read", module: "settings", description: "Firma ayarlarını görüntüleme" },
  { key: "settings.update", module: "settings", description: "Firma ayarlarını güncelleme" },

  { key: "audit_logs.read", module: "audit_logs", description: "Audit log kayıtlarını görüntüleme" },
  { key: "reports.read", module: "reports", description: "Raporları ve özet analizleri görüntüleme" },
];

const systemRoles = [
  {
    key: "ADMIN",
    name: "Firma Sahibi / Admin",
    description: "Tüm yetkilere sahip firma kurucusu/yöneticisi.",
    permissions: permissionsData.map((p) => p.key), // All permissions
  },
  {
    key: "MANAGER",
    name: "Yönetici",
    description: "Operasyonları yöneten, personel ve ayarları kısmen düzenleyen yönetici rolü.",
    permissions: permissionsData
      .map((p) => p.key)
      .filter((k) => k !== "settings.update" && k !== "staff.delete" && k !== "service.delete"),
  },
  {
    key: "TECHNICIAN",
    name: "Tekniker / Usta",
    description: "Servis kayıtlarını ve arızaları çözen saha/atölye usta personeli.",
    permissions: [
      "service.read",
      "service.create",
      "service.update",
      "customer.read",
      "customer.create",
      "customer.update",
      "device.read",
      "device.create",
      "device.update",
      "part.read",
      "part.create",
      "part.update",
    ],
  },
  {
    key: "APPRENTICE",
    name: "Çırak / Yardımcı",
    description: "Atanmış servis kayıtlarını okuyan ve basit notlar/fotoğraflar ekleyen yardımcı personel.",
    permissions: ["service.read", "service.update", "customer.read", "device.read", "part.read"],
  },
  {
    key: "ACCOUNTANT",
    name: "Muhasebe / Kasa",
    description: "Sadece cari hareketleri, ödeme ve giderleri yöneten finans personeli.",
    permissions: [
      "cash.read",
      "cash.create",
      "cash.update",
      "service.read",
      "customer.read",
      "device.read",
    ],
  },
];

async function main() {
  console.log("Seeding database started...");

  // 1. Seed Permissions
  console.log("Seeding permissions...");
  const dbPermissions = [];
  for (const perm of permissionsData) {
    const dbPerm = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, description: perm.description },
      create: { key: perm.key, module: perm.module, description: perm.description },
    });
    dbPermissions.push(dbPerm);
  }

  // 2. Seed System Roles and RolePermissions
  console.log("Seeding system roles...");
  for (const roleInfo of systemRoles) {
    let role = await prisma.role.findFirst({
      where: { companyId: null, key: roleInfo.key },
    });

    if (role) {
      role = await prisma.role.update({
        where: { id: role.id },
        data: { name: roleInfo.name, description: roleInfo.description },
      });
    } else {
      role = await prisma.role.create({
        data: {
          key: roleInfo.key,
          name: roleInfo.name,
          description: roleInfo.description,
          isSystem: true,
        },
      });
    }

    // Link permissions
    for (const permKey of roleInfo.permissions) {
      const permObj = dbPermissions.find((p) => p.key === permKey);
      if (permObj) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permObj.id } },
          update: {},
          create: { roleId: role.id, permissionId: permObj.id },
        });
      }
    }
  }

  // 3. Create Default Demo Company (for testing)
  console.log("Creating default demo company...");
  const company = await prisma.company.upsert({
    where: { slug: "demo-servis" },
    update: {},
    create: {
      name: "Demo Teknik Servis",
      slug: "demo-servis",
      shortCode: "DTS",
      phone: "0212 111 22 33",
      email: "demo@servistakip.com",
      address: "Mecidiyeköy, İstanbul",
      status: CompanyStatus.ACTIVE,
      defaultLocale: "tr",
      currency: "TRY",
    },
  });

  // 4. Create System Admin Role Copy for Demo Company
  // (In multi-tenant, each company gets a copy of roles linked to companyId if needed,
  // but users can be mapped directly to the global role or company-specific role copies.
  // Here we copy the ADMIN system role specifically for the demo company).
  const adminRole = await prisma.role.upsert({
    where: { companyId_key: { companyId: company.id, key: "ADMIN" } },
    update: {},
    create: {
      companyId: company.id,
      key: "ADMIN",
      name: "Firma Sahibi / Admin",
      description: "Firma Sahibi Rolü",
      isSystem: false,
    },
  });

  // Link all permissions to the demo company's admin role copy
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // 5. Create Default User (Demo Admin)
  console.log("Creating default user...");
  const passwordHash = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@servistakip.com" },
    update: { passwordHash },
    create: {
      name: "Demo Admin",
      email: "admin@servistakip.com",
      passwordHash,
      status: UserStatus.ACTIVE,
      locale: "tr",
    },
  });

  // 6. Map User to Demo Company with Admin Role
  console.log("Mapping user to company...");
  await prisma.companyUser.upsert({
    where: { companyId_userId: { companyId: company.id, userId: user.id } },
    update: { roleId: adminRole.id, isOwner: true, status: UserStatus.ACTIVE },
    create: {
      companyId: company.id,
      userId: user.id,
      roleId: adminRole.id,
      isOwner: true,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("Seeding database completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
