"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { createMockCustomer, type CreateCustomerInput } from "@/lib/api/customers";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type FormErrors = Partial<Record<"name" | "phone" | "address", string>>;

export type CreateCustomerCreatedPayload = {
  customerId: string;
  customerName: string;
  input: CreateCustomerInput;
};

type CreateCustomerModalProps = {
  dictionary: Dictionary;
  onClose: () => void;
  onCreated?: (createdCustomer: CreateCustomerCreatedPayload) => void;
  closeOnSuccess?: boolean;
};

const initialState: CreateCustomerInput = {
  name: "",
  phone: "",
  address: "",
  email: "",
  city: "",
  district: "",
  note: "",
};

export function CreateCustomerModal({ dictionary, onClose, onCreated, closeOnSuccess = false }: CreateCustomerModalProps) {
  const [formState, setFormState] = useState<CreateCustomerInput>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const titleId = "create-customer-modal-title";

  const hasFieldErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function updateField<Key extends keyof CreateCustomerInput>(key: Key, value: CreateCustomerInput[Key]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!formState.name.trim()) {
      nextErrors.name = dictionary.customers.create.validation.name;
    }

    if (!formState.phone.trim()) {
      nextErrors.phone = dictionary.customers.create.validation.phone;
    }

    if (!formState.address.trim()) {
      nextErrors.address = dictionary.customers.create.validation.address;
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const snapshot = { ...formState };
    const result = await createMockCustomer(snapshot);

    onCreated?.({
      customerId: result.customerId,
      customerName: result.customerName,
      input: snapshot,
    });

    if (closeOnSuccess) {
      setIsSubmitting(false);
      onClose();
      return;
    }

    setIsSubmitting(false);
    setFormState(initialState);
    setErrors({});
    setSuccessMessage(
      dictionary.customers.create.success.description
        .replace("{name}", result.customerName)
        .replace("{id}", result.customerId),
    );
  }

  return (
    <div aria-labelledby={titleId} aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6" onClick={onClose} role="dialog">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id={titleId}>
              {dictionary.customers.create.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dictionary.customers.create.description}</p>
          </div>
          <button aria-label={dictionary.customers.create.actions.close} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <InputField dictionary={dictionary} error={errors.name} id="customer-name" label={dictionary.customers.create.fields.name} onChange={(value) => updateField("name", value)} required value={formState.name} />
            <InputField dictionary={dictionary} error={errors.phone} id="customer-phone" label={dictionary.customers.create.fields.phone} onChange={(value) => updateField("phone", value)} required value={formState.phone} />
            <InputField dictionary={dictionary} id="customer-email" label={dictionary.customers.create.fields.email} onChange={(value) => updateField("email", value)} type="email" value={formState.email ?? ""} />
            <InputField dictionary={dictionary} id="customer-city" label={dictionary.customers.create.fields.city} onChange={(value) => updateField("city", value)} value={formState.city ?? ""} />
            <InputField dictionary={dictionary} id="customer-district" label={dictionary.customers.create.fields.district} onChange={(value) => updateField("district", value)} value={formState.district ?? ""} />
          </div>

          <TextAreaField dictionary={dictionary} error={errors.address} id="customer-address" label={dictionary.customers.create.fields.address} onChange={(value) => updateField("address", value)} required rows={3} value={formState.address} />
          <TextAreaField dictionary={dictionary} id="customer-note" label={dictionary.customers.create.fields.note} onChange={(value) => updateField("note", value)} rows={2} value={formState.note ?? ""} />

          {successMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              <p className="font-semibold">{dictionary.customers.create.success.title}</p>
              <p className="mt-1">{successMessage}</p>
              <p className="mt-1 text-xs">{dictionary.customers.create.success.nonPersistent}</p>
            </div>
          ) : null}

          {hasFieldErrors ? (
            <p className="text-xs font-medium text-red-700" role="alert">
              {dictionary.customers.create.validation.summary}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
              {dictionary.customers.create.actions.cancel}
            </button>
            <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400" disabled={isSubmitting} type="submit">
              {isSubmitting ? dictionary.customers.create.actions.submitting : dictionary.customers.create.actions.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  required = false,
  type = "text",
  error,
  dictionary,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email";
  error?: string;
  dictionary: Dictionary;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : <span className="ml-1 text-slate-400">({dictionary.customers.create.fields.optional})</span>}
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

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows,
  required = false,
  error,
  dictionary,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  required?: boolean;
  error?: string;
  dictionary: Dictionary;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : <span className="ml-1 text-slate-400">({dictionary.customers.create.fields.optional})</span>}
      </span>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
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
