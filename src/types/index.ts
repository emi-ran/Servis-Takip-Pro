export type { SessionPayload } from "@/lib/auth";

export type UserRole = "ADMIN" | "TECHNICIAN";

export type ServiceStatus =
  | "KAYIT_ACILDI"
  | "TAMIRATTA"
  | "FIYAT_TEKLIFI_VERILDI"
  | "MUSTERI_REDDETTI"
  | "HAZIR"
  | "ODEME_BEKLIYOR"
  | "TESLIM_EDILDI"
  | "IPTAL_EDILDI";

export type ServicePriority =
  | "DUSUK"
  | "NORMAL"
  | "YUKSEK"
  | "ACIL";

export type PaymentType = "BORC" | "TAHSILAT";
export type PaymentMethod = "NAKIT" | "KART" | "EFT" | "DIGER";

export type TaskType =
  | "CIHAZ_ALINACAK"
  | "CIHAZ_BIRAKILACAK"
  | "BAKIM"
  | "KURULUM"
  | "DIGER";

export type TaskStatus =
  | "PLANLANDI"
  | "DEVAM_EDIYOR"
  | "TAMAMLANDI"
  | "IPTAL";

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
