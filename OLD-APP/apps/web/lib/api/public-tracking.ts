import type { ServiceStatus } from "@/lib/api/service-records";

export type PublicTrackingTimelineStepKey = "received" | "diagnosis" | "repair" | "ready" | "delivered";

export type PublicTrackingTimelineStepState = "completed" | "current" | "upcoming";

export type PublicTrackingTimelineStep = {
  key: PublicTrackingTimelineStepKey;
  state: PublicTrackingTimelineStepState;
  happenedAt: string | null;
};

export type PublicTrackingRecord = {
  trackingCode: string;
  currentStatus: ServiceStatus;
  issueTitle: string;
  receivedAt: string;
  estimatedCompletionAt: string | null;
  device: {
    brand: string;
    model: string;
  };
  branch: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  timeline: PublicTrackingTimelineStep[];
};

type RawPublicTrackingRecord = {
  token: string;
  expiresAt: string;
  currentStatus: ServiceStatus;
  currentTimelineStep: PublicTrackingTimelineStepKey;
  issueTitle: string;
  receivedAt: string;
  estimatedCompletionAt: string | null;
  device: {
    brand: string;
    model: string;
  };
  branch: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  milestones: Partial<Record<PublicTrackingTimelineStepKey, string>>;
};

const orderedTimelineSteps: PublicTrackingTimelineStepKey[] = ["received", "diagnosis", "repair", "ready", "delivered"];

const rawRecords: RawPublicTrackingRecord[] = [
  {
    token: "trk_8MX2Q7L9P4K2",
    expiresAt: "2026-12-31T23:59:59.000Z",
    currentStatus: "IN_PROGRESS",
    currentTimelineStep: "repair",
    issueTitle: "Şarj olmuyor ve ara ara kapanıyor",
    receivedAt: "2026-06-01T09:15:00.000Z",
    estimatedCompletionAt: "2026-06-05T15:00:00.000Z",
    device: {
      brand: "Samsung",
      model: "Galaxy S23",
    },
    branch: {
      name: "Kadıköy Servis Noktası",
      phone: "+90 216 555 10 20",
      email: "destek@cettechservis.com",
      address: "Osmanağa Mah. Söğütlüçeşme Cad. No:18 Kadıköy / İstanbul",
    },
    milestones: {
      received: "2026-06-01T09:15:00.000Z",
      diagnosis: "2026-06-01T13:40:00.000Z",
      repair: "2026-06-03T08:45:00.000Z",
    },
  },
  {
    token: "ptk_V4N8R2M7Q1ZX",
    expiresAt: "2026-12-31T23:59:59.000Z",
    currentStatus: "DELIVERED",
    currentTimelineStep: "delivered",
    issueTitle: "Motor bakımı ve filtre değişimi",
    receivedAt: "2026-05-28T10:20:00.000Z",
    estimatedCompletionAt: null,
    device: {
      brand: "Dyson",
      model: "V15 Detect",
    },
    branch: {
      name: "Beşiktaş Servis Noktası",
      phone: "+90 212 555 44 77",
      email: "besiktas@cettechservis.com",
      address: "Sinanpaşa Mah. Şair Nedim Cad. No:42 Beşiktaş / İstanbul",
    },
    milestones: {
      received: "2026-05-28T10:20:00.000Z",
      diagnosis: "2026-05-28T14:00:00.000Z",
      repair: "2026-05-29T09:30:00.000Z",
      ready: "2026-05-30T16:10:00.000Z",
      delivered: "2026-05-31T11:00:00.000Z",
    },
  },
];

const publicTrackingCodePattern = /^[A-Za-z0-9_-]{8,64}$/;

function buildPublicTimeline(record: RawPublicTrackingRecord): PublicTrackingTimelineStep[] {
  const currentStepIndex = orderedTimelineSteps.indexOf(record.currentTimelineStep);

  return orderedTimelineSteps.map((key, index) => ({
    key,
    state: index < currentStepIndex ? "completed" : index === currentStepIndex ? "current" : "upcoming",
    happenedAt: record.milestones[key] ?? null,
  }));
}

function sanitizeRecord(record: RawPublicTrackingRecord): PublicTrackingRecord {
  return {
    trackingCode: record.token,
    currentStatus: record.currentStatus,
    issueTitle: record.issueTitle,
    receivedAt: record.receivedAt,
    estimatedCompletionAt: record.estimatedCompletionAt,
    device: {
      brand: record.device.brand,
      model: record.device.model,
    },
    branch: {
      name: record.branch.name,
      phone: record.branch.phone,
      email: record.branch.email,
      address: record.branch.address,
    },
    timeline: buildPublicTimeline(record),
  };
}

export async function getPublicTrackingRecord(code: string): Promise<PublicTrackingRecord | null> {
  const normalizedCode = code.trim();

  if (!publicTrackingCodePattern.test(normalizedCode)) {
    return null;
  }

  const record = rawRecords.find((item) => item.token.toLowerCase() === normalizedCode.toLowerCase());

  if (!record) {
    return null;
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return sanitizeRecord(record);
}
