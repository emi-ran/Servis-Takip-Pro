"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { Pagination } from "@/components/ui/pagination";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
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
  Textarea,
  SimpleGrid,
  Autocomplete,
  UnstyledButton,
} from "@mantine/core";
import { Link, useRouter } from "@/lib/navigation";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconClipboardList,
  IconEdit,
  IconDeviceFloppy,
  IconUserPlus,
  IconDeviceLaptop,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { normalizePhone, isValidPhone, formatPhone, formatPhoneInput } from "@/lib/phone";

type ServiceRecord = {
  id: string;
  trackingNo: number;
  status: string;
  priority: string;
  serviceMode: ServiceMode;
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

type Customer = { id: string; name: string; surname: string; nickname: string | null; phone: string };
type Device = { id: string; brand: string; model: string; category: string; serialNo: string };
type Technician = { id: string; name: string; surname: string; role: "ADMIN" | "TECHNICIAN" };
type ServiceMode = "SERVISTE" | "YERINDE" | "CIHAZ_ALINACAK" | "CIHAZ_BIRAKILACAK" | "BAKIM" | "KURULUM";
type CustomerCreateResponse = { customer: Customer };
type DeviceCreateResponse = { device: Device };

export default function ServiceRecordsPage() {
  const t = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [createOpened, createHandlers] = useDisclosure(false);
  const [quickCustomerOpened, quickCustomerHandlers] = useDisclosure(false);
  const [quickDeviceOpened, quickDeviceHandlers] = useDisclosure(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedServiceMode, setSelectedServiceMode] = useState<ServiceMode>("SERVISTE");
  const [quickCustomerPhoneValue, setQuickCustomerPhoneValue] = useState("");

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      customerId: "",
      deviceId: "",
      assignedUserId: "",
      serviceMode: "SERVISTE" as ServiceMode,
      scheduledAt: "",
      faultDescription: "",
      priority: "NORMAL",
    },
    validate: {
      customerId: (v: string) => (v.length < 1 ? t("customerRequired") : null),
      deviceId: (v: string) => (v.length < 1 ? t("deviceRequired") : null),
      faultDescription: (v: string) => (v.length < 1 ? t("faultRequired") : null),
      scheduledAt: (v: string, values) =>
        values.serviceMode !== "SERVISTE" && v.length < 1 ? t("scheduledAtRequired") : null,
    },
  });

  const phoneValidate = (v: string) => {
    if (v.length < 1) return t("quickCustomerPhoneRequired");
    if (!isValidPhone(normalizePhone(v))) return t("quickCustomerPhoneInvalid");
    return null;
  };

  const quickCustomerForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { name: "", surname: "", phone: "", email: "", address: "", nickname: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? t("quickCustomerNameRequired") : null),
      surname: (v: string) => (v.length < 1 ? t("quickCustomerSurnameRequired") : null),
      phone: phoneValidate,
      email: (v: string) => {
        const trimmed = v.trim();
        return trimmed && !z.string().email().safeParse(trimmed).success
          ? t("quickCustomerEmailInvalid")
          : null;
      },
    },
  });

  const quickDeviceForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { customerId: "", category: "", brand: "", model: "", serialNo: "", notes: "" },
    validate: {
      category: (v: string) => (v.length < 1 ? t("quickDeviceCategoryRequired") : null),
      brand: (v: string) => (v.length < 1 ? t("quickDeviceBrandRequired") : null),
      model: (v: string) => (v.length < 1 ? t("quickDeviceModelRequired") : null),
    },
  });

  const { data: customersData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers-for-service"],
    queryFn: () => apiClient("/api/customers", { params: { pageSize: "1000" } }),
  });

  const { data: devicesData } = useQuery<{ devices: Device[] }>({
    queryKey: ["devices-for-service", selectedCustomerId],
    queryFn: () =>
      apiClient("/api/devices", {
        params: selectedCustomerId
          ? { pageSize: "1000", customerId: selectedCustomerId }
          : { pageSize: "1000" },
      }),
    enabled: selectedCustomerId.length > 0,
  });

  const { data: optionsData } = useQuery<{ brands: string[]; categories: string[] }>({
    queryKey: ["device-options"],
    queryFn: () => apiClient("/api/devices/options"),
    staleTime: 30000,
  });

  const { data: techniciansData } = useQuery<{ technicians: Technician[] }>({
    queryKey: ["technicians"],
    queryFn: () => apiClient("/api/technicians"),
  });

  const customerOptions = (customersData?.customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} ${c.surname}${c.nickname ? ` (${c.nickname})` : ""} — ${formatPhone(c.phone)}`,
  }));

  const deviceOptions = (devicesData?.devices ?? []).map((d) => ({
    value: d.id,
    label: `${d.brand} ${d.model} — ${d.category}${d.serialNo ? ` (${d.serialNo})` : ""}`,
  }));

  const technicianOptions = (techniciansData?.technicians ?? []).map((u) => ({
    value: u.id,
    label: `${u.name} ${u.surname} - ${t(`role_label.${u.role}`)}`,
  }));

  const serviceModeOptions = [
    { value: "SERVISTE", label: t("serviceMode_label.SERVISTE") },
    { value: "YERINDE", label: t("serviceMode_label.YERINDE") },
    { value: "CIHAZ_ALINACAK", label: t("serviceMode_label.CIHAZ_ALINACAK") },
    { value: "CIHAZ_BIRAKILACAK", label: t("serviceMode_label.CIHAZ_BIRAKILACAK") },
    { value: "BAKIM", label: t("serviceMode_label.BAKIM") },
    { value: "KURULUM", label: t("serviceMode_label.KURULUM") },
  ];

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      apiClient<{ serviceRecord: { id: string } }>("/api/service-records", {
        method: "POST",
        body: {
          ...values,
          scheduledAt:
            values.serviceMode === "SERVISTE" ? "" : new Date(values.scheduledAt).toISOString(),
        },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-records"] });
      notifications.show({ title: ct("success"), message: t("created"), color: "green" });
      form.reset();
      setSelectedCustomerId("");
      setSelectedServiceMode("SERVISTE");
      createHandlers.close();
      router.push(`/service-records/${data.serviceRecord.id}`);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const quickCustomerMutation = useMutation({
    mutationFn: (values: typeof quickCustomerForm.values) =>
      apiClient<CustomerCreateResponse>("/api/customers", {
        method: "POST",
        body: { ...values, phone: normalizePhone(values.phone) },
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["customers-for-service"] });
      form.setFieldValue("customerId", data.customer.id);
      form.setFieldValue("deviceId", "");
      quickDeviceForm.setFieldValue("customerId", data.customer.id);
      setSelectedCustomerId(data.customer.id);
      setQuickCustomerPhoneValue("");
      quickCustomerForm.reset();
      quickCustomerHandlers.close();
      notifications.show({ title: ct("success"), message: t("quickCustomerCreated"), color: "green" });
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const quickDeviceMutation = useMutation({
    mutationFn: (values: typeof quickDeviceForm.values) =>
      apiClient<DeviceCreateResponse>("/api/devices", {
        method: "POST",
        body: { ...values, customerId: selectedCustomerId },
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["devices-for-service", selectedCustomerId] });
      await queryClient.invalidateQueries({ queryKey: ["device-options"] });
      form.setFieldValue("deviceId", data.device.id);
      quickDeviceForm.reset();
      quickDeviceForm.setFieldValue("customerId", selectedCustomerId);
      quickDeviceHandlers.close();
      notifications.show({ title: ct("success"), message: t("quickDeviceCreated"), color: "green" });
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceModeFilter, setServiceModeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params: Record<string, string> = { page: String(page), pageSize: "20" };
  if (debouncedSearch) params.query = debouncedSearch;
  if (statusFilter) params.status = statusFilter;
  if (serviceModeFilter) params.serviceMode = serviceModeFilter;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  params.sortBy = sortBy;
  params.sortDir = sortDir;

  const { data, isLoading, isError, error } = useQuery<ServiceRecordsResponse>({
    queryKey: ["service-records", page, debouncedSearch, statusFilter, serviceModeFilter, dateFrom, dateTo, sortBy, sortDir],
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

  function toggleSort(nextSortBy: string) {
    if (sortBy === nextSortBy) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortableHeader(label: string, value: string) {
    const active = sortBy === value;
    return (
      <UnstyledButton onClick={() => toggleSort(value)}>
        <Group gap={4} wrap="nowrap">
          <Text size="sm" fw={600}>{label}</Text>
          {active ? (
            sortDir === "asc" ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
          ) : (
            <IconArrowsSort size={14} opacity={0.45} />
          )}
        </Group>
      </UnstyledButton>
    );
  }

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
        <Badge size="sm" variant="light" color="indigo">
          {t(`serviceMode_label.${record.serviceMode || "SERVISTE"}`)}
        </Badge>
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
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {t("title")}
            </Title>
            <Text c="dimmed" size="sm">
              {t("pageDescription")}
            </Text>
          </Stack>
          <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open} w={{ base: "100%", sm: "auto" }}>
            {t("new")}
          </Button>
        </Group>

        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder={t("searchByTracking")}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={searchValue}
            autoComplete="nope"
            onChange={(e) => {
              setSearchValue(e.currentTarget.value);
              setPage(1);
            }}
            w={{ base: "100%", sm: "auto" }}
            style={{ flex: 1, minWidth: 240 }}
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
            w={{ base: "100%", sm: 220 }}
          />
          <Select
            placeholder={t("filterByServiceMode")}
            data={serviceModeOptions}
            value={serviceModeFilter}
            onChange={(v) => {
              setServiceModeFilter(v || "");
              setPage(1);
            }}
            clearable
            autoComplete="nope"
            w={{ base: "100%", sm: 220 }}
          />
          <DatePickerInput
            placeholder={t("dateFrom")}
            value={dateFrom}
            onChange={(value) => { setDateFrom(value); setPage(1); }}
            clearable
            w={{ base: "100%", sm: 170 }}
          />
          <DatePickerInput
            placeholder={t("dateTo")}
            value={dateTo}
            onChange={(value) => { setDateTo(value); setPage(1); }}
            clearable
            w={{ base: "100%", sm: 170 }}
          />
        </Group>

        {isLoading ? (
          <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{sortableHeader(t("trackingNo"), "trackingNo")}</Table.Th>
                    <Table.Th>{sortableHeader(t("customer"), "customer")}</Table.Th>
                    <Table.Th>{t("device")}</Table.Th>
                    <Table.Th>{sortableHeader(t("serviceMode"), "serviceMode")}</Table.Th>
                    <Table.Th>{sortableHeader(t("status"), "status")}</Table.Th>
                    <Table.Th>{sortableHeader(t("priority"), "priority")}</Table.Th>
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
                onClick={createHandlers.open}
                mt="xs"
              >
                {t("new")}
              </Button>
            </Stack>
          </Card>
        ) : (
          <>
            <Stack gap="sm" hiddenFrom="sm">
              {data?.serviceRecords.map((record) => (
                <Card key={record.id} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={4} style={{ minWidth: 0 }}>
                        <Text
                          component={Link}
                          href={`/service-records/${record.id}`}
                          prefetch={false}
                          c="blue"
                          fw={800}
                          size="sm"
                          style={{ textDecoration: "none", cursor: "pointer" }}
                        >
                          #{record.trackingNo}
                        </Text>
                        <Text
                          component={Link}
                          href={`/customers/${record.customer.id}`}
                          prefetch={false}
                          size="sm"
                          c="blue"
                          fw={600}
                          lineClamp={1}
                          style={{ textDecoration: "none", cursor: "pointer" }}
                        >
                          {record.customer.name} {record.customer.surname}
                        </Text>
                      </Stack>
                      <Badge size="xs" variant="light" color={statusColors[record.status] || "gray"}>
                        {t(`status_change.${record.status}`)}
                      </Badge>
                    </Group>

                    <Stack gap={4}>
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">{t("device")}</Text>
                        <Text size="xs" fw={500} ta="right" lineClamp={1}>
                          {record.device.brand} {record.device.model}
                        </Text>
                      </Group>
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">{t("serviceMode")}</Text>
                        <Badge size="xs" variant="light" color="indigo">
                          {t(`serviceMode_label.${record.serviceMode || "SERVISTE"}`)}
                        </Badge>
                      </Group>
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">{t("priority")}</Text>
                        <Badge size="xs" variant="outline" color={priorityColors[record.priority] || "gray"}>
                          {t(`priority_label.${record.priority}`)}
                        </Badge>
                      </Group>
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">{t("assignedUser")}</Text>
                        <Text size="xs" fw={500} ta="right" lineClamp={1}>
                          {record.assignedUser
                            ? `${record.assignedUser.name} ${record.assignedUser.surname}`
                            : "—"}
                        </Text>
                      </Group>
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">{t("date")}</Text>
                        <Text size="xs" fw={500}>{new Date(record.createdAt).toLocaleDateString("tr-TR")}</Text>
                      </Group>
                    </Stack>

                    <Group justify="flex-end" gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        component={Link}
                        href={`/service-records/${record.id}`}
                        prefetch={false}
                        size="lg"
                        aria-label={ct("edit")}
                      >
                        <IconEdit size={16} stroke={1.5} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="lg"
                        onClick={() => {
                          setDeletingId(record.id);
                          deleteHandlers.open();
                        }}
                        aria-label={ct("delete")}
                      >
                        <IconTrash size={16} stroke={1.5} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }} visibleFrom="sm">
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{sortableHeader(t("trackingNo"), "trackingNo")}</Table.Th>
                      <Table.Th>{sortableHeader(t("customer"), "customer")}</Table.Th>
                      <Table.Th>{t("device")}</Table.Th>
                      <Table.Th>{sortableHeader(t("serviceMode"), "serviceMode")}</Table.Th>
                      <Table.Th>{sortableHeader(t("status"), "status")}</Table.Th>
                      <Table.Th>{sortableHeader(t("priority"), "priority")}</Table.Th>
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
        opened={createOpened}
        onClose={() => {
          form.reset();
          setSelectedCustomerId("");
          setSelectedServiceMode("SERVISTE");
          createHandlers.close();
        }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {t("new")}
            </Text>
            <Text size="xs" c="dimmed">
              {t("createDescription")}
            </Text>
          </Stack>
        }
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        transitionProps={{ transition: "fade", duration: 150 }}
      >
        <form
          autoComplete="nope"
          onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
          style={{ paddingTop: "8px" }}
        >
          <Stack gap="md">
            <Select
              label={t("customer")}
              placeholder={t("customerPlaceholder")}
              required
              searchable
              data={customerOptions}
              limit={5}
              autoComplete="nope"
              key={form.key("customerId")}
              {...form.getInputProps("customerId")}
              onChange={(value) => {
                form.setFieldValue("customerId", value || "");
                form.setFieldValue("deviceId", "");
                quickDeviceForm.setFieldValue("customerId", value || "");
                setSelectedCustomerId(value || "");
              }}
            />

            <Group justify="flex-end" mt={-8}>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconUserPlus size={14} />}
                onClick={quickCustomerHandlers.open}
              >
                {t("quickAddCustomer")}
              </Button>
            </Group>

            <Select
              label={t("device")}
              placeholder={selectedCustomerId ? t("devicePlaceholder") : t("selectCustomerFirst")}
              required
              searchable
              data={deviceOptions}
              limit={10}
              disabled={!selectedCustomerId}
              autoComplete="nope"
              key={form.key("deviceId")}
              {...form.getInputProps("deviceId")}
            />

            <Group justify="flex-end" mt={-8}>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconDeviceLaptop size={14} />}
                disabled={!selectedCustomerId}
                onClick={() => {
                  quickDeviceForm.setFieldValue("customerId", selectedCustomerId);
                  quickDeviceHandlers.open();
                }}
              >
                {t("quickAddDevice")}
              </Button>
            </Group>

            <Textarea
              label={t("faultDescription")}
              placeholder={t("faultPlaceholder")}
              required
              minRows={4}
              maxRows={8}
              autosize
              autoComplete="nope"
              key={form.key("faultDescription")}
              {...form.getInputProps("faultDescription")}
            />

            <Select
              label={t("serviceMode")}
              placeholder={t("serviceModePlaceholder")}
              data={serviceModeOptions}
              autoComplete="nope"
              required
              key={form.key("serviceMode")}
              {...form.getInputProps("serviceMode")}
              onChange={(value) => {
                const mode = (value || "SERVISTE") as ServiceMode;
                form.setFieldValue("serviceMode", mode);
                setSelectedServiceMode(mode);
                if (mode === "SERVISTE") {
                  form.setFieldValue("scheduledAt", "");
                }
              }}
            />

            {selectedServiceMode !== "SERVISTE" && (
              <TextInput
                label={t("scheduledAt")}
                placeholder={t("scheduledAtPlaceholder")}
                type="datetime-local"
                autoComplete="nope"
                required
                key={form.key("scheduledAt")}
                {...form.getInputProps("scheduledAt")}
              />
            )}

            <Select
              label={t("assignedUser")}
              placeholder={t("assignedUserPlaceholder")}
              clearable
              searchable
              data={technicianOptions}
              limit={5}
              autoComplete="nope"
              key={form.key("assignedUserId")}
              {...form.getInputProps("assignedUserId")}
            />

            <Select
              label={t("priority")}
              data={[
                { value: "DUSUK", label: t("priority_label.DUSUK") },
                { value: "NORMAL", label: t("priority_label.NORMAL") },
                { value: "YUKSEK", label: t("priority_label.YUKSEK") },
                { value: "ACIL", label: t("priority_label.ACIL") },
              ]}
              autoComplete="nope"
              key={form.key("priority")}
              {...form.getInputProps("priority")}
            />

            <Group justify="flex-end" mt="lg">
              <Button
                variant="default"
                onClick={() => {
                  form.reset();
                  setSelectedCustomerId("");
                  setSelectedServiceMode("SERVISTE");
                  createHandlers.close();
                }}
              >
                {ct("cancel")}
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending}
                leftSection={<IconDeviceFloppy size={16} />}
                px="xl"
              >
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={quickCustomerOpened}
        onClose={() => {
          quickCustomerForm.reset();
          setQuickCustomerPhoneValue("");
          quickCustomerHandlers.close();
        }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {t("quickCustomerTitle")}
            </Text>
            <Text size="xs" c="dimmed">
              {t("quickCustomerDescription")}
            </Text>
          </Stack>
        }
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        transitionProps={{ transition: "fade", duration: 150 }}
      >
        <form
          autoComplete="nope"
          onSubmit={quickCustomerForm.onSubmit((values) => quickCustomerMutation.mutate(values))}
          style={{ paddingTop: "8px" }}
        >
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label={t("quickCustomerName")}
                placeholder={t("quickCustomerNamePlaceholder")}
                required
                autoComplete="nope"
                key={quickCustomerForm.key("name")}
                {...quickCustomerForm.getInputProps("name")}
              />
              <TextInput
                label={t("quickCustomerSurname")}
                placeholder={t("quickCustomerSurnamePlaceholder")}
                required
                autoComplete="nope"
                key={quickCustomerForm.key("surname")}
                {...quickCustomerForm.getInputProps("surname")}
              />
              <TextInput
                label={t("quickCustomerPhone")}
                placeholder={t("quickCustomerPhonePlaceholder")}
                required
                autoComplete="nope"
                value={quickCustomerPhoneValue}
                error={quickCustomerForm.errors.phone}
                onChange={(e) => {
                  const formatted = formatPhoneInput(e.currentTarget.value);
                  setQuickCustomerPhoneValue(formatted);
                  quickCustomerForm.setFieldValue("phone", formatted);
                }}
                onFocus={(e) => {
                  if (!e.currentTarget.value) {
                    setQuickCustomerPhoneValue("0");
                    quickCustomerForm.setFieldValue("phone", "0");
                  }
                }}
                onBlur={(e) => {
                  const formatted = formatPhoneInput(e.currentTarget.value);
                  setQuickCustomerPhoneValue(formatted);
                  quickCustomerForm.setFieldValue("phone", formatted);
                }}
              />
              <TextInput
                label={t("quickCustomerEmail")}
                placeholder={t("quickCustomerEmailPlaceholder")}
                autoComplete="nope"
                key={quickCustomerForm.key("email")}
                {...quickCustomerForm.getInputProps("email")}
              />
              <TextInput
                label={t("quickCustomerNickname")}
                placeholder={t("quickCustomerNicknamePlaceholder")}
                autoComplete="nope"
                key={quickCustomerForm.key("nickname")}
                {...quickCustomerForm.getInputProps("nickname")}
              />
            </SimpleGrid>

            <Textarea
              label={t("quickCustomerAddress")}
              placeholder={t("quickCustomerAddressPlaceholder")}
              minRows={2}
              maxRows={4}
              autosize
              autoComplete="nope"
              key={quickCustomerForm.key("address")}
              {...quickCustomerForm.getInputProps("address")}
            />

            <Group justify="flex-end" mt="lg">
              <Button
                variant="default"
                onClick={() => {
                  quickCustomerForm.reset();
                  setQuickCustomerPhoneValue("");
                  quickCustomerHandlers.close();
                }}
              >
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={quickCustomerMutation.isPending} px="xl">
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={quickDeviceOpened}
        onClose={() => {
          quickDeviceForm.reset();
          quickDeviceHandlers.close();
        }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {t("quickDeviceTitle")}
            </Text>
            <Text size="xs" c="dimmed">
              {t("quickDeviceDescription")}
            </Text>
          </Stack>
        }
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        transitionProps={{ transition: "fade", duration: 150 }}
      >
        <form
          autoComplete="nope"
          onSubmit={quickDeviceForm.onSubmit((values) => quickDeviceMutation.mutate(values))}
          style={{ paddingTop: "8px" }}
        >
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Autocomplete
                label={t("quickDeviceBrand")}
                placeholder={t("quickDeviceBrandPlaceholder")}
                required
                data={optionsData?.brands ?? []}
                limit={5}
                autoComplete="nope"
                key={quickDeviceForm.key("brand")}
                {...quickDeviceForm.getInputProps("brand")}
              />
              <TextInput
                label={t("quickDeviceModel")}
                placeholder={t("quickDeviceModelPlaceholder")}
                required
                autoComplete="nope"
                key={quickDeviceForm.key("model")}
                {...quickDeviceForm.getInputProps("model")}
              />
              <Autocomplete
                label={t("quickDeviceCategory")}
                placeholder={t("quickDeviceCategoryPlaceholder")}
                required
                data={optionsData?.categories ?? []}
                limit={5}
                autoComplete="nope"
                key={quickDeviceForm.key("category")}
                {...quickDeviceForm.getInputProps("category")}
              />
              <TextInput
                label={t("quickDeviceSerialNo")}
                placeholder={t("quickDeviceSerialNoPlaceholder")}
                autoComplete="nope"
                key={quickDeviceForm.key("serialNo")}
                {...quickDeviceForm.getInputProps("serialNo")}
              />
            </SimpleGrid>

            <Textarea
              label={t("quickDeviceNotes")}
              placeholder={t("quickDeviceNotesPlaceholder")}
              minRows={3}
              maxRows={5}
              autoComplete="nope"
              key={quickDeviceForm.key("notes")}
              {...quickDeviceForm.getInputProps("notes")}
            />

            <Group justify="flex-end" mt="lg">
              <Button
                variant="default"
                onClick={() => {
                  quickDeviceForm.reset();
                  quickDeviceHandlers.close();
                }}
              >
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={quickDeviceMutation.isPending} px="xl">
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

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
