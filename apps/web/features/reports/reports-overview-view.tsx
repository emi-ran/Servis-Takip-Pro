"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BadgeDollarSign, BarChart3, CheckCircle2, Clock3, FileSpreadsheet, FileText, ShieldAlert, Users, Wrench } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { prepareMockReportExport, type ReportRange, type ReportsOverview } from "@/lib/api/reports";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type ReportsOverviewViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: ReportsOverview;
};

const rangeOrder: ReportRange[] = ["today", "thisWeek", "thisMonth", "last30Days"];

function formatCurrency(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatHours(dictionary: Dictionary, value: number) {
  const wholeHours = Math.floor(value);
  const minutes = Math.round((value - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours} ${dictionary.reports.units.hours}`;
  }

  return `${wholeHours} ${dictionary.reports.units.hours} ${minutes} ${dictionary.reports.units.minutes}`;
}

function formatUpdatedAt(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; label: string; count: number; share: number }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div className="space-y-1.5" key={item.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">
                {item.count} · %{item.share}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.share}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsOverviewView({ locale, dictionary, data }: ReportsOverviewViewProps) {
  const [activeRange, setActiveRange] = useState<ReportRange>("today");
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareMessage, setPrepareMessage] = useState<string | null>(null);

  const activeDataset = data.ranges[activeRange];

  const breakdownLists = useMemo(
    () => ({
      categories: activeDataset.breakdowns.categories.map((item) => ({ ...item, label: dictionary.reports.breakdowns.categoryLabels[item.labelKey as keyof typeof dictionary.reports.breakdowns.categoryLabels] })),
      deviceTypes: activeDataset.breakdowns.deviceTypes.map((item) => ({ ...item, label: dictionary.reports.breakdowns.deviceTypeLabels[item.labelKey as keyof typeof dictionary.reports.breakdowns.deviceTypeLabels] })),
      serviceTypes: activeDataset.breakdowns.serviceTypes.map((item) => ({ ...item, label: dictionary.reports.breakdowns.serviceTypeLabels[item.labelKey as keyof typeof dictionary.reports.breakdowns.serviceTypeLabels] })),
    }),
    [activeDataset, dictionary],
  );

  const handlePrepareExport = async () => {
    setIsPreparing(true);
    const result = await prepareMockReportExport(activeRange);
    setPrepareMessage(
      dictionary.reports.export.success.description
        .replace("{range}", dictionary.reports.ranges[result.range])
        .replace("{reference}", result.referenceCode)
        .replace("{time}", formatUpdatedAt(locale, result.preparedAt)),
    );
    setIsPreparing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{dictionary.reports.title}</h1>
        <p className="text-sm text-slate-500">{dictionary.reports.description}</p>
        <p className="text-sm text-slate-500">
          {dictionary.reports.lastUpdatedLabel}: {formatUpdatedAt(locale, activeDataset.updatedAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">{dictionary.reports.mockBanner.title}</p>
        <p className="mt-1">{dictionary.reports.mockBanner.description}</p>
      </div>

      <Panel className="p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{dictionary.reports.filters.title}</p>
            <p className="mt-1 text-sm text-slate-500">{dictionary.reports.filters.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {rangeOrder.map((range) => (
              <button
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  activeRange === range ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={range}
                onClick={() => {
                  setActiveRange(range);
                  setPrepareMessage(null);
                }}
                type="button"
              >
                {dictionary.reports.ranges[range]}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{dictionary.reports.operationalSummary.openedRecords}</p>
            <Wrench className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeDataset.operationalSummary.openedRecords}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{dictionary.reports.operationalSummary.completedRecords}</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeDataset.operationalSummary.completedRecords}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{dictionary.reports.operationalSummary.averageTurnaround}</p>
            <Clock3 className="h-5 w-5 text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{formatHours(dictionary, activeDataset.operationalSummary.averageTurnaroundHours)}</p>
        </Panel>
        <Panel className="border border-red-100 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-red-700">{dictionary.reports.operationalSummary.urgentQueue}</p>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-red-700">{activeDataset.operationalSummary.urgentQueue}</p>
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-800">{dictionary.reports.financialSummary.revenue}</p>
              <p className="mt-3 text-2xl font-bold text-amber-900">{formatCurrency(locale, activeDataset.financialSummary.revenue)}</p>
            </div>
            <BadgeDollarSign className="h-5 w-5 text-amber-700" />
          </div>
          <p className="mt-2 text-xs text-amber-900">{dictionary.reports.financialSummary.mockNote}</p>
        </Panel>
        <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-800">{dictionary.reports.financialSummary.expenses}</p>
              <p className="mt-3 text-2xl font-bold text-amber-900">{formatCurrency(locale, activeDataset.financialSummary.expenses)}</p>
            </div>
            <BadgeDollarSign className="h-5 w-5 text-amber-700" />
          </div>
          <p className="mt-2 text-xs text-amber-900">{dictionary.reports.financialSummary.mockNote}</p>
        </Panel>
        <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-800">{dictionary.reports.financialSummary.netCash}</p>
              <p className="mt-3 text-2xl font-bold text-amber-900">{formatCurrency(locale, activeDataset.financialSummary.netCash)}</p>
            </div>
            <BadgeDollarSign className="h-5 w-5 text-amber-700" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge tone="orange">{dictionary.reports.financialSummary.permissionSensitive}</StatusBadge>
            <p className="text-xs text-amber-900">{dictionary.reports.financialSummary.mockNote}</p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{dictionary.reports.statusDistribution.title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{dictionary.reports.statusDistribution.description}</p>
          <div className="mt-5 space-y-4">
            {activeDataset.serviceStatusDistribution.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{dictionary.serviceStatuses[item.status]}</span>
                  <span className="text-slate-500">
                    {item.count} · %{item.share}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">{dictionary.reports.staff.title}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{dictionary.reports.staff.description}</p>
            </div>
            <StatusBadge tone="orange">{dictionary.reports.staff.permissionSensitive}</StatusBadge>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{dictionary.reports.staff.table.staff}</th>
                  <th className="px-4 py-3 font-semibold">{dictionary.reports.staff.table.activeWorkload}</th>
                  <th className="px-4 py-3 font-semibold">{dictionary.reports.staff.table.completed}</th>
                  <th className="px-4 py-3 font-semibold">{dictionary.reports.staff.table.averageTurnaround}</th>
                  <th className="px-4 py-3 font-semibold">{dictionary.reports.staff.table.urgentAssignments}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {activeDataset.staffPerformance.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{dictionary.roles[item.roleLabelKey]}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.activeWorkload}</td>
                    <td className="px-4 py-3">{item.completedRecords}</td>
                    <td className="px-4 py-3">{formatHours(dictionary, item.averageTurnaroundHours)}</td>
                    <td className="px-4 py-3">{item.urgentAssignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden">
            {activeDataset.staffPerformance.map((item) => (
              <div className="rounded-2xl border border-slate-200 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{dictionary.roles[item.roleLabelKey]}</p>
                  </div>
                  <StatusBadge tone="orange">{dictionary.reports.staff.mockOnly}</StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{dictionary.reports.staff.table.activeWorkload}</p>
                    <p className="mt-1 font-semibold text-slate-900">{item.activeWorkload}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{dictionary.reports.staff.table.completed}</p>
                    <p className="mt-1 font-semibold text-slate-900">{item.completedRecords}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{dictionary.reports.staff.table.averageTurnaround}</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatHours(dictionary, item.averageTurnaroundHours)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{dictionary.reports.staff.table.urgentAssignments}</p>
                    <p className="mt-1 font-semibold text-slate-900">{item.urgentAssignments}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">{dictionary.reports.breakdowns.title}</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">{dictionary.reports.breakdowns.description}</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <BreakdownList items={breakdownLists.categories} title={dictionary.reports.breakdowns.categoriesTitle} />
          <BreakdownList items={breakdownLists.deviceTypes} title={dictionary.reports.breakdowns.deviceTypesTitle} />
          <BreakdownList items={breakdownLists.serviceTypes} title={dictionary.reports.breakdowns.serviceTypesTitle} />
        </div>
      </Panel>

      <Panel className="p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold">{dictionary.reports.export.title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{dictionary.reports.export.description}</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isPreparing}
            onClick={handlePrepareExport}
            type="button"
          >
            <FileText className="h-4 w-4" />
            <FileSpreadsheet className="h-4 w-4" />
            {isPreparing ? dictionary.reports.export.preparing : dictionary.reports.export.action}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{dictionary.reports.export.pdfTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{dictionary.reports.export.notImplemented}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{dictionary.reports.export.excelTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{dictionary.reports.export.notImplemented}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{dictionary.reports.export.auditTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{dictionary.reports.export.backendRequirements}</p>
          </div>
        </div>

        {prepareMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
            <p className="font-semibold">{dictionary.reports.export.success.title}</p>
            <p className="mt-1">{prepareMessage}</p>
            <p className="mt-1 text-xs">{dictionary.reports.export.success.nonPersistent}</p>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">{dictionary.reports.export.caveatTitle}</p>
          <p className="mt-1">{dictionary.reports.export.backendRequirements}</p>
        </div>
      </Panel>
    </div>
  );
}
