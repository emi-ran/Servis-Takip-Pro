export type ServiceStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_PART"
  | "WAITING_CUSTOMER_APPROVAL"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type ServicePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type MockCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type MockDevice = {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  serialOrImei: string;
  registeredAt?: string;
};

export type CreateServiceRecordInput = {
  customerId?: string;
  newCustomer?: {
    name: string;
    phone: string;
    email?: string;
  };
  deviceId?: string;
  newDevice?: {
    brand: string;
    model: string;
    serialOrImei?: string;
  };
  issueSummary: string;
  issueDescription: string;
  priority: ServicePriority;
  status: ServiceStatus;
  assigneeId: string;
  internalNote: string;
};

export type CreateServiceRecordFormOptions = {
  statuses: ServiceStatus[];
  priorities: ServicePriority[];
  customers: MockCustomer[];
  devices: MockDevice[];
  assignees: Array<{
    id: string;
    name: string;
  }>;
};

export type ServiceRecordPreselectionWarning = "customerNotFound" | "deviceNotFound" | "deviceCustomerMismatch";

export type ServiceRecordFormPreselection = {
  selectedCustomerId: string;
  selectedDeviceId: string;
  warning: ServiceRecordPreselectionWarning | null;
};

export type MockCustomerSearchResult = {
  query: string;
  minQueryLength: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
  customers: MockCustomer[];
};

export type ServiceRecordListItem = {
  id: string;
  trackingCode: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceId?: string;
  deviceName: string;
  issueSummary: string;
  status: ServiceStatus;
  priority: ServicePriority;
  receivedAt: string;
  assigneeName: string | null;
};

export type ServiceRecordsOverview = {
  updatedAt: string;
  records: ServiceRecordListItem[];
};

export type ServiceTimelineEventType = "STATUS_CHANGED" | "NOTE_ADDED" | "ASSIGNED" | "PART_ORDERED";

export type ServiceTimelineEvent = {
  id: string;
  type: ServiceTimelineEventType;
  createdAt: string;
  actorName: string;
  title: string;
  description: string;
};

export type ServiceRecordDetail = {
  id: string;
  trackingCode: string;
  status: ServiceStatus;
  priority: ServicePriority;
  receivedAt: string;
  issueSummary: string;
  customer: {
    name: string;
    phone: string;
  };
  device: {
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
  };
  assigneeName: string | null;
  timeline: ServiceTimelineEvent[];
};

