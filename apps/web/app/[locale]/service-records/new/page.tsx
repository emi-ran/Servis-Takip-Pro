import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function NewServiceRecordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const dictionary = await getDictionary(resolvedLocale);

  return (
    <Panel className="mx-auto max-w-3xl p-8 md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.serviceRecords.newPage.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{dictionary.serviceRecords.newPage.title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{dictionary.serviceRecords.newPage.description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700" href={`/${resolvedLocale}/service-records`}>
          {dictionary.serviceRecords.newPage.backToList}
        </Link>
        <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" href={`/${resolvedLocale}/dashboard`}>
          {dictionary.common.backToDashboard}
        </Link>
      </div>
    </Panel>
  );
}
