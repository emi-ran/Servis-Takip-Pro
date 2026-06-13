import { Bell, Menu } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { useAuth } from "@/components/layout/auth-provider";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;
type ShellContext = Awaited<ReturnType<typeof import("@/lib/api/shell").getShellContext>>;

type AppHeaderProps = {
  dictionary: Dictionary;
  shellContext: ShellContext;
  onOpenSidebar: () => void;
};

export function AppHeader({ dictionary, shellContext, onOpenSidebar }: AppHeaderProps) {
  const { user, company } = useAuth();

  const name = user?.name || shellContext.currentUser.name;
  const roleKey = (user?.roleKey || shellContext.currentUser.roleKey) as string;
  const companyName = company?.name || shellContext.companyName;

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "EK";

  const roleLabel = dictionary.roles[roleKey as keyof typeof dictionary.roles] || roleKey;
  const welcomeMessage = dictionary.header.welcome.replace("{companyName}", companyName);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton icon={<Menu className="h-5 w-5" />} label={dictionary.header.openNavigation} className="md:hidden" onClick={onOpenSidebar} />
        <div className="min-w-0">
          <p className="hidden truncate text-sm font-medium text-slate-500 sm:block">{welcomeMessage}</p>
          <p className="truncate text-lg font-bold text-slate-800 sm:hidden">{dictionary.brand.compactName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <IconButton icon={<Bell className="h-5 w-5" />} label={dictionary.header.notifications} className="hidden sm:inline-flex" />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-600 shadow-sm md:h-10 md:w-10">
          {initials}
        </div>
      </div>
    </header>
  );
}
