"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
  IconDeviceLaptop,
  IconTool,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string | null;
  address: string | null;
  nickname: string | null;
  createdAt: string;
};

type Device = {
  id: string;
  category: string;
  brand: string;
  model: string;
  serialNo: string | null;
  notes: string | null;
};

type ServiceRecord = {
  id: string;
  trackingNo: string;
  status: string;
  priority: string;
  faultDescription: string | null;
  createdAt: string;
  device: { brand: string; model: string } | null;
};

type DetailResponse = {
  customer: Customer;
  devices: Device[];
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

export default function CustomerDetailPage() {
  const t = useTranslations("customers");
  const dt = useTranslations("devices");
  const sr = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery<DetailResponse>({
    queryKey: ["customer", id],
    queryFn: () => apiClient(`/api/customers/${id}`),
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
        {(error as Error)?.message || "Bir hata oluştu"}
      </Alert>
    );
  }

  const { customer, devices, serviceRecords } = data!;

  return (
    <Stack gap="lg">
      <Group>
        <Button
          component={Link}
          href="/customers"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          px={0}
        >
          {ct("back")}
        </Button>
      </Group>

      <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
        {customer.name} {customer.surname}
      </Title>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group>
            <IconUser size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600}>{customer.name} {customer.surname}</Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Group gap="xs">
              <IconPhone size={16} stroke={1.5} opacity={0.5} />
              <Anchor component={Link} href={`tel:${customer.phone}`} size="sm">
                {customer.phone}
              </Anchor>
            </Group>
            {customer.email && (
              <Group gap="xs">
                <IconMail size={16} stroke={1.5} opacity={0.5} />
                <Anchor component={Link} href={`mailto:${customer.email}`} size="sm">
                  {customer.email}
                </Anchor>
              </Group>
            )}
            {customer.nickname && (
              <Group gap="xs" style={{ gridColumn: "span 2" }}>
                <IconUser size={16} stroke={1.5} opacity={0.5} />
                <Text size="sm" c="dimmed" fs="italic">"{customer.nickname}"</Text>
              </Group>
            )}
            {customer.address && (
              <Group gap="xs" style={{ gridColumn: "span 2" }}>
                <IconMapPin size={16} stroke={1.5} opacity={0.5} />
                <Text size="sm">{customer.address}</Text>
              </Group>
            )}
          </SimpleGrid>
        </Stack>
      </Card>

      <Card withBorder radius="md" p={0}>
        <Stack gap={0}>
          <Group px="lg" pt="md" pb="xs">
            <IconDeviceLaptop size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600} size="sm">{t("devices")}</Text>
            {devices.length > 0 && (
              <Badge size="sm" variant="light" color="blue">{devices.length}</Badge>
            )}
          </Group>
          {devices.length === 0 ? (
            <Text px="lg" pb="md" size="sm" c="dimmed">{dt("noDevices")}</Text>
          ) : (
            <Table.ScrollContainer minWidth={500}>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{dt("title")}</Table.Th>
                    <Table.Th>{dt("brand")}</Table.Th>
                    <Table.Th>{dt("model")}</Table.Th>
                    <Table.Th>{dt("serialNo")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {devices.map((device) => (
                    <Table.Tr key={device.id}>
                      <Table.Td>
                        <Anchor component={Link} href={`/devices/${device.id}`} size="sm">
                          {device.brand} {device.model}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="gray">{device.category}</Badge>
                      </Table.Td>
                      <Table.Td><Text size="sm">{device.model}</Text></Table.Td>
                      <Table.Td><Text size="sm">{device.serialNo || "—"}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
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
            <Text px="lg" pb="md" size="sm" c="dimmed">{sr("noRecords")}</Text>
          ) : (
            <Table.ScrollContainer minWidth={600}>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{sr("trackingNo")}</Table.Th>
                    <Table.Th>{sr("device")}</Table.Th>
                    <Table.Th>{sr("status")}</Table.Th>
                    <Table.Th>{sr("priority")}</Table.Th>
                    <Table.Th>{sr("faultDescription")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {serviceRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Anchor component={Link} href={`/service-records/${record.id}`} size="sm" fw={600}>
                          {record.trackingNo}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {record.device ? `${record.device.brand} ${record.device.model}` : "—"}
                        </Text>
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
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
