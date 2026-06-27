"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Modal,
  NumberInput,
  Skeleton,
  Alert,
  Space,
  ActionIcon,
  Anchor,
  UnstyledButton,
} from "@mantine/core";
import { Pagination } from "@/components/ui/pagination";
import { Link } from "@/lib/navigation";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconPlus,
  IconCurrencyDollar,
  IconSearch,
  IconTrash,
  IconEdit,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";

type CustomerResponse = { id: string; name: string; surname: string };
type ServiceRecordResponse = { id: string; trackingNo: number };
type DeviceResponse = { id: string; brand: string; model: string };

type CustomerOption = {
  id: string;
  name: string;
  surname: string;
  nickname: string | null;
  phone: string;
};

type Payment = {
  id: string;
  type: "BORC" | "TAHSILAT";
  amount: number;
  paymentMethod: string;
  date: string;
  description: string | null;
  customer: CustomerResponse;
  serviceRecord: ServiceRecordResponse | null;
  device: DeviceResponse | null;
  createdAt: string;
};

type ListResponse = {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
};

const typeColors: Record<string, string> = {
  BORC: "red",
  TAHSILAT: "green",
};

const methodLabels: Record<string, string> = {
  NAKIT: "method_label.NAKIT",
  KART: "method_label.KART",
  EFT: "method_label.EFT",
  DIGER: "method_label.DIGER",
};

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const ct = useTranslations("common");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [opened, { open, close }] = useDisclosure(false);
  const [modalType, setModalType] = useState<"BORC" | "TAHSILAT">("BORC");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = { page: String(page), pageSize: "20" };
  if (query) params.query = query;
  if (typeFilter) params.type = typeFilter;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  params.sortBy = sortBy;
  params.sortDir = sortDir;

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

  const { data, isLoading, isError, error } = useQuery<ListResponse>({
    queryKey: ["payments", params],
    queryFn: () => apiClient("/api/payments", { params }),
  });

  const { data: customersData } = useQuery<{ customers: CustomerOption[] }>({
    queryKey: ["customers-mini"],
    queryFn: () => apiClient("/api/customers", { params: { pageSize: "1000" } }),
  });

  const { data: customerServiceRecords } = useQuery<{
    serviceRecords: { id: string; trackingNo: number; faultDescription: string; status: string; deviceId: string }[];
  }>({
    queryKey: ["service-records-customer", selectedCustomerId],
    queryFn: () =>
      apiClient("/api/service-records", {
        params: { customerId: selectedCustomerId, pageSize: "100" },
      }),
    enabled: !!selectedCustomerId,
  });

  const { data: customerDevices } = useQuery<{
    devices: { id: string; brand: string; model: string; category: string }[];
  }>({
    queryKey: ["devices-customer", selectedCustomerId],
    queryFn: () =>
      apiClient("/api/devices", {
        params: { customerId: selectedCustomerId, pageSize: "100" },
      }),
    enabled: !!selectedCustomerId,
  });

  const customerOptions = (customersData?.customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} ${c.surname}${c.nickname ? ` (${c.nickname})` : ""} — ${formatPhone(c.phone)}`,
  }));

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      customerId: "",
      amount: 0,
      paymentMethod: "NAKIT",
      date: new Date().toISOString().split("T")[0],
      description: "",
      serviceRecordId: "",
      deviceId: "",
    },
    validate: {
      customerId: (v: string) => (v ? null : t("customerRequired")),
      amount: (v: number) => (v > 0 ? null : t("amountRequired")),
    },
  });

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (editingPayment) {
        return apiClient(`/api/payments/${editingPayment.id}`, {
          method: "PUT",
          body: {
            ...values,
            type: editingPayment.type,
          },
        });
      }
      return apiClient("/api/payments", { method: "POST", body: { ...values, type: modalType } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      notifications.show({
        title: ct("success"),
        message: editingPayment ? t("updated") : t("created"),
        color: "green",
      });
      form.reset();
      setEditingPayment(null);
      close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/payments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      setDeleteId(null);
      closeDelete();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  function openModal(type: "BORC" | "TAHSILAT") {
    setEditingPayment(null);
    setModalType(type);
    setSelectedCustomerId("");
    form.reset();
    open();
  }

  function openEditModal(payment: Payment) {
    setEditingPayment(payment);
    setModalType(payment.type);
    setSelectedCustomerId(payment.customer.id);
    form.setValues({
      customerId: payment.customer.id,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      date: payment.date.slice(0, 10),
      description: payment.description || "",
      serviceRecordId: payment.serviceRecord?.id || "",
      deviceId: payment.device?.id || "",
    });
    open();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={2}>
          <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
            {t("title")}
          </Title>
          <Text size="sm" c="dimmed">{t("pageDescription")}</Text>
        </Stack>
        <Group w={{ base: "100%", sm: "auto" }} grow preventGrowOverflow={false}>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            color="red"
            onClick={() => openModal("BORC")}
          >
            {t("newDebt")}
          </Button>
          <Button
            leftSection={<IconCurrencyDollar size={16} />}
            variant="light"
            color="green"
            onClick={() => openModal("TAHSILAT")}
          >
            {t("newCollection")}
          </Button>
        </Group>
      </Group>

      <Group wrap="wrap" align="flex-start">
        <TextInput
          placeholder={t("searchByCustomer")}
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); setPage(1); }}
          w={{ base: "100%", sm: "auto" }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          placeholder={t("filterByType")}
          data={[
            { value: "", label: t("allTypes") },
            { value: "BORC", label: t("type_label.BORC") },
            { value: "TAHSILAT", label: t("type_label.TAHSILAT") },
          ]}
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); setPage(1); }}
          clearable
          w={{ base: "100%", sm: 180 }}
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
        <Stack gap="md">
          <Skeleton height={48} radius="md" />
          <Skeleton height={48} radius="md" />
          <Skeleton height={48} radius="md" />
        </Stack>
      ) : isError ? (
        <Alert icon={<IconAlertCircle size={16} />} title={ct("error")} color="red" radius="md">
          {(error as Error)?.message || ct("error")}
        </Alert>
      ) : !data || data.payments.length === 0 ? (
        <Card withBorder radius="md" p="xl">
          <Stack align="center" gap="xs">
            <IconCurrencyDollar size={40} stroke={1} opacity={0.3} />
            <Text size="sm" c="dimmed">{t("noPayments")}</Text>
          </Stack>
        </Card>
      ) : (
        <>
          <Stack gap="sm" hiddenFrom="sm">
            {data.payments.map((payment) => (
              <Card key={payment.id} withBorder radius="md" p="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={4} style={{ minWidth: 0 }}>
                      <Badge
                        size="sm"
                        variant="light"
                        color={typeColors[payment.type] || "gray"}
                        w="fit-content"
                      >
                        {t(`type_label.${payment.type}`)}
                      </Badge>
                      <Anchor component={Link} href={`/customers/${payment.customer.id}`} size="sm" fw={700}>
                        {payment.customer.name} {payment.customer.surname}
                      </Anchor>
                    </Stack>
                    <Text fw={800} size="sm" ta="right">
                      {payment.amount.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </Text>
                  </Group>

                  <Stack gap={4}>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed">{t("device")}</Text>
                      <Text size="xs" fw={500} ta="right" lineClamp={1}>
                        {payment.device ? `${payment.device.brand} ${payment.device.model}` : "—"}
                      </Text>
                    </Group>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed">{t("paymentMethod")}</Text>
                      <Badge size="xs" variant="outline" color="gray">
                        {payment.type === "TAHSILAT" ? t(methodLabels[payment.paymentMethod] || "method_label.DIGER") : "—"}
                      </Badge>
                    </Group>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed">{t("date")}</Text>
                      <Text size="xs" fw={500}>
                        {new Date(payment.date).toLocaleDateString("tr-TR")}
                      </Text>
                    </Group>
                    {payment.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {payment.description}
                      </Text>
                    )}
                  </Stack>

                  <Group justify="flex-end" gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      onClick={() => openEditModal(payment)}
                      aria-label={ct("edit")}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="lg"
                      onClick={() => { setDeleteId(payment.id); openDelete(); }}
                      aria-label={ct("delete")}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Card withBorder radius="md" p={0} visibleFrom="sm">
            <Table.ScrollContainer minWidth={700}>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{sortableHeader(t("type"), "type")}</Table.Th>
                    <Table.Th>{sortableHeader(t("customer"), "customer")}</Table.Th>
                    <Table.Th>{t("device")}</Table.Th>
                    <Table.Th>{sortableHeader(t("amount"), "amount")}</Table.Th>
                    <Table.Th>{sortableHeader(t("paymentMethod"), "paymentMethod")}</Table.Th>
                    <Table.Th>{sortableHeader(t("date"), "date")}</Table.Th>
                    <Table.Th>{t("description")}</Table.Th>
                    <Table.Th>{ct("actions")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.payments.map((payment) => (
                    <Table.Tr key={payment.id}>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={typeColors[payment.type] || "gray"}
                        >
                          {t(`type_label.${payment.type}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Anchor component={Link} href={`/customers/${payment.customer.id}`} size="sm" fw={600}>
                          {payment.customer.name} {payment.customer.surname}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {payment.device ? `${payment.device.brand} ${payment.device.model}` : "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {payment.amount.toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="outline" color="gray">
                          {payment.type === "TAHSILAT" ? t(methodLabels[payment.paymentMethod] || "method_label.DIGER") : "—"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(payment.date).toLocaleDateString("tr-TR")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={1} maw={200}>
                          {payment.description || "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={() => openEditModal(payment)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => { setDeleteId(payment.id); openDelete(); }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
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

      <Modal
        opened={opened}
        onClose={() => { form.reset(); setEditingPayment(null); setSelectedCustomerId(""); close(); }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {editingPayment
                ? (modalType === "BORC" ? t("editDebt") : t("editCollection"))
                : (modalType === "BORC" ? t("newDebt") : t("newCollection"))}
            </Text>
            <Text size="xs" c="dimmed">
              {editingPayment
                ? t("editDescription")
                : (modalType === "BORC" ? t("addDebtDescription") : t("addCollectionDescription"))}
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
          onSubmit={form.onSubmit((values) => {
            const payload: Record<string, unknown> = { ...values };
            if (modalType === "BORC") {
              delete payload.paymentMethod;
            }
            saveMutation.mutate(payload);
          })}
        >
          <Stack gap="md">
            <Select
              label={t("customer")}
              placeholder={t("customer")}
              data={customerOptions}
              key={form.key("customerId")}
              {...form.getInputProps("customerId")}
              onChange={(value) => {
                form.getInputProps("customerId").onChange(value);
                setSelectedCustomerId(value || "");
              }}
              searchable
              limit={5}
              nothingFoundMessage={ct("noResults")}
              required
            />
            <NumberInput
              label={t("amount")}
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              prefix="₺ "
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              key={form.key("amount")}
              {...form.getInputProps("amount")}
              required
            />
            <Group grow>
              {modalType === "TAHSILAT" && (
                <Select
                  label={t("paymentMethod")}
                  data={[
                    { value: "NAKIT", label: t("method_label.NAKIT") },
                    { value: "KART", label: t("method_label.KART") },
                    { value: "EFT", label: t("method_label.EFT") },
                    { value: "DIGER", label: t("method_label.DIGER") },
                  ]}
                  key={form.key("paymentMethod")}
                  {...form.getInputProps("paymentMethod")}
                />
              )}
              <DatePickerInput
                label={t("date")}
                valueFormat="DD.MM.YYYY"
                key={form.key("date")}
                {...form.getInputProps("date")}
                required
              />
            </Group>
            <TextInput
              label={t("description")}
              placeholder={
                modalType === "BORC" ? t("debtPlaceholder") : t("collectionPlaceholder")
              }
              key={form.key("description")}
              {...form.getInputProps("description")}
            />
            {selectedCustomerId && (
              <Group grow>
                <Select
                  label={t("deviceOptional")}
                  placeholder={t("deviceOptional")}
                  data={
                    customerDevices?.devices.map((d) => ({
                      value: d.id,
                      label: `${d.brand} ${d.model} (${d.category})`,
                    })) || []
                  }
                  key={form.key("deviceId")}
                  {...form.getInputProps("deviceId")}
                  clearable
                  searchable
                  nothingFoundMessage={ct("noResults")}
                />
                <Select
                  label={t("serviceRecordOptional")}
                  placeholder={t("serviceRecordOptional")}
                  data={
                    customerServiceRecords?.serviceRecords.map((sr) => ({
                      value: sr.id,
                      label: `#${sr.trackingNo} — ${sr.faultDescription.length > 60 ? sr.faultDescription.slice(0, 60) + "..." : sr.faultDescription}`,
                    })) || []
                  }
                  key={form.key("serviceRecordId")}
                  {...form.getInputProps("serviceRecordId")}
                  clearable
                  searchable
                  nothingFoundMessage={ct("noResults")}
                />
              </Group>
            )}
            <Space />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => { form.reset(); setEditingPayment(null); close(); }}>
                {ct("cancel")}
              </Button>
              <Button
                type="submit"
                loading={saveMutation.isPending}
                px="xl"
                color={modalType === "BORC" ? "red" : "green"}
              >
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={() => { setDeleteId(null); closeDelete(); }}
        title={<Text fw={700} size="md">{t("deleteConfirm")}</Text>}
        radius="md"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => { setDeleteId(null); closeDelete(); }}>
            {ct("cancel")}
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            px="xl"
          >
            {ct("delete")}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
