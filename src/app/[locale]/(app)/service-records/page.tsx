"use client";

import { useTranslations } from "next-intl";
import { Title, Text } from "@mantine/core";

export default function ServiceRecordsPage() {
  const t = useTranslations("serviceRecords");

  return (
    <>
      <Title order={2} mb="md">
        {t("title")}
      </Title>
      <Text c="dimmed">Servis kayıtları yakında eklenecek.</Text>
    </>
  );
}
