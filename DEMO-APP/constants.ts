
import { Ticket, TicketStatus, StockItem, Transaction, Personnel, UserRole } from './types';

export const MOCK_PERSONNEL: Personnel[] = [
  { id: 'u1', fullName: 'Yönetici Admin', username: 'admin', phone: '05550000001', role: UserRole.ADMIN, isActive: true },
  { id: 'u2', fullName: 'Teknisyen Ali', username: 'ali.tek', phone: '05550000002', role: UserRole.TECHNICIAN, isActive: true },
  { id: 'u3', fullName: 'Teknisyen Veli', username: 'veli.tek', phone: '05550000003', role: UserRole.TECHNICIAN, isActive: true },
  { id: 'u4', fullName: 'Buse Danışma', username: 'buse.d', phone: '05550000004', role: UserRole.RECEPTION, isActive: true },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    trackingId: 'SRV-1001',
    customerId: 'c1',
    customer: { id: 'c1', fullName: 'Ahmet Yılmaz', phone: '05551234567', address: 'Kadıköy, İstanbul' },
    assignedTo: 'u2',
    device: { 
      brand: 'Samsung', 
      model: 'Galaxy S23', 
      serialNumber: 'SN123456', 
      type: 'Telefon', 
      accessories: ['Şarj Aleti'],
      images: ['https://images.unsplash.com/photo-1598327773204-c8c129e799f9?auto=format&fit=crop&q=80&w=200']
    },
    status: TicketStatus.TEKNIK_SERVIS,
    serviceLocation: 'ATOLYE',
    complaint: 'Ekran kırık, dokunmatik çalışmıyor.',
    estimatedCost: 3500,
    currency: 'TRY',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 'High',
    logs: [
      { id: 'l1', date: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'Kabul Görevlisi', action: 'Cihaz Kabul Edildi', details: 'Ekran çatlak görüldü.' },
      { id: 'l2', date: new Date(Date.now() - 3600000).toISOString(), user: 'Teknisyen Ali', action: 'Arıza Tespiti', details: 'Sadece ön cam değil, panel değişimi gerekli.' }
    ]
  },
  {
    id: '2',
    trackingId: 'SRV-1002',
    customerId: 'c2',
    customer: { id: 'c2', fullName: 'Ayşe Demir', phone: '05329876543', address: 'Çankaya, Ankara' },
    device: { 
      brand: 'Bosch', 
      model: 'WGA142', 
      serialNumber: 'B112233', 
      type: 'Beyaz Eşya', 
      accessories: [],
      images: []
    },
    status: TicketStatus.PARCA_BEKLIYOR,
    serviceLocation: 'DIS_SERVIS',
    complaint: 'Çamaşır makinesi su boşaltmıyor.',
    technicianNotes: 'Pompa motoru arızalı, parça sipariş edildi.',
    currency: 'TRY',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 'Normal',
    logs: [
      { id: 'l3', date: new Date(Date.now() - 86400000 * 5).toISOString(), user: 'Saha Ekibi', action: 'Servis Kaydı Oluşturuldu' },
      { id: 'l4', date: new Date(Date.now() - 86400000 * 4).toISOString(), user: 'Teknisyen Veli', action: 'Parça Siparişi', details: 'Tahliye pompası istendi.' }
    ]
  },
  {
    id: '3',
    trackingId: 'SRV-1003',
    customerId: 'c3',
    customer: { id: 'c3', fullName: 'Mehmet Öz', phone: '05051112233' },
    device: { brand: 'Apple', model: 'MacBook Pro M1', serialNumber: 'C02XXXX', type: 'Notebook', accessories: ['Adaptör'], images: [] },
    status: TicketStatus.ONAY_BEKLIYOR,
    serviceLocation: 'ATOLYE',
    complaint: 'Sıvı teması, açılmıyor.',
    estimatedCost: 12000,
    currency: 'TRY',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 'High',
    logs: [
      { id: 'l5', date: new Date(Date.now() - 86400000 * 1).toISOString(), user: 'Kabul', action: 'Giriş Yapıldı' },
      { id: 'l6', date: new Date().toISOString(), user: 'Müşteri Hiz.', action: 'Fiyat Onayı Bekleniyor', details: 'Müşteriye SMS gönderildi.' }
    ]
  },
   {
    id: '4',
    trackingId: 'SRV-1004',
    customerId: 'c4',
    customer: { id: 'c4', fullName: 'Zeynep Kaya', phone: '05051112244' },
    device: { brand: 'Sony', model: 'Bravia TV', serialNumber: 'TV999', type: 'Televizyon', accessories: ['Kumanda'], images: [] },
    status: TicketStatus.TEKNIK_SERVIS,
    serviceLocation: 'ATOLYE',
    complaint: 'Görüntü gidip geliyor.',
    currency: 'TRY',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(), // Old ticket
    updatedAt: new Date().toISOString(),
    priority: 'Normal',
    logs: []
  }
];

