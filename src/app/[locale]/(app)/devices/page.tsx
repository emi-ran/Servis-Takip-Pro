"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function DevicesPage() {
  const t = useTranslations("devices");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Cihaz listesi yakında eklenecek.</Text>
    </>
  );
}
