export type ShellRoleKey = "operations_manager";

export type ShellNavigationItem = {
  id: string;
  href: string;
  icon: "dashboard" | "serviceRecords" | "customers" | "parts" | "cash" | "staff" | "track" | "qr" | "settings" | "logout";
  labelKey:
    | "dashboard"
    | "serviceRecords"
    | "customers"
    | "parts"
    | "cash"
    | "staff"
    | "track"
    | "quickScan"
    | "settings"
    | "logout";
};

export type ShellNavigationSection = {
  id: "management" | "modules";
  items: ShellNavigationItem[];
};

export async function getShellContext() {
  return {
    companyName: "CetTech Servis",
    currentUser: {
      name: "Elif Kaya",
      roleKey: "operations_manager" as ShellRoleKey,
      initials: "EK",
    },
    navigationSections: [
      {
        id: "management" as const,
        items: [
          { id: "dashboard", href: "/dashboard", icon: "dashboard", labelKey: "dashboard" as const },
          { id: "service-records", href: "/service-records", icon: "serviceRecords", labelKey: "serviceRecords" as const },
          { id: "customers", href: "/customers", icon: "customers", labelKey: "customers" as const },
          { id: "parts", href: "/parts", icon: "parts", labelKey: "parts" as const },
          { id: "cash", href: "/cash", icon: "cash", labelKey: "cash" as const },
          { id: "staff", href: "/staff", icon: "staff", labelKey: "staff" as const },
        ],
      },
      {
        id: "modules" as const,
        items: [
          { id: "track", href: "/track/preview", icon: "track", labelKey: "track" as const },
          { id: "quick-scan", href: "/quick-scan", icon: "qr", labelKey: "quickScan" as const },
        ],
      },
    ] satisfies ShellNavigationSection[],
  };
}
