
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context';
import { ArrowLeft, Save } from 'lucide-react';
import { TicketStatus } from '../types';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { addTicket, addCustomer, customers } = useData();
  const [step, setStep] = useState(1);
  const [existingCustId, setExistingCustId] = useState('');
  
  // Form States
  const [custForm, setCustForm] = useState({ fullName: '', phone: '', address: '', email: '' });
  const [devForm, setDevForm] = useState({ brand: '', model: '', serialNumber: '', type: 'Telefon', accessories: '', complaint: '', notes: '' });

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setExistingCustId(id);
    if(id) {
       const c = customers.find(cus => cus.id === id);
       if(c) setCustForm({ fullName: c.fullName, phone: c.phone, address: c.address || '', email: c.email || '' });
    } else {
       // Reset form for new customer
       setCustForm({ fullName: '', phone: '', address: '', email: '' });
    }
  };

  const handleSubmit = () => {
    let customerId = existingCustId;
    if (!existingCustId) {
      customerId = addCustomer(custForm);
    }

    addTicket({
      customerId,
      device: {
        brand: devForm.brand,
        model: devForm.model,
        serialNumber: devForm.serialNumber,
        type: devForm.type,
        accessories: devForm.accessories.split(',').map(s => s.trim()),
        images: []
      },
      status: TicketStatus.TEKNIK_SERVIS,
      serviceLocation: 'ATOLYE',
      complaint: devForm.complaint,
      technicianNotes: devForm.notes,
      currency: 'TRY',
      priority: 'Normal'
    });

    navigate('/tickets');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5"/>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 pt-1">Yeni Servis Kaydı</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-center gap-4 md:gap-8 text-sm">
           <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
             <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">1</div> Müşteri
           </div>
           <div className="w-8 md:w-12 h-px bg-slate-300 self-center"></div>
           <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
             <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">2</div> Cihaz
           </div>
        </div>

        <div className="p-4 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kayıtlı Müşteri Seç (Opsiyonel)</label>
                <select 
                  onChange={handleCustomerSelect} 
                  value={existingCustId} 
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                >
                  <option value="">-- Yeni Müşteri Ekle --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>)}
                </select>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 text-sm font-semibold text-slate-500 uppercase mb-1">Müşteri Detayları</div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                  <input type="text" value={custForm.fullName} onChange={e => setCustForm({...custForm, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" disabled={!!existingCustId} placeholder="Örn: Ahmet Yılmaz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input type="text" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" disabled={!!existingCustId} placeholder="05XX XXX XX XX" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                  <textarea value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-800 bg-white focus:border-blue-500 outline-none" rows={2} disabled={!!existingCustId} placeholder="Açık adres giriniz..." />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  disabled={!custForm.fullName || !custForm.phone}
                  onClick={() => setStep(2)} 
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  İleri: Cihaz Bilgileri
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Tipi</label>
                  <select value={devForm.type} onChange={e => setDevForm({...devForm, type: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none">
                    <option>Telefon</option><option>Notebook</option><option>Tablet</option><option>Yazıcı</option><option>Televizyon</option><option>Beyaz Eşya</option><option>Küçük Ev Aleti</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
                  <input type="text" value={devForm.brand} onChange={e => setDevForm({...devForm, brand: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" placeholder="Örn: Samsung" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input type="text" value={devForm.model} onChange={e => setDevForm({...devForm, model: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" placeholder="Örn: S23 Ultra" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seri No / IMEI</label>
                  <input type="text" value={devForm.serialNumber} onChange={e => setDevForm({...devForm, serialNumber: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aksesuarlar</label>
                  <input type="text" value={devForm.accessories} onChange={e => setDevForm({...devForm, accessories: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" placeholder="Şarj aleti, kılıf vb." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Şikayeti (Arıza)</label>
                  <textarea value={devForm.complaint} onChange={e => setDevForm({...devForm, complaint: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" rows={3} placeholder="Detaylı arıza tanımı..." />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Geri</button>
                <button 
                  disabled={!devForm.brand || !devForm.complaint}
                  onClick={handleSubmit} 
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" /> Kaydı Tamamla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
