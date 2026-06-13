"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function ServiceRecordDetailPage() {
  const t = useTranslations("serviceRecords");

  return (
    <>
      <Title order={2} mb="md">
        {t("edit")}
      </Title>
      <Text c="dimmed">Servis kaydı detayı yakında eklenecek.</Text>
    </>
  );
}
