"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleDot, ClipboardList, Coins, ShieldAlert } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  applyMockAssignmentUpdate,
  applyMockPaymentNote,
  applyMockStatusUpdate,
  createMockTimelineEvent,
  getMockServiceStatusTransitions,
  type ServicePriority,
  type ServiceRecordDetail,
  type ServiceRecordPartReservationStatus,
  type ServiceStatus,
  type ServiceTimelineEventType,
} from "@/lib/api/service-records";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type ServiceRecordDetailViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  id: string;
  detail: ServiceRecordDetail | null;
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

const priorityTones: Record<ServicePriority, "blue" | "green" | "orange" | "red" | "slate"> = {
  LOW: "slate",
  NORMAL: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const timelineToneByType: Record<ServiceTimelineEventType, string> = {
  STATUS_CHANGED: "bg-blue-100 text-blue-700",
  NOTE_ADDED: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  PART_ORDERED: "bg-amber-100 text-amber-700",
};

const partStatusTones: Record<ServiceRecordPartReservationStatus, "green" | "blue"> = {
  USED: "green",
  RESERVED: "blue",
};

function formatDateTime(locale: Locale, value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

function formatCurrency(locale: Locale, amount: number, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ServiceRecordDetailView({ locale, dictionary, id, detail }: ServiceRecordDetailViewProps) {
  const backHref = `/${locale}/service-records`;
  const cashHref = `/${locale}/cash`;
  const partsHref = `/${locale}/parts`;

  const [activeDetail, setActiveDetail] = useState(detail);
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus | "">("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(detail?.assigneeId ?? "");
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveDetail(detail);
    setSelectedAssigneeId(detail?.assigneeId ?? "");
    setLastActionMessage(null);
  }, [detail]);

  const availableTransitions = useMemo(() => {
    if (!activeDetail) {
      return [];
    }

    return getMockServiceStatusTransitions(activeDetail.status);
  }, [activeDetail]);

  useEffect(() => {
    setSelectedStatus((currentStatus) => {
      if (availableTransitions.length === 0) {
        return "";
      }

      if (currentStatus && availableTransitions.includes(currentStatus)) {
        return currentStatus;
      }

      return availableTransitions[0];
    });
  }, [availableTransitions]);

  if (!activeDetail) {
    return (
      <Panel className="mx-auto max-w-3xl p-8 md:p-10">
        <div role="status">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.serviceRecords.detail.notFound.eyebrow}</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{dictionary.serviceRecords.detail.notFound.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{dictionary.serviceRecords.detail.notFound.description.replace("{id}", id)}</p>
          <Link
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            href={backHref}
          >
            <ArrowLeft className="h-4 w-4" />
            {dictionary.serviceRecords.detail.backToList}
          </Link>
        </div>
      </Panel>
    );
  }

  const formattedReceivedAt = formatDateTime(locale, activeDetail.receivedAt);

  const handleStatusUpdate = () => {
    if (!selectedStatus) {
      return;
    }

    const nextDetail = applyMockStatusUpdate(
      activeDetail,
      selectedStatus,
      createMockTimelineEvent({
        id: `mock-status-${activeDetail.id}-${Date.now()}`,
        type: "STATUS_CHANGED",
        actorName: dictionary.serviceRecords.detail.operations.mockActor,
        title: dictionary.serviceRecords.detail.operations.status.eventTitles[selectedStatus],
        description: dictionary.serviceRecords.detail.operations.status.eventDescriptions[selectedStatus],
      }),
    );

    setActiveDetail(nextDetail);
    setLastActionMessage(dictionary.serviceRecords.detail.operations.feedback.statusChanged.replace("{status}", dictionary.serviceStatuses[selectedStatus]));
  };

  const handleAssignmentUpdate = () => {
    const selectedAssignee = activeDetail.operations.staffOptions.find((staff) => staff.id === selectedAssigneeId) ?? null;

    if (!selectedAssignee) {
      return;
    }

    const nextDetail = applyMockAssignmentUpdate(
      activeDetail,
      selectedAssignee.id,
      createMockTimelineEvent({
        id: `mock-assignment-${activeDetail.id}-${Date.now()}`,
        type: "ASSIGNED",
        actorName: dictionary.serviceRecords.detail.operations.mockActor,
        title: dictionary.serviceRecords.detail.operations.assignment.eventTitle.replace("{name}", selectedAssignee.name),
        description: dictionary.serviceRecords.detail.operations.assignment.eventDescription.replace("{name}", selectedAssignee.name),
      }),
    );

    setActiveDetail(nextDetail);
    setLastActionMessage(dictionary.serviceRecords.detail.operations.feedback.assigneeChanged.replace("{name}", selectedAssignee.name));
  };

  const handlePaymentNote = () => {
    const nextDetail = applyMockPaymentNote(
      activeDetail,
      createMockTimelineEvent({
        id: `mock-payment-${activeDetail.id}-${Date.now()}`,
        type: "NOTE_ADDED",
        actorName: dictionary.serviceRecords.detail.operations.mockActor,
        title: dictionary.serviceRecords.detail.operations.payment.eventTitle,
        description: dictionary.serviceRecords.detail.operations.payment.eventDescription
          .replace("{amount}", formatCurrency(locale, activeDetail.operations.payment.outstandingAmount, activeDetail.operations.payment.currency))
          .replace("{note}", activeDetail.operations.payment.notePreview),
      }),
    );

    setActiveDetail(nextDetail);
    setLastActionMessage(dictionary.serviceRecords.detail.operations.feedback.paymentNoteAdded);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {dictionary.serviceRecords.detail.backToList}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{activeDetail.trackingCode}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.serviceRecords.detail.receivedAtLabel.replace("{date}", formattedReceivedAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge tone={priorityTones[activeDetail.priority]}>{dictionary.servicePriorities[activeDetail.priority]}</StatusBadge>
          <StatusBadge tone={statusTones[activeDetail.status]}>{dictionary.serviceStatuses[activeDetail.status]}</StatusBadge>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">{dictionary.serviceRecords.detail.mockBanner.title}</p>
        <p className="mt-1">{dictionary.serviceRecords.detail.mockBanner.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.issue}</p>
          <p className="mt-2 text-sm leading-6 text-slate-900">{activeDetail.issueSummary}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.customer}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{activeDetail.customer.name}</p>
          <p className="mt-1 text-xs text-slate-500">{activeDetail.customer.phone}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.device}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{activeDetail.device.name}</p>
          <p className="mt-1 text-xs text-slate-500">{activeDetail.device.brand}</p>
          <p className="mt-1 text-xs text-slate-500">{activeDetail.device.model}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.assignee}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{activeDetail.assigneeName ?? dictionary.serviceRecords.table.unassigned}</p>
          <p className="mt-1 text-xs text-slate-500">
            {dictionary.serviceRecords.detail.summary.serialNumber}: {activeDetail.device.serialNumber}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.serviceRecords.detail.timeline.title}</h2>
            <span className="text-xs font-medium text-slate-500">{dictionary.serviceRecords.detail.timeline.subtitle}</span>
          </div>

          {activeDetail.timeline.length > 0 ? (
            <ol className="mt-5 space-y-4">
              {activeDetail.timeline.map((event) => {
                const formattedEventTime = formatDateTime(locale, event.createdAt, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <li className="flex gap-3" key={event.id}>
                    <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <CircleDot className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${timelineToneByType[event.type]}`}>
                            {dictionary.serviceRecords.detail.timeline.eventTypes[event.type]}
                          </span>
                          {event.isMock ? <StatusBadge tone="orange">{dictionary.serviceRecords.detail.timeline.mockBadge}</StatusBadge> : null}
                          {event.visibility === "CUSTOMER_SAFE" ? <StatusBadge tone="slate">{dictionary.serviceRecords.detail.timeline.customerSafeBadge}</StatusBadge> : null}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{formattedEventTime}</p>
                      <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">{dictionary.serviceRecords.detail.timeline.actorLabel.replace("{name}", event.actorName)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center" role="status">
              <ClipboardList className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">{dictionary.serviceRecords.detail.timeline.emptyTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{dictionary.serviceRecords.detail.timeline.emptyDescription}</p>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{dictionary.serviceRecords.detail.operations.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.description}</p>
              </div>
              <StatusBadge tone="orange">{dictionary.serviceRecords.detail.operations.mockOnlyBadge}</StatusBadge>
            </div>

            {lastActionMessage ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
                <p className="font-semibold">{dictionary.serviceRecords.detail.operations.feedback.title}</p>
                <p className="mt-1">{lastActionMessage}</p>
                <p className="mt-1 text-xs">{dictionary.serviceRecords.detail.operations.feedback.nonPersistent}</p>
              </div>
            ) : null}

            <div className="mt-5 space-y-5">
              <section className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{dictionary.serviceRecords.detail.operations.status.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.status.description}</p>

                {availableTransitions.length > 0 ? (
                  <>
                    <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="mock-next-status">
                      {dictionary.serviceRecords.detail.operations.status.nextStatusLabel}
                    </label>
                    <select
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                      id="mock-next-status"
                      onChange={(event) => setSelectedStatus(event.target.value as ServiceStatus)}
                      value={selectedStatus}
                    >
                      {availableTransitions.map((status) => (
                        <option key={status} value={status}>
                          {dictionary.serviceStatuses[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      onClick={handleStatusUpdate}
                      type="button"
                    >
                      {selectedStatus ? dictionary.serviceRecords.detail.operations.status.submitLabels[selectedStatus] : dictionary.serviceRecords.detail.operations.status.defaultSubmitLabel}
                    </button>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
                    {dictionary.serviceRecords.detail.operations.status.noTransitionDescription}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{dictionary.serviceRecords.detail.operations.assignment.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.assignment.description}</p>
                <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="mock-assignee">
                  {dictionary.serviceRecords.detail.operations.assignment.assigneeLabel}
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  id="mock-assignee"
                  onChange={(event) => setSelectedAssigneeId(event.target.value)}
                  value={selectedAssigneeId}
                >
                  {activeDetail.operations.staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleAssignmentUpdate}
                  type="button"
                >
                  {dictionary.serviceRecords.detail.operations.assignment.submitLabel}
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{dictionary.serviceRecords.detail.operations.payment.title}</h3>
                  <StatusBadge tone="orange">{dictionary.serviceRecords.detail.operations.payment.permissionSensitiveBadge}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.payment.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.serviceRecords.detail.operations.payment.outstandingLabel}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formatCurrency(locale, activeDetail.operations.payment.outstandingAmount, activeDetail.operations.payment.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.serviceRecords.detail.operations.payment.collectedLabel}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formatCurrency(locale, activeDetail.operations.payment.collectedAmount, activeDetail.operations.payment.currency)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                  <div className="flex items-start gap-2">
                    <Coins className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                    <div>
                      <p className="font-semibold">{dictionary.serviceRecords.detail.operations.payment.notePreviewLabel}</p>
                      <p className="mt-1">{activeDetail.operations.payment.notePreview}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    onClick={handlePaymentNote}
                    type="button"
                  >
                    {dictionary.serviceRecords.detail.operations.payment.submitLabel}
                  </button>
                  <Link
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    href={cashHref}
                  >
                    {dictionary.serviceRecords.detail.operations.payment.openCashAction}
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{dictionary.serviceRecords.detail.operations.parts.title}</h3>
                  <Link className="text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={partsHref}>
                    {dictionary.serviceRecords.detail.operations.parts.openPartsAction}
                  </Link>
                </div>
                <p className="mt-1 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.parts.description}</p>

                {activeDetail.operations.parts.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {activeDetail.operations.parts.map((part) => (
                      <li className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={part.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{part.sku}</p>
                          </div>
                          <StatusBadge tone={partStatusTones[part.status]}>{dictionary.serviceRecords.detail.operations.parts.statuses[part.status]}</StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{dictionary.serviceRecords.detail.operations.parts.quantityLabel.replace("{count}", String(part.quantity))}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
                    {dictionary.serviceRecords.detail.operations.parts.emptyDescription}
                  </div>
                )}
              </section>
            </div>
          </Panel>

          <Panel className="p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.serviceRecords.detail.workItems.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{dictionary.serviceRecords.detail.workItems.description}</p>
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{dictionary.serviceRecords.detail.workItems.mockSafetyNote}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[0, 1, 2].map((item) => (
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" key={item} />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
