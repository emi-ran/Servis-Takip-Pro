"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Ayarlar yakında eklenecek.</Text>
    </>
  );
}
