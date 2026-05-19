
export enum TicketStatus {
  TEKNIK_SERVIS = 'TEKNIK_SERVIS',
  SERVISINE_GONDERILDI = 'SERVISINE_GONDERILDI',
  PARCA_BEKLIYOR = 'PARCA_BEKLIYOR',
  ONAY_BEKLIYOR = 'ONAY_BEKLIYOR',
  UCRET_BILDIRILECEK = 'UCRET_BILDIRILECEK',
  IADE_EDILECEK = 'IADE_EDILECEK',
  DIS_SERVIS = 'DIS_SERVIS',
  ONARIM_YAPILIYOR = 'ONARIM_YAPILIYOR',
  PARCASI_GELDI = 'PARCASI_GELDI',
  ONAY_VERILDI = 'ONAY_VERILDI',
  TESLIM_EDILECEK = 'TESLIM_EDILECEK',
  TESLIM_EDILDI = 'TESLIM_EDILDI',
  IPTAL = 'IPTAL'
}

export type ServiceLocation = 'ATOLYE' | 'DIS_SERVIS'; 

export enum UserRole {
  ADMIN = 'Yönetici',
  TECHNICIAN = 'Teknisyen',
  RECEPTION = 'Karşılama'
}

export interface Personnel {
  id: string;
  fullName: string;
  username: string;
  phone: string; // Mandatory
  email?: string; // Optional
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  taxNo?: string;
  taxOffice?: string;
  notes?: string;
}

export interface Device {
  brand: string;
  model: string;
  serialNumber: string;
  type: string; 
  accessories: string[];
  images: string[];
}

export interface ServiceLog {
  id: string;
  date: string;
  user: string;
  action: string; 
  details?: string;
}

export interface Ticket {
  id: string;
  trackingId: string;
  customerId: string; // Changed to ID reference for normalization
  customer?: Customer; // Optional populated field for UI
  assignedTo?: string; // ID of the personnel
  assigneeName?: string; // Helper for UI
  device: Device;
  status: TicketStatus;
  serviceLocation: ServiceLocation;
  complaint: string;
  technicianNotes?: string;
  estimatedCost?: number;
  finalCost?: number;
  currency: 'TRY' | 'USD' | 'EUR';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  priority: 'Low' | 'Normal' | 'High';
  logs: ServiceLog[];
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  minLevel: number;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string; 
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK';
}

export interface DashboardStat {
  label: string;
  count: number;
  status?: TicketStatus;
  color: 'blue' | 'red' | 'green' | 'gray' | 'yellow' | 'purple';
  icon?: any;
}

export interface AppSettings {
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  currencySymbol: string;
  taxRate: number;
  termsAndConditions: string;
}
