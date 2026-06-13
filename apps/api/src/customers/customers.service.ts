import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateCustomerDto) {
    const { name, phone, secondaryPhone, email, taxNumber, taxOffice, note, address, city, district } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create customer
      const customer = await tx.customer.create({
        data: {
          companyId,
          fullName: name,
          phone,
          secondaryPhone,
          email,
          taxNumber,
          taxOffice,
          note,
          createdByUserId: userId,
        },
      });

      // 2. Create default address if provided
      if (address || city || district) {
        await tx.customerAddress.create({
          data: {
            companyId,
            customerId: customer.id,
            title: "Varsayılan Adres",
            city: city || "",
            district: district || "",
            addressLine: address || "",
            isDefault: true,
          },
        });
      }

      return customer;
    });
  }

  async findAll(companyId: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalCount, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          addresses: {
            where: { deletedAt: null, isDefault: true },
            take: 1,
          },
          _count: {
            select: {
              devices: { where: { deletedAt: null } },
              serviceRecords: { where: { deletedAt: null, status: { notIn: ["DELIVERED", "CANCELLED"] } } },
            },
          },
        },
      }) as Promise<any[]>,
    ]);

    const formattedItems = items.map((item: any) => {
      const defaultAddress = item.addresses[0];
      return {
        id: item.id,
        name: item.fullName,
        phone: item.phone,
        email: item.email || "",
        address: defaultAddress ? defaultAddress.addressLine : "",
        city: defaultAddress ? defaultAddress.city || "" : "",
        district: defaultAddress ? defaultAddress.district || "" : "",
        note: item.note || "",
        lastServiceAt: item.updatedAt.toISOString(),
        deviceCount: item._count.devices,
        openServiceCount: item._count.serviceRecords,
      };
    });

    return {
      query: search || "",
      totalCount,
      hasMore: skip + items.length < totalCount,
      items: formattedItems,
    };
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        addresses: {
          where: { deletedAt: null },
        },
        devices: {
          where: { deletedAt: null },
        },
        serviceRecords: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            device: true,
          },
        },
      },
    }) as any;

    if (!customer) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }

    const defaultAddress = customer.addresses.find((a: any) => a.isDefault) || customer.addresses[0];

    const formattedCustomer = {
      id: customer.id,
      name: customer.fullName,
      phone: customer.phone,
      email: customer.email || "",
      address: defaultAddress ? defaultAddress.addressLine : "",
      city: defaultAddress ? defaultAddress.city || "" : "",
      district: defaultAddress ? defaultAddress.district || "" : "",
      note: customer.note || "",
      lastServiceAt: customer.updatedAt.toISOString(),
    };

    const formattedDevices = customer.devices.map((d: any) => ({
      id: d.id,
      customerId: d.customerId,
      brand: d.brand || "",
      model: d.model || "",
      serialNumber: d.serialNo || "",
      type: d.category as any,
      nickname: d.note || `${d.brand} ${d.model}`,
    }));

    const formattedHistory = customer.serviceRecords.map((sr: any) => ({
      id: sr.id,
      customerId: sr.customerId,
      deviceId: sr.deviceId,
      trackingCode: sr.trackingNo,
      status: sr.status as any,
      receivedAt: sr.createdAt.toISOString(),
      deviceName: sr.device ? `${sr.device.brand} ${sr.device.model}` : null,
    }));

    return {
      customer: formattedCustomer,
      devices: formattedDevices,
      recentServiceRecords: formattedHistory,
    };
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }

    const { name, phone, secondaryPhone, email, taxNumber, taxOffice, note, address, city, district } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id },
        data: {
          fullName: name,
          phone,
          secondaryPhone,
          email,
          taxNumber,
          taxOffice,
          note,
        },
      });

      if (address || city || district) {
        const defaultAddress = await tx.customerAddress.findFirst({
          where: { customerId: id, isDefault: true, deletedAt: null },
        });

        if (defaultAddress) {
          await tx.customerAddress.update({
            where: { id: defaultAddress.id },
            data: {
              city,
              district,
              addressLine: address,
            },
          });
        } else {
          await tx.customerAddress.create({
            data: {
              companyId,
              customerId: id,
              title: "Varsayılan Adres",
              city: city || "",
              district: district || "",
              addressLine: address || "",
              isDefault: true,
            },
          });
        }
      }

      return updatedCustomer;
    });
  }

  async remove(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Devices Sub-module ---

  async createDevice(companyId: string, customerId: string, dto: CreateDeviceDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }

    return this.prisma.device.create({
      data: {
        companyId,
        customerId,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        serialNo: dto.serialNo,
        note: dto.note,
      },
    });
  }

  async updateDevice(companyId: string, customerId: string, deviceId: string, dto: UpdateDeviceDto) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, customerId, companyId, deletedAt: null },
    });

    if (!device) {
      throw new NotFoundException("Cihaz bulunamadı.");
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        serialNo: dto.serialNo,
        note: dto.note,
      },
    });
  }

  async removeDevice(companyId: string, customerId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, customerId, companyId, deletedAt: null },
    });

    if (!device) {
      throw new NotFoundException("Cihaz bulunamadı.");
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data: { deletedAt: new Date() },
    });
  }

  async findAllDevices(companyId: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { serialNo: { contains: search, mode: "insensitive" } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [totalCount, items] = await Promise.all([
      this.prisma.device.count({ where }),
      this.prisma.device.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          _count: {
            select: {
              serviceRecords: { where: { deletedAt: null, status: { notIn: ["DELIVERED", "CANCELLED"] } } },
            },
          },
        },
      }) as Promise<any[]>,
    ]);

    const formattedItems = items.map((item: any) => ({
      id: item.id,
      customerId: item.customerId,
      brand: item.brand || "",
      model: item.model || "",
      serialNumber: item.serialNo || "",
      type: item.category as any,
      nickname: item.note || `${item.brand} ${item.model}`,
      customer: {
        id: item.customer.id,
        name: item.customer.fullName,
        phone: item.customer.phone,
      },
      openServiceCount: item._count.serviceRecords,
      lastServiceAt: item.updatedAt.toISOString(),
    }));

    return {
      query: search || "",
      totalCount,
      hasMore: skip + items.length < totalCount,
      items: formattedItems,
    };
  }

  async findOneDevice(companyId: string, id: string) {
    const device = await this.prisma.device.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: {
          include: {
            addresses: {
              where: { deletedAt: null, isDefault: true },
              take: 1,
            },
          },
        },
        serviceRecords: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            device: true,
          },
        },
      },
    }) as any;

    if (!device) {
      throw new NotFoundException("Cihaz bulunamadı.");
    }

    const defaultAddress = device.customer.addresses[0];

    const formattedCustomer = {
      id: device.customer.id,
      name: device.customer.fullName,
      phone: device.customer.phone,
      email: device.customer.email || "",
      address: defaultAddress ? defaultAddress.addressLine : "",
      city: defaultAddress ? defaultAddress.city || "" : "",
      district: defaultAddress ? defaultAddress.district || "" : "",
      lastServiceAt: device.customer.updatedAt.toISOString(),
    };

    const formattedDevice = {
      id: device.id,
      customerId: device.customerId,
      brand: device.brand || "",
      model: device.model || "",
      serialNumber: device.serialNo || "",
      type: device.category as any,
      nickname: device.note || `${device.brand} ${device.model}`,
    };

    const formattedHistory = device.serviceRecords.map((sr: any) => ({
      id: sr.id,
      customerId: sr.customerId,
      deviceId: sr.deviceId,
      trackingCode: sr.trackingNo,
      status: sr.status as any,
      receivedAt: sr.createdAt.toISOString(),
      deviceName: sr.device ? `${sr.device.brand} ${sr.device.model}` : "",
    }));

    return {
      device: formattedDevice,
      customer: formattedCustomer,
      serviceHistory: formattedHistory,
    };
  }
}
