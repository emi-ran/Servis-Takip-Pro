
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../context';
import { ArrowLeft, Printer, MessageSquare, Wrench, Camera, History, PenSquare, X, Check, Trash2, Edit, UserCircle } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { TicketStatus } from '../types';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, updateTicketStatus, deleteTicket, updateTicket, personnel, assignTicket } = useData();
  const ticket = getTicketById(id || '');
  const [activeTab, setActiveTab] = useState('INFO');

  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Status Modal Form
  const [newStatus, setNewStatus] = useState<TicketStatus>(TicketStatus.TEKNIK_SERVIS);
  const [statusNote, setStatusNote] = useState('');

  // Edit Ticket Form
  const [editForm, setEditForm] = useState({
    brand: '', model: '', serialNumber: '', complaint: '', accessories: ''
  });

  if (!ticket) return <div className="p-8 text-center">Kayıt bulunamadı.</div>;

  const handleOpenStatusModal = () => {
    setNewStatus(ticket.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = () => {
    updateTicketStatus(ticket.id, newStatus, statusNote);
    setShowStatusModal(false);
  };

  const handleDelete = () => {
    if(window.confirm('Bu servis kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      deleteTicket(ticket.id);
      navigate('/tickets');
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({
      brand: ticket.device.brand,
      model: ticket.device.model,
      serialNumber: ticket.device.serialNumber,
      complaint: ticket.complaint,
      accessories: ticket.device.accessories.join(', ')
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    updateTicket(ticket.id, {
      complaint: editForm.complaint,
      device: {
        ...ticket.device,
        brand: editForm.brand,
        model: editForm.model,
        serialNumber: editForm.serialNumber,
        accessories: editForm.accessories.split(',').map(s => s.trim())
      }
    });
    setShowEditModal(false);
  };

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
     assignTicket(ticket.id, e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex flex-wrap items-center gap-2 mb-1">
             <button onClick={() => navigate('/tickets')} className="p-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 rounded-full transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5"/>
             </button>
             <h1 className="text-xl md:text-2xl font-bold text-slate-800">{ticket.trackingId}</h1>
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[ticket.status]}`}>{STATUS_LABELS[ticket.status]}</span>
           </div>
           <p className="text-sm md:text-base text-slate-500 ml-0 md:ml-7">{ticket.device.brand} {ticket.device.model} - {ticket.customer?.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleOpenEditModal} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium border border-slate-200">
            <Edit className="w-4 h-4" /> <span className="md:hidden lg:inline">Düzenle</span>
          </button>
          <button onClick={handleDelete} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium border border-red-100">
            <Trash2 className="w-4 h-4" /> <span className="md:hidden lg:inline">Sil</span>
          </button>
          <Link to={`/print/${ticket.id}`} target="_blank" className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
            <Printer className="w-4 h-4" /> <span className="md:hidden lg:inline">Yazdır</span>
          </Link>
          <button className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium border border-indigo-100">
            <MessageSquare className="w-4 h-4" /> <span className="md:hidden lg:inline">SMS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-nowrap overflow-x-auto border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 no-scrollbar">
            {[
              { id: 'INFO', label: 'Bilgiler', icon: <Wrench className="w-4 h-4" /> },
              { id: 'IMAGES', label: 'Resimler', icon: <Camera className="w-4 h-4" /> },
              { id: 'LOGS', label: 'Geçmiş', icon: <History className="w-4 h-4" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 p-4 md:p-6">
            {activeTab === 'INFO' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Müşteri</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">İsim:</span> <span className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/customers/${ticket.customerId}`)}>{ticket.customer?.fullName}</span></div>
                      <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">Tel:</span> <span className="font-medium text-slate-800">{ticket.customer?.phone}</span></div>
                      <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">Adres:</span> <span className="text-slate-800">{ticket.customer?.address}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Cihaz</h3>
                    <div className="text-sm space-y-2">
                       <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">Model:</span> <span className="font-medium text-slate-800">{ticket.device.brand} {ticket.device.model}</span></div>
                       <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">Seri No:</span> <span className="font-mono bg-slate-100 px-1 text-slate-800 w-fit">{ticket.device.serialNumber}</span></div>
                       <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-500 font-medium">Aksesuar:</span> <span className="text-slate-800">{ticket.device.accessories.join(', ')}</span></div>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded border border-red-100">
                   <h4 className="text-xs font-bold text-red-600 uppercase mb-1">Müşteri Şikayeti</h4>
                   <p className="text-slate-800 text-sm">{ticket.complaint}</p>
                </div>
              </div>
            )}
             {activeTab === 'LOGS' && (
              <div className="space-y-6 border-l-2 border-slate-200 ml-2 pl-6 py-2">
                {ticket.logs.map((log, i) => (
                   <div key={i} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm group-hover:bg-blue-600 transition-colors"></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors">
                        <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                          <span className="text-sm font-semibold text-slate-800">{log.action}</span>
                          <span className="text-xs text-slate-400">{new Date(log.date).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">{log.details}</p>
                        <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">{log.user.charAt(0)}</div>
                          {log.user}
                        </div>
                      </div>
                   </div>
                ))}
              </div>
            )}
            {activeTab === 'IMAGES' && <div className="text-center py-10 text-slate-400">Resim yükleme alanı (Demo)</div>}
          </div>
        </div>
        <div className="space-y-4">
           {/* Action Card */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">İşlemler</h3>
             <button 
               onClick={handleOpenStatusModal}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-all shadow-sm active:scale-95 mb-4"
             >
                <PenSquare className="w-4 h-4" /> İşlem Ekle / Durum Güncelle
             </button>

             <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Atanan Personel</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select 
                    value={ticket.assignedTo || ''} 
                    onChange={handleAssign}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Atanmamış --</option>
                    {personnel.filter(p => p.isActive).map(p => (
                       <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
                    ))}
                  </select>
                </div>
             </div>
             
             <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase">Mevcut Durum</div>
                <div className={`p-3 rounded-lg border text-center font-bold ${STATUS_COLORS[ticket.status]}`}>
                   {STATUS_LABELS[ticket.status]}
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Durum Güncelle</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Durum</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                >
                   {Object.keys(STATUS_LABELS).map(s => (
                     <option key={s} value={s}>{STATUS_LABELS[s as TicketStatus]}</option>
                   ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Yapılan İşlem Açıklaması</label>
                <textarea 
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                  placeholder="Örn: Cihazın ana kartı onarıldı, testleri yapıldı..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowStatusModal(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleUpdateStatus} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Cihaz Bilgilerini Düzenle</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
                  <input type="text" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input type="text" value={editForm.model} onChange={e => setEditForm({...editForm, model: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seri No</label>
                  <input type="text" value={editForm.serialNumber} onChange={e => setEditForm({...editForm, serialNumber: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aksesuarlar</label>
                  <input type="text" value={editForm.accessories} onChange={e => setEditForm({...editForm, accessories: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arıza Tanımı</label>
                  <textarea value={editForm.complaint} onChange={e => setEditForm({...editForm, complaint: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" rows={3} />
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

export default TicketDetail;
