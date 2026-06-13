"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function DeviceDetailPage() {
  const t = useTranslations("devices");

  return (
    <>
      <Title order={2} mb="md">
        {t("edit")}
      </Title>
      <Text c="dimmed">Cihaz detayı yakında eklenecek.</Text>
    </>
  );
}