export async function getServiceRecordsOverview(): Promise<ServiceRecordsOverview> {
  return {
    updatedAt: "2026-05-19T11:15:00.000Z",
    records: [
      {
        id: "srv-201",
        trackingCode: "SRV-2026-201",
        customerId: "cust-001",
        customerName: "Ahmet Yılmaz",
        customerPhone: "+90 532 000 10 10",
        deviceId: "dev-001",
        deviceName: "Samsung Galaxy S23",
        issueSummary: "Ekran değişimi sonrası test süreci devam ediyor",
        status: "IN_PROGRESS",
        priority: "HIGH",
        receivedAt: "2026-05-19T08:20:00.000Z",
        assigneeName: "Mert Aydın",
      },
      {
        id: "srv-202",
        trackingCode: "SRV-2026-202",
        customerId: "cust-002",
        customerName: "Ayşe Demir",
        customerPhone: "+90 533 111 20 20",
        deviceId: "dev-003",
        deviceName: "Bosch WGA142 Çamaşır Makinesi",
        issueSummary: "Pompa siparişi geçildi, parça bekleniyor",
        status: "WAITING_PART",
        priority: "NORMAL",
        receivedAt: "2026-05-18T13:40:00.000Z",
        assigneeName: "Ece Tunalı",
      },
      {
        id: "srv-203",
        trackingCode: "SRV-2026-203",
        customerId: "cust-003",
        customerName: "Mehmet Öz",
        customerPhone: "+90 535 222 30 30",
        deviceId: "dev-004",
        deviceName: "Apple MacBook Pro M1",
        issueSummary: "Sıvı teması sonrası ilk kontrol tamamlandı",
        status: "WAITING_CUSTOMER_APPROVAL",
        priority: "URGENT",
        receivedAt: "2026-05-18T09:05:00.000Z",
        assigneeName: "Burak Kılıç",
      },
      {
        id: "srv-204",
        trackingCode: "SRV-2026-204",
        customerId: "cust-004",
        customerName: "Zeynep Kaya",
        customerPhone: "+90 537 333 40 40",
        deviceId: "dev-005",
        deviceName: "Sony Bravia 55 OLED TV",
        issueSummary: "Panel testi tamamlandı, teslimat planlanıyor",
        status: "READY_FOR_DELIVERY",
        priority: "HIGH",
        receivedAt: "2026-05-17T15:30:00.000Z",
        assigneeName: "Mert Aydın",
      },
      {
        id: "srv-205",
        trackingCode: "SRV-2026-205",
        customerName: "Bora Akın",
        customerPhone: "+90 538 444 50 50",
        deviceName: "Dyson V15 Detect",
        issueSummary: "Batarya testi için ön kayıt açıldı",
        status: "NEW",
        priority: "LOW",
        receivedAt: "2026-05-19T10:10:00.000Z",
        assigneeName: null,
      },
      {
        id: "srv-206",
        trackingCode: "SRV-2026-206",
        customerName: "Selin Arslan",
        customerPhone: "+90 539 555 60 60",
        deviceName: "Lenovo ThinkPad E14",
        issueSummary: "Fan temizliği ve termal bakım tamamlandı",
        status: "DELIVERED",
        priority: "NORMAL",
        receivedAt: "2026-05-16T11:50:00.000Z",
        assigneeName: "Ece Tunalı",
      },
    ],
  };
}

