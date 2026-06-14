"use client";

import {
  AppShell,
  Group,
  Text,
  Burger,
  Avatar,
  Menu,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/auth-provider";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/ui/logo-mark";

type HeaderProps = {
  onToggle: () => void;
  opened: boolean;
};

export function Header({ onToggle, opened }: HeaderProps) {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const brandName = user?.company.name || t("common.appName");

  return (
    <AppShell.Header style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="md">
          <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
          <Group gap="xs" wrap="nowrap">
            <LogoMark size={24} />
            <Text
              fw={800}
              size="lg"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              style={{ letterSpacing: "-0.5px" }}
            >
              {brandName}
            </Text>
          </Group>
        </Group>

        <Group gap="md">
          <ThemeToggle />

          <Menu shadow="md" width={220} radius="md" transitionProps={{ transition: "pop-top-right", duration: 150 }}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: "pointer", userSelect: "none" }}>
                <Avatar size="sm" color="blue" radius="xl" src={null} alt={`${user?.name} ${user?.surname}`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={600} visibleFrom="sm">
                  {user?.name} {user?.surname}
                </Text>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t("auth.profile")}</Menu.Label>
              <Menu.Item disabled leftSection={<IconUser size={16} />}>
                <Text size="xs" truncate style={{ maxWidth: 180 }}>
                  {user?.email}
                </Text>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={logout}>
                {t("auth.logout")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}

