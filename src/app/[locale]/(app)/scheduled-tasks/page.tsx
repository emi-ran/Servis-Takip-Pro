"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function ScheduledTasksPage() {
  const t = useTranslations("scheduledTasks");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Planlanan işler yakında eklenecek.</Text>
    </>
  );
}