export const MOCK_STOCK: StockItem[] = [
  { id: 's1', code: 'PRC-001', name: 'iPhone 11 Ekran', category: 'Telefon Yedek Parça', quantity: 15, buyPrice: 500, sellPrice: 1200, minLevel: 5 },
  { id: 's2', code: 'PRC-002', name: 'Samsung S23 Batarya', category: 'Telefon Yedek Parça', quantity: 2, buyPrice: 800, sellPrice: 1500, minLevel: 3 },
  { id: 's3', code: 'PRC-003', name: 'Bosch Pompa Motoru', category: 'Beyaz Eşya', quantity: 0, buyPrice: 400, sellPrice: 950, minLevel: 2 },
  { id: 's4', code: 'PRC-004', name: 'Dyson V15 Filtre', category: 'Süpürge', quantity: 20, buyPrice: 200, sellPrice: 500, minLevel: 10 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME', category: 'Servis Geliri', amount: 3500, date: new Date().toISOString(), description: 'SRV-1001 Ödemesi', paymentMethod: 'CREDIT_CARD' },
  { id: 't2', type: 'EXPENSE', category: 'Parça Alımı', amount: 5000, date: new Date(Date.now() - 86400000).toISOString(), description: 'Toptancı Ödemesi', paymentMethod: 'BANK' },
  { id: 't3', type: 'INCOME', category: 'Aksesuar Satışı', amount: 450, date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Kılıf + Ekran Koruyucu', paymentMethod: 'CASH' },
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.TEKNIK_SERVIS]: 'Teknik Serviste',
  [TicketStatus.SERVISINE_GONDERILDI]: 'Servisine Gönderildi',
  [TicketStatus.PARCA_BEKLIYOR]: 'Parça Bekliyor',
  [TicketStatus.ONAY_BEKLIYOR]: 'Onay Bekliyor',
  [TicketStatus.UCRET_BILDIRILECEK]: 'Ücret Bildirilecek',
  [TicketStatus.IADE_EDILECEK]: 'İade Edilecek',
  [TicketStatus.DIS_SERVIS]: 'Dış Servis Yapılacak',
  [TicketStatus.ONARIM_YAPILIYOR]: 'Onarımı Yapılıyor',
  [TicketStatus.PARCASI_GELDI]: 'Parçası Geldi',
  [TicketStatus.ONAY_VERILDI]: 'Onay Verildi',
  [TicketStatus.TESLIM_EDILECEK]: 'Teslim Edilecek',
  [TicketStatus.TESLIM_EDILDI]: 'Teslim Edildi',
  [TicketStatus.IPTAL]: 'İptal Edildi'
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.TEKNIK_SERVIS]: 'bg-blue-100 text-blue-800',
  [TicketStatus.SERVISINE_GONDERILDI]: 'bg-indigo-100 text-indigo-800',
  [TicketStatus.PARCA_BEKLIYOR]: 'bg-red-100 text-red-800',
  [TicketStatus.ONAY_BEKLIYOR]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.UCRET_BILDIRILECEK]: 'bg-purple-100 text-purple-800',
  [TicketStatus.IADE_EDILECEK]: 'bg-gray-100 text-gray-800',
  [TicketStatus.DIS_SERVIS]: 'bg-orange-100 text-orange-800',
  [TicketStatus.ONARIM_YAPILIYOR]: 'bg-blue-200 text-blue-900',
  [TicketStatus.PARCASI_GELDI]: 'bg-teal-100 text-teal-800',
  [TicketStatus.ONAY_VERILDI]: 'bg-green-100 text-green-800',
  [TicketStatus.TESLIM_EDILECEK]: 'bg-emerald-100 text-emerald-800',
  [TicketStatus.TESLIM_EDILDI]: 'bg-gray-200 text-gray-600',
  [TicketStatus.IPTAL]: 'bg-red-200 text-red-900'
};
