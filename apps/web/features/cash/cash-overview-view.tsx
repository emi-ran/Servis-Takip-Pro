"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightLeft, HandCoins, Wallet, WalletCards } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashFilter, CashMethod, CashOverview, CashTransaction, CashTransactionType } from "@/lib/api/cash";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type CashOverviewViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  data: CashOverview;
};

const filterOrder: CashFilter[] = ["all", "income", "expense", "pending"];

const transactionTypeFilter: Record<CashFilter, CashTransactionType | null> = {
  all: null,
  income: "PAYMENT",
  expense: "EXPENSE",
  pending: "PENDING",
};

const transactionTone: Record<CashTransactionType, "green" | "red" | "orange"> = {
  PAYMENT: "green",
  EXPENSE: "red",
  PENDING: "orange",
};

function EmptyState({ dictionary, isFiltered }: { dictionary: Dictionary; isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="status">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Wallet className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{isFiltered ? dictionary.cash.empty.filteredTitle : dictionary.cash.empty.defaultTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{dictionary.cash.empty.description}</p>
    </div>
  );
}

function resolveMethodLabel(dictionary: Dictionary, method: CashMethod | null) {
  if (!method) {
    return dictionary.cash.methods.notAvailable;
  }

  return dictionary.cash.methods[method];
}

function TransactionRow({ locale, dictionary, transaction }: { locale: Locale; dictionary: Dictionary; transaction: CashTransaction }) {
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(transaction.occurredAt));

  const amountLabel = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: transaction.currency,
    minimumFractionDigits: 2,
  }).format(transaction.amount);

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={transactionTone[transaction.type]}>{dictionary.cash.transactionTypes[transaction.type]}</StatusBadge>
            <p className="text-xs text-slate-500">{dateLabel}</p>
          </div>
          <p className="text-sm text-slate-700">{dictionary.cash.notes[transaction.noteKey]}</p>
        </div>

        <p className="text-lg font-bold text-slate-900">{amountLabel}</p>
      </div>

      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <p>
          {dictionary.cash.table.method}: <span className="font-medium text-slate-800">{resolveMethodLabel(dictionary, transaction.method)}</span>
        </p>
        <p>
          {dictionary.cash.table.customer}:{" "}
          {transaction.customerId && transaction.customerName ? (
            <Link className="font-medium text-blue-700 underline-offset-2 transition hover:underline" href={`/${locale}/customers/${transaction.customerId}`}>
              {transaction.customerName}
            </Link>
          ) : (
            <span className="font-medium text-slate-800">{transaction.customerName ?? dictionary.cash.table.notLinked}</span>
          )}
        </p>
        <p>
          {dictionary.cash.table.serviceRecord}:{" "}
          {transaction.serviceRecordId && transaction.serviceRecordCode ? (
            <Link
              className="font-mono font-medium text-blue-700 underline-offset-2 transition hover:underline"
              href={`/${locale}/service-records/${transaction.serviceRecordId}`}
            >
              {transaction.serviceRecordCode}
            </Link>
          ) : (
            <span className="font-mono font-medium text-slate-800">{transaction.serviceRecordCode ?? dictionary.cash.table.notLinked}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function CashOverviewView({ locale, dictionary, data }: CashOverviewViewProps) {
  const [activeFilter, setActiveFilter] = useState<CashFilter>("all");

  const filteredTransactions = useMemo(() => {
    const selectedType = transactionTypeFilter[activeFilter];

    if (!selectedType) {
      return data.transactions;
    }

    return data.transactions.filter((transaction) => transaction.type === selectedType);
  }, [activeFilter, data.transactions]);

  const updatedAtLabel = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data.updatedAt));

  const numberFormat = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{dictionary.cash.title}</h1>
        <p className="text-sm text-slate-500">{dictionary.cash.description}</p>
        <p className="text-sm text-slate-500">
          {dictionary.cash.lastUpdatedLabel}: {updatedAtLabel}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">{dictionary.cash.summary.todayIncome}</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{numberFormat.format(data.summary.todayIncome)}</p>
        </Panel>
        <Panel className="border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-rose-700">{dictionary.cash.summary.todayExpense}</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{numberFormat.format(data.summary.todayExpense)}</p>
        </Panel>
        <Panel className="border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{dictionary.cash.summary.netCash}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{numberFormat.format(data.summary.netCash)}</p>
        </Panel>
        <Panel className="border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-amber-700">{dictionary.cash.summary.pendingReceivables}</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{numberFormat.format(data.summary.pendingReceivables)}</p>
        </Panel>
      </div>

      <Panel className="rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {filterOrder.map((filter) => (
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                activeFilter === filter ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter === "all" ? <WalletCards className="h-4 w-4" /> : null}
              {filter === "income" ? <HandCoins className="h-4 w-4" /> : null}
              {filter === "expense" ? <ArrowRightLeft className="h-4 w-4" /> : null}
              {filter === "pending" ? <Wallet className="h-4 w-4" /> : null}
              {dictionary.cash.filters[filter]}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="overflow-hidden rounded-xl shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">{dictionary.cash.table.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{dictionary.cash.table.description}</p>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="bg-white">
            {filteredTransactions.map((transaction) => (
              <TransactionRow dictionary={dictionary} key={transaction.id} locale={locale} transaction={transaction} />
            ))}
          </div>
        ) : (
          <EmptyState dictionary={dictionary} isFiltered={activeFilter !== "all"} />
        )}
      </Panel>
    </div>
  );
}
