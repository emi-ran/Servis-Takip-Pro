-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('KAYIT_ACILDI', 'TAMIRATTA', 'FIYAT_TEKLIFI_VERILDI', 'MUSTERI_REDDETTI', 'HAZIR', 'ODEME_BEKLIYOR', 'TESLIM_EDILDI', 'IPTAL_EDILDI');

-- CreateEnum
CREATE TYPE "ServicePriority" AS ENUM ('DUSUK', 'NORMAL', 'YUKSEK', 'ACIL');

-- CreateEnum
CREATE TYPE "ServiceMode" AS ENUM ('SERVISTE', 'YERINDE', 'CIHAZ_ALINACAK', 'CIHAZ_BIRAKILACAK', 'BAKIM', 'KURULUM');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BORC', 'TAHSILAT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('NAKIT', 'KART', 'EFT', 'DIGER');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CIHAZ_ALINACAK', 'CIHAZ_BIRAKILACAK', 'BAKIM', 'KURULUM', 'DIGER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PLANLANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'IPTAL');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNo" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "trackingNo" SERIAL NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'KAYIT_ACILDI',
    "priority" "ServicePriority" NOT NULL DEFAULT 'NORMAL',
    "serviceMode" "ServiceMode" NOT NULL DEFAULT 'SERVISTE',
    "faultDescription" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "pricing" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceStatusHistory" (
    "id" TEXT NOT NULL,
    "serviceRecordId" TEXT NOT NULL,
    "fromStatus" "ServiceStatus",
    "toStatus" "ServiceStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceNote" (
    "id" TEXT NOT NULL,
    "serviceRecordId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCustomerVisible" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceRecordId" TEXT,
    "deviceId" TEXT,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceRecordId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PLANLANDI',
    "assignedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");

-- CreateIndex
CREATE INDEX "Customer_companyId_name_surname_idx" ON "Customer"("companyId", "name", "surname");

-- CreateIndex
CREATE INDEX "Device_companyId_idx" ON "Device"("companyId");

-- CreateIndex
CREATE INDEX "Device_customerId_idx" ON "Device"("customerId");

-- CreateIndex
CREATE INDEX "Device_serialNo_idx" ON "Device"("serialNo");

-- CreateIndex
CREATE INDEX "ServiceRecord_companyId_idx" ON "ServiceRecord"("companyId");

-- CreateIndex
CREATE INDEX "ServiceRecord_customerId_idx" ON "ServiceRecord"("customerId");

-- CreateIndex
CREATE INDEX "ServiceRecord_deviceId_idx" ON "ServiceRecord"("deviceId");

-- CreateIndex
CREATE INDEX "ServiceRecord_assignedUserId_idx" ON "ServiceRecord"("assignedUserId");

-- CreateIndex
CREATE INDEX "ServiceRecord_status_idx" ON "ServiceRecord"("status");

-- CreateIndex
CREATE INDEX "ServiceRecord_serviceMode_idx" ON "ServiceRecord"("serviceMode");

-- CreateIndex
CREATE INDEX "ServiceRecord_companyId_status_idx" ON "ServiceRecord"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRecord_companyId_trackingNo_key" ON "ServiceRecord"("companyId", "trackingNo");

-- CreateIndex
CREATE INDEX "ServiceStatusHistory_serviceRecordId_idx" ON "ServiceStatusHistory"("serviceRecordId");

-- CreateIndex
CREATE INDEX "ServiceNote_serviceRecordId_idx" ON "ServiceNote"("serviceRecordId");

-- CreateIndex
CREATE INDEX "Payment_companyId_idx" ON "Payment"("companyId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Payment_serviceRecordId_idx" ON "Payment"("serviceRecordId");

-- CreateIndex
CREATE INDEX "Payment_deviceId_idx" ON "Payment"("deviceId");

-- CreateIndex
CREATE INDEX "Payment_companyId_type_date_idx" ON "Payment"("companyId", "type", "date");

-- CreateIndex
CREATE INDEX "ScheduledTask_companyId_idx" ON "ScheduledTask"("companyId");

-- CreateIndex
CREATE INDEX "ScheduledTask_customerId_idx" ON "ScheduledTask"("customerId");

-- CreateIndex
CREATE INDEX "ScheduledTask_serviceRecordId_idx" ON "ScheduledTask"("serviceRecordId");

-- CreateIndex
CREATE INDEX "ScheduledTask_date_idx" ON "ScheduledTask"("date");

-- CreateIndex
CREATE INDEX "ScheduledTask_assignedUserId_idx" ON "ScheduledTask"("assignedUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceNote" ADD CONSTRAINT "ServiceNote_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceNote" ADD CONSTRAINT "ServiceNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
