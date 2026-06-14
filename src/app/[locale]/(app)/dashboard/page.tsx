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
  Table,
  Badge,
  Anchor,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { Link } from "@/lib/navigation";


type RecentRecord = {
  id: string;
  trackingNo: number;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; surname: string };
  device: { brand: string; model: string };
};

type DashboardData = {
  dailyCollection: number;
  unpaidBalance: number;
  pendingServices: number;
  readyDevices: number;
  todayTasks: number;
  recentRecords: RecentRecord[];
};

const statusColor: Record<string, string> = {
  KAYIT_ACILDI: "blue",
  TAMIRATTA: "yellow",
  FIYAT_TEKLIFI_VERILDI: "orange",
  MUSTERI_REDDETTI: "red",
  HAZIR: "green",
  ODEME_BEKLIYOR: "violet",
  TESLIM_EDILDI: "teal",
  IPTAL_EDILDI: "gray",
};

export default function DashboardPage() {
  const t = useTranslations();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiClient("/api/dashboard"),
  });

  return (
    <Stack gap="lg">
      <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
        {t("dashboard.title")}
      </Title>

      {isLoading ? (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={300} radius="md" />
        </>
      ) : isError ? (
        <Alert icon={<IconAlertCircle size={16} />} title={t("common.errorTitle")} color="red" radius="md">
          {t("common.error")}
        </Alert>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  {t("dashboard.dailyCollection")}
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
                  {t("dashboard.unpaidBalance")}
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
                  {t("dashboard.pendingServices")}
                </Text>
                <Text fw={800} size="xl">
                  {data?.pendingServices ?? 0}
                </Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  {t("dashboard.readyDevices")}
                </Text>
                <Text fw={800} size="xl">
                  {data?.readyDevices ?? 0}
                </Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  {t("dashboard.todayTasks")}
                </Text>
                <Text fw={800} size="xl">
                  {data?.todayTasks ?? 0}
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" padding="lg">
            <Stack gap="md">
              <Title order={4}>{t("dashboard.recentRecords")}</Title>
              {(data?.recentRecords?.length ?? 0) === 0 ? (
                <Text c="dimmed" size="sm">{t("serviceRecords.noRecords")}</Text>
              ) : (
                <Table.ScrollContainer minWidth={500}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t("serviceRecords.trackingNo")}</Table.Th>
                        <Table.Th>{t("serviceRecords.customer")}</Table.Th>
                        <Table.Th>{t("devices.brandModel")}</Table.Th>
                        <Table.Th>{t("serviceRecords.status")}</Table.Th>
                        <Table.Th>{t("serviceRecords.date")}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data?.recentRecords?.map((record) => (
                        <Table.Tr key={record.id}>
                          <Table.Td>
                            <Anchor component={Link} href={`/service-records/${record.id}`} size="sm" prefetch={false}>
                              #{record.trackingNo}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>
                            <Anchor component={Link} href={`/customers/${record.customer.id}`} size="sm" prefetch={false}>
                              {record.customer.name} {record.customer.surname}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{record.device.brand} {record.device.model}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={statusColor[record.status] ?? "gray"} size="sm">
                              {t(`serviceRecords.status_change.${record.status}`)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {new Date(record.createdAt).toLocaleDateString("tr-TR")}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
