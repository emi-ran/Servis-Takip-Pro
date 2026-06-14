"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { Pagination } from "@/components/ui/pagination";
import { notifications } from "@mantine/notifications";
import {
  Title,
  TextInput,
  Button,
  Table,
  Modal,
  Group,
  Stack,
  Text,
  ActionIcon,
  Skeleton,
  Alert,
  Card,
  Badge,
  Tooltip,
  Select,
} from "@mantine/core";
import { Link } from "@/lib/navigation";
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconClipboardList,
  IconEdit,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";

type ServiceRecord = {
  id: string;
  trackingNo: number;
  status: string;
  priority: string;
  faultDescription: string;
  createdAt: string;
  customer: { id: string; name: string; surname: string; phone: string };
  device: { id: string; brand: string; model: string; category: string; serialNo: string };
  assignedUser: { id: string; name: string; surname: string } | null;
};

type ServiceRecordsResponse = {
  serviceRecords: ServiceRecord[];
  total: number;
  page: number;
  pageSize: number;
};

const statusColors: Record<string, string> = {
  KAYIT_ACILDI: "blue",
  TAMIRATTA: "yellow",
  FIYAT_TEKLIFI_VERILDI: "violet",
  MUSTERI_REDDETTI: "red",
  HAZIR: "teal",
  ODEME_BEKLIYOR: "orange",
  TESLIM_EDILDI: "green",
  IPTAL_EDILDI: "gray",
};

const priorityColors: Record<string, string> = {
  DUSUK: "gray",
  NORMAL: "blue",
  YUKSEK: "orange",
  ACIL: "red",
};

export default function ServiceRecordsPage() {
  const t = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params: Record<string, string> = { page: String(page), pageSize: "20" };
  if (debouncedSearch) params.query = debouncedSearch;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading, isError, error } = useQuery<ServiceRecordsResponse>({
    queryKey: ["service-records", page, debouncedSearch, statusFilter],
    queryFn: () => apiClient("/api/service-records", { params }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/api/service-records/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      deleteHandlers.close();
      setDeletingId(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const statusOptions = [
    { value: "", label: t("allStatuses") },
    ...Object.entries(t.raw("status_change") as Record<string, string>).map(
      ([value, label]) => ({ value, label })
    ),
  ];

  const rows = (data?.serviceRecords ?? []).map((record) => (
    <Table.Tr key={record.id}>
      <Table.Td>
        <Text
          component={Link}
          href={`/service-records/${record.id}`}
          prefetch={false}
          c="blue"
          fw={700}
          size="sm"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          #{record.trackingNo}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          component={Link}
          href={`/customers/${record.customer.id}`}
          prefetch={false}
          size="sm"
          c="blue"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          {record.customer.name} {record.customer.surname}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {record.device.brand} {record.device.model}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color={statusColors[record.status] || "gray"}>
          {t(`status_change.${record.status}`)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="outline" color={priorityColors[record.priority] || "gray"}>
          {t(`priority_label.${record.priority}`)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {record.assignedUser
            ? `${record.assignedUser.name} ${record.assignedUser.surname}`
            : "—"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(record.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={ct("edit")} position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              component={Link}
              href={`/service-records/${record.id}`}
              prefetch={false}
            >
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={ct("delete")} position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                setDeletingId(record.id);
                deleteHandlers.open();
              }}
            >
              <IconTrash size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {t("title")}
            </Title>
            <Text c="dimmed" size="sm">
              {t("pageDescription")}
            </Text>
          </Stack>
          <Button leftSection={<IconPlus size={16} />} component={Link} href="/service-records/new" prefetch={false}>
            {t("new")}
          </Button>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <TextInput
            placeholder={t("searchByTracking")}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={searchValue}
            autoComplete="nope"
            onChange={(e) => {
              setSearchValue(e.currentTarget.value);
              setPage(1);
            }}
            style={{ flex: 1 }}
          />
          <Select
            placeholder={t("filterByStatus")}
            data={statusOptions}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v || "");
              setPage(1);
            }}
            clearable
            autoComplete="nope"
            maw={220}
          />
        </Group>

        {isLoading ? (
          <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("trackingNo")}</Table.Th>
                    <Table.Th>{t("customer")}</Table.Th>
                    <Table.Th>{t("device")}</Table.Th>
                    <Table.Th>{t("status")}</Table.Th>
                    <Table.Th>{t("priority")}</Table.Th>
                    <Table.Th>{t("assignedUser")}</Table.Th>
                    <Table.Th>{ct("actions")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                      <Table.Td><Skeleton height={20} radius="xs" /></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        ) : isError ? (
          <Alert icon={<IconAlertCircle size={16} />} title={ct("error")} color="red" radius="md">
            {(error as Error)?.message || ct("error")}
          </Alert>
        ) : data?.serviceRecords.length === 0 ? (
          <Card withBorder shadow="sm" p="xl" ta="center" radius="md">
            <Stack align="center" gap="xs">
              <IconClipboardList size={48} stroke={1} opacity={0.3} />
              <Text fw={600}>{t("noRecords")}</Text>
              <Text size="sm" c="dimmed">
                {t("createFirst")}
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                component={Link}
                href="/service-records/new"
                prefetch={false}
                mt="xs"
              >
                {t("new")}
              </Button>
            </Stack>
          </Card>
        ) : (
          <>
            <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t("trackingNo")}</Table.Th>
                      <Table.Th>{t("customer")}</Table.Th>
                      <Table.Th>{t("device")}</Table.Th>
                      <Table.Th>{t("status")}</Table.Th>
                      <Table.Th>{t("priority")}</Table.Th>
                      <Table.Th>{t("assignedUser")}</Table.Th>
                      <Table.Th>{ct("actions")}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                  radius="md"
                />
              </Group>
            )}
          </>
        )}
      </Stack>

      <Modal
        opened={deleteOpened}
        onClose={() => { setDeletingId(null); deleteHandlers.close(); }}
        title={<Text fw={700} size="md">{t("deleteConfirm")}</Text>}
        radius="md"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => { setDeletingId(null); deleteHandlers.close(); }}>
            {ct("cancel")}
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            px="xl"
          >
            {ct("delete")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
