"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Skeleton,
  Alert,
  Modal,
  Textarea,
  Divider,
  Checkbox,
  TextInput,
  Select,
  SimpleGrid,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import { Link, useRouter } from "@/lib/navigation";
import {
  IconArrowLeft,
  IconTrash,
  IconEdit,
  IconAlertCircle,
  IconUser,
  IconDeviceLaptop,
  IconCheck,
  IconPlus,
  IconHistory,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";

type ServiceRecord = {
  id: string;
  trackingNo: number;
  status: string;
  priority: string;
  faultDescription: string;
  pricing: number | null;
  assignedUserId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; surname: string; phone: string; email: string | null; address: string | null };
  device: { id: string; brand: string; model: string; category: string; serialNo: string };
  assignedUser: { id: string; name: string; surname: string } | null;
  statusHistory: StatusHistoryEntry[];
  notes: Note[];
};

type StatusHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  changedBy: { id: string; name: string; surname: string };
};

type Note = {
  id: string;
  content: string;
  isCustomerVisible: boolean;
  createdAt: string;
  author: { id: string; name: string; surname: string };
};

type User = { id: string; name: string; surname: string; role: string };

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

const validTransitions: Record<string, string[]> = {
  KAYIT_ACILDI: ["TAMIRATTA", "IPTAL_EDILDI"],
  TAMIRATTA: ["FIYAT_TEKLIFI_VERILDI", "IPTAL_EDILDI"],
  FIYAT_TEKLIFI_VERILDI: ["HAZIR", "MUSTERI_REDDETTI"],
  HAZIR: ["TESLIM_EDILDI", "ODEME_BEKLIYOR"],
  ODEME_BEKLIYOR: ["TESLIM_EDILDI"],
  MUSTERI_REDDETTI: [],
  IPTAL_EDILDI: [],
  TESLIM_EDILDI: [],
};

