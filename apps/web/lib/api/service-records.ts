export type ServiceStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_PART"
  | "WAITING_CUSTOMER_APPROVAL"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type ServicePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ServiceRecordListItem = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
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

export async function getServiceRecordsOverview(): Promise<ServiceRecordsOverview> {
  return {
    updatedAt: "2026-05-19T11:15:00.000Z",
    records: [
      {
        id: "srv-201",
        trackingCode: "SRV-2026-201",
        customerName: "Ahmet Yılmaz",
        customerPhone: "+90 532 000 10 10",
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
        customerName: "Ayşe Demir",
        customerPhone: "+90 533 111 20 20",
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
        customerName: "Mehmet Öz",
        customerPhone: "+90 535 222 30 30",
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
        customerName: "Zeynep Kaya",
        customerPhone: "+90 537 333 40 40",
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
