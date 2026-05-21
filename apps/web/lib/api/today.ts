import { getServiceRecordsOverview, type ServicePriority, type ServiceStatus } from "@/lib/api/service-records";

export type TodayWorkFilter = "all" | "appointments" | "urgent" | "completed";

export type TodayWorkAppointment = {
  id: string;
  time: string;
  customerId: string;
  customerName: string;
  deviceId: string;
  deviceName: string;
  address: string | null;
  assignedStaffName: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  isUrgent: boolean;
  serviceRecordId: string;
};

export type TodayAttentionRecord = {
  id: string;
  trackingCode: string;
  customerId: string | null;
  customerName: string;
  deviceId: string | null;
  deviceName: string;
  status: ServiceStatus;
  priority: ServicePriority;
  assigneeName: string | null;
  needsTodayAction: boolean;
};

export type TodayWorkOverview = {
  updatedAt: string;
  summary: {
    dueTodayCount: number;
    openServiceRecordsCount: number;
    urgentCount: number;
    completedTodayCount: number;
  };
  appointments: TodayWorkAppointment[];
  attentionRecords: TodayAttentionRecord[];
};

const mockAppointments: TodayWorkAppointment[] = [
  {
    id: "apt-101",
    time: "2026-05-21T08:30:00.000Z",
    customerId: "cust-001",
    customerName: "Ahmet Yılmaz",
    deviceId: "dev-001",
    deviceName: "Samsung Galaxy S23",
    address: "Kadıköy / İstanbul",
    assignedStaffName: "Mert Aydın",
    status: "SCHEDULED",
    isUrgent: false,
    serviceRecordId: "srv-201",
  },
  {
    id: "apt-102",
    time: "2026-05-21T10:00:00.000Z",
    customerId: "cust-003",
    customerName: "Mehmet Öz",
    deviceId: "dev-004",
    deviceName: "Apple MacBook Pro M1",
    address: "Beşiktaş / İstanbul",
    assignedStaffName: "Burak Kılıç",
    status: "IN_PROGRESS",
    isUrgent: true,
    serviceRecordId: "srv-203",
  },
  {
    id: "apt-103",
    time: "2026-05-21T14:45:00.000Z",
    customerId: "cust-002",
    customerName: "Ayşe Demir",
    deviceId: "dev-003",
    deviceName: "Bosch WGA142 Çamaşır Makinesi",
    address: null,
    assignedStaffName: "Ece Tunalı",
    status: "COMPLETED",
    isUrgent: false,
    serviceRecordId: "srv-202",
  },
];

export async function getTodayWorkOverview(): Promise<TodayWorkOverview> {
  const serviceRecordsOverview = await getServiceRecordsOverview();

  const openStatuses: ServiceStatus[] = ["NEW", "IN_PROGRESS", "WAITING_PART", "WAITING_CUSTOMER_APPROVAL", "READY_FOR_DELIVERY"];
  const openRecords = serviceRecordsOverview.records.filter((record) => openStatuses.includes(record.status));
  const urgentRecords = openRecords.filter((record) => record.priority === "URGENT" || record.status === "WAITING_CUSTOMER_APPROVAL");

  const attentionRecords: TodayAttentionRecord[] = openRecords
    .filter((record) => record.priority === "URGENT" || record.status === "WAITING_CUSTOMER_APPROVAL" || record.status === "WAITING_PART")
    .map((record) => ({
      id: record.id,
      trackingCode: record.trackingCode,
      customerId: record.customerId ?? null,
      customerName: record.customerName,
      deviceId: record.deviceId ?? null,
      deviceName: record.deviceName,
      status: record.status,
      priority: record.priority,
      assigneeName: record.assigneeName,
      needsTodayAction: true,
    }));

  const dueTodayCount = mockAppointments.filter((appointment) => appointment.status !== "COMPLETED").length + attentionRecords.length;
  const completedTodayCount = mockAppointments.filter((appointment) => appointment.status === "COMPLETED").length;

  return {
    updatedAt: "2026-05-21T11:05:00.000Z",
    summary: {
      dueTodayCount,
      openServiceRecordsCount: openRecords.length,
      urgentCount: urgentRecords.length,
      completedTodayCount,
    },
    appointments: mockAppointments,
    attentionRecords,
  };
}
