export type ReportRange = "today" | "thisWeek" | "thisMonth" | "last30Days";

export type ReportStatusKey = "NEW" | "IN_PROGRESS" | "WAITING_PART" | "WAITING_CUSTOMER_APPROVAL" | "READY_FOR_DELIVERY" | "DELIVERED";

export type ReportsOverviewDataset = {
  updatedAt: string;
  operationalSummary: {
    openedRecords: number;
    completedRecords: number;
    averageTurnaroundHours: number;
    urgentQueue: number;
  };
  financialSummary: {
    revenue: number;
    expenses: number;
    netCash: number;
  };
  serviceStatusDistribution: Array<{
    status: ReportStatusKey;
    count: number;
    share: number;
  }>;
  staffPerformance: Array<{
    id: string;
    name: string;
    roleLabelKey: "operations_manager";
    activeWorkload: number;
    completedRecords: number;
    averageTurnaroundHours: number;
    urgentAssignments: number;
  }>;
  breakdowns: {
    categories: Array<{ id: string; labelKey: string; count: number; share: number }>;
    deviceTypes: Array<{ id: string; labelKey: string; count: number; share: number }>;
    serviceTypes: Array<{ id: string; labelKey: string; count: number; share: number }>;
  };
};

export type ReportsOverview = {
  ranges: Record<ReportRange, ReportsOverviewDataset>;
};

export type MockReportPreparationResult = {
  preparedAt: string;
  referenceCode: string;
  range: ReportRange;
};

