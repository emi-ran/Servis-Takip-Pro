
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context';
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Plus, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { TicketStatus } from '../types';

const Dashboard = () => {
  const { tickets, transactions } = useData();
  
  const pending = tickets.filter(t => t.status === TicketStatus.TEKNIK_SERVIS).length;
  const waitingParts = tickets.filter(t => t.status === TicketStatus.PARCA_BEKLIYOR).length;
  const ready = tickets.filter(t => t.status === TicketStatus.TESLIM_EDILECEK || t.status === TicketStatus.ONAY_VERILDI).length;
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const overdue = tickets.filter(t => new Date(t.createdAt) < threeDaysAgo && t.status !== TicketStatus.TESLIM_EDILDI).length;

  const todayIncome = transactions
    .filter(t => t.type === 'INCOME' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayExpense = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Genel Durum Paneli</h1>
        <div className="text-sm text-slate-500">Son Güncelleme: {new Date().toLocaleTimeString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bekleyen Cihazlar" count={pending} icon={<Clock className="w-6 h-6 text-blue-600" />} bg="bg-blue-50" border="border-blue-100" />
        <StatCard title="Parça Bekleyen" count={waitingParts} icon={<AlertTriangle className="w-6 h-6 text-orange-600" />} bg="bg-orange-50" border="border-orange-100" />
        <StatCard title="Teslime Hazır" count={ready} icon={<CheckCircle2 className="w-6 h-6 text-green-600" />} bg="bg-green-50" border="border-green-100" />
        <StatCard title="3 Gün Aşımı (Acil)" count={overdue} icon={<AlertTriangle className="w-6 h-6 text-red-600" />} bg="bg-red-50" border="border-red-100" desc="Yasal süresi yaklaşıyor" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Son Gelen Cihazlar</h3>
            <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Tümünü Gör</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Takip No</th>
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Cihaz</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 5).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-600">{t.trackingId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.customer?.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{t.device.brand} {t.device.model}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Günün Özeti</h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm text-green-700 font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Tahsilat</span>
              <span className="font-bold text-green-700">₺{todayIncome}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-sm text-red-700 font-medium flex items-center gap-2"><TrendingDown className="w-4 h-4"/> Gider</span>
              <span className="font-bold text-red-700">₺{todayExpense}</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link to="/tickets/new" className="flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Yeni Kayıt
            </Link>
            <Link to="/web-query" className="flex items-center justify-center gap-2 p-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">
              <Search className="w-4 h-4" /> Cihaz Sorgula
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
