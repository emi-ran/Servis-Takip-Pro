import { fetchWithAuth, checkDemoMode } from "./client";

export type ServiceStatus =
  | "NEW"
  | "APPOINTMENT_SCHEDULED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING_PART"
  | "WAITING_CUSTOMER_APPROVAL"
  | "REPAIRING"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "UNREACHABLE"
  | "UNPAID";

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
  isMock?: boolean;
  visibility?: "CUSTOMER_SAFE" | "INTERNAL";
};

export type ServiceRecordStaffOption = {
  id: string;
  name: string;
};

export type ServiceRecordPaymentContext = {
  currency: string;
  outstandingAmount: number;
  collectedAmount: number;
  notePreview: string;
};

export type ServiceRecordPartReservationStatus = "USED" | "RESERVED";

export type ServiceRecordPartReservationItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  status: ServiceRecordPartReservationStatus;
};

export type ServiceRecordOperationsContext = {
  staffOptions: ServiceRecordStaffOption[];
  payment: ServiceRecordPaymentContext;
  parts: ServiceRecordPartReservationItem[];
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
  assigneeId: string | null;
  assigneeName: string | null;
  timeline: ServiceTimelineEvent[];
  operations: ServiceRecordOperationsContext;
};

const mockOperationalStaffOptions: ServiceRecordStaffOption[] = [
  { id: "staff-001", name: "Mert Aydın" },
  { id: "staff-002", name: "Ece Tunalı" },
  { id: "staff-003", name: "Burak Kılıç" },
];

