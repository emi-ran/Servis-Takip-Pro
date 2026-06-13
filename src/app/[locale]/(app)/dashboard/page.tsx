"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Dashboard içeriği yakında eklenecek.</Text>
    </>
  );
}
