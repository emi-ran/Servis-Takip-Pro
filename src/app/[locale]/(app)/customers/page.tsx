"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function CustomersPage() {
  const t = useTranslations("customers");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Müşteri listesi yakında eklenecek.</Text>
    </>
  );
}
