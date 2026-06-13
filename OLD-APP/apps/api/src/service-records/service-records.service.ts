import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceRecordDto } from "./dto/create-service-record.dto";
import { UpdateServiceRecordDto } from "./dto/update-service-record.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";

@Injectable()
export class ServiceRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateTrackingNo(companyId: string): Promise<string> {
    const year = new Date().getUTCFullYear().toString();
    const yearPrefix = `SRV-${year}-`;

    const lastRecord = await this.prisma.serviceRecord.findFirst({
      where: {
        companyId,
        trackingNo: { startsWith: yearPrefix },
      },
      orderBy: { trackingNo: "desc" },
      select: { trackingNo: true },
    });

    let nextSeq = 1;
    if (lastRecord) {
      const lastSeq = parseInt(lastRecord.trackingNo.slice(yearPrefix.length), 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    return `${yearPrefix}${String(nextSeq).padStart(6, "0")}`;
  }

  async create(companyId: string, userId: string, dto: CreateServiceRecordDto) {
    if (!dto.deviceId && !dto.newDevice) {
      throw new BadRequestException("deviceId veya newDevice alanlarından biri zorunludur.");
    }

    let deviceId = dto.deviceId;
    const trackingNo = await this.generateTrackingNo(companyId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.newDevice) {
        const createdDevice = await tx.device.create({
          data: {
            companyId,
            customerId: dto.customerId,
            category: dto.newDevice.brand ? `${dto.newDevice.brand} ${dto.newDevice.model}` : "OTHER",
            brand: dto.newDevice.brand || null,
            model: dto.newDevice.model || null,
            serialNo: dto.newDevice.serialNo || null,
          },
        });
        deviceId = createdDevice.id;
      }

      const record = await tx.serviceRecord.create({
        data: {
          companyId,
          trackingNo,
          customerId: dto.customerId,
          customerAddressId: dto.customerAddressId,
          deviceId: deviceId!,
          serviceType: dto.serviceType,
          status: "NEW",
          priority: dto.priority,
          faultDescription: dto.faultDescription,
          diagnosis: dto.diagnosis,
          internalNote: dto.internalNote,
          customerVisibleNote: dto.customerVisibleNote,
          assignedUserId: dto.assignedUserId,
          appointmentAt: dto.appointmentAt ? new Date(dto.appointmentAt) : undefined,
          createdByUserId: userId,
        },
      });

      await tx.serviceStatusHistory.create({
        data: {
          companyId,
          serviceRecordId: record.id,
          oldStatus: null,
          newStatus: "NEW",
          note: "Servis kaydı oluşturuldu.",
          changedByUserId: userId,
        },
      });

      if (dto.assignedUserId) {
        await tx.serviceAssignment.create({
          data: {
            companyId,
            serviceRecordId: record.id,
            userId: dto.assignedUserId,
            assignedByUserId: userId,
            note: "İlk atama",
          },
        });
      }

      return record;
    });
  }

  async findAll(
    companyId: string,
    search?: string,
    status?: string,
    priority?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { trackingNo: { contains: search, mode: "insensitive" } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { device: { brand: { contains: search, mode: "insensitive" } } },
        { device: { model: { contains: search, mode: "insensitive" } } },
        { device: { serialNo: { contains: search, mode: "insensitive" } } },
        { faultDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalCount, items] = await Promise.all([
      this.prisma.serviceRecord.count({ where }),
      this.prisma.serviceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          device: true,
        },
      }),
    ]);

    const formattedItems = items.map((item: any) => ({
      id: item.id,
      trackingCode: item.trackingNo,
      customerId: item.customerId,
      customerName: item.customer.fullName,
      customerPhone: item.customer.phone,
      deviceId: item.deviceId,
      deviceName: item.device.brand && item.device.model
        ? `${item.device.brand} ${item.device.model}`
        : item.device.category,
      issueSummary: item.faultDescription,
      status: item.status,
      priority: item.priority,
      receivedAt: item.createdAt.toISOString(),
      assigneeName: null as string | null,
    }));

    return {
      query: search || "",
      totalCount,
      hasMore: skip + items.length < totalCount,
      records: formattedItems,
    };
  }

  async findOne(companyId: string, id: string) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: true,
        device: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          where: { unassignedAt: null },
        },
        notes: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        payments: {
          where: { deletedAt: null, status: { notIn: ["CANCELLED", "REFUNDED"] } },
        },
        serviceParts: true,
      },
    }) as any;

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    const staffList = await this.prisma.companyUser.findMany({
      where: { companyId, status: "ACTIVE" },
      include: { user: true },
    });

    const activeAssignment = record.assignments?.[0];
    let assigneeName: string | null = null;
    if (activeAssignment) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: activeAssignment.userId },
        select: { name: true },
      });
      assigneeName = assignedUser?.name || null;
    }

    const timeline = record.statusHistory.map((h: any) => ({
      id: h.id,
      type: "STATUS_CHANGED" as const,
      createdAt: h.createdAt.toISOString(),
      actorName: "Sistem",
      title: `Durum ${h.newStatus} olarak güncellendi`,
      description: h.note || "",
      visibility: "INTERNAL" as const,
    }));

    const noteEvents = (record.notes || []).map((n: any) => ({
      id: n.id,
      type: "NOTE_ADDED" as const,
      createdAt: n.createdAt.toISOString(),
      actorName: "Sistem",
      title: "Not eklendi",
      description: n.body,
      visibility: n.isCustomerVisible ? ("CUSTOMER_SAFE" as const) : ("INTERNAL" as const),
    }));

    const allTimeline = [...timeline, ...noteEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const totalPaid = record.payments?.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    ) ?? 0;

    const estimatedPrice = record.estimatedPrice ? Number(record.estimatedPrice) : 0;
    const approvedPrice = record.approvedPrice ? Number(record.approvedPrice) : 0;

    return {
      id: record.id,
      trackingCode: record.trackingNo,
      status: record.status,
      priority: record.priority,
      serviceType: record.serviceType,
      receivedAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      issueSummary: record.faultDescription,
      diagnosis: record.diagnosis || "",
      internalNote: record.internalNote || "",
      customerVisibleNote: record.customerVisibleNote || "",
      customer: {
        id: record.customer.id,
        name: record.customer.fullName,
        phone: record.customer.phone,
      },
      device: {
        id: record.device.id,
        name: record.device.brand && record.device.model
          ? `${record.device.brand} ${record.device.model}`
          : record.device.category,
        brand: record.device.brand || "",
        model: record.device.model || "",
        serialNumber: record.device.serialNo || "",
      },
      assigneeId: activeAssignment?.userId || null,
      assigneeName,
      estimatedPrice,
      approvedPrice,
      totalPaid,
      timeline: allTimeline,
      operations: {
        staffOptions: staffList.map((cu: any) => ({
          id: cu.user.id,
          name: cu.user.name,
        })),
        payment: {
          currency: record.currency,
          outstandingAmount: Math.max(0, approvedPrice - totalPaid),
          collectedAmount: totalPaid,
          notePreview: record.customerVisibleNote || "",
        },
        parts: (record.serviceParts || []).map((sp: any) => ({
          id: sp.id,
          name: sp.name,
          sku: sp.partId || "",
          quantity: Number(sp.quantity),
          status: sp.isSupplied ? ("USED" as const) : ("RESERVED" as const),
        })),
      },
    };
  }

  async update(companyId: string, id: string, dto: UpdateServiceRecordDto) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    return this.prisma.serviceRecord.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        customerAddressId: dto.customerAddressId,
        deviceId: dto.deviceId,
        serviceType: dto.serviceType,
        priority: dto.priority,
        faultDescription: dto.faultDescription,
        diagnosis: dto.diagnosis,
        internalNote: dto.internalNote,
        customerVisibleNote: dto.customerVisibleNote,
        assignedUserId: dto.assignedUserId,
        appointmentAt: dto.appointmentAt ? new Date(dto.appointmentAt) : undefined,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    return this.prisma.serviceRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(companyId: string, id: string, userId: string, dto: UpdateStatusDto) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRecord.update({
        where: { id },
        data: {
          status: dto.status,
          completedAt: dto.status === "DELIVERED" || dto.status === "CANCELLED"
            ? new Date()
            : undefined,
          deliveredAt: dto.status === "DELIVERED" ? new Date() : undefined,
        },
      });

      const history = await tx.serviceStatusHistory.create({
        data: {
          companyId,
          serviceRecordId: id,
          oldStatus: record.status as any,
          newStatus: dto.status as any,
          note: dto.note || null,
          changedByUserId: userId,
        },
      });

      return { record: updated, history };
    });
  }

  async getTimeline(companyId: string, id: string) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    const history = await this.prisma.serviceStatusHistory.findMany({
      where: { serviceRecordId: id, companyId },
      orderBy: { createdAt: "desc" },
    });

    return history.map((h: any) => ({
      id: h.id,
      type: "STATUS_CHANGED",
      oldStatus: h.oldStatus,
      newStatus: h.newStatus,
      note: h.note || "",
      changedByUserId: h.changedByUserId,
      createdAt: h.createdAt.toISOString(),
    }));
  }

  async addNote(companyId: string, id: string, userId: string, dto: AddNoteDto) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    return this.prisma.serviceNote.create({
      data: {
        companyId,
        serviceRecordId: id,
        authorUserId: userId,
        body: dto.body,
        isCustomerVisible: dto.isCustomerVisible ?? false,
      },
    });
  }

  async getNotes(companyId: string, id: string) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    return this.prisma.serviceNote.findMany({
      where: { serviceRecordId: id, companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async assignStaff(companyId: string, id: string, userId: string, staffUserId: string, note?: string) {
    const record = await this.prisma.serviceRecord.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException("Servis kaydı bulunamadı.");
    }

    await this.prisma.serviceAssignment.updateMany({
      where: { serviceRecordId: id, companyId, unassignedAt: null },
      data: { unassignedAt: new Date() },
    });

    return this.prisma.serviceAssignment.create({
      data: {
        companyId,
        serviceRecordId: id,
        userId: staffUserId,
        assignedByUserId: userId,
        note: note || null,
      },
    });
  }
}
