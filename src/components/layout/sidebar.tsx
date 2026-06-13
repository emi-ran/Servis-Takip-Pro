"use client";

import {
  IconHome,
  IconUsers,
  IconDeviceLaptop,
  IconTool,
  IconCurrencyDollar,
  IconCalendar,
  IconUsersGroup,
  IconLogout,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AppShell, NavLink, Stack, Box, Divider } from "@mantine/core";
import { usePathname } from "@/lib/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import NextLink from "next/link";

type NavItem = {
  labelKey: string;
  href: string;
  icon: typeof IconHome;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: IconHome },
  { labelKey: "nav.customers", href: "/customers", icon: IconUsers },
  { labelKey: "nav.devices", href: "/devices", icon: IconDeviceLaptop },
  { labelKey: "nav.serviceRecords", href: "/service-records", icon: IconTool },
  { labelKey: "nav.payments", href: "/payments", icon: IconCurrencyDollar },
  { labelKey: "nav.scheduledTasks", href: "/scheduled-tasks", icon: IconCalendar },
  { labelKey: "nav.staff", href: "/staff", icon: IconUsersGroup, adminOnly: true },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <AppShell.Navbar p="sm" style={{ borderRight: "1px solid var(--mantine-color-default-border)" }}>
      <AppShell.Section grow>
        <Stack gap="xs">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === "ADMIN")
            .map((item) => {
            const Icon = item.icon;
            // Exact or prefix match for active state
            const isActive = item.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                component={NextLink}
                href={item.href}
                label={t(item.labelKey)}
                leftSection={<Icon size={20} stroke={1.5} />}
                active={isActive}
                variant="light"
                color="blue"
                styles={{
                  root: {
                    fontWeight: isActive ? 600 : 500,
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.15s ease",
                  },
                  label: {
                    fontSize: "14px",
                  }
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <Divider my="sm" variant="dashed" />
        <Box py="xs">
          <NavLink
            label={t("auth.logout")}
            leftSection={<IconLogout size={20} stroke={1.5} />}
            color="red"
            variant="subtle"
            onClick={logout}
            styles={{
              root: {
                fontWeight: 500,
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "var(--mantine-radius-md)",
                transition: "all 0.15s ease",
              },
              label: {
                fontSize: "14px",
              }
            }}
          />
        </Box>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}

