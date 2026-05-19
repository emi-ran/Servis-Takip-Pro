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
    customerName: string;
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
      { id: "1", trackingCode: "SRV-2026-101", customerName: "Ahmet Yılmaz", deviceName: "Samsung Galaxy S23", status: "IN_PROGRESS" },
      { id: "2", trackingCode: "SRV-2026-102", customerName: "Ayşe Demir", deviceName: "Bosch WGA142", status: "WAITING_PART" },
      { id: "3", trackingCode: "SRV-2026-103", customerName: "Mehmet Öz", deviceName: "Apple MacBook Pro M1", status: "NEW" },
      { id: "4", trackingCode: "SRV-2026-104", customerName: "Zeynep Kaya", deviceName: "Sony Bravia TV", status: "READY_FOR_DELIVERY" },
      { id: "5", trackingCode: "SRV-2026-105", customerName: "Bora Akın", deviceName: "Dyson V15 Detect", status: "IN_PROGRESS" },
    ],
    dailySummary: {
      revenue: 18450,
      expense: 6200,
      pendingApproval: 3,
    },
  };
}
