
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useData } from '../context';
import { Menu } from 'lucide-react';

const Layout = () => {
  const { isAuthenticated, currentUser } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 md:ml-64 ml-0`}>
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 no-print">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)} 
               className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
               <Menu className="w-6 h-6" />
             </button>
             <div className="text-slate-500 text-sm font-medium truncate hidden sm:block">Hoşgeldiniz, CetTech Yönetici Paneli</div>
             <div className="text-slate-800 font-bold text-lg sm:hidden">CetTech PRO</div>
           </div>

           <div className="flex items-center gap-4">
               <div className="text-right hidden md:block">
                   <div className="text-sm font-bold text-slate-800">{currentUser?.fullName}</div>
                   <div className="text-xs text-slate-500">{currentUser?.role}</div>
               </div>
               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                   {currentUser?.fullName.charAt(0)}
               </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
