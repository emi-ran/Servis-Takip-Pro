import type { ServiceStatus } from "@/lib/api/service-records";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  note?: string;
  lastServiceAt: string;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  address: string;
  email?: string;
  city?: string;
  district?: string;
  note?: string;
};

export type CustomerDevice = {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  type: "PHONE" | "COMPUTER" | "WHITE_GOOD" | "TV";
  nickname: string;
};

export type CustomerServiceHistoryItem = {
  id: string;
  customerId: string;
  deviceId: string;
  trackingCode: string;
  status: ServiceStatus;
  receivedAt: string;
};

export type CustomersListItem = Customer & {
  deviceCount: number;
  openServiceCount: number;
};

export type CustomerListResult = {
  query: string;
  totalCount: number;
  hasMore: boolean;
  items: CustomersListItem[];
};

export type CustomerDetail = {
  customer: Customer;
  devices: CustomerDevice[];
  recentServiceRecords: Array<
    CustomerServiceHistoryItem & {
      deviceName: string | null;
    }
  >;
};

export type CustomerDeviceDetail = {
  customer: Customer;
  device: CustomerDevice;
  serviceHistory: Array<
    CustomerServiceHistoryItem & {
      deviceName: string | null;
    }
  >;
};

export type DeviceListItem = CustomerDevice & {
  customer: Pick<Customer, "id" | "name" | "phone">;
  openServiceCount: number;
  lastServiceAt: string | null;
};

export type DeviceListResult = {
  query: string;
  totalCount: number;
  hasMore: boolean;
  items: DeviceListItem[];
};

export type DeviceDetail = {
  device: CustomerDevice;
  customer: Customer;
  serviceHistory: Array<
    CustomerServiceHistoryItem & {
      deviceName: string;
    }
  >;
};

const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Ahmet Yılmaz",
    phone: "+90 532 000 10 10",
    email: "ahmet.yilmaz@example.com",
    address: "Rasimpaşa Mah. İnönü Cd. No:18 D:6",
    city: "İstanbul",
    district: "Kadıköy",
    note: "Akşam saatlerinde ulaşılabilir.",
    lastServiceAt: "2026-05-19T08:20:00.000Z",
  },
  {
    id: "cust-002",
    name: "Ayşe Demir",
    phone: "+90 533 111 20 20",
    email: "ayse.demir@example.com",
    address: "Atatürk Mah. Alemdağ Cd. No:45",
    city: "İstanbul",
    district: "Ümraniye",
    lastServiceAt: "2026-05-18T13:40:00.000Z",
  },
  {
    id: "cust-003",
    name: "Mehmet Öz",
    phone: "+90 535 222 30 30",
    email: "mehmet.oz@example.com",
    address: "Yahya Kaptan Mah. Gazi Mustafa Kemal Blv. No:22",
    city: "Kocaeli",
    district: "İzmit",
    lastServiceAt: "2026-05-18T09:05:00.000Z",
  },
  {
    id: "cust-004",
    name: "Zeynep Kaya",
    phone: "+90 537 333 40 40",
    email: "zeynep.kaya@example.com",
    address: "Levent Mah. Nispetiye Cd. No:9",
    city: "İstanbul",
    district: "Beşiktaş",
    lastServiceAt: "2026-05-17T15:30:00.000Z",
  },
  {
    id: "cust-005",
    name: "Selin Arslan",
    phone: "+90 539 555 60 60",
    email: "selin.arslan@example.com",
    address: "23 Nisan Mah. İzmir Yolu Cd. No:88",
    city: "Bursa",
    district: "Nilüfer",
    lastServiceAt: "2026-05-16T11:50:00.000Z",
  },
];

const devices: CustomerDevice[] = [
  {
    id: "dev-001",
    customerId: "cust-001",
    brand: "Samsung",
    model: "Galaxy S23",
    serialNumber: "SM-S911B-TR-10021",
    imei: "356732110002481",
    type: "PHONE",
    nickname: "Ana Telefon",
  },
  {
    id: "dev-002",
    customerId: "cust-001",
    brand: "Apple",
    model: "iPhone 13",
    serialNumber: "A2633-IMEI-94421",
    imei: "353847992451220",
    type: "PHONE",
    nickname: "Yedek Telefon",
  },
  {
    id: "dev-003",
    customerId: "cust-002",
    brand: "Bosch",
    model: "WGA142",
    serialNumber: "BS-WGA142-77210",
    type: "WHITE_GOOD",
    nickname: "Çamaşır Makinesi",
  },
  {
    id: "dev-004",
    customerId: "cust-003",
    brand: "Apple",
    model: "MacBook Pro M1",
    serialNumber: "APL-MBP-2021-31104",
    type: "COMPUTER",
    nickname: "Ofis Bilgisayarı",
  },
  {
    id: "dev-005",
    customerId: "cust-004",
    brand: "Sony",
    model: "Bravia 55 OLED",
    serialNumber: "SONY-BRV-55-76119",
    type: "TV",
    nickname: "Salon TV",
  },
  {
    id: "dev-006",
    customerId: "cust-005",
    brand: "Lenovo",
    model: "ThinkPad E14",
    serialNumber: "LEN-E14-44090",
    type: "COMPUTER",
    nickname: "İş Laptopu",
  },
];

