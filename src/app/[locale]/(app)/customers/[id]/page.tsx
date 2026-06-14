"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Modal,
  NumberInput,
  Select,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
  IconDeviceLaptop,
  IconTool,
  IconCurrencyDollar,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconEdit,
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
  trackingNo: number;
  status: string;
  priority: string;
  faultDescription: string | null;
  createdAt: string;
  device: { brand: string; model: string } | null;
};

type Payment = {
  id: string;
  type: "BORC" | "TAHSILAT";
  amount: number;
  paymentMethod: string;
  date: string;
  description: string | null;
  serviceRecordId?: string | null;
  deviceId?: string | null;
};

type ScheduledTask = {
  id: string;
  title: string;
  description: string | null;
  taskType: string;
  date: string;
  status: string;
  assignedUser: { id: string; name: string; surname: string } | null;
};

type DetailResponse = {
  customer: Customer;
  devices: Device[];
  serviceRecords: ServiceRecord[];
  balance: number;
  totalDebt: number;
  totalCollection: number;
  payments: Payment[];
  scheduledTasks: ScheduledTask[];
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

const taskStatusColors: Record<string, string> = {
  PLANLANDI: "blue",
  DEVAM_EDIYOR: "yellow",
  TAMAMLANDI: "green",
  IPTAL: "gray",
};

const taskTypeColors: Record<string, string> = {
  CIHAZ_ALINACAK: "blue",
  CIHAZ_BIRAKILACAK: "teal",
  BAKIM: "orange",
  KURULUM: "violet",
  DIGER: "gray",
};

export default function CustomerDetailPage() {
  const t = useTranslations("customers");
  const dt = useTranslations("devices");
  const sr = useTranslations("serviceRecords");
  const pt = useTranslations("payments");
  const st = useTranslations("scheduledTasks");
  const ct = useTranslations("common");
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [paymentOpened, { open: openPayment, close: closePayment }] = useDisclosure(false);
  const [paymentType, setPaymentType] = useState<"BORC" | "TAHSILAT">("BORC");

  const [paymentEditOpened, paymentEditHandlers] = useDisclosure(false);
  const [paymentDeleteOpened, paymentDeleteHandlers] = useDisclosure(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data, isLoading, isError, error } = useQuery<DetailResponse>({
    queryKey: ["customer", id],
    queryFn: () => apiClient(`/api/customers/${id}`),
  });

  const { data: customerServiceRecords } = useQuery<{
    serviceRecords: { id: string; trackingNo: number; faultDescription: string }[];
  }>({
    queryKey: ["customer-service-records", id],
    queryFn: () =>
      apiClient("/api/service-records", {
        params: { customerId: id, pageSize: "100" },
      }),
    enabled: paymentOpened || paymentEditOpened,
  });

  const paymentForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      amount: 0,
      paymentMethod: "NAKIT",
      date: new Date().toISOString().split("T")[0],
      description: "",
      serviceRecordId: "",
    },
    validate: {
      amount: (v: number) => (v > 0 ? null : pt("amountRequired")),
    },
  });

  const paymentEditForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      amount: 0,
      paymentMethod: "NAKIT",
      date: new Date() as Date | string,
      description: "",
      serviceRecordId: "",
    },
    validate: {
      amount: (v: number) => (v > 0 ? null : pt("amountRequired")),
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiClient("/api/payments", { method: "POST", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      notifications.show({ title: ct("success"), message: pt("created"), color: "green" });
      paymentForm.reset();
      closePayment();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const paymentUpdateMutation = useMutation({
    mutationFn: ({ paymentId, values }: { paymentId: string; values: Record<string, unknown> }) =>
      apiClient(`/api/payments/${paymentId}`, {
        method: "PUT",
        body: {
          ...values,
          customerId: id,
          type: selectedPayment!.type,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      notifications.show({ title: ct("success"), message: pt("updated"), color: "green" });
      paymentEditForm.reset();
      paymentEditHandlers.close();
      setSelectedPayment(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const paymentDeleteMutation = useMutation({
    mutationFn: (paymentId: string) =>
      apiClient(`/api/payments/${paymentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      notifications.show({ title: ct("success"), message: pt("deleted"), color: "green" });
      paymentDeleteHandlers.close();
      setSelectedPayment(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  function openPaymentModal(type: "BORC" | "TAHSILAT") {
    setPaymentType(type);
    paymentForm.reset();
    openPayment();
  }

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

  const { customer, devices, serviceRecords, balance, totalDebt, totalCollection, payments, scheduledTasks } = data!;

  return (
    <Stack gap="lg">
      <Group>
        <Button
          component={Link}
          href="/customers"
          prefetch={false}
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          px={0}
        >
          {ct("back")}
        </Button>
      </Group>

      <Group justify="space-between" wrap="wrap">
        <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
          {customer.name} {customer.surname}
        </Title>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <Group>
              <IconUser size={20} stroke={1.5} opacity={0.5} />
              <Text fw={600}>{customer.name} {customer.surname}</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Group gap="xs">
                <IconPhone size={16} stroke={1.5} opacity={0.5} />
                <Anchor component="a" href={`tel:${customer.phone}`} size="sm">
                  {formatPhone(customer.phone)}
                </Anchor>
              </Group>
              {customer.email && (
                <Group gap="xs">
                  <IconMail size={16} stroke={1.5} opacity={0.5} />
                  <Anchor component="a" href={`mailto:${customer.email}`} size="sm">
                    {customer.email}
                  </Anchor>
                </Group>
              )}
              {customer.nickname && (
                <Group gap="xs" style={{ gridColumn: "span 2" }}>
                  <IconUser size={16} stroke={1.5} opacity={0.5} />
                  <Text size="sm" c="dimmed" fs="italic">&ldquo;{customer.nickname}&rdquo;</Text>
                </Group>
              )}
              {customer.address && (
                <Group gap="xs" style={{ gridColumn: "span 2" }} wrap="nowrap">
                  <IconMapPin size={16} stroke={1.5} opacity={0.5} style={{ flexShrink: 0 }} />
                  <Anchor
                    component="a"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    style={{ flex: 1, textDecoration: "none" }}
                  >
                    {customer.address}
                  </Anchor>
                </Group>
              )}
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <Group>
              <IconCurrencyDollar size={20} stroke={1.5} opacity={0.5} />
              <Text fw={600}>{pt("customerBalance")}</Text>
            </Group>
            <SimpleGrid cols={3}>
              <Stack gap={0} align="center">
                <Text size="xs" c="dimmed">{pt("debtAmount")}</Text>
                <Text fw={700} size="lg" c="red">
                  {totalDebt.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </Text>
              </Stack>
              <Stack gap={0} align="center">
                <Text size="xs" c="dimmed">{pt("collectionAmount")}</Text>
                <Text fw={700} size="lg" c="green">
                  {totalCollection.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </Text>
              </Stack>
              <Stack gap={0} align="center">
                <Text size="xs" c="dimmed">{pt("balance")}</Text>
                <Text
                  fw={800}
                  size="lg"
                  c={balance > 0 ? "red" : balance < 0 ? "green" : undefined}
                >
                  {balance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </Text>
              </Stack>
            </SimpleGrid>
            <Group justify="center" gap="sm">
              <Button
                size="sm"
                variant="light"
                color="red"
                leftSection={<IconPlus size={14} />}
                onClick={() => openPaymentModal("BORC")}
              >
                {pt("newDebt")}
              </Button>
              <Button
                size="sm"
                variant="light"
                color="green"
                leftSection={<IconCurrencyDollar size={14} />}
                onClick={() => openPaymentModal("TAHSILAT")}
              >
                {pt("newCollection")}
              </Button>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

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
                        <Anchor component={Link} href={`/devices/${device.id}`} prefetch={false} size="sm">
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
                        <Anchor component={Link} href={`/service-records/${record.id}`} prefetch={false} size="sm" fw={600}>
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

      <Card withBorder radius="md" p={0}>
        <Stack gap={0}>
          <Group px="lg" pt="md" pb="xs">
            <IconCurrencyDollar size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600} size="sm">{pt("title")}</Text>
            {payments.length > 0 && (
              <Badge size="sm" variant="light" color="yellow">{payments.length}</Badge>
            )}
          </Group>
          {payments.length === 0 ? (
            <Text px="lg" pb="md" size="sm" c="dimmed">{pt("noPayments")}</Text>
          ) : (
            <Table.ScrollContainer minWidth={600}>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{pt("type")}</Table.Th>
                    <Table.Th>{pt("amount")}</Table.Th>
                    <Table.Th>{pt("paymentMethod")}</Table.Th>
                    <Table.Th>{pt("date")}</Table.Th>
                    <Table.Th>{pt("description")}</Table.Th>
                    <Table.Th>{ct("actions")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {payments.map((payment) => (
                    <Table.Tr key={payment.id}>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={typeColors[payment.type] || "gray"}>
                          {pt(`type_label.${payment.type}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {payment.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="outline" color="gray">
                          {pt(methodLabels[payment.paymentMethod] || "method_label.DIGER")}
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
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => {
                              setSelectedPayment(payment);
                              paymentEditForm.setValues({
                                amount: Number(payment.amount),
                                paymentMethod: payment.paymentMethod,
                                date: new Date(payment.date),
                                description: payment.description || "",
                                serviceRecordId: payment.serviceRecordId || "",
                              });
                              paymentEditHandlers.open();
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setSelectedPayment(payment);
                              paymentDeleteHandlers.open();
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
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
            <IconCalendar size={20} stroke={1.5} opacity={0.5} />
            <Text fw={600} size="sm">{st("title")}</Text>
            {scheduledTasks.length > 0 && (
              <Badge size="sm" variant="light" color="blue">{scheduledTasks.length}</Badge>
            )}
          </Group>
          {scheduledTasks.length === 0 ? (
            <Text px="lg" pb="md" size="sm" c="dimmed">{st("noTasks")}</Text>
          ) : (
            <Table.ScrollContainer minWidth={700}>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{st("date")}</Table.Th>
                    <Table.Th>{st("title_field")}</Table.Th>
                    <Table.Th>{st("taskType")}</Table.Th>
                    <Table.Th>{st("status")}</Table.Th>
                    <Table.Th>{st("assignedUser")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {scheduledTasks.map((task) => (
                    <Table.Tr key={task.id}>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {new Date(task.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>{task.title}</Text>
                          {task.description && <Text size="xs" c="dimmed" lineClamp={1}>{task.description}</Text>}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={taskTypeColors[task.taskType] || "gray"}>
                          {st(`type_label.${task.taskType}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={taskStatusColors[task.status] || "gray"}>
                          {st(`status_label.${task.status}`)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {task.assignedUser ? `${task.assignedUser.name} ${task.assignedUser.surname}` : "—"}
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

      <Modal
        opened={paymentOpened}
        onClose={() => { paymentForm.reset(); closePayment(); }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {paymentType === "BORC" ? pt("newDebt") : pt("newCollection")}
            </Text>
            <Text size="xs" c="dimmed">
              {paymentType === "BORC" ? pt("addDebtDescription") : pt("addCollectionDescription")}
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
          onSubmit={paymentForm.onSubmit((values) => {
            const payload: Record<string, unknown> = {
              customerId: id,
              type: paymentType,
              ...values,
            };
            if (paymentType === "BORC") {
              delete payload.paymentMethod;
            }
            createPaymentMutation.mutate(payload);
          })}
        >
          <Stack gap="md">
            <NumberInput
              label={pt("amount")}
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              prefix="₺ "
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              key={paymentForm.key("amount")}
              {...paymentForm.getInputProps("amount")}
              required
            />
            <Group grow>
              {paymentType === "TAHSILAT" && (
                <Select
                  label={pt("paymentMethod")}
                  data={[
                    { value: "NAKIT", label: pt("method_label.NAKIT") },
                    { value: "KART", label: pt("method_label.KART") },
                    { value: "EFT", label: pt("method_label.EFT") },
                    { value: "DIGER", label: pt("method_label.DIGER") },
                  ]}
                  key={paymentForm.key("paymentMethod")}
                  {...paymentForm.getInputProps("paymentMethod")}
                />
              )}
              <DatePickerInput
                label={pt("date")}
                valueFormat="DD.MM.YYYY"
                key={paymentForm.key("date")}
                {...paymentForm.getInputProps("date")}
                required
              />
            </Group>
            <TextInput
              label={pt("description")}
              placeholder={
                paymentType === "BORC" ? pt("debtPlaceholder") : pt("collectionPlaceholder")
              }
              key={paymentForm.key("description")}
              {...paymentForm.getInputProps("description")}
            />
            <Select
              label={pt("serviceRecordOptional")}
              placeholder={pt("serviceRecordOptional")}
              data={
                customerServiceRecords?.serviceRecords.map((sr) => ({
                  value: sr.id,
                  label: `#${sr.trackingNo} — ${sr.faultDescription.length > 60 ? sr.faultDescription.slice(0, 60) + "..." : sr.faultDescription}`,
                })) || []
              }
              key={paymentForm.key("serviceRecordId")}
              {...paymentForm.getInputProps("serviceRecordId")}
              clearable
              searchable
              nothingFoundMessage={ct("noResults")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => { paymentForm.reset(); closePayment(); }}>
                {ct("cancel")}
              </Button>
              <Button
                type="submit"
                loading={createPaymentMutation.isPending}
                px="xl"
                color={paymentType === "BORC" ? "red" : "green"}
              >
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={paymentEditOpened}
        onClose={() => { paymentEditForm.reset(); setSelectedPayment(null); paymentEditHandlers.close(); }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {selectedPayment?.type === "BORC" ? pt("editDebt") : pt("editCollection")}
            </Text>
            <Text size="xs" c="dimmed">
              {pt("editDescription")}
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
          onSubmit={paymentEditForm.onSubmit((values) => {
            if (selectedPayment) {
              paymentUpdateMutation.mutate({ paymentId: selectedPayment.id, values });
            }
          })}
        >
          <Stack gap="md">
            <NumberInput
              label={pt("amount")}
              placeholder="0.00"
              decimalScale={2}
              fixedDecimalScale
              prefix="₺ "
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              key={paymentEditForm.key("amount")}
              {...paymentEditForm.getInputProps("amount")}
              required
            />
            <Group grow>
              {selectedPayment?.type === "TAHSILAT" && (
                <Select
                  label={pt("paymentMethod")}
                  data={[
                    { value: "NAKIT", label: pt("method_label.NAKIT") },
                    { value: "KART", label: pt("method_label.KART") },
                    { value: "EFT", label: pt("method_label.EFT") },
                    { value: "DIGER", label: pt("method_label.DIGER") },
                  ]}
                  key={paymentEditForm.key("paymentMethod")}
                  {...paymentEditForm.getInputProps("paymentMethod")}
                />
              )}
              <DatePickerInput
                label={pt("date")}
                valueFormat="DD.MM.YYYY"
                key={paymentEditForm.key("date")}
                {...paymentEditForm.getInputProps("date")}
                required
              />
            </Group>
            <TextInput
              label={pt("description")}
              placeholder={
                selectedPayment?.type === "BORC" ? pt("debtPlaceholder") : pt("collectionPlaceholder")
              }
              key={paymentEditForm.key("description")}
              {...paymentEditForm.getInputProps("description")}
            />
            <Select
              label={pt("serviceRecordOptional")}
              placeholder={pt("serviceRecordOptional")}
              data={
                customerServiceRecords?.serviceRecords.map((sr) => ({
                  value: sr.id,
                  label: `#${sr.trackingNo} — ${sr.faultDescription.length > 60 ? sr.faultDescription.slice(0, 60) + "..." : sr.faultDescription}`,
                })) || []
              }
              key={paymentEditForm.key("serviceRecordId")}
              {...paymentEditForm.getInputProps("serviceRecordId")}
              clearable
              searchable
              nothingFoundMessage={ct("noResults")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => { paymentEditForm.reset(); setSelectedPayment(null); paymentEditHandlers.close(); }}>
                {ct("cancel")}
              </Button>
              <Button
                type="submit"
                loading={paymentUpdateMutation.isPending}
                px="xl"
                color={selectedPayment?.type === "BORC" ? "red" : "green"}
              >
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={paymentDeleteOpened}
        onClose={() => { setSelectedPayment(null); paymentDeleteHandlers.close(); }}
        title={<Text fw={700} size="md">{pt("deleteConfirm")}</Text>}
        radius="md"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => { setSelectedPayment(null); paymentDeleteHandlers.close(); }}>
            {ct("cancel")}
          </Button>
          <Button
            color="red"
            loading={paymentDeleteMutation.isPending}
            onClick={() => {
              if (selectedPayment) {
                paymentDeleteMutation.mutate(selectedPayment.id);
              }
            }}
            px="xl"
          >
            {ct("delete")}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
