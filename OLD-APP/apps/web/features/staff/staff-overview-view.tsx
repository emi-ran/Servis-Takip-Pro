"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Briefcase, PencilLine, Plus, Search, ShieldAlert, UserCog, Users } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  buildMockStaffDetail,
  createMockStaff,
  getStaffDetail,
  updateMockStaff,
  type CreateStaffInput,
  type StaffDetail,
  type StaffListItem,
  type StaffOverview,
  type StaffPermissionModule,
  type StaffPermissionModuleKey,
  type StaffPermissionState,
  type StaffRoleKey,
  type StaffStatus,
  type UpdateStaffInput,
} from "@/lib/api/staff";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type StaffOverviewViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: StaffOverview;
};

const roleOptions: StaffRoleKey[] = ["ADMIN", "TECHNICIAN", "RECEPTION", "ACCOUNTING"];

const statusOptions: StaffStatus[] = ["ACTIVE", "ON_LEAVE", "INACTIVE"];

const statusTones: Record<StaffStatus, "blue" | "green" | "orange" | "red" | "slate"> = {
  ACTIVE: "green",
  ON_LEAVE: "orange",
  INACTIVE: "slate",
};

const permissionStateTones: Record<StaffPermissionState, "blue" | "green" | "orange" | "red" | "slate"> = {
  FULL: "green",
  LIMITED: "orange",
  NONE: "slate",
};

type StaffFormState = {
  name: string;
  role: StaffRoleKey;
  phone: string;
  email: string;
  status: StaffStatus;
};

type StaffFormErrors = Partial<Record<"name" | "role", string>>;

const initialCreateState: StaffFormState = {
  name: "",
  role: "TECHNICIAN",
  phone: "",
  email: "",
  status: "ACTIVE",
};

const permissionModuleKeys: StaffPermissionModuleKey[] = ["SERVICE_RECORDS", "CUSTOMERS", "DEVICES", "CASH", "STAFF_SETTINGS"];

function EmptyState({ dictionary, hasFilter }: { dictionary: Dictionary; hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{hasFilter ? dictionary.staff.empty.filteredTitle : dictionary.staff.empty.defaultTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.staff.empty.description}</p>
    </div>
  );
}

