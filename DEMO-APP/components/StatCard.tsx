import React from 'react';

interface StatCardProps {
  title: string;
  count: number;
  icon: any;
  bg: string;
  border: string;
  desc?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, bg, border, desc }) => (
  <div className={`p-4 rounded-xl border ${bg} ${border} shadow-sm`}>
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      {desc && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">!</span>}
    </div>
    <div className="mt-2">
      <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-slate-800">{count}</p>
      {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
    </div>
  </div>
);

export default StatCard;