const reportsOverview: ReportsOverview = {
  ranges: {
    today: {
      updatedAt: "2026-06-03T08:40:00.000Z",
      operationalSummary: {
        openedRecords: 18,
        completedRecords: 9,
        averageTurnaroundHours: 16.5,
        urgentQueue: 4,
      },
      financialSummary: {
        revenue: 18450,
        expenses: 5720,
        netCash: 12730,
      },
      serviceStatusDistribution: [
        { status: "NEW", count: 6, share: 24 },
        { status: "IN_PROGRESS", count: 7, share: 28 },
        { status: "WAITING_PART", count: 4, share: 16 },
        { status: "WAITING_CUSTOMER_APPROVAL", count: 3, share: 12 },
        { status: "READY_FOR_DELIVERY", count: 3, share: 12 },
        { status: "DELIVERED", count: 2, share: 8 },
      ],
      staffPerformance: [
        { id: "usr-001", name: "Elif Kaya", roleLabelKey: "operations_manager", activeWorkload: 5, completedRecords: 4, averageTurnaroundHours: 12.4, urgentAssignments: 1 },
        { id: "usr-002", name: "Bora Aydın", roleLabelKey: "operations_manager", activeWorkload: 4, completedRecords: 3, averageTurnaroundHours: 15.1, urgentAssignments: 2 },
        { id: "usr-003", name: "Seda Akın", roleLabelKey: "operations_manager", activeWorkload: 6, completedRecords: 5, averageTurnaroundHours: 18.8, urgentAssignments: 1 },
      ],
      breakdowns: {
        categories: [
          { id: "mobile", labelKey: "mobile", count: 8, share: 35 },
          { id: "whiteGoods", labelKey: "whiteGoods", count: 6, share: 26 },
          { id: "smallAppliance", labelKey: "smallAppliance", count: 5, share: 22 },
          { id: "network", labelKey: "network", count: 4, share: 17 },
        ],
        deviceTypes: [
          { id: "smartphone", labelKey: "smartphone", count: 7, share: 30 },
          { id: "washingMachine", labelKey: "washingMachine", count: 5, share: 22 },
          { id: "combiBoiler", labelKey: "combiBoiler", count: 6, share: 26 },
          { id: "tablet", labelKey: "tablet", count: 5, share: 22 },
        ],
        serviceTypes: [
          { id: "workshop", labelKey: "workshop", count: 11, share: 48 },
          { id: "onSite", labelKey: "onSite", count: 5, share: 22 },
          { id: "pickup", labelKey: "pickup", count: 4, share: 17 },
          { id: "maintenance", labelKey: "maintenance", count: 3, share: 13 },
        ],
      },
    },
    thisWeek: {
      updatedAt: "2026-06-03T08:40:00.000Z",
      operationalSummary: {
        openedRecords: 74,
        completedRecords: 41,
        averageTurnaroundHours: 19.2,
        urgentQueue: 9,
      },
      financialSummary: {
        revenue: 76350,
        expenses: 24810,
        netCash: 51540,
      },
      serviceStatusDistribution: [
        { status: "NEW", count: 18, share: 21 },
        { status: "IN_PROGRESS", count: 24, share: 28 },
        { status: "WAITING_PART", count: 12, share: 14 },
        { status: "WAITING_CUSTOMER_APPROVAL", count: 8, share: 9 },
        { status: "READY_FOR_DELIVERY", count: 10, share: 12 },
        { status: "DELIVERED", count: 14, share: 16 },
      ],
      staffPerformance: [
        { id: "usr-001", name: "Elif Kaya", roleLabelKey: "operations_manager", activeWorkload: 12, completedRecords: 14, averageTurnaroundHours: 17.3, urgentAssignments: 2 },
        { id: "usr-002", name: "Bora Aydın", roleLabelKey: "operations_manager", activeWorkload: 11, completedRecords: 12, averageTurnaroundHours: 18.7, urgentAssignments: 3 },
        { id: "usr-003", name: "Seda Akın", roleLabelKey: "operations_manager", activeWorkload: 13, completedRecords: 15, averageTurnaroundHours: 21.4, urgentAssignments: 4 },
      ],
      breakdowns: {
        categories: [
          { id: "mobile", labelKey: "mobile", count: 25, share: 34 },
          { id: "whiteGoods", labelKey: "whiteGoods", count: 19, share: 26 },
          { id: "smallAppliance", labelKey: "smallAppliance", count: 16, share: 22 },
          { id: "network", labelKey: "network", count: 14, share: 18 },
        ],
        deviceTypes: [
          { id: "smartphone", labelKey: "smartphone", count: 21, share: 28 },
          { id: "washingMachine", labelKey: "washingMachine", count: 18, share: 24 },
          { id: "combiBoiler", labelKey: "combiBoiler", count: 19, share: 26 },
          { id: "tablet", labelKey: "tablet", count: 16, share: 22 },
        ],
        serviceTypes: [
          { id: "workshop", labelKey: "workshop", count: 34, share: 46 },
          { id: "onSite", labelKey: "onSite", count: 17, share: 23 },
          { id: "pickup", labelKey: "pickup", count: 11, share: 15 },
          { id: "maintenance", labelKey: "maintenance", count: 12, share: 16 },
        ],
      },
    },
    thisMonth: {
      updatedAt: "2026-06-03T08:40:00.000Z",
      operationalSummary: {
        openedRecords: 248,
        completedRecords: 171,
        averageTurnaroundHours: 22.8,
        urgentQueue: 17,
      },
      financialSummary: {
        revenue: 246800,
        expenses: 93840,
        netCash: 152960,
      },
      serviceStatusDistribution: [
        { status: "NEW", count: 55, share: 19 },
        { status: "IN_PROGRESS", count: 76, share: 26 },
        { status: "WAITING_PART", count: 38, share: 13 },
        { status: "WAITING_CUSTOMER_APPROVAL", count: 24, share: 8 },
        { status: "READY_FOR_DELIVERY", count: 41, share: 14 },
        { status: "DELIVERED", count: 57, share: 20 },
      ],
      staffPerformance: [
        { id: "usr-001", name: "Elif Kaya", roleLabelKey: "operations_manager", activeWorkload: 21, completedRecords: 49, averageTurnaroundHours: 20.3, urgentAssignments: 5 },
        { id: "usr-002", name: "Bora Aydın", roleLabelKey: "operations_manager", activeWorkload: 19, completedRecords: 46, averageTurnaroundHours: 22.1, urgentAssignments: 6 },
        { id: "usr-003", name: "Seda Akın", roleLabelKey: "operations_manager", activeWorkload: 23, completedRecords: 52, averageTurnaroundHours: 24.5, urgentAssignments: 6 },
      ],
      breakdowns: {
        categories: [
          { id: "mobile", labelKey: "mobile", count: 84, share: 34 },
          { id: "whiteGoods", labelKey: "whiteGoods", count: 64, share: 26 },
          { id: "smallAppliance", labelKey: "smallAppliance", count: 49, share: 20 },
          { id: "network", labelKey: "network", count: 51, share: 20 },
        ],
        deviceTypes: [
          { id: "smartphone", labelKey: "smartphone", count: 69, share: 28 },
          { id: "washingMachine", labelKey: "washingMachine", count: 56, share: 23 },
          { id: "combiBoiler", labelKey: "combiBoiler", count: 65, share: 26 },
          { id: "tablet", labelKey: "tablet", count: 58, share: 23 },
        ],
        serviceTypes: [
          { id: "workshop", labelKey: "workshop", count: 117, share: 47 },
          { id: "onSite", labelKey: "onSite", count: 54, share: 22 },
          { id: "pickup", labelKey: "pickup", count: 35, share: 14 },
          { id: "maintenance", labelKey: "maintenance", count: 42, share: 17 },
        ],
      },
    },
    last30Days: {
      updatedAt: "2026-06-03T08:40:00.000Z",
      operationalSummary: {
        openedRecords: 286,
        completedRecords: 198,
        averageTurnaroundHours: 23.7,
        urgentQueue: 21,
      },
      financialSummary: {
        revenue: 281420,
        expenses: 112360,
        netCash: 169060,
      },
      serviceStatusDistribution: [
        { status: "NEW", count: 63, share: 19 },
        { status: "IN_PROGRESS", count: 81, share: 24 },
        { status: "WAITING_PART", count: 43, share: 13 },
        { status: "WAITING_CUSTOMER_APPROVAL", count: 29, share: 9 },
        { status: "READY_FOR_DELIVERY", count: 47, share: 14 },
        { status: "DELIVERED", count: 71, share: 21 },
      ],
      staffPerformance: [
        { id: "usr-001", name: "Elif Kaya", roleLabelKey: "operations_manager", activeWorkload: 23, completedRecords: 56, averageTurnaroundHours: 21.8, urgentAssignments: 6 },
        { id: "usr-002", name: "Bora Aydın", roleLabelKey: "operations_manager", activeWorkload: 24, completedRecords: 53, averageTurnaroundHours: 23.1, urgentAssignments: 7 },
        { id: "usr-003", name: "Seda Akın", roleLabelKey: "operations_manager", activeWorkload: 26, completedRecords: 59, averageTurnaroundHours: 25.2, urgentAssignments: 8 },
      ],
      breakdowns: {
        categories: [
          { id: "mobile", labelKey: "mobile", count: 94, share: 33 },
          { id: "whiteGoods", labelKey: "whiteGoods", count: 74, share: 26 },
          { id: "smallAppliance", labelKey: "smallAppliance", count: 58, share: 20 },
          { id: "network", labelKey: "network", count: 60, share: 21 },
        ],
        deviceTypes: [
          { id: "smartphone", labelKey: "smartphone", count: 78, share: 27 },
          { id: "washingMachine", labelKey: "washingMachine", count: 66, share: 23 },
          { id: "combiBoiler", labelKey: "combiBoiler", count: 75, share: 26 },
          { id: "tablet", labelKey: "tablet", count: 67, share: 24 },
        ],
        serviceTypes: [
          { id: "workshop", labelKey: "workshop", count: 133, share: 47 },
          { id: "onSite", labelKey: "onSite", count: 61, share: 21 },
          { id: "pickup", labelKey: "pickup", count: 41, share: 14 },
          { id: "maintenance", labelKey: "maintenance", count: 51, share: 18 },
        ],
      },
    },
  },
};

export async function getReportsOverview(): Promise<ReportsOverview> {
  return reportsOverview;
}

export async function prepareMockReportExport(range: ReportRange): Promise<MockReportPreparationResult> {
  return {
    range,
    preparedAt: "2026-06-03T09:05:00.000Z",
    referenceCode: `RPT-${range.toUpperCase()}-260603`,
  };
}
