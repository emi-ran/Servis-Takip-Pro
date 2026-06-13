import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/settings";

type PublicTrackingCopy = {
  metadata: {
    title: string;
    description: string;
  };
  brandName: string;
  languageLabel: string;
  languages: Record<Locale, string>;
  header: {
    eyebrow: string;
    title: string;
    description: string;
    supportLabel: string;
    supportValue: string;
  };
  summary: {
    eyebrow: string;
    description: string;
    trackingCode: string;
    device: string;
    receivedAt: string;
    currentStatus: string;
    estimatedCompletion: string;
    estimatedCompletionUnavailable: string;
  };
  privacy: {
    title: string;
    description: string;
  };
  contact: {
    title: string;
    description: string;
    branch: string;
    phone: string;
    email: string;
    address: string;
  };
  timeline: {
    title: string;
    description: string;
    pending: string;
    states: {
      completed: string;
      current: string;
      upcoming: string;
    };
    received: string;
    diagnosis: string;
    repair: string;
    ready: string;
    delivered: string;
  };
  mockSecurity: {
    title: string;
    description: string;
  };
  invalid: {
    eyebrow: string;
    title: string;
    description: string;
    helpLabel: string;
    helpDescription: string;
  };
  footer: string;
  statusLabels: Record<"NEW" | "APPOINTMENT_SCHEDULED" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_PART" | "WAITING_CUSTOMER_APPROVAL" | "REPAIRING" | "READY_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "UNREACHABLE" | "UNPAID", string>;
};

