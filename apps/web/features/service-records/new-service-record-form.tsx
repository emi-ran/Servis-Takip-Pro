"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { CreateCustomerModal, type CreateCustomerCreatedPayload } from "@/features/customers/create-customer-modal";
import { Panel } from "@/components/ui/panel";
import {
  createMockServiceRecord,
  type CreateServiceRecordFormOptions,
  type CreateServiceRecordInput,
  type MockCustomerSearchResult,
  type ServiceRecordFormPreselection,
  type ServiceRecordPreselectionWarning,
  type ServicePriority,
  type ServiceStatus,
} from "@/lib/api/service-records";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type NewServiceRecordFormProps = {
  locale: Locale;
  dictionary: Dictionary;
  options: CreateServiceRecordFormOptions;
  preselection: ServiceRecordFormPreselection;
};

type FormState = {
  selectedCustomerId: string;
  deviceMode: "existing" | "new";
  selectedDeviceId: string;
  newDeviceBrand: string;
  newDeviceModel: string;
  newDeviceSerialOrImei: string;
  issueSummary: string;
  issueDescription: string;
  priority: ServicePriority;
  status: ServiceStatus;
  assigneeId: string;
  internalNote: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  selectedCustomerId: "",
  deviceMode: "existing",
  selectedDeviceId: "",
  newDeviceBrand: "",
  newDeviceModel: "",
  newDeviceSerialOrImei: "",
  issueSummary: "",
  issueDescription: "",
  priority: "NORMAL",
  status: "NEW",
  assigneeId: "",
  internalNote: "",
};

const CUSTOMER_SEARCH_MIN_LENGTH = 2;
const CUSTOMER_SEARCH_LIMIT = 8;

function validate(formState: FormState, dictionary: Dictionary): FormErrors {
  const errors: FormErrors = {};

  if (!formState.selectedCustomerId) {
    errors.selectedCustomerId = dictionary.serviceRecords.newForm.validation.customerRequired;
  }

  if (formState.deviceMode === "existing") {
    if (!formState.selectedDeviceId) {
      errors.selectedDeviceId = dictionary.serviceRecords.newForm.validation.deviceRequired;
    }
  } else {
    if (!formState.newDeviceBrand.trim()) {
      errors.newDeviceBrand = dictionary.serviceRecords.newForm.validation.deviceBrand;
    }
    if (!formState.newDeviceModel.trim()) {
      errors.newDeviceModel = dictionary.serviceRecords.newForm.validation.deviceModel;
    }
  }

  if (!formState.issueSummary.trim()) {
    errors.issueSummary = dictionary.serviceRecords.newForm.validation.issueSummary;
  }

  if (!formState.issueDescription.trim()) {
    errors.issueDescription = dictionary.serviceRecords.newForm.validation.issueDescription;
  }

  if (!formState.priority) {
    errors.priority = dictionary.serviceRecords.newForm.validation.priority;
  }

  if (!formState.status) {
    errors.status = dictionary.serviceRecords.newForm.validation.status;
  }

  return errors;
}

function getPreselectionWarningMessage(dictionary: Dictionary, warning: ServiceRecordPreselectionWarning | null): string | null {
  if (!warning) {
    return null;
  }

  return dictionary.serviceRecords.newForm.preselectWarnings[warning];
}

