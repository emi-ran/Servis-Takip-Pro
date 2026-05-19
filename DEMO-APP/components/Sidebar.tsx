
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Package, 
  Wallet, 
  Globe, 
  Settings, 
  LogOut,
  QrCode,
  UserCog,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
    }`;

  // Role Checks
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isReception = currentUser?.role === UserRole.RECEPTION;
  const isTechnician = currentUser?.role === UserRole.TECHNICIAN;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">Servis Takip <span className="text-blue-600">PRO</span></span>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Özet Durum</span>
          </NavLink>
          
          <NavLink to="/tickets" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <Wrench className="w-5 h-5" />
            <span className="font-medium">Servis Kayıtları</span>
          </NavLink>
          
          <NavLink to="/customers" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Müşteriler</span>
          </NavLink>

          {/* Stock: Admin & Technician */}
          {(isAdmin || isTechnician) && (
              <NavLink to="/stock" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
              <Package className="w-5 h-5" />
              <span className="font-medium">Stok & Parça</span>
              </NavLink>
          )}

          {/* Accounting: Admin Only */}
          {isAdmin && (
              <NavLink to="/accounting" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Kasa & Cari</span>
              </NavLink>
          )}
          
          {/* Personnel: Admin Only */}
          {isAdmin && (
              <>
                  <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Yönetim</p>
                  </div>

                  <NavLink to="/personnel" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
                  <UserCog className="w-5 h-5" />
                  <span className="font-medium">Personel</span>
                  </NavLink>
              </>
          )}

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Modüller</p>
          </div>

          <NavLink to="/web-query" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <Globe className="w-5 h-5" />
            <span className="font-medium">Cihaz Sorgulama</span>
          </NavLink>

          <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-blue-600 w-full rounded-lg transition-colors">
            <QrCode className="w-5 h-5" />
            <span className="font-medium">Hızlı Barkod Oku</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          {isAdmin && (
              <NavLink to="/settings" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
              <Settings className="w-5 h-5" />
              <span className="font-medium">Genel Ayarlar</span>
              </NavLink>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg mt-1 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
