"use client";

import { AppShell, Group, Text, Burger, Avatar, Menu } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/auth-provider";

type HeaderProps = {
  onToggle: () => void;
  opened: boolean;
};

export function Header({ onToggle, opened }: HeaderProps) {
  const t = useTranslations();
  const { user, logout } = useAuth();

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
          <Text fw={700} size="lg">
            {t("common.appName")}
          </Text>
        </Group>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Group gap="xs" style={{ cursor: "pointer" }}>
              <Text size="sm" visibleFrom="sm">
                {user?.name} {user?.surname}
              </Text>
              <Avatar size="sm" color="blue" radius="xl">
                {user?.name?.charAt(0)}
              </Avatar>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item disabled>
              {user?.email}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" onClick={logout}>
              {t("auth.logout")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </AppShell.Header>
  );
}
