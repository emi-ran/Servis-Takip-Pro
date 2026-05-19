
import React, { useState } from 'react';
import { useData } from '../context';
import { Plus, Search, X } from 'lucide-react';

const Stock = () => {
   const { stock, addStock } = useData();
   const [showModal, setShowModal] = useState(false);
   const [form, setForm] = useState({ code: '', name: '', quantity: 1, buyPrice: 0, sellPrice: 0, category: '', minLevel: 5 });
   const [searchTerm, setSearchTerm] = useState('');

   const handleAdd = () => {
      addStock(form);
      setShowModal(false);
      setForm({ code: '', name: '', quantity: 1, buyPrice: 0, sellPrice: 0, category: '', minLevel: 5 });
   };

   const filteredStock = stock.filter(s => 
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.code.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Stok Yönetimi</h1>
            <button onClick={() => setShowModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4"/> Parça Ekle</button>
         </div>

         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
               type="text" 
               placeholder="Parça adı veya stok kodu ile ara..." 
               className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-slate-800 placeholder:text-slate-400"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">Kod</th><th className="px-6 py-3">Ürün</th><th className="px-6 py-3">Adet</th><th className="px-6 py-3">Fiyat</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredStock.length > 0 ? (
                       filteredStock.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-mono text-slate-600">{s.code}</td>
                           <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                           <td className="px-6 py-4 font-bold text-slate-700">{s.quantity}</td>
                           <td className="px-6 py-4 text-green-700">₺{s.sellPrice}</td>
                        </tr>
                       ))
                     ) : (
                       <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Simple Modal */}
         {showModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
               <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-lg text-slate-800">Yeni Parça Ekle</h3>
                     <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <input placeholder="Stok Kodu" className="w-full border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                  <input placeholder="Parça Adı" className="w-full border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                     <input type="number" placeholder="Adet" className="border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} />
                     <input type="number" placeholder="Satış Fiyatı" className="border border-slate-300 p-2 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" value={form.sellPrice} onChange={e => setForm({...form, sellPrice: +e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                     <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">İptal</button>
                     <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Stock;
