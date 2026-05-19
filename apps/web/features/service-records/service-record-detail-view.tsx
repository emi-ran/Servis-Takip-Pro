import Link from "next/link";
import { ArrowLeft, CircleDot, ClipboardList } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ServicePriority, ServiceRecordDetail, ServiceStatus, ServiceTimelineEventType } from "@/lib/api/service-records";
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

const timelineToneByType: Record<ServiceTimelineEventType, string> = {
  STATUS_CHANGED: "bg-blue-100 text-blue-700",
  NOTE_ADDED: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  PART_ORDERED: "bg-amber-100 text-amber-700",
};

export function ServiceRecordDetailView({ locale, dictionary, id, detail }: ServiceRecordDetailViewProps) {
  const backHref = `/${locale}/service-records`;

  if (!detail) {
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

  const formattedReceivedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(detail.receivedAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {dictionary.serviceRecords.detail.backToList}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{detail.trackingCode}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.serviceRecords.detail.receivedAtLabel.replace("{date}", formattedReceivedAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge tone={priorityTones[detail.priority]}>{dictionary.servicePriorities[detail.priority]}</StatusBadge>
          <StatusBadge tone={statusTones[detail.status]}>{dictionary.serviceStatuses[detail.status]}</StatusBadge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.issue}</p>
          <p className="mt-2 text-sm leading-6 text-slate-900">{detail.issueSummary}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.customer}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{detail.customer.name}</p>
          <p className="mt-1 text-xs text-slate-500">{detail.customer.phone}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.device}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{detail.device.name}</p>
          <p className="mt-1 text-xs text-slate-500">{detail.device.brand}</p>
          <p className="mt-1 text-xs text-slate-500">{detail.device.model}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.serviceRecords.detail.summary.assignee}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{detail.assigneeName ?? dictionary.serviceRecords.table.unassigned}</p>
          <p className="mt-1 text-xs text-slate-500">
            {dictionary.serviceRecords.detail.summary.serialNumber}: {detail.device.serialNumber}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.serviceRecords.detail.timeline.title}</h2>
            <span className="text-xs font-medium text-slate-500">{dictionary.serviceRecords.detail.timeline.subtitle}</span>
          </div>

          {detail.timeline.length > 0 ? (
            <ol className="mt-5 space-y-4">
              {detail.timeline.map((event) => {
                const formattedEventTime = new Intl.DateTimeFormat(locale, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(event.createdAt));

                return (
                  <li className="flex gap-3" key={event.id}>
                    <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <CircleDot className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${timelineToneByType[event.type]}`}>
                          {dictionary.serviceRecords.detail.timeline.eventTypes[event.type]}
                        </span>
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

        <Panel className="p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{dictionary.serviceRecords.detail.workItems.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{dictionary.serviceRecords.detail.workItems.description}</p>
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((item) => (
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" key={item} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
