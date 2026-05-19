
import React, { useState } from 'react';
import { useData } from '../context';
import { Plus, X } from 'lucide-react';

const Accounting = () => {
   const { transactions, addTransaction } = useData();
   const [showModal, setShowModal] = useState(false);
   const [form, setForm] = useState({ description: '', amount: 0, type: 'INCOME' as any, category: 'Servis Geliri', paymentMethod: 'CASH' as any });

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Kasa Hareketleri</h1>
            <button onClick={() => setShowModal(true)} className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2 items-center justify-center"><Plus className="w-4 h-4"/> İşlem Ekle</button>
         </div>
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">Tarih</th><th className="px-6 py-3">Açıklama</th><th className="px-6 py-3 text-right">Tutar</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                           <td className="px-6 py-4 font-medium text-slate-800">{t.description} <span className="text-xs bg-slate-100 text-slate-500 px-1 rounded ml-2 whitespace-nowrap">{t.category}</span></td>
                           <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'INCOME' ? '+' : '-'}₺{t.amount}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {showModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
               <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-lg text-slate-800">Gelir / Gider Ekle</h3>
                     <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  
                  <div className="flex gap-2 p-1 bg-slate-100 rounded">
                     <button onClick={() => setForm({...form, type: 'INCOME'})} className={`flex-1 py-2 text-sm font-medium rounded transition ${form.type === 'INCOME' ? 'bg-white text-green-700 shadow' : 'text-slate-500'}`}>Gelir</button>
                     <button onClick={() => setForm({...form, type: 'EXPENSE'})} className={`flex-1 py-2 text-sm font-medium rounded transition ${form.type === 'EXPENSE' ? 'bg-white text-red-700 shadow' : 'text-slate-500'}`}>Gider</button>
                  </div>
                  
                  <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Açıklama</label>
                     <input className="w-full border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Örn: Müşteri Ödemesi" />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tutar (₺)</label>
                     <input type="number" className="w-full border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                     <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">İptal</button>
                     <button onClick={() => { addTransaction(form); setShowModal(false); }} className={`px-4 py-2 text-white rounded shadow-sm ${form.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Kaydet</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Accounting;