const mockStatusTransitions: Record<ServiceStatus, ServiceStatus[]> = {
  NEW: ["ASSIGNED", "APPOINTMENT_SCHEDULED", "IN_PROGRESS", "WAITING_CUSTOMER_APPROVAL", "CANCELLED"],
  APPOINTMENT_SCHEDULED: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_PART", "WAITING_CUSTOMER_APPROVAL", "REPAIRING", "READY_FOR_DELIVERY", "CANCELLED"],
  WAITING_PART: ["IN_PROGRESS", "READY_FOR_DELIVERY", "CANCELLED"],
  WAITING_CUSTOMER_APPROVAL: ["IN_PROGRESS", "REPAIRING", "READY_FOR_DELIVERY", "CANCELLED"],
  REPAIRING: ["WAITING_PART", "WAITING_CUSTOMER_APPROVAL", "READY_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_DELIVERY: ["DELIVERED", "UNPAID"],
  DELIVERED: [],
  CANCELLED: [],
  UNREACHABLE: ["NEW", "CANCELLED"],
  UNPAID: ["DELIVERED", "CANCELLED"],
};

function cloneServiceRecordDetail(detail: ServiceRecordDetail): ServiceRecordDetail {
  return {
    ...detail,
    customer: { ...detail.customer },
    device: { ...detail.device },
    timeline: detail.timeline.map((event) => ({ ...event })),
    operations: {
      staffOptions: detail.operations.staffOptions.map((staff) => ({ ...staff })),
      payment: { ...detail.operations.payment },
      parts: detail.operations.parts.map((part) => ({ ...part })),
    },
  };
}

export function getMockServiceStatusTransitions(status: ServiceStatus): ServiceStatus[] {
  return mockStatusTransitions[status];
}

export function getMockServiceStaffOptions(): ServiceRecordStaffOption[] {
  return mockOperationalStaffOptions.map((staff) => ({ ...staff }));
}

export function createMockTimelineEvent(input: {
  id: string;
  type: ServiceTimelineEventType;
  actorName: string;
  title: string;
  description: string;
  createdAt?: string;
  visibility?: "CUSTOMER_SAFE" | "INTERNAL";
}): ServiceTimelineEvent {
  return {
    id: input.id,
    type: input.type,
    actorName: input.actorName,
    title: input.title,
    description: input.description,
    createdAt: input.createdAt ?? new Date().toISOString(),
    isMock: true,
    visibility: input.visibility ?? "CUSTOMER_SAFE",
  };
}

export function applyMockTimelineEvent(detail: ServiceRecordDetail, event: ServiceTimelineEvent): ServiceRecordDetail {
  const nextDetail = cloneServiceRecordDetail(detail);
  nextDetail.timeline = [event, ...nextDetail.timeline];
  return nextDetail;
}

export function applyMockStatusUpdate(detail: ServiceRecordDetail, status: ServiceStatus, event: ServiceTimelineEvent): ServiceRecordDetail {
  const nextDetail = applyMockTimelineEvent(detail, event);
  nextDetail.status = status;
  return nextDetail;
}

export function applyMockAssignmentUpdate(detail: ServiceRecordDetail, assigneeId: string | null, event: ServiceTimelineEvent): ServiceRecordDetail {
  const nextDetail = applyMockTimelineEvent(detail, event);
  const nextAssignee = nextDetail.operations.staffOptions.find((staff) => staff.id === assigneeId) ?? null;

  nextDetail.assigneeId = nextAssignee?.id ?? null;
  nextDetail.assigneeName = nextAssignee?.name ?? null;

  return nextDetail;
}

export function applyMockPaymentNote(detail: ServiceRecordDetail, event: ServiceTimelineEvent): ServiceRecordDetail {
  return applyMockTimelineEvent(detail, event);
}

const mockOverviewRecords: ServiceRecordListItem[] = [
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
];

export async function getServiceRecordsOverview(): Promise<ServiceRecordsOverview> {
  const isDemo = await checkDemoMode();
  if (!isDemo) {
    const res = await fetchWithAuth("/service-records?limit=50");
    if (res.ok) {
      const data = await res.json();
      return {
        updatedAt: new Date().toISOString(),
        records: data.records || [],
      };
    }
  }

  return {
    updatedAt: "2026-05-19T11:15:00.000Z",
    records: mockOverviewRecords,
  };
}

const createServiceRecordFormOptions: CreateServiceRecordFormOptions = {
  statuses: [
    "NEW",
    "APPOINTMENT_SCHEDULED",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_PART",
    "WAITING_CUSTOMER_APPROVAL",
    "REPAIRING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "UNREACHABLE",
    "UNPAID",
  ],
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
  assignees: mockOperationalStaffOptions,
};

export async function getCreateServiceRecordFormOptions(): Promise<CreateServiceRecordFormOptions> {
  const isDemo = await checkDemoMode();
  if (!isDemo) {
    const [customersRes, devicesRes] = await Promise.all([
      fetchWithAuth("/customers?limit=100"),
      fetchWithAuth("/devices?limit=100"),
    ]);

    const customersData = customersRes.ok ? await customersRes.json() : null;
    const devicesData = devicesRes.ok ? await devicesRes.json() : null;

    if (customersData && devicesData) {
      return {
        statuses: createServiceRecordFormOptions.statuses,
        priorities: createServiceRecordFormOptions.priorities,
        customers: (customersData.items || []).map((item: Record<string, unknown>) => ({
          id: item.id as string,
          name: item.name as string,
          phone: (item.phone as string) || "",
          email: (item.email as string) || "",
        })),
        devices: (devicesData.items || []).map((item: Record<string, unknown>) => ({
          id: item.id as string,
          customerId: item.customerId as string,
          brand: item.brand || "",
          model: item.model || "",
          serialOrImei: item.serialNumber || "",
          registeredAt: item.lastServiceAt || undefined,
        })),
        assignees: createServiceRecordFormOptions.assignees,
      };
    }
  }

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
  const isDemo = await checkDemoMode();
  if (!isDemo) {
    const res = await fetchWithAuth(`/customers?search=${encodeURIComponent(query)}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      return {
        query: data.query || query,
        minQueryLength,
        limit,
        totalCount: data.totalCount || 0,
        hasMore: data.hasMore || false,
        customers: (data.items || []).map((item: Record<string, unknown>) => ({
          id: item.id as string,
          name: item.name as string,
          phone: (item.phone as string) || "",
          email: (item.email as string) || "",
        })),
      };
    }
  }

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
  const isDemo = await checkDemoMode();
  if (!isDemo) {
    const body: Record<string, unknown> = {
      customerId: input.customerId,
      serviceType: "WORKSHOP",
      priority: input.priority,
      faultDescription: input.issueDescription || input.issueSummary,
      internalNote: input.internalNote || undefined,
    };

    if (input.deviceId) {
      body.deviceId = input.deviceId;
    }

    if (input.newDevice) {
      body.newDevice = {
        brand: input.newDevice.brand,
        model: input.newDevice.model,
        serialNo: input.newDevice.serialOrImei || undefined,
      };
    }

    if (input.assigneeId) {
      body.assignedUserId = input.assigneeId;
    }

    const res = await fetchWithAuth("/service-records", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return { trackingCode: data.trackingNo };
    }

    const errorBody = await res.text();
    throw new Error(errorBody || `API hatası: ${res.status}`);
  }

  const year = new Date().getUTCFullYear();
  const randomNumber = Math.floor(Math.random() * 900 + 100);
  const trackingCode = `SRV-${year}-${randomNumber}`;

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
    assigneeId: "staff-001",
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
    operations: {
      staffOptions: mockOperationalStaffOptions,
      payment: {
        currency: "TRY",
        outstandingAmount: 2450,
        collectedAmount: 750,
        notePreview: "Teslimat öncesi kalan ekran + işçilik tutarı için mock tahsilat notu planlandı.",
      },
      parts: [
        {
          id: "srv-201-part-1",
          name: "OLED ekran modülü",
          sku: "SCR-S23-OLED",
          quantity: 1,
          status: "USED",
        },
        {
          id: "srv-201-part-2",
          name: "Koruyucu çerçeve bandı",
          sku: "ACC-FRM-TAPE",
          quantity: 1,
          status: "RESERVED",
        },
      ],
    },
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
    assigneeId: "staff-002",
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
    operations: {
      staffOptions: mockOperationalStaffOptions,
      payment: {
        currency: "TRY",
        outstandingAmount: 1800,
        collectedAmount: 0,
        notePreview: "Pompa parçası geldikten sonra işçilikle birlikte mock tahsilat planlanıyor.",
      },
      parts: [
        {
          id: "srv-202-part-1",
          name: "Tahliye pompası",
          sku: "PMP-BSH-WGA142",
          quantity: 1,
          status: "RESERVED",
        },
      ],
    },
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
    assigneeId: "staff-003",
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
    operations: {
      staffOptions: mockOperationalStaffOptions,
      payment: {
        currency: "TRY",
        outstandingAmount: 6200,
        collectedAmount: 0,
        notePreview: "Müşteri onayı sonrası kapora veya tam tahsilat için mock not akışı planlandı.",
      },
      parts: [],
    },
  },
};

export async function getServiceRecordDetail(id: string): Promise<ServiceRecordDetail | null> {
  const isDemo = await checkDemoMode();
  if (!isDemo) {
    const res = await fetchWithAuth(`/service-records/${id}`);
    if (res.ok) {
      return res.json();
    }
    if (res.status === 404) {
      return null;
    }
    const errorBody = await res.text();
    throw new Error(errorBody || `API hatası: ${res.status}`);
  }

  return serviceRecordDetailsById[id] ?? null;
}
