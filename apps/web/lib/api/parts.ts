import { getServiceRecordsOverview, type ServiceStatus } from "@/lib/api/service-records";

export type PartCategoryKey = "SCREEN" | "BATTERY" | "PUMP" | "BOARD" | "ACCESSORY" | "THERMAL";

export type PartInventoryFilter = "all" | "low_stock" | "out_of_stock" | "reserved" | "available";

export type PartAvailabilityState = Exclude<PartInventoryFilter, "all">;

export type PartMovementType = "PURCHASE" | "RESERVATION" | "USAGE" | "ADJUSTMENT";

export type PartMovementNoteKey =
  | "supplier_restock"
  | "reserved_for_waiting_part"
  | "used_in_repair"
  | "manual_cycle_adjustment"
  | "buffer_stock_added";

export type PartCostVisibility = "HIDDEN_MOCK_SENSITIVE";

export type PartListItem = {
  id: string;
  sku: string;
  name: string;
  category: PartCategoryKey;
  compatibleDeviceType: string;
  compatibleBrand: string;
  stockQuantity: number;
  reorderThreshold: number;
  reservedQuantity: number;
  salePrice: number;
  costVisibility: PartCostVisibility;
};

export type PartMovement = {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  type: PartMovementType;
  quantity: number;
  occurredAt: string;
  noteKey: PartMovementNoteKey;
  serviceRecordId?: string;
  serviceRecordCode?: string;
};

export type PartServiceRecordOption = {
  id: string;
  trackingCode: string;
  customerName: string;
  deviceName: string;
  status: ServiceStatus;
};

export type LowStockAlert = {
  partId: string;
  severity: "warning" | "critical";
  shortageQuantity: number;
};

export type PartsOverview = {
  updatedAt: string;
  currency: "TRY";
  summary: {
    totalParts: number;
    lowStockCount: number;
    reservedUnits: number;
    estimatedRevenueValue: number;
  };
  parts: PartListItem[];
  recentMovements: PartMovement[];
  lowStockAlerts: LowStockAlert[];
  serviceRecords: PartServiceRecordOption[];
};

export type ReserveMockPartForServiceInput = {
  partId: string;
  serviceRecordId: string;
  quantity: number;
};

export type ReserveMockPartForServiceResult = {
  savedAt: string;
  movement: PartMovement;
  reservedQuantityAdded: number;
};

