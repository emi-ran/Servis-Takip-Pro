"use client";

import {
  IconHome,
  IconUsers,
  IconDeviceLaptop,
  IconTool,
  IconCalendar,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  AppShell,
  UnstyledButton,
  Stack,
  Text,
  Group,
  ThemeIcon,
} from "@mantine/core";
import { usePathname } from "@/lib/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";

type NavItem = {
  labelKey: string;
  href: string;
  icon: typeof IconHome;
};

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: IconHome },
  { labelKey: "nav.customers", href: "/customers", icon: IconUsers },
  { labelKey: "nav.devices", href: "/devices", icon: IconDeviceLaptop },
  { labelKey: "nav.serviceRecords", href: "/service-records", icon: IconTool },
  { labelKey: "nav.scheduledTasks", href: "/scheduled-tasks", icon: IconCalendar },
  { labelKey: "nav.settings", href: "/settings", icon: IconSettings },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <AppShell.Navbar p="md">
      <AppShell.Section grow>
        <Stack gap={4}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                p="sm"
                style={(theme) => ({
                  borderRadius: theme.radius.sm,
                  backgroundColor: isActive
                    ? theme.colors.blue[0]
                    : "transparent",
                  color: isActive
                    ? theme.colors.blue[7]
                    : theme.colors.gray[7],
                  "&:hover": {
                    backgroundColor: isActive
                      ? theme.colors.blue[0]
                      : theme.colors.gray[0],
                  },
                })}
              >
                <Group gap="sm">
                  <ThemeIcon
                    variant={isActive ? "filled" : "light"}
                    color={isActive ? "blue" : "gray"}
                    size="sm"
                  >
                    <Icon size={16} />
                  </ThemeIcon>
                  <Text size="sm">{t(item.labelKey)}</Text>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <UnstyledButton
          onClick={logout}
          p="sm"
          style={(theme) => ({
            borderRadius: theme.radius.sm,
            color: theme.colors.red[6],
            "&:hover": { backgroundColor: theme.colors.red[0] },
          })}
        >
          <Group gap="sm">
            <ThemeIcon variant="light" color="red" size="sm">
              <IconLogout size={16} />
            </ThemeIcon>
            <Text size="sm">{t("auth.logout")}</Text>
          </Group>
        </UnstyledButton>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
