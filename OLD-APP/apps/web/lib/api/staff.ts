export type StaffRoleKey = "ADMIN" | "TECHNICIAN" | "RECEPTION" | "ACCOUNTING";

export type StaffStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";

export type StaffAssignment = {
  serviceRecordId: string;
  trackingCode: string;
  issueSummary: string;
};

export type StaffPermissionState = "FULL" | "LIMITED" | "NONE";

export type StaffPermissionModuleKey = "SERVICE_RECORDS" | "CUSTOMERS" | "DEVICES" | "CASH" | "STAFF_SETTINGS";

export type StaffPermissionModule = {
  key: StaffPermissionModuleKey;
  permissionState: StaffPermissionState;
  noteKey:
    | "ADMIN_SERVICE_RECORDS"
    | "ADMIN_CUSTOMERS"
    | "ADMIN_DEVICES"
    | "ADMIN_CASH"
    | "ADMIN_STAFF_SETTINGS"
    | "TECHNICIAN_SERVICE_RECORDS"
    | "TECHNICIAN_CUSTOMERS"
    | "TECHNICIAN_DEVICES"
    | "TECHNICIAN_CASH"
    | "TECHNICIAN_STAFF_SETTINGS"
    | "RECEPTION_SERVICE_RECORDS"
    | "RECEPTION_CUSTOMERS"
    | "RECEPTION_DEVICES"
    | "RECEPTION_CASH"
    | "RECEPTION_STAFF_SETTINGS"
    | "ACCOUNTING_SERVICE_RECORDS"
    | "ACCOUNTING_CUSTOMERS"
    | "ACCOUNTING_DEVICES"
    | "ACCOUNTING_CASH"
    | "ACCOUNTING_STAFF_SETTINGS";
};

export type StaffRoleTemplate = {
  role: StaffRoleKey;
  modules: StaffPermissionModule[];
};

export type StaffListItem = {
  id: string;
  name: string;
  role: StaffRoleKey;
  phone: string | null;
  email: string | null;
  status: StaffStatus;
  openAssignedServiceCount: number;
  assignedTodayCount: number;
  recentAssignments: StaffAssignment[];
};

export type StaffDetail = StaffListItem & {
  roleTemplate: StaffRoleTemplate;
};

export type CreateStaffInput = {
  name: string;
  role: StaffRoleKey;
  phone: string;
  email: string;
  status: StaffStatus;
};

export type UpdateStaffInput = {
  id: string;
  name: string;
  role: StaffRoleKey;
  phone: string;
  email: string;
  status: StaffStatus;
};

export type StaffOverview = {
  updatedAt: string;
  summary: {
    totalStaff: number;
    activeTechnicians: number;
    assignedJobsToday: number;
    unavailableCount: number;
  };
  items: StaffListItem[];
};

const staffItems: StaffListItem[] = [
  {
    id: "staff-001",
    name: "Mert Aydın",
    role: "TECHNICIAN",
    phone: "+90 532 700 10 10",
    email: "mert.aydin@example.com",
    status: "ACTIVE",
    openAssignedServiceCount: 4,
    assignedTodayCount: 2,
    recentAssignments: [
      { serviceRecordId: "srv-201", trackingCode: "SRV-2026-201", issueSummary: "Ekran değişimi sonrası test" },
      { serviceRecordId: "srv-204", trackingCode: "SRV-2026-204", issueSummary: "Teslimat hazırlığı" },
    ],
  },
  {
    id: "staff-002",
    name: "Ece Tunalı",
    role: "TECHNICIAN",
    phone: "+90 533 700 20 20",
    email: "ece.tunali@example.com",
    status: "ACTIVE",
    openAssignedServiceCount: 1,
    assignedTodayCount: 1,
    recentAssignments: [{ serviceRecordId: "srv-202", trackingCode: "SRV-2026-202", issueSummary: "Parça bekleyen kayıt" }],
  },
  {
    id: "staff-003",
    name: "Burak Kılıç",
    role: "TECHNICIAN",
    phone: "+90 535 700 30 30",
    email: "burak.kilic@example.com",
    status: "ON_LEAVE",
    openAssignedServiceCount: 1,
    assignedTodayCount: 0,
    recentAssignments: [{ serviceRecordId: "srv-203", trackingCode: "SRV-2026-203", issueSummary: "Müşteri onayı bekleniyor" }],
  },
  {
    id: "staff-004",
    name: "Selin Koç",
    role: "RECEPTION",
    phone: null,
    email: "selin.koc@example.com",
    status: "ACTIVE",
    openAssignedServiceCount: 0,
    assignedTodayCount: 0,
    recentAssignments: [],
  },
  {
    id: "staff-005",
    name: "Can Öztürk",
    role: "ACCOUNTING",
    phone: "+90 536 700 50 50",
    email: null,
    status: "INACTIVE",
    openAssignedServiceCount: 0,
    assignedTodayCount: 0,
    recentAssignments: [],
  },
];

