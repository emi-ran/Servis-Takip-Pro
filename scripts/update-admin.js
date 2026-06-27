require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });

async function main() {
  console.log("\n=== ADMIN BİLGİLERİ GÜNCELLEME SCRİPTİ ===\n");

  // 1. Veritabanında admin var mı kontrol et.
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    include: { company: true },
  });

  if (!adminUser) {
    console.log("❌ HATA: Veritabanında ADMIN rolüne sahip hiçbir kullanıcı bulunamadı!");
    console.log("Lütfen önce setup işlemini (/tr/setup) tamamlayın veya seed scriptini çalıştırın.");
    rl.close();
    process.exit(1);
  }

  // 2. Mevcut bilgileri göster (şifre hariç).
  console.log("Mevcut Admin Bilgileri:");
  console.log("-----------------------------------");
  console.log(`ID:           ${adminUser.id}`);
  console.log(`Ad:           ${adminUser.name}`);
  console.log(`Soyad:        ${adminUser.surname}`);
  console.log(`E-posta:      ${adminUser.email}`);
  console.log(`Şirket Adı:   ${adminUser.company?.name || "Bilinmiyor"}`);
  console.log(`Şirket Slug:  ${adminUser.company?.slug || "Bilinmiyor"}`);
  console.log("-----------------------------------\n");

  // 3. Kullanıcıyı uyar.
  console.log("⚠️  DİKKAT: Bu işlem admin bilgilerini ve şirket adını/slug'ını kalıcı olarak değiştirecektir.");
  console.log("Güncellemek istemediğiniz alanları boş bırakarak (Enter tuşuna basarak) geçebilirsiniz.");
  console.log("İşlemi iptal etmek için istediğiniz an Ctrl+C tuşlarına basabilirsiniz.\n");

  const confirm = await ask("Devam etmek istiyor musunuz? (evet/hayır): ");
  if (confirm.toLowerCase() !== "evet") {
    console.log("İşlem iptal edildi.");
    rl.close();
    process.exit(0);
  }

  console.log("\nYeni bilgileri giriniz:");

  // 4. Yeni bilgileri al.
  const newName = await ask(`Yeni Ad [${adminUser.name}]: `);
  const newSurname = await ask(`Yeni Soyad [${adminUser.surname}]: `);
  
  let newEmail = "";
  while (true) {
    const emailInput = await ask(`Yeni E-posta [${adminUser.email}]: `);
    if (emailInput === "") {
      break;
    }
    // E-posta formatı basitçe doğrulanabilir
    if (!emailInput.includes("@")) {
      console.log("❌ Lütfen geçerli bir e-posta adresi girin.");
      continue;
    }
    // Benzersizlik kontrolü
    if (emailInput !== adminUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: emailInput },
      });
      if (emailExists) {
        console.log(`❌ HATA: '${emailInput}' e-posta adresi başka bir kullanıcı tarafından kullanılıyor. Lütfen başka bir e-posta girin.`);
        continue;
      }
    }
    newEmail = emailInput;
    break;
  }

  let newPasswordHash = undefined;
  while (true) {
    const newPassword = await ask("Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın, en az 8 karakter): ");
    if (newPassword === "") {
      break;
    }
    if (newPassword.length < 8) {
      console.log("❌ Şifre en az 8 karakter olmalıdır. Lütfen tekrar deneyin.");
      continue;
    }
    newPasswordHash = await bcrypt.hash(newPassword, 12);
    break;
  }

  let newCompanyName = "";
  let newCompanySlug = "";
  if (adminUser.company) {
    newCompanyName = await ask(`Yeni Şirket Adı [${adminUser.company.name}]: `);
    
    if (newCompanyName !== "") {
      while (true) {
        const slugInput = await ask(`Yeni Şirket Slug [${adminUser.company.slug}]: `);
        if (slugInput === "") {
          break;
        }
        // Slug formatı kontrolü (küçük harfler, sayılar ve tire)
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slugInput)) {
          console.log("❌ Slug sadece küçük harf, rakam ve tire (-) içerebilir.");
          continue;
        }
        // Benzersizlik kontrolü
        if (slugInput !== adminUser.company.slug) {
          const slugExists = await prisma.company.findUnique({
            where: { slug: slugInput },
          });
          if (slugExists) {
            console.log(`❌ HATA: '${slugInput}' slug'ı başka bir şirket tarafından kullanılıyor. Lütfen başka bir slug girin.`);
            continue;
          }
        }
        newCompanySlug = slugInput;
        break;
      }
    }
  }

  // 5. Güncelleme İşlemi
  console.log("\n⏳ Bilgiler güncelleniyor...");

  const updateUserData = {};
  if (newName !== "") updateUserData.name = newName;
  if (newSurname !== "") updateUserData.surname = newSurname;
  if (newEmail !== "") updateUserData.email = newEmail;
  if (newPasswordHash) updateUserData.passwordHash = newPasswordHash;

  try {
    await prisma.$transaction(async (tx) => {
      // Şirket Güncelleme
      if (adminUser.companyId && newCompanyName !== "") {
        const companyUpdateData = { name: newCompanyName };
        if (newCompanySlug !== "") {
          companyUpdateData.slug = newCompanySlug;
        }
        await tx.company.update({
          where: { id: adminUser.companyId },
          data: companyUpdateData,
        });
      }

      // Kullanıcı Güncelleme
      if (Object.keys(updateUserData).length > 0) {
        await tx.user.update({
          where: { id: adminUser.id },
          data: updateUserData,
        });
      }
    });

    console.log("\n✅ Başarılı! Admin ve şirket bilgileri başarıyla güncellendi.");
    
    // Güncellenmiş bilgileri göster
    const updatedAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      include: { company: true },
    });
    console.log("\nGüncellenmiş Admin Bilgileri:");
    console.log("-----------------------------------");
    console.log(`Ad:           ${updatedAdmin.name}`);
    console.log(`Soyad:        ${updatedAdmin.surname}`);
    console.log(`E-posta:      ${updatedAdmin.email}`);
    console.log(`Şirket Adı:   ${updatedAdmin.company?.name || "Bilinmiyor"}`);
    console.log(`Şirket Slug:  ${updatedAdmin.company?.slug || "Bilinmiyor"}`);
    console.log("-----------------------------------\n");

  } catch (error) {
    console.log(`\n❌ HATA: Güncelleme sırasında bir sorun oluştu: ${error.message}`);
  }

  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    rl.close();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