export function NewServiceRecordForm({ locale, dictionary, options, preselection }: NewServiceRecordFormProps) {
  const [localCustomers, setLocalCustomers] = useState(options.customers);
  const [formState, setFormState] = useState<FormState>({
    ...initialFormState,
    selectedCustomerId: preselection.selectedCustomerId,
    selectedDeviceId: preselection.selectedDeviceId,
  });
  const [preselectionWarning, setPreselectionWarning] = useState<string | null>(getPreselectionWarningMessage(dictionary, preselection.warning));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearchResult, setCustomerSearchResult] = useState<MockCustomerSearchResult>({
    query: "",
    minQueryLength: CUSTOMER_SEARCH_MIN_LENGTH,
    limit: CUSTOMER_SEARCH_LIMIT,
    totalCount: 0,
    hasMore: false,
    customers: [],
  });
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
  const [devicePickerQuery, setDevicePickerQuery] = useState("");

  useEffect(() => {
    const normalizedQuery = customerSearchQuery.trim();

    if (normalizedQuery.length < CUSTOMER_SEARCH_MIN_LENGTH) {
      setCustomerSearchResult({
        query: normalizedQuery,
        minQueryLength: CUSTOMER_SEARCH_MIN_LENGTH,
        limit: CUSTOMER_SEARCH_LIMIT,
        totalCount: 0,
        hasMore: false,
        customers: [],
      });
      return;
    }

    const loweredQuery = normalizedQuery.toLocaleLowerCase("tr-TR");
    const matchedCustomers = localCustomers.filter((customer) => {
      const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase("tr-TR");
      return searchable.includes(loweredQuery);
    });

    setCustomerSearchResult({
      query: normalizedQuery,
      minQueryLength: CUSTOMER_SEARCH_MIN_LENGTH,
      limit: CUSTOMER_SEARCH_LIMIT,
      totalCount: matchedCustomers.length,
      hasMore: matchedCustomers.length > CUSTOMER_SEARCH_LIMIT,
      customers: matchedCustomers.slice(0, CUSTOMER_SEARCH_LIMIT),
    });
  }, [customerSearchQuery, localCustomers]);

  useEffect(() => {
    if (!isCustomerSearchOpen && !isDevicePickerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCustomerSearchOpen(false);
        setIsDevicePickerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCustomerSearchOpen, isDevicePickerOpen]);

  const selectedCustomer = localCustomers.find((customer) => customer.id === formState.selectedCustomerId) ?? null;
  const selectedCustomerDevices = useMemo(
    () => (selectedCustomer ? options.devices.filter((device) => device.customerId === selectedCustomer.id) : []),
    [options.devices, selectedCustomer],
  );
  const selectedDevice = selectedCustomerDevices.find((device) => device.id === formState.selectedDeviceId) ?? null;
  const filteredSelectedCustomerDevices = useMemo(() => {
    const normalizedQuery = devicePickerQuery.trim().toLocaleLowerCase("tr-TR");
    if (!normalizedQuery) {
      return selectedCustomerDevices;
    }

    return selectedCustomerDevices.filter((device) => {
      const searchable = `${device.brand} ${device.model} ${device.serialOrImei ?? ""}`.toLocaleLowerCase("tr-TR");
      return searchable.includes(normalizedQuery);
    });
  }, [devicePickerQuery, selectedCustomerDevices]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((previousState) => ({ ...previousState, [field]: value }));
    setErrors((previousErrors) => {
      if (!previousErrors[field]) {
        return previousErrors;
      }
      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleDeviceModeChange = (mode: "existing" | "new") => {
    setFormState((previousState) => ({
      ...previousState,
      deviceMode: mode,
      selectedDeviceId: mode === "existing" ? previousState.selectedDeviceId : "",
    }));
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors.selectedDeviceId;
      delete nextErrors.newDeviceBrand;
      delete nextErrors.newDeviceModel;
      return nextErrors;
    });
  };

  const openCustomerSearch = () => {
    setIsCustomerSearchOpen(true);
  };

  const closeCustomerSearch = () => {
    setIsCustomerSearchOpen(false);
  };

  const selectCustomer = (customerId: string) => {
    updateField("selectedCustomerId", customerId);
    updateField("selectedDeviceId", "");
    setPreselectionWarning(null);
    closeCustomerSearch();
  };

  const openCreateCustomerModal = () => {
    closeCustomerSearch();
    setIsCreateCustomerModalOpen(true);
  };

  const closeCreateCustomerModal = () => {
    setIsCreateCustomerModalOpen(false);
  };

  const openDevicePicker = () => {
    if (!selectedCustomer) {
      return;
    }

    setDevicePickerQuery("");
    setIsDevicePickerOpen(true);
  };

  const closeDevicePicker = () => {
    setIsDevicePickerOpen(false);
    setDevicePickerQuery("");
  };

  const selectDevice = (deviceId: string) => {
    updateField("selectedDeviceId", deviceId);
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors.selectedDeviceId;
      return nextErrors;
    });
    closeDevicePicker();
  };

  const switchToNewDeviceMode = () => {
    handleDeviceModeChange("new");
    closeDevicePicker();
  };

  const handleCustomerCreatedForServiceForm = (createdCustomer: CreateCustomerCreatedPayload) => {
    const customerToAppend = {
      id: createdCustomer.customerId,
      name: createdCustomer.customerName,
      phone: createdCustomer.input.phone.trim(),
      email: createdCustomer.input.email?.trim() || "",
    };

    setLocalCustomers((previousCustomers) => [customerToAppend, ...previousCustomers]);
    setFormState((previousState) => ({
      ...previousState,
      selectedCustomerId: createdCustomer.customerId,
      deviceMode: "new",
      selectedDeviceId: "",
    }));
    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors.selectedCustomerId;
      delete nextErrors.selectedDeviceId;
      delete nextErrors.newDeviceBrand;
      delete nextErrors.newDeviceModel;
      return nextErrors;
    });
    setPreselectionWarning(null);
    closeCreateCustomerModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(formState, dictionary);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setTrackingCode(null);
      return;
    }

    const input: CreateServiceRecordInput = {
      customerId: formState.selectedCustomerId,
      newCustomer: undefined,
      deviceId: formState.deviceMode === "existing" ? formState.selectedDeviceId : undefined,
      newDevice:
        formState.deviceMode === "new"
          ? {
              brand: formState.newDeviceBrand.trim(),
              model: formState.newDeviceModel.trim(),
              serialOrImei: formState.newDeviceSerialOrImei.trim() || undefined,
            }
          : undefined,
      issueSummary: formState.issueSummary.trim(),
      issueDescription: formState.issueDescription.trim(),
      priority: formState.priority,
      status: formState.status,
      assigneeId: formState.assigneeId,
      internalNote: formState.internalNote,
    };

    setIsSubmitting(true);
    const result = await createMockServiceRecord(input);
    setTrackingCode(result.trackingCode);
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.serviceRecords.newForm.eyebrow}</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{dictionary.serviceRecords.newForm.title}</h1>
        <p className="text-sm leading-6 text-slate-600">{dictionary.serviceRecords.newForm.description}</p>
      </div>

      {trackingCode ? (
        <Panel className="border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">{dictionary.serviceRecords.newForm.success.title}</p>
          <p className="mt-1 text-sm text-emerald-700">{dictionary.serviceRecords.newForm.success.description.replace("{code}", trackingCode)}</p>
        </Panel>
      ) : null}

      {preselectionWarning ? (
        <Panel className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">{preselectionWarning}</p>
        </Panel>
      ) : null}

      <Panel className="p-4 sm:p-6">
        <form className="space-y-6" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{dictionary.serviceRecords.newForm.sections.customer}</h2>
            </div>

            <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="customer-search-action">
                    {dictionary.serviceRecords.newForm.fields.customerSelect}
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  {selectedCustomer ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{selectedCustomer.name}</p>
                      <p>{selectedCustomer.phone}</p>
                      <p>{selectedCustomer.email || dictionary.serviceRecords.newForm.fields.emailNotProvided}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          id="customer-search-action"
                          onClick={openCustomerSearch}
                          type="button"
                        >
                          {dictionary.serviceRecords.newForm.actions.changeCustomer}
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          onClick={openCreateCustomerModal}
                          type="button"
                        >
                          {dictionary.serviceRecords.newForm.actions.newCustomer}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">{dictionary.serviceRecords.newForm.customerSelector.emptyTitle}</p>
                      <p className="mt-1 text-slate-600">{dictionary.serviceRecords.newForm.customerSelector.emptyDescription}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                          id="customer-search-action"
                          onClick={openCustomerSearch}
                          type="button"
                        >
                          {dictionary.serviceRecords.newForm.actions.searchCustomer}
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          onClick={openCreateCustomerModal}
                          type="button"
                        >
                          {dictionary.serviceRecords.newForm.actions.newCustomer}
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.selectedCustomerId ? (
                    <span className="text-xs font-medium text-red-600">{errors.selectedCustomerId}</span>
                  ) : null}

                  {isCustomerSearchOpen ? (
                    <CustomerSearchModal
                      dictionary={dictionary}
                      onCreateCustomer={openCreateCustomerModal}
                      onClose={closeCustomerSearch}
                      onSearchQueryChange={setCustomerSearchQuery}
                      onSelectCustomer={selectCustomer}
                      searchQuery={customerSearchQuery}
                      searchResult={customerSearchResult}
                    />
                  ) : null}
                </div>

            <div className="md:col-span-2 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{dictionary.serviceRecords.newForm.sections.device}</h2>
            </div>

            <SelectField
              id="device-mode"
              label={dictionary.serviceRecords.newForm.fields.deviceMode}
              onChange={(value) => handleDeviceModeChange(value as "existing" | "new")}
              options={[
                { value: "existing", label: dictionary.serviceRecords.newForm.fields.deviceModeExisting },
                { value: "new", label: dictionary.serviceRecords.newForm.fields.deviceModeNew },
              ]}
              value={formState.deviceMode}
            />

            {formState.deviceMode === "existing" ? (
              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700" htmlFor="device-picker-action">
                  {dictionary.serviceRecords.newForm.fields.deviceSelect}
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedCustomer ? (
                    selectedDevice ? (
                      <>
                        <p className="font-semibold text-slate-900">{`${selectedDevice.brand} ${selectedDevice.model}`}</p>
                        <p>{selectedDevice.serialOrImei || dictionary.serviceRecords.newForm.fields.serialNotProvided}</p>
                        {selectedDevice.registeredAt ? (
                          <p className="text-xs text-slate-500">
                            {dictionary.serviceRecords.newForm.devicePicker.registeredAt.replace(
                              "{date}",
                              new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(selectedDevice.registeredAt)),
                            )}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">{dictionary.serviceRecords.newForm.devicePicker.emptyTitle}</p>
                        <p className="mt-1 text-slate-600">{dictionary.serviceRecords.newForm.devicePicker.emptyDescription}</p>
                      </>
                    )
                  ) : (
                    <>
                      <p className="font-medium text-slate-900">{dictionary.serviceRecords.newForm.devicePicker.customerRequiredTitle}</p>
                      <p className="mt-1 text-slate-600">{dictionary.serviceRecords.newForm.devicePicker.customerRequiredDescription}</p>
                    </>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      disabled={!selectedCustomer}
                      id="device-picker-action"
                      onClick={openDevicePicker}
                      type="button"
                    >
                      {selectedDevice
                        ? dictionary.serviceRecords.newForm.actions.changeDevice
                        : dictionary.serviceRecords.newForm.actions.selectRegisteredDevice}
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      onClick={() => handleDeviceModeChange("new")}
                      type="button"
                    >
                      {dictionary.serviceRecords.newForm.actions.addNewDevice}
                    </button>
                  </div>
                </div>

                {errors.selectedDeviceId ? <span className="text-xs font-medium text-red-600">{errors.selectedDeviceId}</span> : null}

                {isDevicePickerOpen ? (
                  <DevicePickerModal
                    customer={selectedCustomer}
                    dictionary={dictionary}
                    locale={locale}
                    onClose={closeDevicePicker}
                    onDeviceQueryChange={setDevicePickerQuery}
                    onSelectDevice={selectDevice}
                    onSwitchToNewDevice={switchToNewDeviceMode}
                    searchQuery={devicePickerQuery}
                    selectedDeviceId={formState.selectedDeviceId}
                    devices={filteredSelectedCustomerDevices}
                  />
                ) : null}
              </div>
            ) : (
              <>
                <FormField
                  error={errors.newDeviceBrand}
                  id="new-device-brand"
                  label={dictionary.serviceRecords.newForm.fields.deviceBrand}
                  onChange={(value) => updateField("newDeviceBrand", value)}
                  required
                  value={formState.newDeviceBrand}
                />
                <FormField
                  error={errors.newDeviceModel}
                  id="new-device-model"
                  label={dictionary.serviceRecords.newForm.fields.deviceModel}
                  onChange={(value) => updateField("newDeviceModel", value)}
                  required
                  value={formState.newDeviceModel}
                />
                <FormField
                  id="new-device-serial"
                  label={dictionary.serviceRecords.newForm.fields.serialOrImei}
                  onChange={(value) => updateField("newDeviceSerialOrImei", value)}
                  value={formState.newDeviceSerialOrImei}
                />
              </>
            )}

            {formState.deviceMode === "existing" && selectedCustomer && selectedCustomerDevices.length === 0 ? (
              <p className="text-sm text-amber-700 md:col-span-2">{dictionary.serviceRecords.newForm.hints.noDeviceForCustomer}</p>
            ) : null}

            <div className="md:col-span-2 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{dictionary.serviceRecords.newForm.sections.service}</h2>
            </div>

            <FormField
              error={errors.issueSummary}
              id="issue-summary"
              label={dictionary.serviceRecords.newForm.fields.issueSummary}
              onChange={(value) => updateField("issueSummary", value)}
              required
              value={formState.issueSummary}
            />
            <TextAreaField
              error={errors.issueDescription}
              id="issue-description"
              label={dictionary.serviceRecords.newForm.fields.issueDescription}
              onChange={(value) => updateField("issueDescription", value)}
              required
              rows={4}
              value={formState.issueDescription}
            />
            <TextAreaField
              id="internal-note"
              label={dictionary.serviceRecords.newForm.fields.internalNote}
              onChange={(value) => updateField("internalNote", value)}
              rows={3}
              value={formState.internalNote}
            />

            <SelectField
              error={errors.priority}
              id="priority"
              label={dictionary.serviceRecords.newForm.fields.priority}
              onChange={(value) => updateField("priority", value as ServicePriority)}
              options={options.priorities.map((priority) => ({ label: dictionary.servicePriorities[priority], value: priority }))}
              required
              value={formState.priority}
            />
            <SelectField
              error={errors.status}
              id="status"
              label={dictionary.serviceRecords.newForm.fields.status}
              onChange={(value) => updateField("status", value as ServiceStatus)}
              options={options.statuses.map((status) => ({ label: dictionary.serviceStatuses[status], value: status }))}
              required
              value={formState.status}
            />
            <SelectField
              id="assignee"
              label={dictionary.serviceRecords.newForm.fields.assignee}
              onChange={(value) => updateField("assigneeId", value)}
              options={[
                { label: dictionary.serviceRecords.newForm.fields.assigneePlaceholder, value: "" },
                ...options.assignees.map((assignee) => ({ label: assignee.name, value: assignee.id })),
              ]}
              value={formState.assigneeId}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" href={`/${locale}/service-records`}>
              {dictionary.serviceRecords.newForm.actions.cancel}
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? dictionary.serviceRecords.newForm.actions.submitting : dictionary.serviceRecords.newForm.actions.submit}
            </button>
          </div>
        </form>
      </Panel>

      {isCreateCustomerModalOpen ? (
        <CreateCustomerModal
          closeOnSuccess
          dictionary={dictionary}
          onClose={closeCreateCustomerModal}
          onCreated={handleCustomerCreatedForServiceForm}
        />
      ) : null}
    </div>
  );
}