const serviceHistory: CustomerServiceHistoryItem[] = [
  { id: "srv-201", customerId: "cust-001", deviceId: "dev-001", trackingCode: "SRV-2026-201", status: "IN_PROGRESS", receivedAt: "2026-05-19T08:20:00.000Z" },
  { id: "srv-207", customerId: "cust-001", deviceId: "dev-002", trackingCode: "SRV-2026-207", status: "DELIVERED", receivedAt: "2026-05-15T10:10:00.000Z" },
  { id: "srv-202", customerId: "cust-002", deviceId: "dev-003", trackingCode: "SRV-2026-202", status: "WAITING_PART", receivedAt: "2026-05-18T13:40:00.000Z" },
  {
    id: "srv-203",
    customerId: "cust-003",
    deviceId: "dev-004",
    trackingCode: "SRV-2026-203",
    status: "WAITING_CUSTOMER_APPROVAL",
    receivedAt: "2026-05-18T09:05:00.000Z",
  },
  { id: "srv-204", customerId: "cust-004", deviceId: "dev-005", trackingCode: "SRV-2026-204", status: "READY_FOR_DELIVERY", receivedAt: "2026-05-17T15:30:00.000Z" },
  { id: "srv-206", customerId: "cust-005", deviceId: "dev-006", trackingCode: "SRV-2026-206", status: "DELIVERED", receivedAt: "2026-05-16T11:50:00.000Z" },
];

function isOpenStatus(status: ServiceStatus) {
  return status !== "DELIVERED" && status !== "CANCELLED";
}

export async function searchCustomers(query: string, limit = 12): Promise<CustomerListResult> {
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

  const matchedCustomers = customers.filter((customer) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase("tr-TR");
    return searchable.includes(normalizedQuery);
  });

  const items: CustomersListItem[] = matchedCustomers.map((customer) => {
    const customerDevices = devices.filter((device) => device.customerId === customer.id);
    const customerServices = serviceHistory.filter((service) => service.customerId === customer.id);

    return {
      ...customer,
      deviceCount: customerDevices.length,
      openServiceCount: customerServices.filter((service) => isOpenStatus(service.status)).length,
    };
  });

  return {
    query,
    totalCount: items.length,
    hasMore: items.length > limit,
    items: items.slice(0, limit),
  };
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetail | null> {
  const customer = customers.find((entry) => entry.id === customerId);

  if (!customer) {
    return null;
  }

  const customerDevices = devices.filter((device) => device.customerId === customerId);
  const customerServices = serviceHistory
    .filter((service) => service.customerId === customerId)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .map((service) => {
      const device = devices.find((entry) => entry.id === service.deviceId);

      return {
        ...service,
        deviceName: device ? `${device.brand} ${device.model}` : null,
      };
    });

  return {
    customer,
    devices: customerDevices,
    recentServiceRecords: customerServices,
  };
}

export async function getCustomerDeviceDetail(customerId: string, deviceId: string): Promise<CustomerDeviceDetail | null> {
  const customer = customers.find((entry) => entry.id === customerId);

  if (!customer) {
    return null;
  }

  const device = devices.find((entry) => entry.id === deviceId && entry.customerId === customerId);

  if (!device) {
    return null;
  }

  const deviceServiceHistory = serviceHistory
    .filter((service) => service.customerId === customerId && service.deviceId === deviceId)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .map((service) => ({
      ...service,
      deviceName: `${device.brand} ${device.model}`,
    }));

  return {
    customer,
    device,
    serviceHistory: deviceServiceHistory,
  };
}

export async function createMockCustomer(input: CreateCustomerInput): Promise<{ customerId: string; customerName: string }> {
  const generatedId = `cust-mock-${Math.floor(Date.now() / 1000).toString(36)}`;

  return {
    customerId: generatedId,
    customerName: input.name.trim(),
  };
}

export async function searchDevices(query: string, limit = 30): Promise<DeviceListResult> {
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

  const items = devices
    .map((device) => {
      const customer = customers.find((entry) => entry.id === device.customerId);

      if (!customer) {
        return null;
      }

      const deviceServices = serviceHistory.filter((service) => service.deviceId === device.id);

      return {
        ...device,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
        },
        openServiceCount: deviceServices.filter((service) => isOpenStatus(service.status)).length,
        lastServiceAt: deviceServices.length > 0 ? deviceServices.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())[0].receivedAt : null,
      } satisfies DeviceListItem;
    })
    .filter((item): item is DeviceListItem => Boolean(item));

  const filteredItems = items.filter((device) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchable = `${device.brand} ${device.model} ${device.serialNumber} ${device.imei ?? ""} ${device.customer.name} ${device.customer.phone}`.toLocaleLowerCase(
      "tr-TR",
    );

    return searchable.includes(normalizedQuery);
  });

  return {
    query,
    totalCount: filteredItems.length,
    hasMore: filteredItems.length > limit,
    items: filteredItems.slice(0, limit),
  };
}

export async function getDeviceDetail(deviceId: string): Promise<DeviceDetail | null> {
  const device = devices.find((entry) => entry.id === deviceId);

  if (!device) {
    return null;
  }

  const customer = customers.find((entry) => entry.id === device.customerId);

  if (!customer) {
    return null;
  }

  const deviceName = `${device.brand} ${device.model}`;

  const deviceServiceHistory = serviceHistory
    .filter((service) => service.deviceId === deviceId && service.customerId === customer.id)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .map((service) => ({
      ...service,
      deviceName,
    }));

  return {
    device,
    customer,
    serviceHistory: deviceServiceHistory,
  };
}
