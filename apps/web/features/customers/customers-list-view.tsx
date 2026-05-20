"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Users } from "lucide-react";

import { CreateCustomerModal } from "@/features/customers/create-customer-modal";
import { Panel } from "@/components/ui/panel";
import type { CustomerListResult } from "@/lib/api/customers";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type CustomersListViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  initialData: CustomerListResult;
};

function EmptyState({ dictionary, hasQuery }: { dictionary: Dictionary; hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="status">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{hasQuery ? dictionary.customers.list.empty.searchTitle : dictionary.customers.list.empty.defaultTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.customers.list.empty.description}</p>
    </div>
  );
}

export function CustomersListView({ locale, dictionary, initialData }: CustomersListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(locale);

    return initialData.items.filter((customer) => {
      if (!query) {
        return true;
      }

      const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase(locale);
      return searchable.includes(query);
    });
  }, [initialData.items, locale, searchTerm]);

  const totalDevices = initialData.items.reduce((total, customer) => total + customer.deviceCount, 0);
  const totalOpenServices = initialData.items.reduce((total, customer) => total + customer.openServiceCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{dictionary.customers.list.title}</h1>
            <p className="text-sm text-slate-500">{dictionary.customers.list.description}</p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            {dictionary.customers.list.actions.create}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.customers.list.summary.totalCustomers}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{initialData.totalCount}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.customers.list.summary.totalDevices}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalDevices}</p>
        </Panel>
        <Panel className="border border-orange-100 bg-orange-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-orange-700">{dictionary.customers.list.summary.openServices}</p>
          <p className="mt-2 text-2xl font-bold text-orange-700">{totalOpenServices}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            aria-label={dictionary.customers.list.searchLabel}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={dictionary.customers.list.searchPlaceholder}
            type="search"
            value={searchTerm}
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">{dictionary.customers.list.resultsLabel.replace("{count}", String(filteredItems.length))}</p>
      </Panel>

      <Panel className="overflow-hidden rounded-xl shadow-sm">
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-slate-100 bg-white">
            {filteredItems.map((customer) => (
              <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between" key={customer.id}>
                <div className="min-w-0">
                  <Link className="text-base font-semibold text-blue-700 transition hover:text-blue-800 hover:underline" href={`/${locale}/customers/${customer.id}`}>
                    {customer.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">{customer.phone}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{customer.email}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <p>
                    {dictionary.customers.list.row.devicesLabel}: <span className="font-semibold text-slate-800">{customer.deviceCount}</span>
                  </p>
                  <p>
                    {dictionary.customers.list.row.openServicesLabel}: <span className="font-semibold text-slate-800">{customer.openServiceCount}</span>
                  </p>
                </div>

                <Link
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  href={`/${locale}/customers/${customer.id}`}
                >
                  {dictionary.customers.list.row.detailAction}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState dictionary={dictionary} hasQuery={searchTerm.trim().length > 0} />
        )}
      </Panel>

      {isCreateModalOpen ? <CreateCustomerModal dictionary={dictionary} onClose={() => setIsCreateModalOpen(false)} /> : null}
    </div>
  );
}
