"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Smartphone } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import type { DeviceListResult } from "@/lib/api/customers";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type DevicesListViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  initialData: DeviceListResult;
};

function EmptyState({ dictionary, hasQuery }: { dictionary: Dictionary; hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="status">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Smartphone className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{hasQuery ? dictionary.devices.list.empty.searchTitle : dictionary.devices.list.empty.defaultTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.devices.list.empty.description}</p>
    </div>
  );
}

export function DevicesListView({ locale, dictionary, initialData }: DevicesListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(locale);

    return initialData.items.filter((device) => {
      if (!query) {
        return true;
      }

      const searchable = `${device.brand} ${device.model} ${device.serialNumber} ${device.imei ?? ""} ${device.customer.name} ${device.customer.phone}`.toLocaleLowerCase(locale);
      return searchable.includes(query);
    });
  }, [initialData.items, locale, searchTerm]);

  const openServiceCount = initialData.items.reduce((total, item) => total + item.openServiceCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{dictionary.devices.list.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{dictionary.devices.list.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.devices.list.summary.totalDevices}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{initialData.totalCount}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.devices.list.summary.totalOwners}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{new Set(initialData.items.map((item) => item.customer.id)).size}</p>
        </Panel>
        <Panel className="border border-orange-100 bg-orange-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-orange-700">{dictionary.devices.list.summary.openServices}</p>
          <p className="mt-2 text-2xl font-bold text-orange-700">{openServiceCount}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            aria-label={dictionary.devices.list.searchLabel}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={dictionary.devices.list.searchPlaceholder}
            type="search"
            value={searchTerm}
          />
        </div>
        <p className="mt-4 text-sm text-slate-500">{dictionary.devices.list.resultsLabel.replace("{count}", String(filteredItems.length))}</p>
      </Panel>

      <Panel className="overflow-hidden rounded-xl shadow-sm">
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-slate-100 bg-white">
            {filteredItems.map((device) => (
              <div className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)_minmax(7.5rem,0.6fr)_auto] lg:items-center" key={device.id}>
                <div className="min-w-0 space-y-1.5">
                  <Link className="block truncate text-base font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/devices/${device.id}`}>
                    {device.brand} {device.model}
                  </Link>
                  <p className="truncate text-sm text-slate-600">{dictionary.devices.list.row.serialLabel.replace("{serial}", device.serialNumber)}</p>
                  {device.imei ? <p className="truncate text-sm text-slate-500">{dictionary.devices.list.row.imeiLabel.replace("{imei}", device.imei)}</p> : null}
                </div>

                <div className="min-w-0 space-y-1.5 text-sm text-slate-600">
                  <Link className="block truncate font-semibold text-blue-600 transition hover:text-blue-700 hover:underline" href={`/${locale}/customers/${device.customer.id}`}>
                    {device.customer.name}
                  </Link>
                  <p className="truncate text-slate-500">{device.customer.phone}</p>
                </div>

                <div className="lg:justify-self-start">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{dictionary.devices.list.row.openServicesLabel}</p>
                  <div className="mt-2 inline-flex min-w-12 items-center justify-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-inset ring-orange-100">
                    {device.openServiceCount}
                  </div>
                </div>

                <Link className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700 lg:justify-self-end lg:self-center" href={`/${locale}/devices/${device.id}`}>
                  {dictionary.devices.list.row.detailAction}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState dictionary={dictionary} hasQuery={searchTerm.trim().length > 0} />
        )}
      </Panel>
    </div>
  );
}
