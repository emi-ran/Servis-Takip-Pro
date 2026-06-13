export type DashboardOverview = {
  updatedAt: string;
  metrics: Array<{
    id: "waiting_devices" | "waiting_parts" | "ready_delivery" | "overdue";
    value: number;
    note?: "legal_deadline";
  }>;
  recentRecords: Array<{
    id: string;
    trackingCode: string;
    customerId?: string;
    customerName: string;
    deviceId?: string;
    deviceName: string;
    status: "IN_PROGRESS" | "WAITING_PART" | "READY_FOR_DELIVERY" | "NEW";
  }>;
  dailySummary: {
    revenue: number;
    expense: number;
    pendingApproval: number;
  };
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return {
    updatedAt: "2026-05-19T10:42:00.000Z",
    metrics: [
      { id: "waiting_devices", value: 18 },
      { id: "waiting_parts", value: 6 },
      { id: "ready_delivery", value: 9 },
      { id: "overdue", value: 4, note: "legal_deadline" },
    ],
    recentRecords: [
      {
        id: "srv-201",
        trackingCode: "SRV-2026-201",
        customerId: "cust-001",
        customerName: "Ahmet Yılmaz",
        deviceId: "dev-001",
        deviceName: "Samsung Galaxy S23",
        status: "IN_PROGRESS",
      },
      {
        id: "srv-202",
        trackingCode: "SRV-2026-202",
        customerId: "cust-002",
        customerName: "Ayşe Demir",
        deviceId: "dev-003",
        deviceName: "Bosch WGA142",
        status: "WAITING_PART",
      },
      {
        id: "srv-203",
        trackingCode: "SRV-2026-203",
        customerId: "cust-003",
        customerName: "Mehmet Öz",
        deviceId: "dev-004",
        deviceName: "Apple MacBook Pro M1",
        status: "NEW",
      },
      {
        id: "srv-204",
        trackingCode: "SRV-2026-204",
        customerId: "cust-004",
        customerName: "Zeynep Kaya",
        deviceId: "dev-005",
        deviceName: "Sony Bravia TV",
        status: "READY_FOR_DELIVERY",
      },
      { id: "srv-205", trackingCode: "SRV-2026-205", customerName: "Bora Akın", deviceName: "Dyson V15 Detect", status: "IN_PROGRESS" },
    ],
    dailySummary: {
      revenue: 18450,
      expense: 6200,
      pendingApproval: 3,
    },
  };
}