function StaffCard({
  locale,
  dictionary,
  item,
  onOpenDetail,
}: {
  locale: Locale;
  dictionary: Dictionary;
  item: StaffListItem;
  onOpenDetail: (staffId: string) => void;
}) {
  return (
    <Panel className="border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{dictionary.staff.roles[item.role]}</p>
        </div>
        <StatusBadge tone={statusTones[item.status]}>{dictionary.staff.statuses[item.status]}</StatusBadge>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>{item.phone ?? dictionary.staff.card.notAvailable}</p>
        <p>{item.email ?? dictionary.staff.card.notAvailable}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{dictionary.staff.card.openAssigned}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{item.openAssignedServiceCount}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">{dictionary.staff.card.assignedToday}</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{item.assignedTodayCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.staff.card.recentAssignments}</p>
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100" onClick={() => onOpenDetail(item.id)} type="button">
            <PencilLine className="h-3.5 w-3.5" />
            {dictionary.staff.actions.detail}
          </button>
        </div>
        {item.recentAssignments.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {item.recentAssignments.map((assignment) => (
              <li className="rounded-lg border border-slate-100 bg-white p-2.5" key={`${item.id}-${assignment.serviceRecordId}`}>
                <Link className="text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${assignment.serviceRecordId}`}>
                  {assignment.trackingCode}
                </Link>
                <p className="mt-1 text-xs text-slate-500">{assignment.issueSummary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">{dictionary.staff.card.noRecentAssignments}</p>
        )}
      </div>
    </Panel>
  );
}

function buildUpdatePayload(detail: StaffDetail, formState: StaffFormState): UpdateStaffInput {
  return {
    id: detail.id,
    name: formState.name,
    role: formState.role,
    phone: formState.phone,
    email: formState.email,
    status: formState.status,
  };
}

function toFormState(staff: Pick<StaffListItem, "name" | "role" | "phone" | "email" | "status">): StaffFormState {
  return {
    name: staff.name,
    role: staff.role,
    phone: staff.phone ?? "",
    email: staff.email ?? "",
    status: staff.status,
  };
}

function validateStaffForm(dictionary: Dictionary, formState: StaffFormState): StaffFormErrors {
  const errors: StaffFormErrors = {};

  if (!formState.name.trim()) {
    errors.name = dictionary.staff.validation.nameRequired;
  }

  if (!formState.role) {
    errors.role = dictionary.staff.validation.roleRequired;
  }

  return errors;
}

function ModalField({
  id,
  label,
  value,
  onChange,
  dictionary,
  required = false,
  type = "text",
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  dictionary: Dictionary;
  required?: boolean;
  type?: "text" | "email" | "tel";
  error?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : <span className="ml-1 text-slate-400">({dictionary.staff.form.optional})</span>}
      </span>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
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

function ModalSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  hint?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
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
      {!error && hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      {error ? (
        <span className="text-xs font-medium text-red-600" id={describedBy} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function CreateStaffModal({
  dictionary,
  onClose,
  onCreated,
}: {
  dictionary: Dictionary;
  onClose: () => void;
  onCreated: (staff: StaffDetail) => void;
}) {
  const [formState, setFormState] = useState<StaffFormState>(initialCreateState);
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateField<Key extends keyof StaffFormState>(key: Key, value: StaffFormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateStaffForm(dictionary, formState);
    setErrors(validationErrors);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const payload: CreateStaffInput = {
      name: formState.name,
      role: formState.role,
      phone: formState.phone,
      email: formState.email,
      status: formState.status,
    };
    const result = await createMockStaff(payload);

    onCreated(result.staff);
    setFormState(initialCreateState);
    setErrors({});
    setSuccessMessage(dictionary.staff.create.success.description.replace("{name}", result.staff.name).replace("{id}", result.staff.id));
    setIsSubmitting(false);
  }

  return (
    <div aria-labelledby="staff-create-title" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6" onClick={onClose} role="dialog">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="staff-create-title">
              {dictionary.staff.create.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dictionary.staff.create.description}</p>
          </div>
          <button aria-label={dictionary.staff.actions.closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <ModalField dictionary={dictionary} error={errors.name} id="staff-create-name" label={dictionary.staff.form.fields.name} onChange={(value) => updateField("name", value)} required value={formState.name} />
            <ModalSelect
              error={errors.role}
              id="staff-create-role"
              label={dictionary.staff.form.fields.role}
              hint={dictionary.staff.form.roleMockHint}
              onChange={(value) => updateField("role", value as StaffRoleKey)}
              options={roleOptions.map((role) => ({ label: dictionary.staff.roles[role], value: role }))}
              value={formState.role}
            />
            <ModalField dictionary={dictionary} id="staff-create-phone" label={dictionary.staff.form.fields.phone} onChange={(value) => updateField("phone", value)} type="tel" value={formState.phone} />
            <ModalField dictionary={dictionary} id="staff-create-email" label={dictionary.staff.form.fields.email} onChange={(value) => updateField("email", value)} type="email" value={formState.email} />
            <ModalSelect
              id="staff-create-status"
              label={dictionary.staff.form.fields.status}
              onChange={(value) => updateField("status", value as StaffStatus)}
              options={statusOptions.map((status) => ({ label: dictionary.staff.statuses[status], value: status }))}
              value={formState.status}
            />
          </div>

          {successMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              <p className="font-semibold">{dictionary.staff.create.success.title}</p>
              <p className="mt-1">{successMessage}</p>
              <p className="mt-1 text-xs">{dictionary.staff.create.success.nonPersistent}</p>
            </div>
          ) : null}

          {hasErrors ? (
            <p className="text-xs font-medium text-red-700" role="alert">
              {dictionary.staff.validation.summary}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
              {dictionary.staff.actions.cancel}
            </button>
            <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400" disabled={isSubmitting} type="submit">
              {isSubmitting ? dictionary.staff.create.actions.submitting : dictionary.staff.create.actions.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionMatrix({ dictionary, modules }: { dictionary: Dictionary; modules: StaffPermissionModule[] }) {
  const modulesByKey = new Map(modules.map((module) => [module.key, module]));

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-semibold">{dictionary.staff.permissions.mockTitle}</p>
        <p className="mt-1">{dictionary.staff.permissions.mockDescription}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[minmax(0,1.2fr)_140px_minmax(0,1.8fr)] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>{dictionary.staff.permissions.columns.module}</span>
          <span>{dictionary.staff.permissions.columns.state}</span>
          <span>{dictionary.staff.permissions.columns.note}</span>
        </div>
        {permissionModuleKeys.map((key) => {
          const permissionModule = modulesByKey.get(key);

          if (!permissionModule) {
            return null;
          }

          return (
            <div className="grid grid-cols-[minmax(0,1.2fr)_140px_minmax(0,1.8fr)] gap-3 border-t border-slate-100 px-3 py-3 text-sm" key={permissionModule.key}>
              <p className="font-medium text-slate-900">{dictionary.staff.permissions.modules[permissionModule.key]}</p>
              <div>
                <StatusBadge tone={permissionStateTones[permissionModule.permissionState]}>{dictionary.staff.permissions.states[permissionModule.permissionState]}</StatusBadge>
              </div>
              <p className="text-slate-600">{dictionary.staff.permissions.notes[permissionModule.noteKey]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StaffDetailModal({
  locale,
  dictionary,
  detail,
  isLoading,
  errorMessage,
  onClose,
  onSaved,
}: {
  locale: Locale;
  dictionary: Dictionary;
  detail: StaffDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSaved: (staff: StaffDetail) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<StaffFormState>(initialCreateState);
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (detail) {
      setFormState(toFormState(detail));
      setErrors({});
      setSuccessMessage(null);
      setIsEditing(false);
    }
  }, [detail]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateField<Key extends keyof StaffFormState>(key: Key, value: StaffFormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!detail) {
      return;
    }

    const validationErrors = validateStaffForm(dictionary, formState);
    setErrors(validationErrors);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await updateMockStaff(buildUpdatePayload(detail, formState));
    const mergedStaff: StaffDetail = {
      ...detail,
      ...result.staff,
      openAssignedServiceCount: detail.openAssignedServiceCount,
      assignedTodayCount: detail.assignedTodayCount,
      recentAssignments: detail.recentAssignments,
      roleTemplate: result.staff.roleTemplate,
    };
    onSaved(mergedStaff);
    setIsEditing(false);
    setErrors({});
    setSuccessMessage(dictionary.staff.detail.success.description.replace("{name}", mergedStaff.name));
    setIsSubmitting(false);
  }

  return (
    <div aria-labelledby="staff-detail-title" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6" onClick={onClose} role="dialog">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="staff-detail-title">
              {dictionary.staff.detail.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dictionary.staff.detail.description}</p>
          </div>
          <button aria-label={dictionary.staff.actions.closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-slate-600">{dictionary.staff.detail.loading}</p> : null}

        {!isLoading && errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage && detail ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">{dictionary.staff.detail.securityTitle}</p>
              <p className="mt-1">{dictionary.staff.detail.securityDescription}</p>
            </div>

            {successMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
                <p className="font-semibold">{dictionary.staff.detail.success.title}</p>
                <p className="mt-1">{successMessage}</p>
                <p className="mt-1 text-xs">{dictionary.staff.detail.success.nonPersistent}</p>
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <Panel className="border border-slate-200 p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{detail.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{dictionary.staff.roles[detail.role]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={statusTones[detail.status]}>{dictionary.staff.statuses[detail.status]}</StatusBadge>
                      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" onClick={() => setIsEditing((current) => !current)} type="button">
                        <PencilLine className="h-4 w-4" />
                        {isEditing ? dictionary.staff.actions.cancelEdit : dictionary.staff.actions.edit}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.staff.detail.metrics.openAssignments}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{detail.openAssignedServiceCount}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{dictionary.staff.detail.metrics.assignedToday}</p>
                      <p className="mt-1 text-2xl font-bold text-blue-700">{detail.assignedTodayCount}</p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Panel className="border border-slate-100 p-3 shadow-none">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.staff.detail.contact.phone}</p>
                        <p className="mt-1 text-sm text-slate-700">{detail.phone ?? dictionary.staff.card.notAvailable}</p>
                      </Panel>
                      <Panel className="border border-slate-100 p-3 shadow-none">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.staff.detail.contact.email}</p>
                        <p className="mt-1 text-sm text-slate-700">{detail.email ?? dictionary.staff.card.notAvailable}</p>
                      </Panel>
                    </div>
                  ) : (
                    <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <ModalField dictionary={dictionary} error={errors.name} id="staff-detail-name" label={dictionary.staff.form.fields.name} onChange={(value) => updateField("name", value)} required value={formState.name} />
                        <ModalSelect
                          error={errors.role}
                          id="staff-detail-role"
                          label={dictionary.staff.form.fields.role}
                          hint={dictionary.staff.form.roleMockHint}
                          onChange={(value) => updateField("role", value as StaffRoleKey)}
                          options={roleOptions.map((role) => ({ label: dictionary.staff.roles[role], value: role }))}
                          value={formState.role}
                        />
                        <ModalField dictionary={dictionary} id="staff-detail-phone" label={dictionary.staff.form.fields.phone} onChange={(value) => updateField("phone", value)} type="tel" value={formState.phone} />
                        <ModalField dictionary={dictionary} id="staff-detail-email" label={dictionary.staff.form.fields.email} onChange={(value) => updateField("email", value)} type="email" value={formState.email} />
                        <ModalSelect
                          id="staff-detail-status"
                          label={dictionary.staff.form.fields.status}
                          onChange={(value) => updateField("status", value as StaffStatus)}
                          options={statusOptions.map((status) => ({ label: dictionary.staff.statuses[status], value: status }))}
                          value={formState.status}
                        />
                      </div>

                      {hasErrors ? (
                        <p className="text-xs font-medium text-red-700" role="alert">
                          {dictionary.staff.validation.summary}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" onClick={() => setIsEditing(false)} type="button">
                          {dictionary.staff.actions.cancel}
                        </button>
                        <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400" disabled={isSubmitting} type="submit">
                          {isSubmitting ? dictionary.staff.detail.actions.submitting : dictionary.staff.detail.actions.save}
                        </button>
                      </div>
                    </form>
                  )}
                </Panel>

                <Panel className="border border-slate-200 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{dictionary.staff.detail.recentAssignmentsTitle}</p>
                  {detail.recentAssignments.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {detail.recentAssignments.map((assignment) => (
                        <div className="rounded-xl border border-slate-100 p-3" key={`${detail.id}-${assignment.serviceRecordId}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Link className="font-mono text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/service-records/${assignment.serviceRecordId}`}>
                              {assignment.trackingCode}
                            </Link>
                            <span className="text-xs text-slate-500">{dictionary.staff.detail.assignmentLinkLabel}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{assignment.issueSummary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">{dictionary.staff.card.noRecentAssignments}</p>
                  )}
                </Panel>
              </div>

              <div className="space-y-4">
                <Panel className="border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{dictionary.staff.permissions.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{dictionary.staff.permissions.description}</p>
                    </div>
                    <StatusBadge tone="orange">{dictionary.staff.permissions.readinessDraft}</StatusBadge>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{dictionary.staff.permissions.roleTemplateLabel.replace("{role}", dictionary.staff.roles[detail.role])}</p>
                </Panel>

                <PermissionMatrix dictionary={dictionary} modules={detail.roleTemplate.modules} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function StaffOverviewView({ locale, dictionary, data }: StaffOverviewViewProps) {
  const [staffItems, setStaffItems] = useState<StaffListItem[]>(data.items);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRoleKey>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StaffStatus>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<StaffDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);

  const summaryData = useMemo(
    () => ({
      totalStaff: staffItems.length,
      activeTechnicians: staffItems.filter((item) => item.role === "TECHNICIAN" && item.status === "ACTIVE").length,
      assignedJobsToday: staffItems.reduce((total, item) => total + item.assignedTodayCount, 0),
      unavailableCount: staffItems.filter((item) => item.status !== "ACTIVE").length,
    }),
    [staffItems],
  );

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(locale);

    return staffItems.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLocaleLowerCase(locale).includes(query) ||
        item.email?.toLocaleLowerCase(locale).includes(query) ||
        item.phone?.toLocaleLowerCase(locale).includes(query);
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [locale, roleFilter, searchTerm, staffItems, statusFilter]);

  const formattedUpdatedAt = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.updatedAt));

  const hasFilter = searchTerm.trim().length > 0 || roleFilter !== "all" || statusFilter !== "all";

  async function openStaffDetail(staffId: string) {
    setSelectedStaffId(staffId);
    setSelectedDetail(null);
    setDetailErrorMessage(null);
    setIsDetailLoading(true);

    const localStaff = staffItems.find((item) => item.id === staffId);

    if (localStaff) {
      setSelectedDetail(buildMockStaffDetail(localStaff));
    }

    const detail = await getStaffDetail(staffId);

    if (!detail) {
      if (localStaff) {
        setIsDetailLoading(false);
        return;
      }

      setDetailErrorMessage(dictionary.staff.detail.notFound);
      setIsDetailLoading(false);
      return;
    }

    const mergedLocal = localStaff
      ? {
          ...detail,
          ...localStaff,
          roleTemplate: detail.roleTemplate,
        }
      : detail;

    setSelectedDetail(mergedLocal);
    setIsDetailLoading(false);
  }

  function handleCreateSuccess(createdStaff: StaffDetail) {
    setStaffItems((current) => [createdStaff, ...current]);
  }

  function handleDetailSaved(updatedStaff: StaffDetail) {
    setSelectedDetail(updatedStaff);
    setStaffItems((current) => current.map((item) => (item.id === updatedStaff.id ? updatedStaff : item)));
  }

  function closeDetailModal() {
    setSelectedStaffId(null);
    setSelectedDetail(null);
    setDetailErrorMessage(null);
    setIsDetailLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dictionary.staff.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dictionary.staff.description}</p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-sm text-slate-500">
            {dictionary.staff.lastUpdatedLabel}: {formattedUpdatedAt}
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Plus className="h-4 w-4" />
            {dictionary.staff.actions.create}
          </button>
        </div>
      </div>

      <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
        <p className="text-sm leading-6 text-amber-800">{dictionary.staff.securityNote}</p>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.staff.summary.totalStaff}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summaryData.totalStaff}</p>
        </Panel>
        <Panel className="border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Users className="h-4 w-4" />
            {dictionary.staff.summary.activeTechnicians}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{summaryData.activeTechnicians}</p>
        </Panel>
        <Panel className="border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <Briefcase className="h-4 w-4" />
            {dictionary.staff.summary.assignedJobsToday}
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{summaryData.assignedJobsToday}</p>
        </Panel>
        <Panel className="border border-orange-100 bg-orange-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-orange-700">
            <ShieldAlert className="h-4 w-4" />
            {dictionary.staff.summary.unavailable}
          </p>
          <p className="mt-2 text-2xl font-bold text-orange-700">{summaryData.unavailableCount}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              aria-label={dictionary.staff.filters.searchLabel}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={dictionary.staff.filters.searchPlaceholder}
              type="search"
              value={searchTerm}
            />
          </div>
          <select
            aria-label={dictionary.staff.filters.roleLabel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setRoleFilter(event.target.value as "all" | StaffRoleKey)}
            value={roleFilter}
          >
            <option value="all">{dictionary.staff.filters.allRoles}</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {dictionary.staff.roles[role]}
              </option>
            ))}
          </select>
          <select
            aria-label={dictionary.staff.filters.statusLabel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setStatusFilter(event.target.value as "all" | StaffStatus)}
            value={statusFilter}
          >
            <option value="all">{dictionary.staff.filters.allStatuses}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {dictionary.staff.statuses[status]}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-4 text-sm text-slate-500">{dictionary.staff.resultsLabel.replace("{count}", String(filteredItems.length))}</p>
      </Panel>

      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <StaffCard dictionary={dictionary} item={item} key={item.id} locale={locale} onOpenDetail={openStaffDetail} />
          ))}
        </div>
      ) : (
        <Panel className="overflow-hidden rounded-xl shadow-sm">
          <EmptyState dictionary={dictionary} hasFilter={hasFilter} />
        </Panel>
      )}

      <Panel className="border border-slate-200 p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <UserCog className="h-4 w-4" />
          {dictionary.staff.readOnlyNote}
        </p>
      </Panel>

      {isCreateModalOpen ? <CreateStaffModal dictionary={dictionary} onClose={() => setIsCreateModalOpen(false)} onCreated={handleCreateSuccess} /> : null}

      {selectedStaffId ? (
        <StaffDetailModal
          detail={selectedDetail}
          dictionary={dictionary}
          errorMessage={detailErrorMessage}
          isLoading={isDetailLoading}
          locale={locale}
          onClose={closeDetailModal}
          onSaved={handleDetailSaved}
        />
      ) : null}
    </div>
  );
}
