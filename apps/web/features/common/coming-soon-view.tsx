import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type ComingSoonViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  sectionTitle: string;
};

export function ComingSoonView({ locale, dictionary, sectionTitle }: ComingSoonViewProps) {
  return (
    <Panel className="mx-auto max-w-3xl p-8 md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{dictionary.placeholder.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{sectionTitle}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{dictionary.placeholder.title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-500">{dictionary.placeholder.description}</p>
      <div className="mt-6">
        <Link className="inline-flex rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700" href={`/${locale}/dashboard`}>
          {dictionary.common.backToDashboard}
        </Link>
      </div>
    </Panel>
  );
}
