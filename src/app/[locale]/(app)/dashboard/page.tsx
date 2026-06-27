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
  Badge,
  Anchor,
  Group,
  Button,
} from "@mantine/core";
import { IconAlertCircle, IconArrowRight, IconCalendar, IconCash, IconTool } from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { Link } from "@/lib/navigation";
import { formatPhone } from "@/lib/phone";

interface DashboardRecord {
  id: string;
  trackingNo: number;
  status: string;
  priority: string;
  faultDescription: string;
  createdAt: string;
  customer: { id: string; name: string; surname: string; phone: string };
  device: { brand: string; model: string };
}

interface TodayTask {
  id: string;
  title: string;
  taskType: string;
  status: string;
  date: string;
  customer: { id: string; name: string; surname: string; phone: string };
  assignedUser: { id: string; name: string; surname: string } | null;
}

interface DashboardData {
  dailyCollection: number;
  unpaidBalance: number;
  pendingServices: number;
  readyDevices: number;
  todayTasks: number;
  todayTaskList: TodayTask[];
  urgentRecords: DashboardRecord[];
  readyRecords: DashboardRecord[];
  paymentWaitingRecords: DashboardRecord[];
  recentRecords: DashboardRecord[];
}

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

const priorityColor: Record<string, string> = {
  DUSUK: "gray",
  NORMAL: "blue",
  YUKSEK: "orange",
  ACIL: "red",
};

export default function DashboardPage() {
  const t = useTranslations();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiClient("/api/dashboard"),
  });

  const unpaidBalance = data?.unpaidBalance ?? 0;
  const unpaidBalanceDirection = unpaidBalance > 0 ? "receivable" : unpaidBalance < 0 ? "payable" : "settled";
  const unpaidBalanceColor = unpaidBalance > 0 ? "red" : unpaidBalance < 0 ? "orange" : "green";

  function renderServiceList(records: DashboardRecord[], emptyKey: string) {
    if (records.length === 0) {
      return <Text size="sm" c="dimmed">{t(emptyKey)}</Text>;
    }

    return (
      <Stack gap="xs">
        {records.map((record) => (
          <Card key={record.id} withBorder radius="md" p="sm">
            <Stack gap={6}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Anchor component={Link} href={`/service-records/${record.id}`} size="sm" fw={800} prefetch={false} lineClamp={1}>
                    #{record.trackingNo} · {record.device.brand} {record.device.model}
                  </Anchor>
                  <Anchor component={Link} href={`/customers/${record.customer.id}`} size="xs" prefetch={false} lineClamp={1}>
                    {record.customer.name} {record.customer.surname} · {formatPhone(record.customer.phone)}
                  </Anchor>
                </Stack>
                <Badge size="xs" variant="light" color={statusColor[record.status] ?? "gray"}>
                  {t(`serviceRecords.status_change.${record.status}`)}
                </Badge>
              </Group>
              <Group gap="xs">
                <Badge size="xs" variant="outline" color={priorityColor[record.priority] ?? "gray"}>
                  {t(`serviceRecords.priority_label.${record.priority}`)}
                </Badge>
                <Text size="xs" c="dimmed" lineClamp={1}>{record.faultDescription}</Text>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Title order={2} fw={800}>{t("dashboard.title")}</Title>
          <Text c="dimmed" size="sm">{t("dashboard.subtitle")}</Text>
        </Stack>
        <Button component={Link} href="/service-records" rightSection={<IconArrowRight size={16} />}>
          {t("dashboard.allJobs")}
        </Button>
      </Group>

      {isLoading ? (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={104} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={360} radius="md" />
        </>
      ) : isError ? (
        <Alert icon={<IconAlertCircle size={16} />} title={t("common.errorTitle")} color="red" radius="md">
          {t("common.error")}
        </Alert>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Group gap="xs"><IconCalendar size={18} /><Text size="xs" tt="uppercase" c="dimmed" fw={700}>{t("dashboard.todayTasks")}</Text></Group>
                <Text fw={900} size="xl">{data?.todayTasks ?? 0}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Group gap="xs"><IconTool size={18} /><Text size="xs" tt="uppercase" c="dimmed" fw={700}>{t("dashboard.pendingServices")}</Text></Group>
                <Text fw={900} size="xl">{data?.pendingServices ?? 0}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Group gap="xs"><IconCash size={18} /><Text size="xs" tt="uppercase" c="dimmed" fw={700}>{t("dashboard.unpaidBalance")}</Text></Group>
                <Text fw={900} size="xl" c={unpaidBalanceColor}>
                  {Math.abs(unpaidBalance).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </Text>
                <Text size="xs" c="dimmed">{t(`payments.${unpaidBalanceDirection}`)}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack gap={4}>
                <Group gap="xs"><IconCash size={18} /><Text size="xs" tt="uppercase" c="dimmed" fw={700}>{t("dashboard.dailyCollection")}</Text></Group>
                <Text fw={900} size="xl" c="green">
                  {(data?.dailyCollection ?? 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group justify="space-between"><Title order={4}>{t("dashboard.todayAgenda")}</Title><Badge variant="light">{data?.todayTaskList.length ?? 0}</Badge></Group>
                {(data?.todayTaskList.length ?? 0) === 0 ? (
                  <Text size="sm" c="dimmed">{t("dashboard.noTodayTasks")}</Text>
                ) : (
                  <Stack gap="xs">
                    {data?.todayTaskList.map((task) => (
                      <Card key={task.id} withBorder radius="md" p="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text fw={800} size="sm" lineClamp={1}>{new Date(task.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · {task.title}</Text>
                            <Anchor component={Link} href={`/customers/${task.customer.id}`} size="xs" prefetch={false} lineClamp={1}>
                              {task.customer.name} {task.customer.surname} · {formatPhone(task.customer.phone)}
                            </Anchor>
                          </Stack>
                          <Badge size="xs" variant="light">{t(`scheduledTasks.status_label.${task.status}`)}</Badge>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group justify="space-between"><Title order={4}>{t("dashboard.urgentJobs")}</Title><Badge color="red" variant="light">{data?.urgentRecords.length ?? 0}</Badge></Group>
                {renderServiceList(data?.urgentRecords ?? [], "dashboard.noUrgentJobs")}
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group justify="space-between"><Title order={4}>{t("dashboard.readyJobs")}</Title><Badge color="green" variant="light">{data?.readyRecords.length ?? 0}</Badge></Group>
                {renderServiceList(data?.readyRecords ?? [], "dashboard.noReadyJobs")}
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group justify="space-between"><Title order={4}>{t("dashboard.paymentWaitingJobs")}</Title><Badge color="violet" variant="light">{data?.paymentWaitingRecords.length ?? 0}</Badge></Group>
                {renderServiceList(data?.paymentWaitingRecords ?? [], "dashboard.noPaymentWaitingJobs")}
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" padding="lg">
            <Stack gap="md">
              <Group justify="space-between"><Title order={4}>{t("dashboard.activeJobs")}</Title><Button component={Link} href="/service-records" variant="subtle" size="xs">{t("dashboard.allJobs")}</Button></Group>
              {renderServiceList(data?.recentRecords ?? [], "dashboard.noActiveJobs")}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
