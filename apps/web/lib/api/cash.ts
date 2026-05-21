export type CashTransactionType = "PAYMENT" | "EXPENSE" | "PENDING";

export type CashMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

export type CashFilter = "all" | "income" | "expense" | "pending";

export type CashTransaction = {
  id: string;
  type: CashTransactionType;
  amount: number;
  currency: "TRY";
  occurredAt: string;
  method: CashMethod | null;
  noteKey:
    | "service_collection"
    | "fuel_expense"
    | "parts_and_labor_collection"
    | "awaiting_customer_approval"
    | "supplier_parts_payment"
    | "collect_at_delivery"
    | "corporate_bulk_collection";
  customerId?: string;
  customerName?: string;
  serviceRecordId?: string;
  serviceRecordCode?: string;
};

export type CashOverview = {
  updatedAt: string;
  summary: {
    todayIncome: number;
    todayExpense: number;
    netCash: number;
    pendingReceivables: number;
  };
  transactions: CashTransaction[];
};

export async function getCashOverview(): Promise<CashOverview> {
  return {
    updatedAt: "2026-05-21T12:20:00.000Z",
    summary: {
      todayIncome: 18750,
      todayExpense: 4320,
      netCash: 14430,
      pendingReceivables: 9650,
    },
    transactions: [
      {
        id: "txn-501",
        type: "PAYMENT",
        amount: 3250,
        currency: "TRY",
        occurredAt: "2026-05-21T11:40:00.000Z",
        method: "CARD",
        noteKey: "service_collection",
        customerId: "cust-001",
        customerName: "Ahmet Yılmaz",
        serviceRecordId: "srv-201",
        serviceRecordCode: "SRV-2026-201",
      },
      {
        id: "txn-502",
        type: "EXPENSE",
        amount: 1680,
        currency: "TRY",
        occurredAt: "2026-05-21T10:10:00.000Z",
        method: "BANK_TRANSFER",
        noteKey: "fuel_expense",
      },
      {
        id: "txn-503",
        type: "PAYMENT",
        amount: 5400,
        currency: "TRY",
        occurredAt: "2026-05-21T09:35:00.000Z",
        method: "CASH",
        noteKey: "parts_and_labor_collection",
        customerId: "cust-004",
        customerName: "Zeynep Kaya",
        serviceRecordId: "srv-204",
        serviceRecordCode: "SRV-2026-204",
      },
      {
        id: "txn-504",
        type: "PENDING",
        amount: 2200,
        currency: "TRY",
        occurredAt: "2026-05-21T08:15:00.000Z",
        method: null,
        noteKey: "awaiting_customer_approval",
        customerId: "cust-003",
        customerName: "Mehmet Öz",
        serviceRecordId: "srv-203",
        serviceRecordCode: "SRV-2026-203",
      },
      {
        id: "txn-505",
        type: "EXPENSE",
        amount: 2640,
        currency: "TRY",
        occurredAt: "2026-05-20T17:50:00.000Z",
        method: "CARD",
        noteKey: "supplier_parts_payment",
      },
      {
        id: "txn-506",
        type: "PENDING",
        amount: 7450,
        currency: "TRY",
        occurredAt: "2026-05-20T16:05:00.000Z",
        method: null,
        noteKey: "collect_at_delivery",
        customerName: "Selin Arslan",
        serviceRecordCode: "SRV-2026-206",
      },
      {
        id: "txn-507",
        type: "PAYMENT",
        amount: 10100,
        currency: "TRY",
        occurredAt: "2026-05-20T14:25:00.000Z",
        method: "BANK_TRANSFER",
        noteKey: "corporate_bulk_collection",
        customerId: "cust-002",
        customerName: "Ayşe Demir",
      },
    ],
  };
}
