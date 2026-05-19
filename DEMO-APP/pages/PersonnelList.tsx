
import React, { useState } from 'react';
import { useData } from '../context';
import { UserCog, Plus, ShieldCheck, KeyRound, Ban, CheckCircle, X, Trash2, AlertTriangle } from 'lucide-react';
import { UserRole } from '../types';

const PersonnelList = () => {
  const { personnel, addPersonnel, deletePersonnel, resetPersonnelPassword, togglePersonnelStatus } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Delete Confirmation State
  const [deleteState, setDeleteState] = useState<{ step: 0 | 1 | 2, id: string | null }>({ step: 0, id: null });
  
  // Password Reveal Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedForUser, setGeneratedForUser] = useState('');

  // Add Form
  const [form, setForm] = useState({ fullName: '', username: '', role: UserRole.TECHNICIAN, phone: '', email: '' });

  const handleAdd = () => {
    const pwd = addPersonnel(form);
    setGeneratedPassword(pwd);
    setGeneratedForUser(form.username);
    setShowAddModal(false);
    setShowPasswordModal(true);
    setForm({ fullName: '', username: '', role: UserRole.TECHNICIAN, phone: '', email: '' });
  };

  const handleResetPassword = (id: string, username: string) => {
    if (window.confirm(`${username} kullanıcısının şifresi sıfırlansın mı?`)) {
        const pwd = resetPersonnelPassword(id);
        setGeneratedPassword(pwd);
        setGeneratedForUser(username);
        setShowPasswordModal(true);
    }
  };

  const initiateDelete = (id: string) => {
      setDeleteState({ step: 1, id });
  };

  const confirmDeleteStep1 = () => {
      setDeleteState(prev => ({ ...prev, step: 2 }));
  };

  const finalDelete = () => {
      if (deleteState.id) {
          deletePersonnel(deleteState.id);
          setDeleteState({ step: 0, id: null });
      }
  };

  const cancelDelete = () => {
      setDeleteState({ step: 0, id: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personel Yönetimi</h1>
          <p className="text-sm text-slate-500">Teknik servis ve yönetici hesaplarını buradan yönetebilirsiniz.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-4 h-4"/> Personel Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500">
                <tr>
                <th className="px-6 py-4">Ad Soyad</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Kullanıcı Adı</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {personnel.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <UserCog className="w-4 h-4" />
                        </div>
                        {p.fullName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{p.phone}</span>
                            {p.email && <span className="text-xs text-slate-400">{p.email}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{p.username}</td>
                    <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        p.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                        p.role === UserRole.TECHNICIAN ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                    }`}>
                        {p.role}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                    {p.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium text-xs"><CheckCircle className="w-3 h-3"/> Aktif</span>
                    ) : (
                        <span className="flex items-center gap-1 text-red-500 font-medium text-xs"><Ban className="w-3 h-3"/> Pasif</span>
                    )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleResetPassword(p.id, p.username)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Şifre Sıfırla">
                        <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => togglePersonnelStatus(p.id)} className={`p-2 rounded-lg transition ${p.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`} title={p.isActive ? 'Hesabı Dondur' : 'Hesabı Aktifleştir'}>
                        {p.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => initiateDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Personeli Sil">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Yeni Personel Ekle</h3>
                  <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad <span className="text-red-500">*</span></label>
                        <input className="w-full border border-slate-300 p-2 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Örn: Ahmet Yılmaz" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı (Giriş İçin) <span className="text-red-500">*</span></label>
                        <input className="w-full border border-slate-300 p-2 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Örn: ahmetyilmaz" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                        <input className="w-full border border-slate-300 p-2 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Örn: 0555 123 45 67" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta (Opsiyonel)</label>
                        <input type="email" className="w-full border border-slate-300 p-2 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Örn: ahmet@firma.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Yetki</label>
                        <select className="w-full border border-slate-300 p-2 rounded bg-white text-slate-800 focus:border-blue-500 outline-none" value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})}>
                            <option value={UserRole.TECHNICIAN}>Teknisyen (Servis İşlemleri)</option>
                            <option value={UserRole.RECEPTION}>Karşılama (Kayıt & Teslim)</option>
                            <option value={UserRole.ADMIN}>Yönetici (Tam Yetki)</option>
                        </select>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">İptal</button>
                    <button disabled={!form.username || !form.fullName || !form.phone} onClick={handleAdd} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Oluştur</button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal (2 Steps) */}
      {deleteState.step > 0 && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
                  <div className={`p-8 pb-4 ${deleteState.step === 2 ? 'bg-red-50' : 'bg-white'}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${deleteState.step === 2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {deleteState.step === 2 ? <AlertTriangle className="w-8 h-8" /> : <Trash2 className="w-8 h-8" />}
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 ${deleteState.step === 2 ? 'text-red-700' : 'text-slate-800'}`}>
                          {deleteState.step === 2 ? 'SON UYARI!' : 'Personeli Sil'}
                      </h3>
                      
                      <p className="text-sm text-slate-500 mb-6">
                          {deleteState.step === 2 
                             ? 'Bu işlem geri alınamaz ve bu personele ait tüm atamalar boşa çıkabilir. Kesinlikle silmek istiyor musunuz?'
                             : 'Bu personeli sistemden silmek istediğinize emin misiniz?'}
                      </p>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                      <button onClick={cancelDelete} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 transition">İptal</button>
                      {deleteState.step === 1 ? (
                          <button onClick={confirmDeleteStep1} className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition">Evet, Devam Et</button>
                      ) : (
                          <button onClick={finalDelete} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-sm">Kalıcı Olarak Sil</button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* One-Time Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
                <div className="p-8 pb-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Şifre Oluşturuldu</h3>
                    <p className="text-sm text-slate-500 mb-6">Aşağıdaki şifreyi lütfen kopyalayın. Güvenlik nedeniyle bu şifreyi <strong>bir daha göremeyeceksiniz.</strong></p>
                    
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-2">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Kullanıcı: {generatedForUser}</div>
                        <div className="text-2xl font-mono font-bold text-slate-800 tracking-wider select-all break-all">{generatedPassword}</div>
                    </div>
                    <p className="text-xs text-red-500">Bu pencere kapandığında şifre kaybolacaktır.</p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <button onClick={() => setShowPasswordModal(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-sm">Tamam, Kopyaladım</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;
