"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function CustomerDetailPage() {
  const t = useTranslations("customers");

  return (
    <>
      <Title order={2} mb="md">
        {t("edit")}
      </Title>
      <Text c="dimmed">Müşteri detayı yakında eklenecek.</Text>
    </>
  );
}
