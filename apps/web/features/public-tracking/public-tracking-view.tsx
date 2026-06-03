import Link from "next/link";
import { CheckCircle2, Circle, CircleDashed, Mail, MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPublicTrackingCopy, type PublicTrackingCopyDictionary } from "@/features/public-tracking/public-tracking-copy";
import type { PublicTrackingRecord, PublicTrackingTimelineStep, PublicTrackingTimelineStepKey } from "@/lib/api/public-tracking";
import type { Locale } from "@/lib/i18n/settings";

type PublicTrackingViewProps = {
  code: string;
  locale: Locale;
  dictionary: PublicTrackingCopyDictionary;
  record: PublicTrackingRecord | null;
};

type PublicTrackingTimelineLabelKey = "received" | "diagnosis" | "repair" | "ready" | "delivered";

const statusTones = {
  NEW: "slate",
  IN_PROGRESS: "blue",
  WAITING_PART: "orange",
  WAITING_CUSTOMER_APPROVAL: "orange",
  READY_FOR_DELIVERY: "green",
  DELIVERED: "green",
  CANCELLED: "red",
} as const;

const timelineStateStyles: Record<PublicTrackingTimelineStep["state"], string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  current: "border-blue-200 bg-blue-50 text-blue-700",
  upcoming: "border-slate-200 bg-slate-50 text-slate-400",
};

const timelineLabelKeys: Record<PublicTrackingTimelineStepKey, PublicTrackingTimelineLabelKey> = {
  received: "received",
  diagnosis: "diagnosis",
  repair: "repair",
  ready: "ready",
  delivered: "delivered",
};

function formatDate(locale: Locale, value: string, withTime = false) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function TimelineIcon({ state }: { state: PublicTrackingTimelineStep["state"] }) {
  if (state === "completed") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (state === "current") {
    return <Circle className="h-5 w-5 fill-current" />;
  }

  return <CircleDashed className="h-5 w-5" />;
}

export function PublicTrackingView({ code, locale, dictionary, record }: PublicTrackingViewProps) {
  const copy = dictionary;
  const alternateLocale = locale === "tr" ? "en" : "tr";
  const alternateDictionary = getPublicTrackingCopy(alternateLocale);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-panel">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.35),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_55%,_#1e293b_100%)] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">{copy.header.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.brandName}</h1>
                <p className="mt-3 text-lg font-semibold tracking-tight text-white">{copy.header.title}</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{copy.header.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">{copy.header.supportLabel}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{copy.header.supportValue}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 backdrop-blur">
                  <span className="font-semibold uppercase tracking-[0.16em] text-slate-300">{copy.languageLabel}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white">{copy.languages[locale]}</span>
                    <Link className="rounded-full border border-white/15 px-2.5 py-1 font-semibold transition hover:bg-white/10" href={`/track/${encodeURIComponent(code)}?lang=${alternateLocale}`}>
                      {alternateDictionary.languages[alternateLocale]}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {record ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{copy.summary.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{record.issueTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{copy.summary.description}</p>
                  </div>
                  <StatusBadge tone={statusTones[record.currentStatus]}>{copy.statusLabels[record.currentStatus]}</StatusBadge>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.summary.trackingCode}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900 break-all">{record.trackingCode}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.summary.device}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{record.device.brand}</dd>
                    <dd className="mt-1 text-sm text-slate-600">{record.device.model}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.summary.receivedAt}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{formatDate(locale, record.receivedAt, true)}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 xl:col-span-1">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.summary.currentStatus}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{copy.statusLabels[record.currentStatus]}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 xl:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.summary.estimatedCompletion}</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">
                      {record.estimatedCompletionAt ? formatDate(locale, record.estimatedCompletionAt, true) : copy.summary.estimatedCompletionUnavailable}
                    </dd>
                  </div>
                </dl>
              </Panel>

              <div className="space-y-6">
                <Panel className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{copy.privacy.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{copy.privacy.description}</p>
                    </div>
                  </div>
                </Panel>

                <Panel className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Wrench className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{copy.contact.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{copy.contact.description}</p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-4 text-sm text-slate-700">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.contact.branch}</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{record.branch.name}</dd>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.contact.phone}</dt>
                        <dd className="mt-1">{record.branch.phone}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.contact.email}</dt>
                        <dd className="mt-1 break-all">{record.branch.email}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.contact.address}</dt>
                        <dd className="mt-1 leading-6">{record.branch.address}</dd>
                      </div>
                    </div>
                  </dl>
                </Panel>
              </div>
            </section>

            <Panel className="p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{copy.timeline.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{copy.timeline.description}</p>
                </div>
              </div>

              <ol className="mt-6 grid gap-4 lg:grid-cols-5">
                {record.timeline.map((step) => (
                  <li className={`rounded-2xl border p-4 ${timelineStateStyles[step.state]}`} key={step.key}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70">
                        <TimelineIcon state={step.state} />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">{copy.timeline.states[step.state]}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold">{copy.timeline[timelineLabelKeys[step.key]]}</p>
                    <p className="mt-2 text-xs leading-5">
                      {step.happenedAt ? formatDate(locale, step.happenedAt, true) : copy.timeline.pending}
                    </p>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel className="border-dashed p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">{copy.mockSecurity.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy.mockSecurity.description}</p>
            </Panel>
          </>
        ) : (
          <Panel className="mx-auto max-w-3xl p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{copy.invalid.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{copy.invalid.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy.invalid.description}</p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.invalid.helpLabel}</p>
              <p className="mt-2 text-sm text-slate-700">{copy.invalid.helpDescription}</p>
            </div>
          </Panel>
        )}

        <p className="text-center text-xs leading-6 text-slate-500">{copy.footer.replace("{code}", record ? record.trackingCode : code)}</p>
      </div>
    </main>
  );
}
