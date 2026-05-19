
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context';
import { Wrench, Search, AlertTriangle, ArrowLeft } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { TicketStatus } from '../types';

const WebQuery = () => {
  const { tickets } = useData();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     const t = tickets.find(ticket => ticket.trackingId.toLowerCase() === query.toLowerCase());
     setResult(t || 'NOT_FOUND');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 md:p-6 relative">
      <button 
         onClick={() => navigate('/')} 
         className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-white text-slate-700 hover:text-blue-600 px-4 py-2 rounded-lg shadow-sm border border-slate-200 transition-colors text-sm font-medium"
      >
         <ArrowLeft className="w-4 h-4" /> Sisteme Dön
      </button>

      <div className="w-full max-w-lg mt-12 md:mt-0">
         <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
               <Wrench className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Servis Sorgulama</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Cihazınızın güncel durumunu takip numarası ile öğrenin.</p>
         </div>

         <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8">
               <form onSubmit={handleSearch} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Takip Numarası</label>
                  <div className="relative">
                     <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Örn: SRV-1001" 
                        className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                     />
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 md:h-6"/>
                  </div>
                  <button className="w-full mt-6 bg-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2">
                     SORGULA
                  </button>
               </form>

               {result === 'NOT_FOUND' && (
                  <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 text-sm md:text-base">
                     <AlertTriangle className="w-5 h-5 shrink-0" />
                     <span className="font-medium">Kayıt bulunamadı. Lütfen numarayı kontrol ediniz.</span>
                  </div>
               )}

               {result && result !== 'NOT_FOUND' && (
                  <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                        <span className="text-slate-500 font-medium text-sm">Durum</span>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm w-fit ${STATUS_COLORS[result.status as TicketStatus]}`}>
                           {STATUS_LABELS[result.status as TicketStatus]}
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <div className="text-xs text-slate-400 uppercase font-bold mb-1">Cihaz Bilgisi</div>
                           <div className="font-semibold text-slate-800 text-lg">{result.device.brand} {result.device.model}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="text-xs text-slate-400 uppercase font-bold mb-1">Kayıt Tarihi</div>
                              <div className="font-medium text-slate-700">{new Date(result.createdAt).toLocaleDateString()}</div>
                           </div>
                           <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="text-xs text-slate-400 uppercase font-bold mb-1">Tahmini Ücret</div>
                              <div className="font-medium text-slate-700">{result.estimatedCost ? `₺${result.estimatedCost}` : '-'}</div>
                           </div>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-4">
                           <div className="text-xs text-blue-400 uppercase font-bold mb-2">Son İşlem</div>
                           <p className="text-blue-900 font-medium text-sm md:text-base">
                              {result.logs[result.logs.length -1]?.details || 'İşlem bekleniyor...'}
                           </p>
                           <div className="text-xs text-blue-400 mt-2 text-right">
                              {new Date(result.updatedAt).toLocaleString()}
                           </div>
                        </div>
                     </div>

                     <button onClick={() => { setResult(null); setQuery(''); }} className="w-full mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium py-2">
                        Yeni Sorgulama Yap
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default WebQuery;
