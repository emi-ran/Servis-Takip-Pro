"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Title,
  Text,
  Card,
  Stack,
  SimpleGrid,
  Skeleton,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from "@/lib/api";

type DashboardData = {
  dailyCollection: number;
  unpaidBalance: number;
  pendingServices: number;
  readyDevices: number;
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiClient("/api/dashboard"),
  });

  return (
    <Stack gap="lg">
      <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
        {t("title")}
      </Title>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} radius="md" />
          ))}
        </SimpleGrid>
      ) : isError ? (
        <Alert icon={<IconAlertCircle size={16} />} title={t("error")} color="red" radius="md">
          {t("error")}
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card withBorder radius="md" padding="lg">
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                {t("dailyCollection")}
              </Text>
              <Text fw={800} size="xl" c="green">
                {(data?.dailyCollection ?? 0).toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </Text>
            </Stack>
          </Card>
          <Card withBorder radius="md" padding="lg">
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                {t("unpaidBalance")}
              </Text>
              <Text fw={800} size="xl" c="red">
                {(data?.unpaidBalance ?? 0).toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </Text>
            </Stack>
          </Card>
          <Card withBorder radius="md" padding="lg">
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                {t("pendingServices")}
              </Text>
              <Text fw={800} size="xl">
                {data?.pendingServices ?? 0}
              </Text>
            </Stack>
          </Card>
          <Card withBorder radius="md" padding="lg">
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                {t("readyDevices")}
              </Text>
              <Text fw={800} size="xl">
                {data?.readyDevices ?? 0}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>
      )}
    </Stack>
  );
}