function CustomerSearchModal({
  dictionary,
  searchQuery,
  searchResult,
  onSearchQueryChange,
  onClose,
  onSelectCustomer,
  onCreateCustomer,
}: {
  dictionary: Dictionary;
  searchQuery: string;
  searchResult: MockCustomerSearchResult;
  onSearchQueryChange: (value: string) => void;
  onClose: () => void;
  onSelectCustomer: (customerId: string) => void;
  onCreateCustomer: () => void;
}) {
  const shouldPromptForMinLength = searchQuery.trim().length < searchResult.minQueryLength;

  return (
    <div
      aria-labelledby="customer-search-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900" id="customer-search-modal-title">
              {dictionary.serviceRecords.newForm.customerSelector.modalTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{dictionary.serviceRecords.newForm.customerSelector.modalDescription}</p>
          </div>
          <button
            aria-label={dictionary.serviceRecords.newForm.customerSelector.closeModalAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <FormField
            id="customer-search"
            label={dictionary.serviceRecords.newForm.fields.customerSearch}
            onChange={onSearchQueryChange}
            placeholder={dictionary.serviceRecords.newForm.fields.customerSearchPlaceholder}
            value={searchQuery}
          />

          {shouldPromptForMinLength ? (
            <p className="text-sm text-slate-600">{dictionary.serviceRecords.newForm.customerSelector.minCharactersHint}</p>
          ) : null}

          {!shouldPromptForMinLength && searchResult.customers.length > 0 ? (
            <ul className="space-y-2" role="list">
              {searchResult.customers.map((customer) => (
                <li key={customer.id}>
                  <button
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    onClick={() => onSelectCustomer(customer.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-700">{customer.phone}</p>
                    <p className="text-xs text-slate-500">{customer.email || dictionary.serviceRecords.newForm.fields.emailNotProvided}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {!shouldPromptForMinLength && searchResult.totalCount === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{dictionary.serviceRecords.newForm.customerSelector.noResultTitle}</p>
              <p className="mt-1">{dictionary.serviceRecords.newForm.customerSelector.noResultDescription}</p>
            </div>
          ) : null}

          {!shouldPromptForMinLength && searchResult.hasMore ? (
            <p className="text-xs font-medium text-amber-700">{dictionary.serviceRecords.newForm.customerSelector.refineSearchHint}</p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <button
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={onCreateCustomer}
              type="button"
            >
              {dictionary.serviceRecords.newForm.actions.newCustomer}
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            {dictionary.serviceRecords.newForm.actions.closeSearch}
          </button>
        </div>
      </div>
    </div>
  );
}

function DevicePickerModal({
  dictionary,
  customer,
  locale,
  devices,
  selectedDeviceId,
  searchQuery,
  onDeviceQueryChange,
  onClose,
  onSelectDevice,
  onSwitchToNewDevice,
}: {
  dictionary: Dictionary;
  customer: CreateServiceRecordFormOptions["customers"][number] | null;
  locale: Locale;
  devices: CreateServiceRecordFormOptions["devices"];
  selectedDeviceId: string;
  searchQuery: string;
  onDeviceQueryChange: (value: string) => void;
  onClose: () => void;
  onSelectDevice: (deviceId: string) => void;
  onSwitchToNewDevice: () => void;
}) {
  return (
    <div
      aria-labelledby="device-picker-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6"
      onClick={onClose}
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900" id="device-picker-modal-title">
              {dictionary.serviceRecords.newForm.devicePicker.modalTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {dictionary.serviceRecords.newForm.devicePicker.modalDescription.replace("{name}", customer?.name ?? "")}
            </p>
          </div>
          <button
            aria-label={dictionary.serviceRecords.newForm.devicePicker.closeModalAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <FormField
            id="device-search"
            label={dictionary.serviceRecords.newForm.devicePicker.searchLabel}
            onChange={onDeviceQueryChange}
            placeholder={dictionary.serviceRecords.newForm.devicePicker.searchPlaceholder}
            value={searchQuery}
          />

          {devices.length > 0 ? (
            <ul className="max-h-[340px] space-y-2 overflow-y-auto pr-1" role="list">
              {devices.map((device) => (
                <li key={device.id}>
                  <button
                    className={`w-full rounded-xl border px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50 ${
                      selectedDeviceId === device.id ? "border-blue-400 bg-blue-50" : "border-slate-200"
                    }`}
                    onClick={() => onSelectDevice(device.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-slate-900">{`${device.brand} ${device.model}`}</p>
                    <p className="text-sm text-slate-700">{device.serialOrImei || dictionary.serviceRecords.newForm.fields.serialNotProvided}</p>
                    <p className="text-xs text-slate-500">
                      {device.registeredAt
                        ? dictionary.serviceRecords.newForm.devicePicker.registeredAt.replace(
                            "{date}",
                            new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(device.registeredAt)),
                          )
                        : dictionary.serviceRecords.newForm.devicePicker.registeredAtUnknown}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{dictionary.serviceRecords.newForm.devicePicker.noResultTitle}</p>
              <p className="mt-1">{dictionary.serviceRecords.newForm.devicePicker.noResultDescription}</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={onSwitchToNewDevice}
            type="button"
          >
            {dictionary.serviceRecords.newForm.actions.addNewDevice}
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            {dictionary.serviceRecords.newForm.actions.closeDevicePicker}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  required = false,
  type = "text",
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email";
  error?: string;
  placeholder?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600" id={describedBy}>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  required?: boolean;
  error?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
        value={value}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600" id={describedBy}>
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
  required = false,
  error,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value || `${id}-empty`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-medium text-red-600" id={describedBy}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
