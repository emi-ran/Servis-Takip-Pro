"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function NewServiceRecordPage() {
  const t = useTranslations("serviceRecords");

  return (
    <>
      <Title order={2} mb="md">
        {t("new")}
      </Title>
      <Text c="dimmed">Yeni servis kaydı formu yakında eklenecek.</Text>
    </>
  );
}
