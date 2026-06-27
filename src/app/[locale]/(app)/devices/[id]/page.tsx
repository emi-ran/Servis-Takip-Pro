"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Badge,
  Table,
  Skeleton,
  Alert,
  SimpleGrid,
  Anchor,
  Button,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceLaptop,
  IconUser,
  IconTool,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";

type Customer = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string | null;
  address: string | null;
};

type Device = {
  id: string;
  customerId: string;
  category: string;
  brand: string;
  model: string;
  serialNo: string;
  notes: string | null;
  createdAt: string;
};

type ServiceRecord = {
  id: string;
  trackingNo: number;
  status: string;
  priority: string;
  faultDescription: string | null;
  createdAt: string;
};

type DetailResponse = {
  device: Device;
  customer: Customer;
  serviceRecords: ServiceRecord[];
};

const statusColors: Record<string, string> = {
  KAYIT_ACILDI: "blue",
  TAMIRATTA: "yellow",
  FIYAT_TEKLIFI_VERILDI: "violet",
  MUSTERI_REDDETTI: "red",
  HAZIR: "green",
  ODEME_BEKIYOR: "orange",
  TESLIM_EDILDI: "teal",
  IPTAL_EDILDI: "gray",
};

const priorityColors: Record<string, string> = {
  DUSUK: "gray",
  NORMAL: "blue",
  YUKSEK: "orange",
  ACIL: "red",
};

export default function DeviceDetailPage() {
  const t = useTranslations("devices");
  const sr = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery<DetailResponse>({
    queryKey: ["device", id],
    queryFn: () => apiClient(`/api/devices/${id}`),
  });

  if (isLoading) {
    return (
      <Stack gap="lg">
        <Skeleton height={36} width={300} radius="md" />
        <Skeleton height={160} radius="md" />
        <Skeleton height={200} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={ct("error")} color="red" radius="md">
        {(error as Error)?.message || ct("error")}
      </Alert>
    );
  }

  const { device, customer, serviceRecords } = data!;

  return (
    <Stack gap="lg">
      <Group>
        <Button
          component={Link}
          href="/devices"
          prefetch={false}
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          px={0}
        >
          {ct("back")}
        </Button>
      </Group>

      <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
        {device.brand} {device.model}
      </Title>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group>
            <IconDeviceLaptop size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600}>{device.brand} {device.model}</Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Group gap="xs">
              <Text size="sm" c="dimmed">{t("category")}:</Text>
              <Badge size="sm" variant="light" color="gray">{device.category}</Badge>
            </Group>
            <Group gap="xs">
              <Text size="sm" c="dimmed">{t("serialNo")}:</Text>
              <Text size="sm">{device.serialNo || "—"}</Text>
            </Group>
            {device.notes && (
              <Text size="sm" style={{ gridColumn: "span 2" }}>
                <Text span c="dimmed" size="sm">{t("notes")}: </Text>
                {device.notes}
              </Text>
            )}
          </SimpleGrid>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group>
            <IconUser size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600} size="sm">{t("customerInfo")}</Text>
          </Group>
          <Anchor
            component={Link}
            href={`/customers/${customer.id}`}
            prefetch={false}
            c="blue"
            fw={600}
          >
            {customer.name} {customer.surname}
          </Anchor>
          <Text size="sm" c="dimmed">{formatPhone(customer.phone)}</Text>
          {customer.email && <Text size="sm" c="dimmed">{customer.email}</Text>}
          {customer.address && <Text size="sm" c="dimmed">{customer.address}</Text>}
        </Stack>
      </Card>

      <Card withBorder radius="md" p={0}>
        <Stack gap={0}>
          <Group px="lg" pt="md" pb="xs">
            <IconTool size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600} size="sm">{t("serviceHistory")}</Text>
            {serviceRecords.length > 0 && (
              <Badge size="sm" variant="light" color="teal">{serviceRecords.length}</Badge>
            )}
          </Group>
          {serviceRecords.length === 0 ? (
            <Text px="lg" pb="md" size="sm" c="dimmed">{t("noRecords")}</Text>
          ) : (
            <>
            <Stack gap="xs" px="md" pb="md" hiddenFrom="sm">
              {serviceRecords.map((record) => (
                <Card key={record.id} withBorder radius="md" p="sm">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Anchor
                        component={Link}
                        href={`/service-records/${record.id}`}
                        prefetch={false}
                        size="sm"
                        fw={700}
                      >
                        {record.trackingNo}
                      </Anchor>
                      <Badge size="sm" variant="light" color={statusColors[record.status] || "gray"}>
                        {sr(`status_change.${record.status}`)}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Badge size="sm" variant="outline" color={priorityColors[record.priority] || "gray"}>
                        {sr(`priority_label.${record.priority}`)}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {new Date(record.createdAt).toLocaleDateString("tr-TR")}
                      </Text>
                    </Group>
                    <Text size="sm" lineClamp={3}>
                      {record.faultDescription || "—"}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Table.ScrollContainer minWidth={600} visibleFrom="sm">
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{sr("trackingNo")}</Table.Th>
                    <Table.Th>{sr("status")}</Table.Th>
                    <Table.Th>{sr("priority")}</Table.Th>
                    <Table.Th>{sr("faultDescription")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {serviceRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Anchor
                          component={Link}
                          href={`/service-records/${record.id}`}
                          prefetch={false}
                          size="sm"
                          fw={600}
                        >
                          {record.trackingNo}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={statusColors[record.status] || "gray"}>
                          {sr(`status_change.${record.status}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="outline" color={priorityColors[record.priority] || "gray"}>
                          {sr(`priority_label.${record.priority}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2} maw={250}>
                          {record.faultDescription || "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