const createServiceRecordFormOptions: CreateServiceRecordFormOptions = {
  statuses: ["NEW", "IN_PROGRESS", "WAITING_PART", "WAITING_CUSTOMER_APPROVAL", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  priorities: ["LOW", "NORMAL", "HIGH", "URGENT"],
  customers: [
    { id: "cust-001", name: "Ahmet Yılmaz", phone: "+90 532 000 10 10", email: "ahmet.yilmaz@example.com" },
    { id: "cust-002", name: "Ayşe Demir", phone: "+90 533 111 20 20", email: "ayse.demir@example.com" },
    { id: "cust-003", name: "Mehmet Öz", phone: "+90 535 222 30 30", email: "mehmet.oz@example.com" },
    { id: "cust-004", name: "Zeynep Kaya", phone: "+90 537 333 40 40", email: "zeynep.kaya@example.com" },
  ],
  devices: [
    { id: "dev-001", customerId: "cust-001", brand: "Samsung", model: "Galaxy S23", serialOrImei: "SM-S911B-TR-10021", registeredAt: "2026-02-11T09:15:00.000Z" },
    { id: "dev-002", customerId: "cust-001", brand: "Apple", model: "iPhone 13", serialOrImei: "A2633-IMEI-94421", registeredAt: "2025-12-08T13:40:00.000Z" },
    { id: "dev-003", customerId: "cust-002", brand: "Bosch", model: "WGA142", serialOrImei: "BS-WGA142-77210", registeredAt: "2026-01-22T16:05:00.000Z" },
    { id: "dev-004", customerId: "cust-003", brand: "Apple", model: "MacBook Pro M1", serialOrImei: "APL-MBP-2021-31104", registeredAt: "2025-11-19T10:30:00.000Z" },
    { id: "dev-005", customerId: "cust-004", brand: "Sony", model: "Bravia 55 OLED", serialOrImei: "SONY-BRV-55-76119", registeredAt: "2026-03-02T08:50:00.000Z" },
  ],
  assignees: [
    { id: "staff-001", name: "Mert Aydın" },
    { id: "staff-002", name: "Ece Tunalı" },
    { id: "staff-003", name: "Burak Kılıç" },
  ],
};

export async function getCreateServiceRecordFormOptions(): Promise<CreateServiceRecordFormOptions> {
  return createServiceRecordFormOptions;
}

export async function resolveServiceRecordFormPreselection(params: {
  customerId?: string;
  deviceId?: string;
}): Promise<ServiceRecordFormPreselection> {
  const customerId = params.customerId?.trim() ?? "";
  const deviceId = params.deviceId?.trim() ?? "";

  if (!customerId && !deviceId) {
    return {
      selectedCustomerId: "",
      selectedDeviceId: "",
      warning: null,
    };
  }

  const selectedCustomer = customerId ? createServiceRecordFormOptions.customers.find((customer) => customer.id === customerId) : undefined;
  const selectedDevice = deviceId ? createServiceRecordFormOptions.devices.find((device) => device.id === deviceId) : undefined;

  if (customerId && !selectedCustomer) {
    return {
      selectedCustomerId: "",
      selectedDeviceId: "",
      warning: "customerNotFound",
    };
  }

  if (deviceId && !selectedDevice) {
    return {
      selectedCustomerId: selectedCustomer?.id ?? "",
      selectedDeviceId: "",
      warning: "deviceNotFound",
    };
  }

  if (selectedCustomer && selectedDevice) {
    if (selectedDevice.customerId !== selectedCustomer.id) {
      return {
        selectedCustomerId: selectedCustomer.id,
        selectedDeviceId: "",
        warning: "deviceCustomerMismatch",
      };
    }

    return {
      selectedCustomerId: selectedCustomer.id,
      selectedDeviceId: selectedDevice.id,
      warning: null,
    };
  }

  if (selectedCustomer) {
    return {
      selectedCustomerId: selectedCustomer.id,
      selectedDeviceId: "",
      warning: null,
    };
  }

  if (selectedDevice) {
    return {
      selectedCustomerId: selectedDevice.customerId,
      selectedDeviceId: selectedDevice.id,
      warning: null,
    };
  }

  return {
    selectedCustomerId: "",
    selectedDeviceId: "",
    warning: null,
  };
}

export async function searchMockCustomers(query: string, limit = 8, minQueryLength = 2): Promise<MockCustomerSearchResult> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < minQueryLength) {
    return {
      query: normalizedQuery,
      minQueryLength,
      limit,
      totalCount: 0,
      hasMore: false,
      customers: [],
    };
  }

  const loweredQuery = normalizedQuery.toLocaleLowerCase("tr-TR");
  const matchedCustomers = createServiceRecordFormOptions.customers.filter((customer) => {
    const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase("tr-TR");
    return searchable.includes(loweredQuery);
  });

  return {
    query: normalizedQuery,
    minQueryLength,
    limit,
    totalCount: matchedCustomers.length,
    hasMore: matchedCustomers.length > limit,
    customers: matchedCustomers.slice(0, limit),
  };
}

export async function createMockServiceRecord(input: CreateServiceRecordInput): Promise<{ trackingCode: string }> {
  const year = new Date().getUTCFullYear();
  const randomNumber = Math.floor(Math.random() * 900 + 100);
  const trackingCode = `SRV-${year}-${randomNumber}`;

  void input;

  return { trackingCode };
}