const mockParts: PartListItem[] = [
  {
    id: "part-001",
    sku: "SCR-S23-OLED",
    name: "Samsung Galaxy S23 OLED Ekran",
    category: "SCREEN",
    compatibleDeviceType: "Akıllı Telefon",
    compatibleBrand: "Samsung",
    stockQuantity: 6,
    reorderThreshold: 3,
    reservedQuantity: 2,
    salePrice: 4850,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
  {
    id: "part-002",
    sku: "BAT-IP13-ORJ",
    name: "iPhone 13 Batarya",
    category: "BATTERY",
    compatibleDeviceType: "Akıllı Telefon",
    compatibleBrand: "Apple",
    stockQuantity: 3,
    reorderThreshold: 4,
    reservedQuantity: 1,
    salePrice: 2950,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
  {
    id: "part-003",
    sku: "PMP-BSH-WGA142",
    name: "Bosch WGA142 Tahliye Pompası",
    category: "PUMP",
    compatibleDeviceType: "Çamaşır Makinesi",
    compatibleBrand: "Bosch",
    stockQuantity: 1,
    reorderThreshold: 2,
    reservedQuantity: 1,
    salePrice: 1820,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
  {
    id: "part-004",
    sku: "BRD-MBP-M1-IO",
    name: "MacBook Pro M1 I/O Board",
    category: "BOARD",
    compatibleDeviceType: "Laptop",
    compatibleBrand: "Apple",
    stockQuantity: 0,
    reorderThreshold: 1,
    reservedQuantity: 0,
    salePrice: 6250,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
  {
    id: "part-005",
    sku: "THM-DYS-V15",
    name: "Dyson V15 Termal Koruma Kiti",
    category: "THERMAL",
    compatibleDeviceType: "Dikey Süpürge",
    compatibleBrand: "Dyson",
    stockQuantity: 9,
    reorderThreshold: 3,
    reservedQuantity: 0,
    salePrice: 980,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
  {
    id: "part-006",
    sku: "ACC-SONY-55-FLEX",
    name: "Sony Bravia 55 Flex Kablo",
    category: "ACCESSORY",
    compatibleDeviceType: "Televizyon",
    compatibleBrand: "Sony",
    stockQuantity: 4,
    reorderThreshold: 2,
    reservedQuantity: 1,
    salePrice: 740,
    costVisibility: "HIDDEN_MOCK_SENSITIVE",
  },
];

const mockMovements: PartMovement[] = [
  {
    id: "move-001",
    partId: "part-003",
    partName: "Bosch WGA142 Tahliye Pompası",
    sku: "PMP-BSH-WGA142",
    type: "PURCHASE",
    quantity: 2,
    occurredAt: "2026-06-03T08:10:00.000Z",
    noteKey: "supplier_restock",
  },
  {
    id: "move-002",
    partId: "part-003",
    partName: "Bosch WGA142 Tahliye Pompası",
    sku: "PMP-BSH-WGA142",
    type: "RESERVATION",
    quantity: 1,
    occurredAt: "2026-06-03T08:40:00.000Z",
    noteKey: "reserved_for_waiting_part",
    serviceRecordId: "srv-202",
    serviceRecordCode: "SRV-2026-202",
  },
  {
    id: "move-003",
    partId: "part-001",
    partName: "Samsung Galaxy S23 OLED Ekran",
    sku: "SCR-S23-OLED",
    type: "USAGE",
    quantity: 1,
    occurredAt: "2026-06-02T15:20:00.000Z",
    noteKey: "used_in_repair",
    serviceRecordId: "srv-201",
    serviceRecordCode: "SRV-2026-201",
  },
  {
    id: "move-004",
    partId: "part-005",
    partName: "Dyson V15 Termal Koruma Kiti",
    sku: "THM-DYS-V15",
    type: "ADJUSTMENT",
    quantity: 2,
    occurredAt: "2026-06-02T11:05:00.000Z",
    noteKey: "manual_cycle_adjustment",
  },
  {
    id: "move-005",
    partId: "part-002",
    partName: "iPhone 13 Batarya",
    sku: "BAT-IP13-ORJ",
    type: "PURCHASE",
    quantity: 4,
    occurredAt: "2026-06-01T13:50:00.000Z",
    noteKey: "buffer_stock_added",
  },
];

function cloneParts() {
  return structuredClone(mockParts);
}

function cloneMovements() {
  return structuredClone(mockMovements);
}

export function resolvePartAvailabilityState(part: Pick<PartListItem, "stockQuantity" | "reorderThreshold" | "reservedQuantity">): PartAvailabilityState {
  if (part.stockQuantity <= 0) {
    return "out_of_stock";
  }

  if (part.stockQuantity <= part.reorderThreshold) {
    return "low_stock";
  }

  if (part.reservedQuantity > 0) {
    return "reserved";
  }

  return "available";
}

function buildLowStockAlerts(parts: PartListItem[]): LowStockAlert[] {
  return parts
    .filter((part) => part.stockQuantity <= part.reorderThreshold)
    .map((part) => ({
      partId: part.id,
      severity: part.stockQuantity === 0 ? "critical" : "warning",
      shortageQuantity: Math.max(part.reorderThreshold - part.stockQuantity, 1),
    }));
}

function buildSummary(parts: PartListItem[]) {
  return {
    totalParts: parts.length,
    lowStockCount: parts.filter((part) => part.stockQuantity <= part.reorderThreshold).length,
    reservedUnits: parts.reduce((total, part) => total + part.reservedQuantity, 0),
    estimatedRevenueValue: parts.reduce((total, part) => total + part.stockQuantity * part.salePrice, 0),
  };
}

async function buildServiceRecordOptions(): Promise<PartServiceRecordOption[]> {
  const overview = await getServiceRecordsOverview();

  return overview.records
    .filter((record) => record.status !== "DELIVERED" && record.status !== "CANCELLED")
    .map((record) => ({
      id: record.id,
      trackingCode: record.trackingCode,
      customerName: record.customerName,
      deviceName: record.deviceName,
      status: record.status,
    }));
}

export async function getPartsOverview(): Promise<PartsOverview> {
  const parts = cloneParts();

  return {
    updatedAt: "2026-06-03T09:40:00.000Z",
    currency: "TRY",
    summary: buildSummary(parts),
    parts,
    recentMovements: cloneMovements().sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()),
    lowStockAlerts: buildLowStockAlerts(parts),
    serviceRecords: await buildServiceRecordOptions(),
  };
}

export async function reserveMockPartForService(input: ReserveMockPartForServiceInput): Promise<ReserveMockPartForServiceResult> {
  const parts = cloneParts();
  const serviceRecords = await buildServiceRecordOptions();
  const part = parts.find((item) => item.id === input.partId);
  const serviceRecord = serviceRecords.find((item) => item.id === input.serviceRecordId);

  if (!part) {
    throw new Error("PART_NOT_FOUND");
  }

  if (!serviceRecord) {
    throw new Error("SERVICE_RECORD_NOT_FOUND");
  }

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const availableQuantity = Math.max(part.stockQuantity - part.reservedQuantity, 0);

  if (input.quantity > availableQuantity) {
    throw new Error("INSUFFICIENT_AVAILABLE_STOCK");
  }

  const savedAt = new Date().toISOString();

  return {
    savedAt,
    reservedQuantityAdded: input.quantity,
    movement: {
      id: `move-mock-${part.id}-${serviceRecord.id}-${savedAt}`,
      partId: part.id,
      partName: part.name,
      sku: part.sku,
      type: "RESERVATION",
      quantity: input.quantity,
      occurredAt: savedAt,
      noteKey: "reserved_for_waiting_part",
      serviceRecordId: serviceRecord.id,
      serviceRecordCode: serviceRecord.trackingCode,
    },
  };
}
