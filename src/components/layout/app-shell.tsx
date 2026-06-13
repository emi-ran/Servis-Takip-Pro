"use client";

import { AppShell as MantineShell, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AuthProvider } from "@/components/providers/auth-provider";

type ShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: ShellProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AuthProvider>
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
        <Sidebar />
        <MantineShell.Main>
          <Container size="xl" py="md">
            {children}
          </Container>
        </MantineShell.Main>
      </MantineShell>
    </AuthProvider>
  );
}
