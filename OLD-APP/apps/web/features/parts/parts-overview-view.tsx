"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Boxes, PackagePlus, Search, ShieldAlert, Wrench } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  reserveMockPartForService,
  resolvePartAvailabilityState,
  type PartAvailabilityState,
  type PartCategoryKey,
  type PartInventoryFilter,
  type PartListItem,
  type PartMovement,
  type PartMovementType,
  type PartsOverview,
} from "@/lib/api/parts";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type PartsOverviewViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: PartsOverview;
};

type ReservationErrors = {
  serviceRecordId?: string;
  quantity?: string;
  form?: string;
};

const inventoryFilterOrder: PartInventoryFilter[] = ["all", "low_stock", "out_of_stock", "reserved", "available"];

const availabilityTone: Record<PartAvailabilityState, "green" | "orange" | "red" | "blue"> = {
  available: "green",
  low_stock: "orange",
  out_of_stock: "red",
  reserved: "blue",
};

const movementTone: Record<PartMovementType, "green" | "blue" | "orange" | "slate"> = {
  PURCHASE: "green",
  RESERVATION: "blue",
  USAGE: "orange",
  ADJUSTMENT: "slate",
};

function formatCurrency(locale: Locale, amount: number, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function EmptyState({ dictionary, onReset }: { dictionary: Dictionary; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Boxes className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{dictionary.parts.empty.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.parts.empty.description}</p>
      <button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={onReset} type="button">
        <ArrowRight className="h-4 w-4" />
        {dictionary.parts.filters.reset}
      </button>
    </div>
  );
}

function ReservePartModal({
  locale,
  dictionary,
  currency,
  part,
  serviceRecords,
  onClose,
  onReserved,
}: {
  locale: Locale;
  dictionary: Dictionary;
  currency: string;
  part: PartListItem;
  serviceRecords: PartsOverview["serviceRecords"];
  onClose: () => void;
  onReserved: (payload: { partId: string; reservedQuantity: number; movement: PartMovement; savedAt: string }) => void;
}) {
  const availableQuantity = Math.max(part.stockQuantity - part.reservedQuantity, 0);
  const [serviceRecordId, setServiceRecordId] = useState(serviceRecords[0]?.id ?? "");
  const [quantity, setQuantity] = useState(String(Math.min(1, Math.max(availableQuantity, 1))));
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: ReservationErrors = {};
    const parsedQuantity = Number(quantity);

    if (!serviceRecordId) {
      nextErrors.serviceRecordId = dictionary.parts.reserve.validation.serviceRecordRequired;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      nextErrors.quantity = dictionary.parts.reserve.validation.quantityRequired;
    } else if (parsedQuantity > availableQuantity) {
      nextErrors.quantity = dictionary.parts.reserve.validation.quantityExceeds.replace("{count}", String(availableQuantity));
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await reserveMockPartForService({ partId: part.id, serviceRecordId, quantity: parsedQuantity });
      onReserved({ partId: part.id, reservedQuantity: parsedQuantity, movement: result.movement, savedAt: result.savedAt });
      onClose();
    } catch {
      setErrors({ form: dictionary.parts.reserve.validation.generic });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div aria-labelledby="parts-reserve-title" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-3 py-6" onClick={onClose} role="dialog">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="parts-reserve-title">
              {dictionary.parts.reserve.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dictionary.parts.reserve.description}</p>
          </div>
          <button aria-label={dictionary.parts.actions.closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.reserve.selectedPart}</p>
            <p className="mt-1 font-semibold text-slate-900">{part.name}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{part.sku}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.stock}</p>
            <p className="mt-1 font-semibold text-slate-900">{part.stockQuantity}</p>
            <p className="mt-1 text-xs text-slate-500">{dictionary.parts.reserve.availableUnits.replace("{count}", String(availableQuantity))}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.salePrice}</p>
            <p className="mt-1 font-semibold text-slate-900">{formatCurrency(locale, part.salePrice, currency)}</p>
            <p className="mt-1 text-xs text-slate-500">{dictionary.parts.reserve.mockPriceNote}</p>
          </div>
        </div>

        <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor="reserve-service-record">
            <span className="font-medium">{dictionary.parts.reserve.serviceRecordLabel}</span>
            <select
              aria-invalid={Boolean(errors.serviceRecordId)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              id="reserve-service-record"
              onChange={(event) => {
                setServiceRecordId(event.target.value);
                setErrors((current) => ({ ...current, serviceRecordId: undefined, form: undefined }));
              }}
              value={serviceRecordId}
            >
              <option value="">{dictionary.parts.reserve.serviceRecordPlaceholder}</option>
              {serviceRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.trackingCode} · {record.customerName} · {record.deviceName}
                </option>
              ))}
            </select>
            {errors.serviceRecordId ? <span className="text-xs font-medium text-red-600">{errors.serviceRecordId}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor="reserve-quantity">
            <span className="font-medium">{dictionary.parts.reserve.quantityLabel}</span>
            <input
              aria-invalid={Boolean(errors.quantity)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              id="reserve-quantity"
              inputMode="numeric"
              max={availableQuantity}
              min={1}
              onChange={(event) => {
                setQuantity(event.target.value);
                setErrors((current) => ({ ...current, quantity: undefined, form: undefined }));
              }}
              type="number"
              value={quantity}
            />
            <span className="text-xs text-slate-500">{dictionary.parts.reserve.quantityHint.replace("{count}", String(availableQuantity))}</span>
            {errors.quantity ? <span className="text-xs font-medium text-red-600">{errors.quantity}</span> : null}
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">{dictionary.parts.reserve.bannerTitle}</p>
            <p className="mt-1">{dictionary.parts.reserve.bannerDescription}</p>
          </div>

          {errors.form ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {errors.form}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" onClick={onClose} type="button">
              {dictionary.parts.actions.cancel}
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400" disabled={isSubmitting || availableQuantity === 0} type="submit">
              <PackagePlus className="h-4 w-4" />
              {isSubmitting ? dictionary.parts.reserve.actions.submitting : dictionary.parts.reserve.actions.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PartsOverviewView({ locale, dictionary, data }: PartsOverviewViewProps) {
  const [parts, setParts] = useState(data.parts);
  const [recentMovements, setRecentMovements] = useState(data.recentMovements);
  const [updatedAt, setUpdatedAt] = useState(data.updatedAt);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<PartInventoryFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PartCategoryKey>("all");
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categoryOptions = useMemo(() => Array.from(new Set(parts.map((part) => part.category))), [parts]);

  const summary = useMemo(
    () => ({
      totalParts: parts.length,
      lowStockCount: parts.filter((part) => part.stockQuantity <= part.reorderThreshold).length,
      reservedUnits: parts.reduce((total, part) => total + part.reservedQuantity, 0),
      estimatedRevenueValue: parts.reduce((total, part) => total + part.stockQuantity * part.salePrice, 0),
    }),
    [parts],
  );

  const lowStockAlerts = useMemo(
    () =>
      parts
        .filter((part) => part.stockQuantity <= part.reorderThreshold)
        .sort((left, right) => left.stockQuantity - right.stockQuantity),
    [parts],
  );

  const filteredParts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(locale);

    return parts.filter((part) => {
      const state = resolvePartAvailabilityState(part);
      const searchValue = `${part.sku} ${part.name} ${part.compatibleDeviceType} ${part.compatibleBrand}`.toLocaleLowerCase(locale);
      const matchesSearch = query.length === 0 || searchValue.includes(query);
      const matchesFilter = inventoryFilter === "all" || state === inventoryFilter;
      const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [categoryFilter, inventoryFilter, locale, parts, searchTerm]);

  const selectedPart = useMemo(() => parts.find((part) => part.id === selectedPartId) ?? null, [parts, selectedPartId]);

  const hasActiveFilters = searchTerm.length > 0 || inventoryFilter !== "all" || categoryFilter !== "all";

  function handleReset() {
    setSearchTerm("");
    setInventoryFilter("all");
    setCategoryFilter("all");
  }

  function handleReservation(payload: { partId: string; reservedQuantity: number; movement: PartMovement; savedAt: string }) {
    setParts((current) =>
      current.map((part) => (part.id === payload.partId ? { ...part, reservedQuantity: part.reservedQuantity + payload.reservedQuantity } : part)),
    );
    setRecentMovements((current) => [payload.movement, ...current]);
    setUpdatedAt(payload.savedAt);

    const reservedPart = parts.find((part) => part.id === payload.partId);
    const successPartName = reservedPart?.name ?? payload.movement.partName;
    const successTrackingCode = payload.movement.serviceRecordCode ?? "";

    setSuccessMessage(
      dictionary.parts.reserve.success.description
        .replace("{part}", successPartName)
        .replace("{serviceRecord}", successTrackingCode)
        .replace("{count}", String(payload.reservedQuantity)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{dictionary.parts.title}</h1>
        <p className="text-sm text-slate-500">{dictionary.parts.description}</p>
        <p className="text-sm text-slate-500">
          {dictionary.parts.lastUpdatedLabel}: {formatDate(locale, updatedAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">{dictionary.parts.mockBanner.title}</p>
        <p className="mt-1">{dictionary.parts.mockBanner.description}</p>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          <p className="font-semibold">{dictionary.parts.reserve.success.title}</p>
          <p className="mt-1">{successMessage}</p>
          <p className="mt-1 text-xs">{dictionary.parts.reserve.success.nonPersistent}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.parts.summary.totalParts}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalParts}</p>
        </Panel>
        <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            {dictionary.parts.summary.lowStock}
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{summary.lowStockCount}</p>
        </Panel>
        <Panel className="border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-blue-700">{dictionary.parts.summary.reservedUnits}</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{summary.reservedUnits}</p>
        </Panel>
        <Panel className="border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-rose-700">{dictionary.parts.summary.estimatedRevenueValue}</p>
            <StatusBadge tone="red">{dictionary.parts.summary.permissionSensitive}</StatusBadge>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700">{formatCurrency(locale, summary.estimatedRevenueValue, data.currency)}</p>
          <p className="mt-2 text-xs text-rose-700">{dictionary.parts.summary.mockValueNote}</p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Panel className="rounded-xl p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={dictionary.parts.filters.searchPlaceholder}
                  type="search"
                  value={searchTerm}
                />
              </div>

              <select
                aria-label={dictionary.parts.filters.statusLabel}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                onChange={(event) => setInventoryFilter(event.target.value as PartInventoryFilter)}
                value={inventoryFilter}
              >
                {inventoryFilterOrder.map((filter) => (
                  <option key={filter} value={filter}>
                    {dictionary.parts.filters.statusOptions[filter]}
                  </option>
                ))}
              </select>

              <select
                aria-label={dictionary.parts.filters.categoryLabel}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                onChange={(event) => setCategoryFilter(event.target.value as "all" | PartCategoryKey)}
                value={categoryFilter}
              >
                <option value="all">{dictionary.parts.filters.allCategories}</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {dictionary.parts.categories[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">{dictionary.parts.resultsLabel.replace("{count}", String(filteredParts.length))}</p>
              {hasActiveFilters ? (
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" onClick={handleReset} type="button">
                  {dictionary.parts.filters.reset}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </Panel>

          <Panel className="overflow-hidden rounded-xl shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">{dictionary.parts.list.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{dictionary.parts.list.description}</p>
            </div>

            {filteredParts.length > 0 ? (
              <div className="divide-y divide-slate-100 bg-white">
                {filteredParts.map((part) => {
                  const availability = resolvePartAvailabilityState(part);
                  const availableQuantity = Math.max(part.stockQuantity - part.reservedQuantity, 0);

                  return (
                    <div className="px-4 py-4 sm:px-6" key={part.id}>
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{part.name}</h3>
                            <StatusBadge tone={availabilityTone[availability]}>{dictionary.parts.inventoryStates[availability]}</StatusBadge>
                            <StatusBadge tone="slate">{dictionary.parts.categories[part.category]}</StatusBadge>
                          </div>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                            <p>
                              {dictionary.parts.list.sku}: <span className="font-mono font-medium text-slate-900">{part.sku}</span>
                            </p>
                            <p>
                              {dictionary.parts.list.compatibility}: <span className="font-medium text-slate-900">{part.compatibleBrand} · {part.compatibleDeviceType}</span>
                            </p>
                            <p>
                              {dictionary.parts.list.salePrice}: <span className="font-medium text-slate-900">{formatCurrency(locale, part.salePrice, data.currency)}</span>
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.stock}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{part.stockQuantity}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.reorderThreshold}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{part.reorderThreshold}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.reserved}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{part.reservedQuantity}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dictionary.parts.list.availableToUse}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{availableQuantity}</p>
                            </div>
                          </div>
                        </div>

                        <div className="xl:w-[240px] xl:flex-shrink-0">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-800">
                              <ShieldAlert className="h-4 w-4 text-amber-600" />
                              <p className="text-sm font-semibold">{dictionary.parts.list.costVisibilityTitle}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{dictionary.parts.list.costVisibilityDescription}</p>
                            <button
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              disabled={availableQuantity === 0}
                              onClick={() => {
                                setSelectedPartId(part.id);
                                setSuccessMessage(null);
                              }}
                              type="button"
                            >
                              <PackagePlus className="h-4 w-4" />
                              {dictionary.parts.actions.reserve}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState dictionary={dictionary} onReset={handleReset} />
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-base font-semibold">{dictionary.parts.alerts.title}</h2>
            </div>
            <p className="mt-1 text-sm text-amber-900/90">{dictionary.parts.alerts.description}</p>

            <div className="mt-4 space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((part) => (
                  <div className="rounded-xl border border-amber-200 bg-white/80 p-3" key={part.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{part.name}</p>
                      <StatusBadge tone={part.stockQuantity === 0 ? "red" : "orange"}>
                        {part.stockQuantity === 0 ? dictionary.parts.alerts.critical : dictionary.parts.alerts.warning}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {dictionary.parts.alerts.itemDescription
                        .replace("{stock}", String(part.stockQuantity))
                        .replace("{threshold}", String(part.reorderThreshold))}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{part.sku}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{dictionary.parts.alerts.empty}</div>
              )}
            </div>
          </Panel>

          <Panel className="overflow-hidden rounded-xl shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-900">{dictionary.parts.movements.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{dictionary.parts.movements.description}</p>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {recentMovements.map((movement) => (
                <div className="px-4 py-4" key={movement.id}>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={movementTone[movement.type]}>{dictionary.parts.movements.types[movement.type]}</StatusBadge>
                        <p className="text-xs text-slate-500">{formatDate(locale, movement.occurredAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</p>
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">{movement.partName}</p>
                      <p className="mt-1 text-sm text-slate-600">{dictionary.parts.movements.notes[movement.noteKey]}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{movement.sku}</p>
                    </div>

                    {movement.serviceRecordId && movement.serviceRecordCode ? (
                      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700" href={`/${locale}/service-records/${movement.serviceRecordId}`}>
                        <Wrench className="h-4 w-4" />
                        {dictionary.parts.movements.serviceRecordLink.replace("{code}", movement.serviceRecordCode)}
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {selectedPart ? (
        <ReservePartModal
          currency={data.currency}
          dictionary={dictionary}
          locale={locale}
          onClose={() => setSelectedPartId(null)}
          onReserved={handleReservation}
          part={selectedPart}
          serviceRecords={data.serviceRecords}
        />
      ) : null}
    </div>
  );
}
