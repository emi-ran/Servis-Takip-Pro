
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, Customer, StockItem, Transaction, TicketStatus, Personnel, AppSettings } from './types';
import { MOCK_TICKETS, MOCK_STOCK, MOCK_TRANSACTIONS, MOCK_PERSONNEL } from './constants';

// Define the context shape
interface DataContextType {
  // Auth
  currentUser: Personnel | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;

  // Data
  tickets: Ticket[];
  customers: Customer[];
  stock: StockItem[];
  transactions: Transaction[];
  personnel: Personnel[];
  settings: AppSettings;
  
  // Ticket Actions
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'trackingId' | 'logs'>) => void;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, description?: string) => void;
  assignTicket: (ticketId: string, personnelId: string) => void;
  getTicketById: (id: string) => Ticket | undefined;
  
  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id'>) => string; 
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerHistory: (customerId: string) => Ticket[];
  
  // Stock & Finance
  addStock: (item: Omit<StockItem, 'id'>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;

  // Personnel Actions
  addPersonnel: (data: Omit<Personnel, 'id' | 'isActive'>) => string; // Returns the generated password
  deletePersonnel: (id: string) => void;
  resetPersonnelPassword: (id: string) => string; // Returns the new password
  togglePersonnelStatus: (id: string) => void;

  // Settings Actions
  updateSettings: (newSettings: AppSettings) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Settings State
  const defaultSettings: AppSettings = {
    companyName: 'CetTech Teknoloji Hizmetleri',
    companyPhone: '0850 123 45 67',
    companyAddress: 'Teknoloji Mah. Bilişim Cad. No:10 İstanbul',
    companyWebsite: 'www.cettech.com.tr',
    currencySymbol: '₺',
    taxRate: 20,
    termsAndConditions: '1. Cihaz teslim alındıktan sonra 3 ay içinde alınmayan cihazlardan firmamız sorumlu değildir.\n2. Sıvı temaslı cihazlarda onarım garantisi verilmemektedir.\n3. Bu belge teslim tesellüm niteliğindedir.\n4. Arıza tespiti yapılıp onay verilmeyen cihazlardan servis ücreti talep edilebilir.'
  };

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c1', fullName: 'Ahmet Yılmaz', phone: '05551234567', address: 'Kadıköy, İstanbul' },
    { id: 'c2', fullName: 'Ayşe Demir', phone: '05329876543', address: 'Çankaya, Ankara' },
    { id: 'c3', fullName: 'Mehmet Öz', phone: '05051112233', address: 'Bornova, İzmir' },
    { id: 'c4', fullName: 'Zeynep Kaya', phone: '05051112244', address: 'Nilüfer, Bursa' },
  ]);

  const [personnel, setPersonnel] = useState<Personnel[]>(MOCK_PERSONNEL);

  const initialTickets = MOCK_TICKETS.map(t => ({
    ...t,
    customerId: t.customer?.id || 'c1', 
    customer: undefined 
  }));

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // --- Auth Methods ---
  const login = (username: string, password: string) => {
    // Mock Login Logic
    // In a real app, this would verify hash against backend
    const user = personnel.find(p => p.username === username && p.isActive);
    
    // For demo purposes, any non-empty password allows login if user exists
    if (user && password.length > 0) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Persist to local storage for refresh
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
  };

  const logout = () => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');
  };

  // Check Local Storage on Mount
  useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
      }
  }, []);


  // --- Helper Methods ---
  const generatePassword = () => {
    // Generate a random 8-character password
    return Math.random().toString(36).slice(-8).toUpperCase();
  };

  const populateTicket = (ticket: Ticket): Ticket => {
    const customer = customers.find(c => c.id === ticket.customerId);
    const assignee = personnel.find(p => p.id === ticket.assignedTo);
    return { ...ticket, customer, assigneeName: assignee?.fullName };
  };

  // --- Ticket Actions ---
  const addTicket = (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'trackingId' | 'logs'>) => {
    const newTicket: Ticket = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      trackingId: `SRV-${2000 + tickets.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [{
        id: Math.random().toString(36),
        date: new Date().toISOString(),
        user: currentUser?.fullName || 'Sistem',
        action: 'Kayıt Açıldı',
        details: 'Yeni servis kaydı oluşturuldu.'
      }]
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: string, data: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, description?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          updatedAt: new Date().toISOString(),
          logs: [...t.logs, {
            id: Math.random().toString(),
            date: new Date().toISOString(),
            user: currentUser?.fullName || 'Admin',
            action: description ? 'İşlem Eklendi / Durum Güncellendi' : 'Durum Değişti',
            details: description || `Durum ${status} olarak güncellendi.`
          }]
        };
      }
      return t;
    }));
  };

  const assignTicket = (ticketId: string, personnelId: string) => {
    const person = personnel.find(p => p.id === personnelId);
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedTo: personnelId,
          updatedAt: new Date().toISOString(),
          logs: [...t.logs, {
            id: Math.random().toString(),
            date: new Date().toISOString(),
            user: currentUser?.fullName || 'Admin',
            action: 'Personel Atandı',
            details: `Cihaz ${person?.fullName || 'Bilinmeyen'} adlı personele atandı.`
          }]
        };
      }
      return t;
    }));
  };

  // --- Customer Actions ---
  const addCustomer = (data: Omit<Customer, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newCustomer = { ...data, id: newId };
    setCustomers(prev => [...prev, newCustomer]);
    return newId;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const getCustomerHistory = (customerId: string) => {
    return tickets
      .filter(t => t.customerId === customerId)
      .map(populateTicket)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // --- Personnel Actions ---
  const addPersonnel = (data: Omit<Personnel, 'id' | 'isActive'>) => {
    const password = generatePassword();
    const newId = Math.random().toString(36).substr(2, 9);
    const newPerson: Personnel = { ...data, id: newId, isActive: true };
    setPersonnel(prev => [...prev, newPerson]);
    return password;
  };

  const deletePersonnel = (id: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
  };

  const resetPersonnelPassword = (id: string) => {
    const password = generatePassword();
    // In a real app, we would hash this password and update the DB
    console.log(`Password reset for ${id}: ${password}`);
    return password;
  };

  const togglePersonnelStatus = (id: string) => {
    setPersonnel(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // --- Other Actions ---
  const addStock = (data: Omit<StockItem, 'id'>) => {
    setStock(prev => [...prev, { ...data, id: Math.random().toString(36) }]);
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => [{ ...data, id: Math.random().toString(36), date: new Date().toISOString() }, ...prev]);
  };

  const getTicketById = (id: string) => {
    const t = tickets.find(ticket => ticket.id === id);
    if (t) return populateTicket(t);
    return undefined;
  };

  const visibleTickets = tickets.map(populateTicket);

  return (
    <DataContext.Provider value={{ 
      currentUser,
      login,
      logout,
      isAuthenticated,
      settings,
      tickets: visibleTickets, 
      customers, 
      stock, 
      transactions, 
      personnel,
      addTicket, 
      updateTicket,
      deleteTicket,
      updateTicketStatus,
      assignTicket,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerHistory,
      addStock,
      addTransaction,
      getTicketById,
      addPersonnel,
      deletePersonnel,
      resetPersonnelPassword,
      togglePersonnelStatus,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
