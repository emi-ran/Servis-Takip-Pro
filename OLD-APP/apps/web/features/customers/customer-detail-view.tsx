"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, Laptop } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCustomerDeviceDetail, type CustomerDetail, type CustomerDeviceDetail } from "@/lib/api/customers";
import type { ServiceStatus } from "@/lib/api/service-records";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type CustomerDetailViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  id: string;
  detail: CustomerDetail | null;
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

export function CustomerDetailView({ locale, dictionary, id, detail }: CustomerDetailViewProps) {
  const backHref = `/${locale}/customers`;
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isDeviceLoading, setIsDeviceLoading] = useState(false);
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<CustomerDeviceDetail | null>(null);
  const [deviceErrorMessage, setDeviceErrorMessage] = useState<string | null>(null);

  async function openDeviceDetail(deviceId: string) {
    if (!detail) {
      return;
    }

    setIsDeviceModalOpen(true);
    setIsDeviceLoading(true);
    setDeviceErrorMessage(null);
    setSelectedDeviceDetail(null);

    const result = await getCustomerDeviceDetail(detail.customer.id, deviceId);

    if (!result) {
      setDeviceErrorMessage(dictionary.customers.detail.devices.mismatchError);
      setIsDeviceLoading(false);
      return;
    }

    setSelectedDeviceDetail(result);
    setIsDeviceLoading(false);
  }

  if (!detail) {
    return (
      <Panel className="mx-auto max-w-3xl p-8 md:p-10">
        <div role="status">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.customers.detail.notFound.eyebrow}</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{dictionary.customers.detail.notFound.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{dictionary.customers.detail.notFound.description.replace("{id}", id)}</p>
          <Link
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            href={backHref}
          >
            <ArrowLeft className="h-4 w-4" />
            {dictionary.customers.detail.backToList}
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
            {dictionary.customers.detail.backToList}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{detail.customer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{detail.customer.city + " • " + detail.customer.district}</p>
          <p className="mt-1 text-sm text-slate-500">{detail.customer.address}</p>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          href={`/${locale}/service-records/new?customerId=${detail.customer.id}`}
        >
          {dictionary.customers.detail.actions.newServiceRecord}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <Panel className="p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{dictionary.customers.detail.contactCard.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.customers.detail.contactCard.phone}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.customers.detail.contactCard.email}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail.customer.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.customers.detail.contactCard.city}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail.customer.city}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.customers.detail.contactCard.district}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail.customer.district}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.customers.detail.contactCard.address}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail.customer.address}</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <Panel className="p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.customers.detail.devices.title}</h2>
            <span className="text-sm text-slate-500">{dictionary.customers.detail.devices.countLabel.replace("{count}", String(detail.devices.length))}</span>
          </div>

          {detail.devices.length > 0 ? (
            <div className="mt-4 space-y-3">
              {detail.devices.map((device) => (
                <div className="rounded-xl border border-slate-100 p-3" key={device.id}>
                  <p className="text-sm font-semibold text-slate-900">{device.nickname}</p>
                  <p className="mt-1 text-sm text-slate-600">{device.brand + " " + device.model}</p>
                  <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.devices.serialLabel.replace("{serial}", device.serialNumber)}</p>
                  <button
                    className="mt-3 inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    onClick={() => void openDeviceDetail(device.id)}
                    type="button"
                  >
                    {dictionary.customers.detail.devices.detailAction}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center" role="status">
              <Laptop className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">{dictionary.customers.detail.devices.emptyTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.devices.emptyDescription}</p>
            </div>
          )}
        </Panel>

        <Panel className="p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{dictionary.customers.detail.serviceHistory.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{dictionary.customers.detail.serviceHistory.description}</p>

          {detail.recentServiceRecords.length > 0 ? (
            <div className="mt-4 space-y-3">
              {detail.recentServiceRecords.map((record) => {
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
                    <p className="mt-2 text-sm text-slate-700">
                      {dictionary.customers.detail.serviceHistory.deviceLabel}: {record.deviceName ?? dictionary.customers.detail.serviceHistory.unknownDevice}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.serviceHistory.dateLabel.replace("{date}", formattedDate)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center" role="status">
              <ClipboardList className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">{dictionary.customers.detail.serviceHistory.emptyTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.serviceHistory.emptyDescription}</p>
            </div>
          )}
        </Panel>
      </div>

      {isDeviceModalOpen ? (
        <DeviceDetailModal
          detail={selectedDeviceDetail}
          dictionary={dictionary}
          errorMessage={deviceErrorMessage}
          isLoading={isDeviceLoading}
          locale={locale}
          onClose={() => setIsDeviceModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function DeviceDetailModal({
  locale,
  dictionary,
  detail,
  isLoading,
  errorMessage,
  onClose,
}: {
  locale: Locale;
  dictionary: Dictionary;
  detail: CustomerDeviceDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
}) {
  return (
    <div aria-labelledby="customer-device-detail-title" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6" onClick={onClose} role="dialog">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900" id="customer-device-detail-title">
            {dictionary.customers.detail.devices.modalTitle}
          </h3>
          <button aria-label={dictionary.customers.detail.devices.closeModalAriaLabel} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-slate-600">{dictionary.customers.detail.devices.loading}</p> : null}

        {!isLoading && errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage && detail ? (
          <div className="mt-4 space-y-4">
            <Panel className="border border-slate-100 p-4 shadow-none">
              <p className="text-sm font-semibold text-slate-900">{detail.device.nickname}</p>
              <p className="mt-1 text-sm text-slate-700">{detail.device.brand + " " + detail.device.model}</p>
              <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.devices.serialLabel.replace("{serial}", detail.device.serialNumber)}</p>
              <p className="mt-2 text-xs text-slate-500">{dictionary.customers.detail.devices.ownerLabel.replace("{name}", detail.customer.name)}</p>
            </Panel>

            <div>
              <p className="text-sm font-semibold text-slate-900">{dictionary.customers.detail.devices.serviceHistoryTitle}</p>
              {detail.serviceHistory.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {detail.serviceHistory.map((record) => {
                    const formattedDate = new Intl.DateTimeFormat(locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(record.receivedAt));

                    return (
                      <div className="rounded-xl border border-slate-100 p-3" key={record.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link className="font-mono text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${record.id}`}>
                            {record.trackingCode}
                          </Link>
                          <StatusBadge tone={statusTones[record.status]}>{dictionary.serviceStatuses[record.status]}</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{dictionary.customers.detail.serviceHistory.dateLabel.replace("{date}", formattedDate)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">{dictionary.customers.detail.devices.noDeviceHistory}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
