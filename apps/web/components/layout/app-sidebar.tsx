import Link from "next/link";
import { Globe, LayoutDashboard, LogOut, Package, QrCode, Settings, UserCog, Users, Wallet, Wrench, X } from "lucide-react";

import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;
type ShellContext = Awaited<ReturnType<typeof import("@/lib/api/shell").getShellContext>>;

type AppSidebarProps = {
  locale: Locale;
  dictionary: Dictionary;
  shellContext: ShellContext;
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
};

const icons = {
  dashboard: LayoutDashboard,
  serviceRecords: Wrench,
  customers: Users,
  parts: Package,
  cash: Wallet,
  staff: UserCog,
  track: Globe,
  qr: QrCode,
  settings: Settings,
  logout: LogOut,
};

export function AppSidebar({ locale, dictionary, shellContext, pathname, isOpen, onClose }: AppSidebarProps) {
  const resolveHref = (href: string) => (href.startsWith("/track/") ? href : `/${locale}${href}`);

  return (
    <>
      {isOpen ? <div className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm md:hidden" onClick={onClose} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-slate-800">
              {dictionary.brand.name} <span className="text-blue-600">{dictionary.brand.pro}</span>
            </p>
          </div>

          <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:hidden" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {shellContext.navigationSections.map((section) => (
            <div className="space-y-1" key={section.id}>
              <div className="pb-2 pt-4 first:pt-0">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {dictionary.navigation.sections[section.id]}
                </p>
              </div>

              {section.items.map((item) => {
                const href = resolveHref(item.href);
                const Icon = icons[item.icon];
                const isActive = pathname === href;

                return (
                  <Link
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                      isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                    }`}
                    href={href}
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{dictionary.navigation.items[item.labelKey]}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <Link
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
              pathname === `/${locale}/settings` ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
            }`}
            href={`/${locale}/settings`}
            onClick={onClose}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">{dictionary.navigation.items.settings}</span>
          </Link>
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-colors duration-200 hover:bg-red-50" type="button">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{dictionary.navigation.items.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
