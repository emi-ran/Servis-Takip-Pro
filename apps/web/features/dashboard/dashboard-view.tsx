import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, PackageSearch, Plus, Search, TrendingDown, TrendingUp } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardOverview } from "@/lib/api/dashboard";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

const metricIcons = {
  waiting_devices: Clock3,
  waiting_parts: PackageSearch,
  ready_delivery: CheckCircle2,
  overdue: AlertTriangle,
};

const metricTones = {
  waiting_devices: "blue",
  waiting_parts: "orange",
  ready_delivery: "green",
  overdue: "red",
} as const;

const statusTones = {
  IN_PROGRESS: "blue",
  WAITING_PART: "orange",
  READY_FOR_DELIVERY: "green",
  NEW: "slate",
} as const;

type DashboardViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: DashboardOverview;
};

export function DashboardView({ locale, dictionary, data }: DashboardViewProps) {
  const formattedUpdatedAt = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.updatedAt));

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dictionary.dashboard.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.dashboard.description}</p>
        </div>
        <div className="text-sm text-slate-500">
          {dictionary.dashboard.lastUpdatedLabel}: {formattedUpdatedAt}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => {
          const Icon = metricIcons[metric.id];
          const tone = metricTones[metric.id];
          const toneClasses =
            tone === "blue"
              ? "bg-blue-50 border-blue-100"
              : tone === "orange"
                ? "bg-orange-50 border-orange-100"
                : tone === "green"
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-red-50 border-red-100";
          const iconClasses =
            tone === "blue"
              ? "text-blue-600"
              : tone === "orange"
                ? "text-orange-600"
                : tone === "green"
                  ? "text-emerald-600"
                  : "text-red-600";

          return (
            <Panel key={metric.id} className={`border p-4 shadow-sm ${toneClasses}`}>
              <div className="mb-2 flex items-start justify-between gap-4">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Icon className={`h-6 w-6 ${iconClasses}`} />
                </div>
                {metric.note ? <StatusBadge tone={tone}>!</StatusBadge> : null}
              </div>
              <p className="text-sm font-medium text-slate-500">{dictionary.dashboard.metrics[metric.id].title}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{metric.value}</p>
              {metric.id === "overdue" && metric.note ? <p className="mt-1 text-xs text-slate-500">{dictionary.dashboard.metrics.overdue.notes[metric.note]}</p> : null}
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <Panel className="overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <h2 className="font-semibold text-slate-800">{dictionary.dashboard.recentRecords.title}</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={`/${locale}/service-records`}>
              {dictionary.common.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{dictionary.dashboard.table.trackingCode}</th>
                  <th className="px-4 py-3 font-medium">{dictionary.dashboard.table.customer}</th>
                  <th className="px-4 py-3 font-medium">{dictionary.dashboard.table.device}</th>
                  <th className="px-4 py-3 font-medium">{dictionary.dashboard.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.recentRecords.map((record) => (
                  <tr className="transition hover:bg-slate-50" key={record.id}>
                    <td className="px-4 py-3 font-mono text-slate-600">{record.trackingCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{record.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{record.deviceName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTones[record.status]}>{dictionary.serviceStatuses[record.status]}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="rounded-xl p-4 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">{dictionary.dashboard.summary.title}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                  {dictionary.dashboard.summary.revenue}
                </span>
                <span className="font-bold text-emerald-700">{currencyFormatter.format(data.dailySummary.revenue)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <TrendingDown className="h-4 w-4" />
                  {dictionary.dashboard.summary.expense}
                </span>
                <span className="font-bold text-red-700">{currencyFormatter.format(data.dailySummary.expense)}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 p-2 text-sm text-white transition hover:bg-blue-700" href={`/${locale}/service-records/new`}>
                <Plus className="h-4 w-4" />
                {dictionary.dashboard.quickActions.primary}
              </Link>
              <Link className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 p-2 text-sm text-slate-700 transition hover:bg-slate-50" href="/track/preview">
                <Search className="h-4 w-4" />
                {dictionary.dashboard.quickActions.secondary}
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">{dictionary.dashboard.summary.pendingApproval}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{data.dailySummary.pendingApproval}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