const copyByLocale: Record<Locale, PublicTrackingCopy> = {
  tr: {
    metadata: {
      title: "Servis takip bağlantısı",
      description: "Müşteri güvenli servis takip özeti",
    },
    brandName: "CetTech Servis",
    languageLabel: "Dil",
    languages: {
      tr: "Türkçe",
      en: "English",
    },
    header: {
      eyebrow: "Güvenli müşteri görünümü",
      title: "Servis durumunuzu takip edin",
      description: "Bu sayfa yalnızca müşteriye açık özet bilgileri gösterir. İç notlar, personel kayıtları ve finans detayları paylaşılmaz.",
      supportLabel: "Destek hattı",
      supportValue: "+90 850 955 01 23",
    },
    summary: {
      eyebrow: "Kayıt özeti",
      description: "Takip kodunuz, cihaz bilgisi ve müşteriyle paylaşılabilen servis durumu burada gösterilir.",
      trackingCode: "Takip kodu",
      device: "Cihaz",
      receivedAt: "Kabul tarihi",
      currentStatus: "Güncel durum",
      estimatedCompletion: "Tahmini tamamlanma",
      estimatedCompletionUnavailable: "Henüz paylaşılmadı",
    },
    privacy: {
      title: "Gizlilik notu",
      description: "Müşteriye açık bu görünüm; yalnızca takip kodu, durum, cihaz özeti, zaman çizelgesi ve şube iletişimini içerir.",
    },
    contact: {
      title: "Şube iletişimi",
      description: "Ek bilgi gerekiyorsa kayıt aldığınız şube ile iletişime geçebilirsiniz.",
      branch: "Şube",
      phone: "Telefon",
      email: "E-posta",
      address: "Adres",
    },
    timeline: {
      title: "Müşteri paylaşımına açık süreç",
      description: "Aşağıdaki adımlar yalnızca müşteriye gösterilmesi güvenli operasyon özetidir.",
      pending: "Beklemede",
      states: {
        completed: "Tamamlandı",
        current: "Aktif",
        upcoming: "Sırada",
      },
      received: "Kayıt alındı",
      diagnosis: "İlk inceleme",
      repair: "Servis işlemi",
      ready: "Teslime hazırlanıyor",
      delivered: "Teslim edildi",
    },
    mockSecurity: {
      title: "Mock güvenlik sınırı",
      description: "Gerçek sistemde takip kodları tahmin edilemez token olmalı; backend rate limiting, veri filtreleme ve yetkili signed medya URL'leri zorunlu olmalıdır.",
    },
    invalid: {
      eyebrow: "Takip bağlantısı",
      title: "Bu bağlantı şu anda görüntülenemiyor",
      description: "Bağlantı geçersiz olabilir, süresi dolmuş olabilir veya müşteri görünümü kapatılmış olabilir.",
      helpLabel: "Yardım",
      helpDescription: "Size verilen takip bağlantısını kontrol edin veya servis aldığınız şube ile iletişime geçin.",
    },
    footer: "Gösterilen kayıt kodu: {code}",
    statusLabels: {
      NEW: "Yeni kayıt",
      APPOINTMENT_SCHEDULED: "Randevu planlandı",
      ASSIGNED: "Personel atandı",
      IN_PROGRESS: "İşlemde",
      WAITING_PART: "Parça bekleniyor",
      WAITING_CUSTOMER_APPROVAL: "Müşteri onayı bekleniyor",
      REPAIRING: "Onarım aşamasında",
      READY_FOR_DELIVERY: "Teslime hazır",
      DELIVERED: "Teslim edildi",
      CANCELLED: "İptal edildi",
      UNREACHABLE: "Ulaşılamıyor",
      UNPAID: "Ödeme bekliyor",
    },
  },
  en: {
    metadata: {
      title: "Service tracking link",
      description: "Customer-safe service tracking summary",
    },
    brandName: "CetTech Service",
    languageLabel: "Language",
    languages: {
      tr: "Türkçe",
      en: "English",
    },
    header: {
      eyebrow: "Secure customer view",
      title: "Track your service status",
      description: "This page shows customer-safe summary data only. Internal notes, staff logs, and financial details are not shared.",
      supportLabel: "Support line",
      supportValue: "+90 850 955 01 23",
    },
    summary: {
      eyebrow: "Record summary",
      description: "Your tracking code, device details, and customer-safe status are shown here.",
      trackingCode: "Tracking code",
      device: "Device",
      receivedAt: "Received at",
      currentStatus: "Current status",
      estimatedCompletion: "Estimated completion",
      estimatedCompletionUnavailable: "Not shared yet",
    },
    privacy: {
      title: "Privacy note",
      description: "This customer-facing view includes only the tracking code, status, device summary, timeline, and branch contact details.",
    },
    contact: {
      title: "Branch contact",
      description: "If you need more information, please contact the branch where your device was received.",
      branch: "Branch",
      phone: "Phone",
      email: "Email",
      address: "Address",
    },
    timeline: {
      title: "Customer-safe progress",
      description: "The steps below are limited to a safe operational summary for customers.",
      pending: "Pending",
      states: {
        completed: "Completed",
        current: "Current",
        upcoming: "Upcoming",
      },
      received: "Record received",
      diagnosis: "Initial review",
      repair: "Service work",
      ready: "Preparing for delivery",
      delivered: "Delivered",
    },
    mockSecurity: {
      title: "Mock security boundary",
      description: "In production, tracking codes must be non-guessable tokens, with backend rate limiting, response filtering, and authorization-aware signed media URLs.",
    },
    invalid: {
      eyebrow: "Tracking link",
      title: "This link cannot be displayed right now",
      description: "The link may be invalid, expired, or the customer-facing view may be unavailable.",
      helpLabel: "Help",
      helpDescription: "Please verify the tracking link you received or contact the service branch directly.",
    },
    footer: "Displayed record code: {code}",
    statusLabels: {
      NEW: "New record",
      APPOINTMENT_SCHEDULED: "Appointment scheduled",
      ASSIGNED: "Staff assigned",
      IN_PROGRESS: "In progress",
      WAITING_PART: "Waiting for part",
      WAITING_CUSTOMER_APPROVAL: "Waiting for customer approval",
      REPAIRING: "Repairing",
      READY_FOR_DELIVERY: "Ready for delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      UNREACHABLE: "Unreachable",
      UNPAID: "Unpaid",
    },
  },
};

export type PublicTrackingCopyDictionary = PublicTrackingCopy;

export function getPublicTrackingLocale(lang?: string): Locale {
  return lang && isLocale(lang) ? lang : defaultLocale;
}

export function getPublicTrackingCopy(lang?: string): PublicTrackingCopy {
  return copyByLocale[getPublicTrackingLocale(lang)];
}
