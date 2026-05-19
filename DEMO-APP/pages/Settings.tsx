
import React, { useState } from 'react';
import { useData } from '../context';
import { Save, Building2, Receipt, FileText, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings } = useData();
  const [activeTab, setActiveTab] = useState('COMPANY');
  const [form, setForm] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Genel Ayarlar</h1>
            <p className="text-sm text-slate-500">Uygulama genel yapılandırması ve firma bilgileri.</p>
          </div>
          <button 
            onClick={handleSave} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Değişiklikleri Kaydet
          </button>
       </div>

       {showSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
             <CheckCircle2 className="w-5 h-5" />
             <span className="font-medium">Ayarlar başarıyla güncellendi!</span>
          </div>
       )}

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-slate-200 bg-slate-50">
             {[
               { id: 'COMPANY', label: 'Firma Bilgileri', icon: <Building2 className="w-4 h-4" /> },
               { id: 'FINANCE', label: 'Finansal Ayarlar', icon: <Receipt className="w-4 h-4" /> },
               { id: 'LEGAL', label: 'Yasal Metinler & Çıktı', icon: <FileText className="w-4 h-4" /> },
             ].map(tab => (
               <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 sm:border-b-0 sm:border-r transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
               >
                  {tab.icon} {tab.label}
               </button>
             ))}
          </div>
          
          <div className="p-4 md:p-8">
             {activeTab === 'COMPANY' && (
                <div className="space-y-6 max-w-2xl">
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-sm text-blue-800">
                      Bu bilgiler servis formlarında ve müşteri fişlerinde başlık olarak kullanılacaktır.
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Firma Ünvanı</label>
                      <input 
                        type="text" 
                        value={form.companyName} 
                        onChange={e => setForm({...form, companyName: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                      <input 
                        type="text" 
                        value={form.companyPhone} 
                        onChange={e => setForm({...form, companyPhone: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Web Sitesi</label>
                      <input 
                        type="text" 
                        value={form.companyWebsite} 
                        onChange={e => setForm({...form, companyWebsite: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                      <textarea 
                        value={form.companyAddress} 
                        onChange={e => setForm({...form, companyAddress: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none" 
                        rows={3}
                      />
                   </div>
                </div>
             )}

             {activeTab === 'FINANCE' && (
                <div className="space-y-6 max-w-lg">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Varsayılan Para Birimi</label>
                      <select 
                         value={form.currencySymbol}
                         onChange={e => setForm({...form, currencySymbol: e.target.value})}
                         className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none"
                      >
                         <option value="₺">Türk Lirası (₺)</option>
                         <option value="$">Amerikan Doları ($)</option>
                         <option value="€">Euro (€)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">KDV Oranı (%)</label>
                      <input 
                        type="number" 
                        value={form.taxRate} 
                        onChange={e => setForm({...form, taxRate: +e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none" 
                      />
                      <p className="text-xs text-slate-400 mt-1">Tekliflerde ve faturalarda kullanılacak varsayılan oran.</p>
                   </div>
                </div>
             )}

             {activeTab === 'LEGAL' && (
                <div className="space-y-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Servis Fişi Alt Bilgisi (Yasal Uyarılar)</label>
                      <p className="text-xs text-slate-500 mb-2">Servis kayıt formu yazdırıldığında sayfanın en altında görünecek maddeler.</p>
                      <textarea 
                        value={form.termsAndConditions} 
                        onChange={e => setForm({...form, termsAndConditions: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed" 
                        rows={10}
                      />
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default Settings;
