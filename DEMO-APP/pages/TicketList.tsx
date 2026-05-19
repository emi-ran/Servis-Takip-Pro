
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context';
import { Plus, Search } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

const TicketList = () => {
   const { tickets } = useData();
   const navigate = useNavigate();
   const [searchTerm, setSearchTerm] = useState('');

   const filteredTickets = tickets.filter(t => 
      t.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.device.model.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Tüm Kayıtlar</h1>
            <Link to="/tickets/new" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center justify-center"><Plus className="w-4 h-4"/> Yeni Kayıt</Link>
         </div>

         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
               type="text" 
               placeholder="Takip no, müşteri adı veya cihaz marka/model ile ara..." 
               className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-slate-800 placeholder:text-slate-400"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500">
                     <tr><th className="px-6 py-3">Takip No</th><th className="px-6 py-3">Müşteri</th><th className="px-6 py-3">Cihaz</th><th className="px-6 py-3">Durum</th><th className="px-6 py-3"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredTickets.length > 0 ? (
                        filteredTickets.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                           <td className="px-6 py-4 font-mono text-slate-600">{t.trackingId}</td>
                           <td className="px-6 py-4 text-slate-900 font-medium">{t.customer?.fullName}</td>
                           <td className="px-6 py-4 text-slate-700">{t.device.brand} {t.device.model}</td>
                           <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                           <td className="px-6 py-4 text-blue-600 text-right">Detay</td>
                        </tr>
                        ))
                     ) : (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default TicketList;
