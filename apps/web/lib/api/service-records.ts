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
