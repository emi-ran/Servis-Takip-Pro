
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context';
import { ArrowLeft, User, Phone, MapPin, History, Trash2, Edit, X } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, getCustomerHistory, deleteCustomer, updateCustomer } = useData();
  const customer = customers.find(c => c.id === id);
  const history = id ? getCustomerHistory(id) : [];

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', address: '' });

  if(!customer) return <div>Müşteri bulunamadı</div>;

  const handleDelete = () => {
    if(window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
      deleteCustomer(customer.id);
      navigate('/customers');
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    updateCustomer(customer.id, editForm);
    setShowEditModal(false);
  };

  return (
     <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div className="flex items-center gap-4">
             <button onClick={() => navigate('/customers')} className="p-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 rounded-full transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5"/>
             </button>
             <h1 className="text-xl md:text-2xl font-bold text-slate-800">{customer.fullName}</h1>
           </div>
           <div className="flex gap-2 w-full sm:w-auto">
             <button onClick={handleOpenEdit} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium border border-slate-200">
               <Edit className="w-4 h-4" /> Düzenle
             </button>
             <button onClick={handleDelete} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium border border-red-100">
               <Trash2 className="w-4 h-4" /> Sil
             </button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Info Card */}
           <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 h-fit">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><User className="w-8 h-8"/></div>
              <div className="space-y-3 text-sm">
                 <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400 shrink-0"/> <span className="text-slate-800">{customer.phone}</span></div>
                 <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-slate-400 shrink-0"/> <span className="text-slate-800 break-words">{customer.address || 'Adres Girilmemiş'}</span></div>
              </div>
           </div>

           {/* Service History */}
           <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><History className="w-5 h-5"/> Servis Geçmişi ({history.length})</h2>
              {history.map(ticket => (
                 <div key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                       <div>
                          <span className="font-bold text-slate-800 block sm:inline">{ticket.device.brand} {ticket.device.model}</span>
                          <span className="mt-1 sm:mt-0 sm:ml-2 text-xs font-mono bg-slate-100 px-1 rounded text-slate-500 inline-block">{ticket.trackingId}</span>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[ticket.status]}`}>{STATUS_LABELS[ticket.status]}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{ticket.complaint}</p>
                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-2">
                       <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       {ticket.finalCost && <span className="font-bold text-green-600">₺{ticket.finalCost}</span>}
                    </div>
                 </div>
              ))}
              {history.length === 0 && <div className="text-slate-500 bg-slate-50 p-6 rounded-lg text-center">Bu müşteriye ait geçmiş kayıt bulunamadı.</div>}
           </div>
        </div>

        {/* Edit Customer Modal */}
        {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Müşteri Düzenle</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                  <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                  <textarea value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" rows={3} />
               </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">İptal</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">Kaydet</button>
            </div>
          </div>
        </div>
      )}
     </div>
  );
};

export default CustomerDetail;