const serviceRecordDetailsById: Record<string, ServiceRecordDetail> = {
  "srv-201": {
    id: "srv-201",
    trackingCode: "SRV-2026-201",
    status: "IN_PROGRESS",
    priority: "HIGH",
    receivedAt: "2026-05-19T08:20:00.000Z",
    issueSummary: "Ekran değişimi sonrası test süreci devam ediyor",
    customer: {
      name: "Ahmet Yılmaz",
      phone: "+90 532 000 10 10",
    },
    device: {
      name: "Samsung Galaxy S23",
      brand: "Samsung",
      model: "Galaxy S23",
      serialNumber: "SM-S911B-TR-10021",
    },
    assigneeName: "Mert Aydın",
    timeline: [
      {
        id: "evt-201-1",
        type: "STATUS_CHANGED",
        createdAt: "2026-05-19T10:00:00.000Z",
        actorName: "Mert Aydın",
        title: "Durum işlemde olarak güncellendi",
        description: "Ekran değişimi tamamlandı, kalite kontrol testleri başlatıldı.",
      },
      {
        id: "evt-201-2",
        type: "NOTE_ADDED",
        createdAt: "2026-05-19T09:12:00.000Z",
        actorName: "Mert Aydın",
        title: "Teknik not eklendi",
        description: "Titreşim motoru bağlantısı da kontrol edildi, ek arıza tespit edilmedi.",
      },
      {
        id: "evt-201-3",
        type: "ASSIGNED",
        createdAt: "2026-05-19T08:28:00.000Z",
        actorName: "Operasyon",
        title: "Kayıt personele atandı",
        description: "Kayıt Mert Aydın'a atandı.",
      },
      {
        id: "evt-201-4",
        type: "STATUS_CHANGED",
        createdAt: "2026-05-19T08:20:00.000Z",
        actorName: "Ön Büro",
        title: "Kayıt oluşturuldu",
        description: "Cihaz teslim alındı ve ilk arıza bilgileri eklendi.",
      },
    ],
  },
  "srv-202": {
    id: "srv-202",
    trackingCode: "SRV-2026-202",
    status: "WAITING_PART",
    priority: "NORMAL",
    receivedAt: "2026-05-18T13:40:00.000Z",
    issueSummary: "Pompa siparişi geçildi, parça bekleniyor",
    customer: {
      name: "Ayşe Demir",
      phone: "+90 533 111 20 20",
    },
    device: {
      name: "Bosch WGA142 Çamaşır Makinesi",
      brand: "Bosch",
      model: "WGA142",
      serialNumber: "BS-WGA142-77210",
    },
    assigneeName: "Ece Tunalı",
    timeline: [
      {
        id: "evt-202-1",
        type: "PART_ORDERED",
        createdAt: "2026-05-18T16:05:00.000Z",
        actorName: "Ece Tunalı",
        title: "Parça siparişi oluşturuldu",
        description: "Tahliye pompası için tedarik siparişi geçildi.",
      },
      {
        id: "evt-202-2",
        type: "STATUS_CHANGED",
        createdAt: "2026-05-18T16:00:00.000Z",
        actorName: "Ece Tunalı",
        title: "Durum parça bekliyor olarak güncellendi",
        description: "Parça gelene kadar kayıt bekleme durumuna alındı.",
      },
    ],
  },
  "srv-203": {
    id: "srv-203",
    trackingCode: "SRV-2026-203",
    status: "WAITING_CUSTOMER_APPROVAL",
    priority: "URGENT",
    receivedAt: "2026-05-18T09:05:00.000Z",
    issueSummary: "Sıvı teması sonrası ilk kontrol tamamlandı",
    customer: {
      name: "Mehmet Öz",
      phone: "+90 535 222 30 30",
    },
    device: {
      name: "Apple MacBook Pro M1",
      brand: "Apple",
      model: "MacBook Pro M1",
      serialNumber: "APL-MBP-2021-31104",
    },
    assigneeName: "Burak Kılıç",
    timeline: [
      {
        id: "evt-203-1",
        type: "NOTE_ADDED",
        createdAt: "2026-05-18T11:10:00.000Z",
        actorName: "Burak Kılıç",
        title: "Maliyet notu eklendi",
        description: "Anakart onarımı için müşteri onayı bekleniyor.",
      },
      {
        id: "evt-203-2",
        type: "STATUS_CHANGED",
        createdAt: "2026-05-18T11:08:00.000Z",
        actorName: "Burak Kılıç",
        title: "Durum müşteri onayı bekliyor olarak güncellendi",
        description: "Müşteriye onarım maliyeti iletildi.",
      },
    ],
  },
};

export async function getServiceRecordDetail(id: string): Promise<ServiceRecordDetail | null> {
  return serviceRecordDetailsById[id] ?? null;
}
