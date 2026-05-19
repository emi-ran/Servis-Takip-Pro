"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;
type ShellContext = Awaited<ReturnType<typeof import("@/lib/api/shell").getShellContext>>;

type AppShellProps = {
  locale: Locale;
  dictionary: Dictionary;
  shellContext: ShellContext;
  children: ReactNode;
};

export function AppShell({ locale, dictionary, shellContext, children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar
        locale={locale}
        dictionary={dictionary}
        shellContext={shellContext}
        pathname={pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-col md:pl-[280px]">
        <AppHeader dictionary={dictionary} shellContext={shellContext} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
