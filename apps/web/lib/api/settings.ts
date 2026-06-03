export type SettingsLocale = "tr" | "en";

export type SettingsCurrency = "TRY" | "USD" | "EUR";

export type SettingsTimezone = "Europe/Istanbul" | "Europe/Berlin" | "UTC";

export type NotificationChannel = "sms" | "email" | "whatsapp";

export type ReadinessStatus = "BACKEND_REQUIRED" | "PLANNING_ONLY";

export type WorkingHoursTemplate = "MON_SAT";

export type SundayCoverage = "ON_CALL_INTAKE";

export type PublicTrackingMode = "PLANNED";

export type SettingsCompanyProfile = {
  companyName: string;
  taxNumber: string;
  phone: string;
  email: string;
  defaultLocale: SettingsLocale;
  defaultCurrency: SettingsCurrency;
  timezone: SettingsTimezone;
};

export type SettingsOverview = {
  updatedAt: string;
  companyProfile: SettingsCompanyProfile;
  branchOperation: {
    branchCount: number;
    workingHours: {
      template: WorkingHoursTemplate;
      startTime: string;
      endTime: string;
      sundayCoverage: SundayCoverage;
    };
    serviceRecordPrefix: string;
    nextSequence: number;
    previewCode: string;
    publicTrackingMode: PublicTrackingMode;
  };
  notifications: Array<{
    channel: NotificationChannel;
    enabled: boolean;
  }>;
  securityChecklist: Array<{
    id: "auth" | "rbac" | "tenant_guard" | "audit_log" | "signed_file_urls";
    status: ReadinessStatus;
  }>;
};

export type UpdateSettingsCompanyProfileInput = SettingsCompanyProfile;

const settingsOverview: SettingsOverview = {
  updatedAt: "2026-06-03T09:15:00.000Z",
  companyProfile: {
    companyName: "CetTech Servis",
    taxNumber: "3456789012",
    phone: "+90 216 555 14 24",
    email: "operasyon@cettechservis.com",
    defaultLocale: "tr",
    defaultCurrency: "TRY",
    timezone: "Europe/Istanbul",
  },
  branchOperation: {
    branchCount: 3,
    workingHours: {
      template: "MON_SAT",
      startTime: "09:00",
      endTime: "18:30",
      sundayCoverage: "ON_CALL_INTAKE",
    },
    serviceRecordPrefix: "SRV-2026",
    nextSequence: 428,
    previewCode: "SRV-2026-0428",
    publicTrackingMode: "PLANNED",
  },
  notifications: [
    { channel: "sms", enabled: false },
    { channel: "email", enabled: true },
    { channel: "whatsapp", enabled: false },
  ],
  securityChecklist: [
    { id: "auth", status: "BACKEND_REQUIRED" },
    { id: "rbac", status: "BACKEND_REQUIRED" },
    { id: "tenant_guard", status: "BACKEND_REQUIRED" },
    { id: "audit_log", status: "BACKEND_REQUIRED" },
    { id: "signed_file_urls", status: "BACKEND_REQUIRED" },
  ],
};

export async function getSettingsOverview(): Promise<SettingsOverview> {
  return structuredClone(settingsOverview);
}

export async function saveMockSettingsCompanyProfile(
  input: UpdateSettingsCompanyProfileInput,
): Promise<{ companyProfile: SettingsCompanyProfile; savedAt: string }> {
  return {
    companyProfile: structuredClone(input),
    savedAt: new Date().toISOString(),
  };
}
