"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DeviceDetail } from "@/lib/api/customers";
import type { ServiceStatus } from "@/lib/api/service-records";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type DeviceDetailViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  id: string;
  detail: DeviceDetail | null;
};

const statusTones: Record<ServiceStatus, "blue" | "green" | "orange" | "red" | "slate"> = {
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
};

export function DeviceDetailView({ locale, dictionary, id, detail }: DeviceDetailViewProps) {
  const backHref = `/${locale}/devices`;

  if (!detail) {
    return (
      <Panel className="mx-auto max-w-3xl p-8 md:p-10">
        <div role="status">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.devices.detail.notFound.eyebrow}</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{dictionary.devices.detail.notFound.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{dictionary.devices.detail.notFound.description.replace("{id}", id)}</p>
          <Link className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {dictionary.devices.detail.backToList}
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {dictionary.devices.detail.backToList}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {detail.device.brand} {detail.device.model}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{detail.device.nickname}</p>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          href={`/${locale}/service-records/new?customerId=${detail.customer.id}&deviceId=${detail.device.id}`}
        >
          {dictionary.devices.detail.actions.newServiceRecord}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{dictionary.devices.detail.summary.title}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.devices.detail.summary.brandModel}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{detail.device.brand + " " + detail.device.model}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.devices.detail.summary.type}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{dictionary.devices.deviceTypes[detail.device.type]}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.devices.detail.summary.serialNumber}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{detail.device.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.devices.detail.summary.imei}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{detail.device.imei ?? dictionary.devices.detail.summary.notAvailable}</p>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{dictionary.devices.detail.owner.title}</h2>
          <div className="mt-4 space-y-1">
            <Link className="text-base font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/customers/${detail.customer.id}`}>
              {detail.customer.name}
            </Link>
            <p className="text-sm text-slate-700">{detail.customer.phone}</p>
            <p className="text-sm text-slate-700">{detail.customer.email}</p>
            <p className="text-sm text-slate-600">{detail.customer.city + " • " + detail.customer.district}</p>
            <p className="text-sm text-slate-600">{detail.customer.address}</p>
          </div>
        </Panel>
      </div>

      <Panel className="p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{dictionary.devices.detail.serviceHistory.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{dictionary.devices.detail.serviceHistory.description}</p>

        {detail.serviceHistory.length > 0 ? (
          <div className="mt-4 space-y-3">
            {detail.serviceHistory.map((record) => {
              const formattedDate = new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(record.receivedAt));

              return (
                <div className="rounded-xl border border-slate-100 p-3" key={record.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Link className="font-mono text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${record.id}`}>
                      {record.trackingCode}
                    </Link>
                    <StatusBadge tone={statusTones[record.status]}>{dictionary.serviceStatuses[record.status]}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{dictionary.devices.detail.serviceHistory.dateLabel.replace("{date}", formattedDate)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center" role="status">
            <ClipboardList className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">{dictionary.devices.detail.serviceHistory.emptyTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{dictionary.devices.detail.serviceHistory.emptyDescription}</p>
          </div>
        )}
      </Panel>

      <Panel className="border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
        <p className="text-sm text-blue-900">{dictionary.devices.detail.createServiceRecordHint}</p>
      </Panel>
    </div>
  );
}
