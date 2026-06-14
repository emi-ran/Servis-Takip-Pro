"use client";

import { useEffect } from "react";
import { AppShell as MantineShell, Center, Container, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { LogoMark } from "@/components/ui/logo-mark";

type ShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: ShellProps) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}

function AppShellContent({ children }: ShellProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const { loading } = useAuth();
  const tc = useTranslations("common");
  const td = useTranslations("dashboard");
  const tCustomers = useTranslations("customers");
  const tDevices = useTranslations("devices");
  const tPayments = useTranslations("payments");
  const tScheduled = useTranslations("scheduledTasks");
  const tService = useTranslations("serviceRecords");
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: td("title"),
      customers: tCustomers("title"),
      devices: tDevices("title"),
      payments: tPayments("title"),
      "scheduled-tasks": tScheduled("title"),
      "service-records": tService("title"),
      staff: tNav("staff"),
    };

    const section = pathname.split("/").filter(Boolean).pop() || "dashboard";
    const title = titles[section] || tc("appName");
    document.title = `${title} - ${tc("appName")}`;
  }, [pathname, tc, td, tCustomers, tDevices, tPayments, tScheduled, tService, tNav]);

  if (loading) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="md">
          <LogoMark size={48} />
          <Loader size="sm" />
          <Text size="sm" c="dimmed" fw={600}>
            {tc("loading")}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <MantineShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <Header onToggle={toggle} opened={opened} />
      <Sidebar onClose={close} />
      <MantineShell.Main>
        <Container size="xl" py="md">
          {children}
        </Container>
      </MantineShell.Main>
    </MantineShell>
  );
}
