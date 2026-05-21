"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, Filter, Plus, Search, ShieldAlert } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ServicePriority, ServiceRecordListItem, ServiceRecordsOverview, ServiceStatus } from "@/lib/api/service-records";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type ServiceRecordsViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: ServiceRecordsOverview;
};

const statusTones: Record<ServiceStatus, "blue" | "green" | "orange" | "red" | "slate"> = {
  NEW: "slate",
  IN_PROGRESS: "blue",
  WAITING_PART: "orange",
  WAITING_CUSTOMER_APPROVAL: "red",
  READY_FOR_DELIVERY: "green",
  DELIVERED: "green",
  CANCELLED: "red",
};

const priorityTones: Record<ServicePriority, "blue" | "green" | "orange" | "red" | "slate"> = {
  LOW: "slate",
  NORMAL: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const statusOptions: ServiceStatus[] = ["NEW", "IN_PROGRESS", "WAITING_PART", "WAITING_CUSTOMER_APPROVAL", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const priorityOptions: ServicePriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];

function normalizePhoneSearchValue(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return digitsOnly.slice(1);
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith("90")) {
    return digitsOnly.slice(2);
  }

  return digitsOnly;
}

function isPhoneLikeQuery(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0 || /[^\d\s+()\-]/.test(trimmedValue)) {
    return false;
  }

  const normalizedDigits = normalizePhoneSearchValue(trimmedValue);

  return normalizedDigits.length > 0;
}

function matchesServiceRecordSearch(record: ServiceRecordListItem, query: string, locale: Locale) {
  if (query.length === 0) {
    return true;
  }

  const normalizedPhoneQuery = isPhoneLikeQuery(query) ? normalizePhoneSearchValue(query) : "";
  const normalizedCustomerPhone = normalizePhoneSearchValue(record.customerPhone);

  return (
    record.trackingCode.toLocaleLowerCase(locale).includes(query) ||
    record.customerName.toLocaleLowerCase(locale).includes(query) ||
    record.deviceName.toLocaleLowerCase(locale).includes(query) ||
    (normalizedPhoneQuery.length > 0 && normalizedCustomerPhone.includes(normalizedPhoneQuery))
  );
}

function EmptyResults({ dictionary, hasActiveFilters, onReset }: { dictionary: Dictionary; hasActiveFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <ClipboardList className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{dictionary.serviceRecords.empty.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.serviceRecords.empty.description}</p>
      {hasActiveFilters ? (
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onReset}
          type="button"
        >
          <Filter className="h-4 w-4" />
          {dictionary.serviceRecords.filters.reset}
        </button>
      ) : null}
    </div>
  );
}

function ServiceRecordRow({ locale, dictionary, record }: { locale: Locale; dictionary: Dictionary; record: ServiceRecordListItem }) {
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(record.receivedAt));

  return (
    <tr className="transition hover:bg-slate-50" key={record.id}>
      <td className="px-4 py-4 align-top sm:px-6">
        <Link className="font-mono text-sm text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${record.id}`}>
          {record.trackingCode}
        </Link>
        <p className="mt-1 text-xs text-slate-500">{formattedDate}</p>
      </td>
      <td className="px-4 py-4 align-top sm:px-6">
        {record.customerId ? (
          <Link className="font-medium text-slate-900 underline-offset-2 transition hover:underline" href={`/${locale}/customers/${record.customerId}`}>
            {record.customerName}
          </Link>
        ) : (
          <p className="font-medium text-slate-900">{record.customerName}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">{record.customerPhone}</p>
      </td>
      <td className="px-4 py-4 align-top sm:px-6">
        {record.deviceId ? (
          <Link className="font-medium text-slate-800 underline-offset-2 transition hover:underline" href={`/${locale}/devices/${record.deviceId}`}>
            {record.deviceName}
          </Link>
        ) : (
          <p className="font-medium text-slate-800">{record.deviceName}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">{record.issueSummary}</p>
      </td>
      <td className="px-4 py-4 align-top sm:px-6">
        <StatusBadge tone={priorityTones[record.priority]}>{dictionary.servicePriorities[record.priority]}</StatusBadge>
      </td>
      <td className="px-4 py-4 align-top sm:px-6">
        <StatusBadge tone={statusTones[record.status]}>{dictionary.serviceStatuses[record.status]}</StatusBadge>
      </td>
      <td className="px-4 py-4 align-top sm:px-6 text-sm text-slate-600">{record.assigneeName ?? dictionary.serviceRecords.table.unassigned}</td>
      <td className="px-4 py-4 align-top sm:px-6">
        <Link
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          href={`/${locale}/service-records/${record.id}`}
        >
          {dictionary.serviceRecords.table.detailAction}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

export function ServiceRecordsView({ locale, dictionary, data }: ServiceRecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ServiceStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ServicePriority>("all");

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(locale);

    return data.records.filter((record) => {
      const matchesSearch = matchesServiceRecordSearch(record, query, locale);

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || record.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [data.records, locale, priorityFilter, searchTerm, statusFilter]);

  const summary = {
    total: data.records.length,
    urgent: data.records.filter((record) => record.priority === "URGENT").length,
    ready: data.records.filter((record) => record.status === "READY_FOR_DELIVERY").length,
  };

  const formattedUpdatedAt = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.updatedAt));

  const hasActiveFilters = searchTerm.length > 0 || statusFilter !== "all" || priorityFilter !== "all";

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dictionary.serviceRecords.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.serviceRecords.description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            {dictionary.serviceRecords.lastUpdatedLabel}: {formattedUpdatedAt}
          </p>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            href={`/${locale}/service-records/new`}
          >
            <Plus className="h-4 w-4" />
            {dictionary.serviceRecords.actions.new}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.summary.total}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
        </Panel>
        <Panel className="border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-red-700">
            <ShieldAlert className="h-4 w-4" />
            {dictionary.serviceRecords.summary.urgent}
          </p>
          <p className="mt-2 text-2xl font-bold text-red-700">{summary.urgent}</p>
        </Panel>
        <Panel className="border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">{dictionary.serviceRecords.summary.ready}</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{summary.ready}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={dictionary.serviceRecords.filters.searchPlaceholder}
              type="search"
              value={searchTerm}
            />
          </div>

          <select
            aria-label={dictionary.serviceRecords.filters.statusLabel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setStatusFilter(event.target.value as "all" | ServiceStatus)}
            value={statusFilter}
          >
            <option value="all">{dictionary.serviceRecords.filters.allStatuses}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {dictionary.serviceStatuses[status]}
              </option>
            ))}
          </select>

          <select
            aria-label={dictionary.serviceRecords.filters.priorityLabel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setPriorityFilter(event.target.value as "all" | ServicePriority)}
            value={priorityFilter}
          >
            <option value="all">{dictionary.serviceRecords.filters.allPriorities}</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {dictionary.servicePriorities[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {dictionary.serviceRecords.resultsLabel.replace("{count}", String(filteredRecords.length))}
          </p>
          {hasActiveFilters ? (
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" onClick={handleReset} type="button">
              {dictionary.serviceRecords.filters.reset}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </Panel>

      <Panel className="overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.trackingCode}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.customer}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.device}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.priority}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.status}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.assignee}</th>
                  <th className="px-4 py-3 font-medium sm:px-6">{dictionary.serviceRecords.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.map((record) => (
                  <ServiceRecordRow dictionary={dictionary} key={record.id} locale={locale} record={record} />
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyResults dictionary={dictionary} hasActiveFilters={hasActiveFilters} onReset={handleReset} />
          )}
        </div>
      </Panel>
    </div>
  );
}
