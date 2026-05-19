
import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context';
import { Printer } from 'lucide-react';

const PrintView = () => {
  const { id } = useParams();
  const { getTicketById, settings } = useData();
  const ticket = getTicketById(id || '');

  if(!ticket) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-white min-h-screen p-8 max-w-3xl mx-auto">
       {/* Print-specific style */}
       <style>{`@media print { .no-print { display: none; } body { background: white; } }`}</style>
       
       <div className="no-print mb-8 flex justify-between">
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded gap-2 flex items-center"><Printer className="w-4 h-4"/> Yazdır</button>
          <button onClick={() => window.close()} className="px-4 py-2 border rounded">Pencereyi Kapat</button>
       </div>

       <div className="border-2 border-slate-800 p-8 space-y-6">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 flex items-center justify-center text-white font-bold text-xl rounded">
                    {settings.companyName.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <h1 className="text-2xl font-bold uppercase tracking-wider">{settings.companyName}</h1>
                   <p className="text-sm text-slate-600">Teknik Servis Formu</p>
                   <p className="text-xs text-slate-500 mt-1">Tel: {settings.companyPhone} | {settings.companyWebsite}</p>
                   <p className="text-xs text-slate-500">{settings.companyAddress}</p>
                </div>
             </div>
             <div className="text-right">
                <div className="text-3xl font-mono font-bold text-slate-800">{ticket.trackingId}</div>
                <div className="text-sm text-slate-500">{new Date().toLocaleString()}</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div>
                <h3 className="font-bold border-b border-slate-300 mb-2 pb-1">Müşteri Bilgileri</h3>
                <div className="text-sm space-y-1">
                   <div><span className="font-semibold">Ad Soyad:</span> {ticket.customer?.fullName}</div>
                   <div><span className="font-semibold">Telefon:</span> {ticket.customer?.phone}</div>
                   <div><span className="font-semibold">Adres:</span> {ticket.customer?.address}</div>
                </div>
             </div>
             <div>
                <h3 className="font-bold border-b border-slate-300 mb-2 pb-1">Cihaz Bilgileri</h3>
                <div className="text-sm space-y-1">
                   <div><span className="font-semibold">Cihaz:</span> {ticket.device.brand} {ticket.device.model}</div>
                   <div><span className="font-semibold">Seri No:</span> {ticket.device.serialNumber}</div>
                   <div><span className="font-semibold">Aksesuar:</span> {ticket.device.accessories.join(', ') || '-'}</div>
                </div>
             </div>
          </div>

          <div className="border border-slate-300 rounded p-4 bg-slate-50">
             <h3 className="font-bold text-sm mb-1">Müşteri Şikayeti / Arıza Tanımı:</h3>
             <p className="text-sm">{ticket.complaint}</p>
          </div>

          <div className="flex justify-between items-end pt-4">
             <div className="text-xs text-slate-500 max-w-sm">
                <p><strong>YASAL UYARI VE TESLİM ŞARTLARI:</strong></p>
                <div className="whitespace-pre-wrap mt-1">
                    {settings.termsAndConditions}
                </div>
             </div>
             <div className="text-center">
                 {/* Simulated QR Code for Tracking */}
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://servistakip.pro/query/${ticket.trackingId}`} alt="QR" className="w-24 h-24 mb-2 border" />
                 <p className="text-xs font-bold">Cihaz Durumu</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-12 text-center text-sm font-semibold">
             <div className="border-t border-slate-300 pt-2">Teslim Eden (Müşteri)</div>
             <div className="border-t border-slate-300 pt-2">Teslim Alan (Servis)</div>
          </div>
       </div>
    </div>
  );
};

export default PrintView;
