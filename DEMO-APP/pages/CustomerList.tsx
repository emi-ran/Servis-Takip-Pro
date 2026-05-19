
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context';
import { Plus, Search, X } from 'lucide-react';

const CustomerList = () => {
  const { customers, addCustomer } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ fullName: '', phone: '', address: '' });

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    addCustomer(newCustomer);
    setShowAddModal(false);
    setNewCustomer({ fullName: '', phone: '', address: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Müşteriler</h1>
        <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            <Plus className="w-4 h-4"/> Müşteri Ekle
        </button>
      </div>

      <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
         <input 
            type="text" 
            placeholder="İsim, telefon veya adres ile ara..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-slate-800 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">Müşteri Adı</th><th className="px-6 py-3">Telefon</th><th className="px-6 py-3">Adres</th><th className="px-6 py-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.fullName}</td>
                    <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                    <td className="px-6 py-4 truncate max-w-xs text-slate-600">{c.address}</td>
                    <td className="px-6 py-4 text-right"><span className="text-blue-600">Detay</span></td>
                </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Yeni Müşteri</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                  <input type="text" value={newCustomer.fullName} onChange={e => setNewCustomer({...newCustomer, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" placeholder="Örn: Mehmet Yılmaz" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" placeholder="05XX XXX XX XX" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                  <textarea value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" rows={3} placeholder="Açık adres..." />
               </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">İptal</button>
              <button disabled={!newCustomer.fullName || !newCustomer.phone} onClick={handleAdd} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
