"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, Clock3, UserRound } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TodayAttentionRecord, TodayWorkFilter, TodayWorkOverview } from "@/lib/api/today";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type TodayWorkViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: TodayWorkOverview;
};

const recordStatusTones = {
  NEW: "slate",
  APPOINTMENT_SCHEDULED: "blue",
  ASSIGNED: "blue",
  IN_PROGRESS: "blue",
  WAITING_PART: "orange",
  WAITING_CUSTOMER_APPROVAL: "red",
  REPAIRING: "blue",
  READY_FOR_DELIVERY: "green",
  DELIVERED: "green",
  CANCELLED: "red",
  UNREACHABLE: "red",
  UNPAID: "red",
} as const;

const priorityTones = {
  LOW: "slate",
  NORMAL: "blue",
  HIGH: "orange",
  URGENT: "red",
} as const;

const filterKeys: TodayWorkFilter[] = ["all", "appointments", "urgent", "completed"];

function EmptyState({ dictionary }: { dictionary: Dictionary }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <ClipboardCheck className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{dictionary.today.empty.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.today.empty.description}</p>
    </div>
  );
}

function RecordAttentionRow({ locale, dictionary, record }: { locale: Locale; dictionary: Dictionary; record: TodayAttentionRecord }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="font-mono text-sm text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${record.id}`}>
            {record.trackingCode}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge tone={priorityTones[record.priority]}>{dictionary.servicePriorities[record.priority]}</StatusBadge>
            <StatusBadge tone={recordStatusTones[record.status]}>{dictionary.serviceStatuses[record.status]}</StatusBadge>
          </div>
        </div>
        <Link className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={`/${locale}/service-records/${record.id}`}>
          {dictionary.today.sections.attention.detailAction}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          {dictionary.today.sections.attention.customerLabel}:{" "}
          {record.customerId ? (
            <Link className="font-medium text-slate-800 underline-offset-2 hover:underline" href={`/${locale}/customers/${record.customerId}`}>
              {record.customerName}
            </Link>
          ) : (
            <span className="font-medium text-slate-800">{record.customerName}</span>
          )}
        </p>
        <p>
          {dictionary.today.sections.attention.deviceLabel}:{" "}
          {record.deviceId ? (
            <Link className="font-medium text-slate-800 underline-offset-2 hover:underline" href={`/${locale}/devices/${record.deviceId}`}>
              {record.deviceName}
            </Link>
          ) : (
            <span className="font-medium text-slate-800">{record.deviceName}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function TodayWorkView({ locale, dictionary, data }: TodayWorkViewProps) {
  const [activeFilter, setActiveFilter] = useState<TodayWorkFilter>("all");

  const filteredAppointments = useMemo(() => {
    if (activeFilter === "completed") {
      return data.appointments.filter((appointment) => appointment.status === "COMPLETED");
    }

    if (activeFilter === "urgent") {
      return data.appointments.filter((appointment) => appointment.isUrgent);
    }

    if (activeFilter === "appointments" || activeFilter === "all") {
      return data.appointments;
    }

    return data.appointments;
  }, [activeFilter, data.appointments]);

  const filteredAttention = useMemo(() => {
    if (activeFilter === "appointments") {
      return [];
    }

    if (activeFilter === "completed") {
      return [];
    }

    if (activeFilter === "urgent") {
      return data.attentionRecords.filter((record) => record.priority === "URGENT" || record.status === "WAITING_CUSTOMER_APPROVAL");
    }

    return data.attentionRecords;
  }, [activeFilter, data.attentionRecords]);

  const hasAnyVisibleWork = filteredAppointments.length > 0 || filteredAttention.length > 0;

  const formattedUpdatedAt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(data.updatedAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dictionary.today.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.today.description}</p>
        </div>
        <p className="text-sm text-slate-500">
          {dictionary.today.lastUpdatedLabel}: {formattedUpdatedAt}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <CalendarClock className="h-4 w-4" />
            {dictionary.today.summary.dueToday}
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{data.summary.dueTodayCount}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Clock3 className="h-4 w-4" />
            {dictionary.today.summary.openRecords}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.summary.openServiceRecordsCount}</p>
        </Panel>
        <Panel className="border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {dictionary.today.summary.urgent}
          </p>
          <p className="mt-2 text-2xl font-bold text-red-700">{data.summary.urgentCount}</p>
        </Panel>
        <Panel className="border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {dictionary.today.summary.completed}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{data.summary.completedTodayCount}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap gap-2">
          {filterKeys.map((filterKey) => {
            const isActive = activeFilter === filterKey;

            return (
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                type="button"
              >
                {dictionary.today.filters[filterKey]}
              </button>
            );
          })}
        </div>
      </Panel>

      {hasAnyVisibleWork ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel className="rounded-xl p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{dictionary.today.sections.appointments.title}</h2>
              <StatusBadge tone="blue">{filteredAppointments.length}</StatusBadge>
            </div>
            {filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => {
                  const formattedTime = new Intl.DateTimeFormat(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(appointment.time));

                  return (
                    <div className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50" key={appointment.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{formattedTime}</p>
                          <p className="mt-1 text-sm text-slate-600">{appointment.deviceName}</p>
                        </div>
                        <StatusBadge tone={appointment.status === "COMPLETED" ? "green" : appointment.isUrgent ? "red" : "blue"}>
                          {dictionary.today.appointmentStatuses[appointment.status]}
                        </StatusBadge>
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                        <p>
                          {dictionary.today.sections.appointments.customerLabel}:{" "}
                          <Link className="font-medium text-slate-800 underline-offset-2 hover:underline" href={`/${locale}/customers/${appointment.customerId}`}>
                            {appointment.customerName}
                          </Link>
                        </p>
                        <p>
                          {dictionary.today.sections.appointments.deviceLabel}:{" "}
                          <Link className="font-medium text-slate-800 underline-offset-2 hover:underline" href={`/${locale}/devices/${appointment.deviceId}`}>
                            {appointment.deviceName}
                          </Link>
                        </p>
                        <p>
                          {dictionary.today.sections.appointments.addressLabel}:{" "}
                          <span className="font-medium text-slate-800">{appointment.address ?? dictionary.today.sections.appointments.addressUnavailable}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          {dictionary.today.sections.appointments.assigneeLabel}: {appointment.assignedStaffName ?? dictionary.today.sections.appointments.unassigned}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                          href={`/${locale}/service-records/${appointment.serviceRecordId}`}
                        >
                          {dictionary.today.sections.appointments.relatedRecordAction}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState dictionary={dictionary} />
            )}
          </Panel>

          <Panel className="rounded-xl p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{dictionary.today.sections.attention.title}</h2>
              <StatusBadge tone="red">{filteredAttention.length}</StatusBadge>
            </div>
            {filteredAttention.length > 0 ? (
              <div className="space-y-3">
                {filteredAttention.map((record) => (
                  <RecordAttentionRow dictionary={dictionary} key={record.id} locale={locale} record={record} />
                ))}
              </div>
            ) : (
              <EmptyState dictionary={dictionary} />
            )}
          </Panel>
        </div>
      ) : (
        <Panel className="rounded-xl shadow-sm">
          <EmptyState dictionary={dictionary} />
        </Panel>
      )}
    </div>
  );
}