const roleTemplates: Record<StaffRoleKey, StaffRoleTemplate> = {
  ADMIN: {
    role: "ADMIN",
    modules: [
      { key: "SERVICE_RECORDS", permissionState: "FULL", noteKey: "ADMIN_SERVICE_RECORDS" },
      { key: "CUSTOMERS", permissionState: "FULL", noteKey: "ADMIN_CUSTOMERS" },
      { key: "DEVICES", permissionState: "FULL", noteKey: "ADMIN_DEVICES" },
      { key: "CASH", permissionState: "FULL", noteKey: "ADMIN_CASH" },
      { key: "STAFF_SETTINGS", permissionState: "LIMITED", noteKey: "ADMIN_STAFF_SETTINGS" },
    ],
  },
  TECHNICIAN: {
    role: "TECHNICIAN",
    modules: [
      { key: "SERVICE_RECORDS", permissionState: "FULL", noteKey: "TECHNICIAN_SERVICE_RECORDS" },
      { key: "CUSTOMERS", permissionState: "LIMITED", noteKey: "TECHNICIAN_CUSTOMERS" },
      { key: "DEVICES", permissionState: "FULL", noteKey: "TECHNICIAN_DEVICES" },
      { key: "CASH", permissionState: "NONE", noteKey: "TECHNICIAN_CASH" },
      { key: "STAFF_SETTINGS", permissionState: "NONE", noteKey: "TECHNICIAN_STAFF_SETTINGS" },
    ],
  },
  RECEPTION: {
    role: "RECEPTION",
    modules: [
      { key: "SERVICE_RECORDS", permissionState: "LIMITED", noteKey: "RECEPTION_SERVICE_RECORDS" },
      { key: "CUSTOMERS", permissionState: "FULL", noteKey: "RECEPTION_CUSTOMERS" },
      { key: "DEVICES", permissionState: "LIMITED", noteKey: "RECEPTION_DEVICES" },
      { key: "CASH", permissionState: "LIMITED", noteKey: "RECEPTION_CASH" },
      { key: "STAFF_SETTINGS", permissionState: "NONE", noteKey: "RECEPTION_STAFF_SETTINGS" },
    ],
  },
  ACCOUNTING: {
    role: "ACCOUNTING",
    modules: [
      { key: "SERVICE_RECORDS", permissionState: "LIMITED", noteKey: "ACCOUNTING_SERVICE_RECORDS" },
      { key: "CUSTOMERS", permissionState: "LIMITED", noteKey: "ACCOUNTING_CUSTOMERS" },
      { key: "DEVICES", permissionState: "NONE", noteKey: "ACCOUNTING_DEVICES" },
      { key: "CASH", permissionState: "FULL", noteKey: "ACCOUNTING_CASH" },
      { key: "STAFF_SETTINGS", permissionState: "NONE", noteKey: "ACCOUNTING_STAFF_SETTINGS" },
    ],
  },
};

function buildStaffDetail(item: StaffListItem): StaffDetail {
  return {
    ...item,
    roleTemplate: roleTemplates[item.role],
  };
}

export function buildMockStaffDetail(item: StaffListItem): StaffDetail {
  return buildStaffDetail(item);
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase("en-US")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export async function getStaffOverview(): Promise<StaffOverview> {
  return {
    updatedAt: "2026-05-21T09:20:00.000Z",
    summary: {
      totalStaff: staffItems.length,
      activeTechnicians: staffItems.filter((item) => item.role === "TECHNICIAN" && item.status === "ACTIVE").length,
      assignedJobsToday: staffItems.reduce((total, item) => total + item.assignedTodayCount, 0),
      unavailableCount: staffItems.filter((item) => item.status !== "ACTIVE").length,
    },
    items: staffItems,
  };
}

export async function getStaffDetail(staffId: string): Promise<StaffDetail | null> {
  const item = staffItems.find((entry) => entry.id === staffId);

  return item ? buildStaffDetail(item) : null;
}

export async function createMockStaff(input: CreateStaffInput): Promise<{ staff: StaffDetail }> {
  const normalizedName = input.name.trim();
  const suffix = Math.max(staffItems.length + 1, 1).toString().padStart(3, "0");
  const id = `staff-${slugifyName(normalizedName) || "member"}-${suffix}`;

  return {
    staff: buildStaffDetail({
      id,
      name: normalizedName,
      role: input.role,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      status: input.status,
      openAssignedServiceCount: 0,
      assignedTodayCount: 0,
      recentAssignments: [],
    }),
  };
}

export async function updateMockStaff(input: UpdateStaffInput): Promise<{ staff: StaffDetail }> {
  return {
    staff: buildStaffDetail({
      id: input.id,
      name: input.name.trim(),
      role: input.role,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      status: input.status,
      openAssignedServiceCount: 0,
      assignedTodayCount: 0,
      recentAssignments: [],
    }),
  };
}
