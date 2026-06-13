"use client";

import { Building2, CheckCircle2, Globe2, Mail, MapPinned, Phone, Save, Settings2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  saveMockSettingsCompanyProfile,
  type NotificationChannel,
  type ReadinessStatus,
  type SettingsCompanyProfile,
  type SettingsOverview,
} from "@/lib/api/settings";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type SettingsOverviewViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: SettingsOverview;
};

type CompanyProfileFormErrors = Partial<Record<keyof SettingsCompanyProfile, string>>;

const localeOptions: SettingsCompanyProfile["defaultLocale"][] = ["tr", "en"];
const currencyOptions: SettingsCompanyProfile["defaultCurrency"][] = ["TRY", "USD", "EUR"];
const timezoneOptions: SettingsCompanyProfile["timezone"][] = ["Europe/Istanbul", "Europe/Berlin", "UTC"];

const readinessTone: Record<ReadinessStatus, "orange" | "slate"> = {
  BACKEND_REQUIRED: "orange",
  PLANNING_ONLY: "slate",
};

const notificationTone: Record<NotificationChannel, "blue" | "green" | "orange"> = {
  sms: "orange",
  email: "green",
  whatsapp: "blue",
};

function formatUpdatedAt(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function validateCompanyProfile(dictionary: Dictionary, values: SettingsCompanyProfile): CompanyProfileFormErrors {
  const errors: CompanyProfileFormErrors = {};

  if (!values.companyName.trim()) {
    errors.companyName = dictionary.settings.validation.companyNameRequired;
  }

  if (!values.taxNumber.trim()) {
    errors.taxNumber = dictionary.settings.validation.taxNumberRequired;
  }

  if (!values.phone.trim()) {
    errors.phone = dictionary.settings.validation.phoneRequired;
  }

  if (!values.email.trim()) {
    errors.email = dictionary.settings.validation.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = dictionary.settings.validation.emailInvalid;
  }

  return errors;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  disabled = false,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  type?: "text" | "email" | "tel";
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600" id={describedBy} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MockToggle({ enabled }: { enabled: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-7 w-12 items-center rounded-full p-1 transition ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  );
}

export function SettingsOverviewView({ locale, dictionary, data }: SettingsOverviewViewProps) {
  const [companyProfile, setCompanyProfile] = useState<SettingsCompanyProfile>(data.companyProfile);
  const [draftProfile, setDraftProfile] = useState<SettingsCompanyProfile>(data.companyProfile);
  const [errors, setErrors] = useState<CompanyProfileFormErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(data.updatedAt);

  const localeSelectOptions = useMemo(
    () => localeOptions.map((value) => ({ value, label: dictionary.settings.companyProfile.localeOptions[value] })),
    [dictionary.settings.companyProfile.localeOptions],
  );
  const currencySelectOptions = useMemo(
    () => currencyOptions.map((value) => ({ value, label: dictionary.settings.companyProfile.currencyOptions[value] })),
    [dictionary.settings.companyProfile.currencyOptions],
  );
  const timezoneSelectOptions = useMemo(
    () => timezoneOptions.map((value) => ({ value, label: dictionary.settings.companyProfile.timezoneOptions[value] })),
    [dictionary.settings.companyProfile.timezoneOptions],
  );
  const workingHoursSummary = `${dictionary.settings.branchOperation.workingHourTemplates[data.branchOperation.workingHours.template]} ${data.branchOperation.workingHours.startTime}-${data.branchOperation.workingHours.endTime} · ${dictionary.settings.branchOperation.sundayCoverage[data.branchOperation.workingHours.sundayCoverage]}`;
  const publicTrackingSummary = dictionary.settings.branchOperation.publicTrackingModes[data.branchOperation.publicTrackingMode];

  const handleFieldChange = <K extends keyof SettingsCompanyProfile>(key: K, value: SettingsCompanyProfile[K]) => {
    setDraftProfile((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleCancel = () => {
    setDraftProfile(companyProfile);
    setErrors({});
    setSuccessMessage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const validationErrors = validateCompanyProfile(dictionary, draftProfile);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    const result = await saveMockSettingsCompanyProfile(draftProfile);
    setCompanyProfile(result.companyProfile);
    setDraftProfile(result.companyProfile);
    setUpdatedAt(result.savedAt);
    setErrors({});
    setSuccessMessage(dictionary.settings.companyProfile.success.description.replace("{name}", result.companyProfile.companyName));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{dictionary.settings.title}</h1>
        <p className="text-sm text-slate-500">{dictionary.settings.description}</p>
        <p className="text-sm text-slate-500">
          {dictionary.settings.lastUpdatedLabel}: {formatUpdatedAt(locale, updatedAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">{dictionary.settings.mockBanner.title}</p>
        <p className="mt-1">{dictionary.settings.mockBanner.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">{dictionary.settings.companyProfile.title}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{dictionary.settings.companyProfile.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <button
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={handleCancel}
                    type="button"
                  >
                    {dictionary.settings.actions.cancel}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    disabled={isSaving}
                    onClick={handleSave}
                    type="button"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? dictionary.settings.actions.saving : dictionary.settings.actions.save}
                  </button>
                </>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    setDraftProfile(companyProfile);
                    setErrors({});
                    setSuccessMessage(null);
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  {dictionary.settings.actions.edit}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">{dictionary.settings.companyProfile.mockNote}</p>
          </div>

          {successMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
              <p className="font-semibold">{dictionary.settings.companyProfile.success.title}</p>
              <p className="mt-1">{successMessage}</p>
              <p className="mt-1 text-xs">{dictionary.settings.companyProfile.success.nonPersistent}</p>
            </div>
          ) : null}

          {Object.keys(errors).length > 0 ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {dictionary.settings.validation.summary}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              error={errors.companyName}
              disabled={!isEditing}
              id="company-name"
              label={dictionary.settings.companyProfile.fields.companyName}
              onChange={(value) => handleFieldChange("companyName", value)}
              value={draftProfile.companyName}
            />
            <Field
              error={errors.taxNumber}
              disabled={!isEditing}
              id="tax-number"
              label={dictionary.settings.companyProfile.fields.taxNumber}
              onChange={(value) => handleFieldChange("taxNumber", value)}
              value={draftProfile.taxNumber}
            />
            <Field
              error={errors.phone}
              disabled={!isEditing}
              id="company-phone"
              label={dictionary.settings.companyProfile.fields.phone}
              onChange={(value) => handleFieldChange("phone", value)}
              type="tel"
              value={draftProfile.phone}
            />
            <Field
              error={errors.email}
              disabled={!isEditing}
              id="company-email"
              label={dictionary.settings.companyProfile.fields.email}
              onChange={(value) => handleFieldChange("email", value)}
              type="email"
              value={draftProfile.email}
            />
            <SelectField
              id="default-locale"
              disabled={!isEditing}
              label={dictionary.settings.companyProfile.fields.defaultLocale}
              onChange={(value) => handleFieldChange("defaultLocale", value as SettingsCompanyProfile["defaultLocale"])}
              options={localeSelectOptions}
              value={draftProfile.defaultLocale}
            />
            <SelectField
              id="default-currency"
              disabled={!isEditing}
              label={dictionary.settings.companyProfile.fields.defaultCurrency}
              onChange={(value) => handleFieldChange("defaultCurrency", value as SettingsCompanyProfile["defaultCurrency"])}
              options={currencySelectOptions}
              value={draftProfile.defaultCurrency}
            />
            <div className="md:col-span-2">
              <SelectField
                id="default-timezone"
                disabled={!isEditing}
                label={dictionary.settings.companyProfile.fields.timezone}
                onChange={(value) => handleFieldChange("timezone", value as SettingsCompanyProfile["timezone"])}
                options={timezoneSelectOptions}
                value={draftProfile.timezone}
              />
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <Settings2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{dictionary.settings.branchOperation.title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{dictionary.settings.branchOperation.description}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryItem label={dictionary.settings.branchOperation.fields.branchCount} value={data.branchOperation.branchCount} />
              <SummaryItem label={dictionary.settings.branchOperation.fields.workingHours} value={workingHoursSummary} />
              <SummaryItem label={dictionary.settings.branchOperation.fields.serviceRecordPrefix} value={data.branchOperation.serviceRecordPrefix} />
              <SummaryItem label={dictionary.settings.branchOperation.fields.nextSequence} value={data.branchOperation.nextSequence} />
              <SummaryItem label={dictionary.settings.branchOperation.fields.sequencePreview} value={data.branchOperation.previewCode} />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium">{dictionary.settings.branchOperation.fields.publicTracking}</p>
              <p className="mt-1">{publicTrackingSummary}</p>
              <p className="mt-2 text-xs text-slate-500">{dictionary.settings.branchOperation.backendNote}</p>
            </div>
          </Panel>

          <Panel className="border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{dictionary.settings.notifications.title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{dictionary.settings.notifications.description}</p>

            <div className="mt-4 space-y-3">
              {data.notifications.map((item) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3" key={item.channel}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{dictionary.settings.notifications.channels[item.channel]}</p>
                    <p className="mt-1 text-xs text-slate-500">{dictionary.settings.notifications.channelDescriptions[item.channel]}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MockToggle enabled={item.enabled} />
                    <StatusBadge tone={notificationTone[item.channel]}>
                      {item.enabled ? dictionary.settings.notifications.states.enabled : dictionary.settings.notifications.states.disabled}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">{dictionary.settings.notifications.mockOnlyNote}</p>
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{dictionary.settings.security.title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{dictionary.settings.security.description}</p>
          </div>
          <StatusBadge tone="orange">{dictionary.settings.security.readOnlyBadge}</StatusBadge>
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-semibold">{dictionary.settings.security.backendRequiredTitle}</p>
          <p className="mt-1">{dictionary.settings.security.backendRequiredDescription}</p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {data.securityChecklist.map((item) => (
            <div className="rounded-xl border border-slate-100 p-4" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-900">{dictionary.settings.security.items[item.id].title}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{dictionary.settings.security.items[item.id].description}</p>
                </div>
                <StatusBadge tone={readinessTone[item.status]}>{dictionary.settings.security.statuses[item.status]}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <Phone className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold">{dictionary.settings.footerCards.contact.title}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{companyProfile.phone}</p>
          <p className="mt-1 text-sm text-slate-600">{companyProfile.email}</p>
        </Panel>

        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <Globe2 className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold">{dictionary.settings.footerCards.display.title}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{dictionary.settings.companyProfile.localeOptions[companyProfile.defaultLocale]}</p>
          <p className="mt-1 text-sm text-slate-600">{dictionary.settings.companyProfile.currencyOptions[companyProfile.defaultCurrency]}</p>
        </Panel>

        <Panel className="border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPinned className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold">{dictionary.settings.footerCards.timezone.title}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{dictionary.settings.companyProfile.timezoneOptions[companyProfile.timezone]}</p>
          <p className="mt-1 text-xs text-slate-500">{dictionary.settings.footerCards.timezone.description}</p>
        </Panel>
      </div>
    </div>
  );
}