export default function ServiceRecordDetailPage() {
  const t = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpened, editHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);

  const { data, isLoading, isError, error } = useQuery<{ serviceRecord: ServiceRecord }>({
    queryKey: ["service-record", params.id],
    queryFn: () => apiClient(`/api/service-records/${params.id}`),
  });

  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["users"],
    queryFn: () => apiClient("/api/auth/users"),
  });

  const record = data?.serviceRecord;
  const userOptions = (usersData?.users ?? []).map((u) => ({
    value: u.id,
    label: `${u.name} ${u.surname}`,
  }));

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiClient(`/api/service-records/${params.id}/status`, {
        method: "POST",
        body: { status: newStatus },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-record", params.id] });
      notifications.show({ title: ct("success"), message: t("statusUpdated"), color: "green" });
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const editForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      faultDescription: "",
      priority: "NORMAL" as string,
      assignedUserId: "" as string,
      pricing: "" as string,
    },
    validate: {
      faultDescription: (v: string) => (v.length < 1 ? t("faultRequired") : null),
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: typeof editForm.values) =>
      apiClient(`/api/service-records/${params.id}`, {
        method: "PUT",
        body: {
          faultDescription: values.faultDescription,
          priority: values.priority,
          assignedUserId: values.assignedUserId || null,
          pricing: values.pricing ? parseFloat(values.pricing) : null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-record", params.id] });
      notifications.show({ title: ct("success"), message: t("updated"), color: "green" });
      editHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient(`/api/service-records/${params.id}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      router.push("/service-records");
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const noteForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { content: "", isCustomerVisible: false },
    validate: {
      content: (v: string) => (v.length < 1 ? t("contentRequired") : null),
    },
  });

  const noteMutation = useMutation({
    mutationFn: (values: typeof noteForm.values) =>
      apiClient(`/api/service-records/${params.id}/notes`, {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-record", params.id] });
      notifications.show({ title: ct("success"), message: t("noteAdded"), color: "green" });
      noteForm.reset();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const transitions = record ? validTransitions[record.status] || [] : [];

  if (isLoading) {
    return (
      <Stack gap="lg">
        <Skeleton height={40} width={300} radius="md" />
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
        </SimpleGrid>
        <Skeleton height={300} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (isError || !record) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={ct("error")} color="red" radius="md">
        {(error as Error)?.message || ct("error")}
      </Alert>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button
              variant="subtle"
              component={Link}
              href="/service-records"
              leftSection={<IconArrowLeft size={16} />}
            >
              {t("backToList")}
            </Button>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {t("detail")} — #{record.trackingNo}
            </Title>
          </Group>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                editForm.setValues({
                  faultDescription: record.faultDescription,
                  priority: record.priority,
                  assignedUserId: record.assignedUser?.id || "",
                  pricing: record.pricing?.toString() || "",
                });
                editHandlers.open();
              }}
            >
              {ct("edit")}
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={deleteHandlers.open}
            >
              {ct("delete")}
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="sm">
              <Group gap="xs">
                <Badge size="lg" variant="light" color={statusColors[record.status] || "gray"}>
                  {t(`status_change.${record.status}`)}
                </Badge>
                <Badge size="lg" variant="outline" color={priorityColors[record.priority] || "gray"}>
                  {t(`priority_label.${record.priority}`)}
                </Badge>
              </Group>
              <Divider />
              <Text size="sm" c="dimmed">{t("faultDescription")}</Text>
              <Text size="sm">{record.faultDescription}</Text>
              {record.assignedUser && (
                <>
                  <Divider />
                  <Text size="sm" c="dimmed">{t("assignedUser")}</Text>
                  <Group gap="xs">
                    <IconUser size={14} stroke={1.5} />
                    <Text size="sm">{record.assignedUser.name} {record.assignedUser.surname}</Text>
                  </Group>
                </>
              )}
              {record.pricing != null && (
                <>
                  <Divider />
                  <Text size="sm" c="dimmed">{t("pricing")}</Text>
                  <Text size="sm" fw={600}>{record.pricing.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</Text>
                </>
              )}
              <Divider />
              <Text size="sm" c="dimmed">{t("trackingNo")}</Text>
              <Text size="sm">#{record.trackingNo}</Text>
              <Text size="xs" c="dimmed">
                {new Date(record.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </Text>
            </Stack>
          </Card>

          <Card
            withBorder
            shadow="sm"
            radius="md"
            p="lg"
            component={Link}
            href={`/customers/${record.customer.id}`}
            style={{ cursor: "pointer", textDecoration: "none" }}
          >
            <Stack gap="sm">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
                  <IconUser size={14} />
                </ThemeIcon>
                <Text fw={600}>{t("customer")}</Text>
              </Group>
              <Text size="lg" fw={700}>
                {record.customer.name} {record.customer.surname}
              </Text>
              <Text size="sm" c="dimmed">{formatPhone(record.customer.phone)}</Text>
              {record.customer.email && <Text size="sm" c="dimmed">{record.customer.email}</Text>}
              {record.customer.address && (
                <Text size="sm" c="dimmed" lineClamp={2}>{record.customer.address}</Text>
              )}
            </Stack>
          </Card>

          <Card
            withBorder
            shadow="sm"
            radius="md"
            p="lg"
            component={Link}
            href={`/devices/${record.device.id}`}
            style={{ cursor: "pointer", textDecoration: "none" }}
          >
            <Stack gap="sm">
              <Group gap="xs">
                <ThemeIcon variant="light" color="teal" size="sm" radius="xl">
                  <IconDeviceLaptop size={14} />
                </ThemeIcon>
                <Text fw={600}>{t("device")}</Text>
              </Group>
              <Text size="lg" fw={700}>
                {record.device.brand} {record.device.model}
              </Text>
              <Badge size="sm" variant="light" color="gray">
                {record.device.category}
              </Badge>
              {record.device.serialNo && (
                <Text size="sm" c="dimmed">{record.device.serialNo}</Text>
              )}
            </Stack>
          </Card>
        </SimpleGrid>

        {transitions.length > 0 && (
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Group gap="xs">
                <IconHistory size={20} stroke={1.5} />
                <Text fw={600}>{t("changeStatus")}</Text>
              </Group>
              <Group gap="sm">
                <Badge size="lg" variant="filled" color={statusColors[record.status] || "gray"}>
                  {t(`status_change.${record.status}`)}
                </Badge>
                {transitions.map((targetStatus) => (
                  <Button
                    key={targetStatus}
                    variant="light"
                    color={statusColors[targetStatus] || "gray"}
                    size="sm"
                    loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(targetStatus)}
                    leftSection={<IconCheck size={14} />}
                  >
                    {t(`status_change.${targetStatus}`)}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Card>
        )}

        {record.statusHistory.length > 0 && (
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Group gap="xs">
                <IconHistory size={20} stroke={1.5} />
                <Text fw={600}>{t("statusHistory")}</Text>
              </Group>
              <Timeline active={record.statusHistory.length - 1} bulletSize={24} lineWidth={2}>
                {[...record.statusHistory].reverse().map((h) => (
                  <Timeline.Item
                    key={h.id}
                    bullet={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        color={statusColors[h.toStatus] || "gray"}
                        variant="filled"
                      >
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                    title={
                      <Group gap="xs">
                        <Badge size="sm" variant="light" color={statusColors[h.toStatus] || "gray"}>
                          {t(`status_change.${h.toStatus}`)}
                        </Badge>
                        {h.fromStatus && (
                          <>
                            <IconArrowLeft size={12} stroke={1.5} />
                            <Badge size="sm" variant="outline" color="gray">
                              {t(`status_change.${h.fromStatus}`)}
                            </Badge>
                          </>
                        )}
                      </Group>
                    }
                  >
                    <Text size="xs" c="dimmed" mt={4}>
                      {h.changedBy.name} {h.changedBy.surname} —{" "}
                      {new Date(h.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Stack>
          </Card>
        )}

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Stack gap="md">
            <Text fw={600}>{t("notesSection")}</Text>

            <form
              autoComplete="nope"
              onSubmit={noteForm.onSubmit((values) => noteMutation.mutate(values))}
            >
              <Stack gap="sm">
                <Textarea
                  placeholder={t("faultPlaceholder")}
                  minRows={3}
                  maxRows={6}
                  autosize
                  autoComplete="nope"
                  key={noteForm.key("content")}
                  {...noteForm.getInputProps("content")}
                />
                <Group justify="space-between">
                  <Checkbox
                    label={t("customerVisible")}
                    key={noteForm.key("isCustomerVisible")}
                    {...noteForm.getInputProps("isCustomerVisible", { type: "checkbox" })}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    loading={noteMutation.isPending}
                    leftSection={<IconPlus size={14} />}
                  >
                    {t("addNote")}
                  </Button>
                </Group>
              </Stack>
            </form>

            <Divider />

            {record.notes.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="lg">
                {t("addNote")}
              </Text>
            ) : (
              <Stack gap="sm">
                {record.notes.map((note) => (
                  <Card key={note.id} withBorder p="sm" radius="md">
                    <Text size="sm">{note.content}</Text>
                    <Group gap="xs" mt="xs">
                      <Text size="xs" c="dimmed">
                        {note.author.name} {note.author.surname}
                      </Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(note.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </Text>
                      {note.isCustomerVisible && (
                        <>
                          <Text size="xs" c="dimmed">·</Text>
                          <Text size="xs" c="green">{t("customerVisible")}</Text>
                        </>
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={editOpened}
        onClose={editHandlers.close}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">{t("edit")}</Text>
            <Text size="xs" c="dimmed">#{record.trackingNo}</Text>
          </Stack>
        }
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form
          autoComplete="nope"
          onSubmit={editForm.onSubmit((values) => updateMutation.mutate(values))}
          style={{ paddingTop: "8px" }}
        >
          <Stack gap="md">
            <Textarea
              label={t("faultDescription")}
              required
              minRows={3}
              autoComplete="nope"
              key={editForm.key("faultDescription")}
              {...editForm.getInputProps("faultDescription")}
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
              key={editForm.key("priority")}
              {...editForm.getInputProps("priority")}
            />
            <Select
              label={t("assignedUser")}
              placeholder={t("assignedUser")}
              clearable
              searchable
              data={userOptions}
              limit={5}
              autoComplete="nope"
              key={editForm.key("assignedUserId")}
              {...editForm.getInputProps("assignedUserId")}
            />
            <TextInput
              label={t("pricing")}
              type="number"
              step="0.01"
              min="0"
              autoComplete="nope"
              key={editForm.key("pricing")}
              {...editForm.getInputProps("pricing")}
            />
            <Group justify="flex-end" mt="lg">
              <Button variant="default" onClick={editHandlers.close}>
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={updateMutation.isPending} px="xl">
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={deleteHandlers.close}
        title={<Text fw={700} size="md">{t("deleteConfirm")}</Text>}
        radius="md"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={deleteHandlers.close}>
            {ct("cancel")}
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            px="xl"
          >
            {ct("delete")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
