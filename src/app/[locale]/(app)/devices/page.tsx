"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Title,
  TextInput,
  Button,
  Table,
  Pagination,
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
  SimpleGrid,
  Textarea,
  Select,
  Autocomplete,
} from "@mantine/core";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconDeviceLaptop,
  IconTool,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";
import { z } from "zod";

type Device = {
  id: string;
  category: string;
  brand: string;
  model: string;
  serialNo: string;
  notes: string | null;
  customerId: string;
  createdAt: string;
  customer: { id: string; name: string; surname: string };
  _count: { serviceRecords: number };
};

type DevicesResponse = {
  devices: Device[];
  total: number;
  page: number;
  pageSize: number;
};

type Customer = {
  id: string;
  name: string;
  surname: string;
  nickname: string | null;
  phone: string;
};

export default function DevicesPage() {
  const t = useTranslations("devices");
  const ct = useTranslations("common");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [createOpened, createHandlers] = useDisclosure(false);
  const [editOpened, editHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: { customerId: "", category: "", brand: "", model: "", serialNo: "", notes: "" },
    validate: {
      customerId: (v: string) => (v.length < 1 ? t("customerRequired") : null),
      category: (v: string) => (v.length < 1 ? t("categoryRequired") : null),
      brand: (v: string) => (v.length < 1 ? t("brandRequired") : null),
      model: (v: string) => (v.length < 1 ? t("modelRequired") : null),
    },
  });

  const editForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { customerId: "", category: "", brand: "", model: "", serialNo: "", notes: "" },
    validate: {
      customerId: (v: string) => (v.length < 1 ? t("customerRequired") : null),
      category: (v: string) => (v.length < 1 ? t("categoryRequired") : null),
      brand: (v: string) => (v.length < 1 ? t("brandRequired") : null),
      model: (v: string) => (v.length < 1 ? t("modelRequired") : null),
    },
  });

  const { data, isLoading, isError, error } = useQuery<DevicesResponse>({
    queryKey: ["devices", page, debouncedSearch],
    queryFn: () =>
      apiClient("/api/devices", {
        params: { page: String(page), pageSize: "20", query: debouncedSearch },
      }),
  });

  const { data: customersData } = useQuery<{ customers: Customer[] }>({
    queryKey: ["customers-mini"],
    queryFn: () => apiClient("/api/customers", { params: { pageSize: "1000" } }),
  });

  const { data: optionsData } = useQuery<{ brands: string[]; categories: string[] }>({
    queryKey: ["device-options"],
    queryFn: () => apiClient("/api/devices/options"),
    staleTime: 30000,
  });

  const customerOptions = (customersData?.customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} ${c.surname}${c.nickname ? ` (${c.nickname})` : ""} — ${formatPhone(c.phone)}`,
  }));

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      apiClient("/api/devices", { method: "POST", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notifications.show({ title: ct("success"), message: t("created"), color: "green" });
      form.reset();
      createHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: typeof editForm.values & { id: string }) =>
      apiClient(`/api/devices/${values.id}`, { method: "PUT", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notifications.show({ title: ct("success"), message: t("updated"), color: "green" });
      setEditingDevice(null);
      editHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/api/devices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      deleteHandlers.close();
      setDeletingId(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const rows = (data?.devices ?? []).map((device) => (
    <Table.Tr key={device.id}>
      <Table.Td>
        <Text
          component={Link}
          href={`/devices/${device.id}`}
          c="blue"
          fw={600}
          size="sm"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          {device.brand} {device.model}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color="gray">
          {device.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{device.serialNo || "—"}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          component={Link}
          href={`/customers/${device.customer.id}`}
          size="sm"
          c="blue"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          {device.customer.name} {device.customer.surname}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color="teal" leftSection={<IconTool size={12} stroke={1.5} />}>
          {device._count.serviceRecords}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={ct("edit")} position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setEditingDevice(device);
                editForm.setValues({
                  customerId: device.customerId,
                  category: device.category,
                  brand: device.brand,
                  model: device.model,
                  serialNo: device.serialNo || "",
                  notes: device.notes || "",
                });
                editHandlers.open();
              }}
            >
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={ct("delete")} position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                setDeletingId(device.id);
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
          <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
            {t("new")}
          </Button>
        </Group>

        <TextInput
          placeholder={ct("search") + "..."}
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={searchValue}
          autoComplete="nope"
          onChange={(e) => {
            setSearchValue(e.currentTarget.value);
            setPage(1);
          }}
          maw={400}
        />

        {isLoading ? (
          <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={700}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Marka / Model</Table.Th>
                    <Table.Th>{t("category")}</Table.Th>
                    <Table.Th>{t("serialNo")}</Table.Th>
                    <Table.Th>{t("owner")}</Table.Th>
                    <Table.Th>Servis</Table.Th>
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
        ) : data?.devices.length === 0 ? (
          <Card withBorder shadow="sm" p="xl" ta="center" radius="md">
            <Stack align="center" gap="xs">
              <IconDeviceLaptop size={48} stroke={1} opacity={0.3} />
              <Text fw={600}>{t("noDevices")}</Text>
              <Text size="sm" c="dimmed">
                {t("addFirst")}
              </Text>
              <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open} mt="xs">
                {t("new")}
              </Button>
            </Stack>
          </Card>
        ) : (
          <>
            <Card withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
              <Table.ScrollContainer minWidth={700}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                    <Table.Th>{t("brandModel")}</Table.Th>
                      <Table.Th>{t("category")}</Table.Th>
                      <Table.Th>{t("serialNo")}</Table.Th>
                      <Table.Th>{t("owner")}</Table.Th>
                    <Table.Th>{t("serviceCount")}</Table.Th>
                      <Table.Th>{ct("actions")}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination total={totalPages} value={page} onChange={setPage} radius="md" />
              </Group>
            )}
          </>
        )}
      </Stack>

      <Modal
        opened={createOpened}
        onClose={() => {
          form.reset();
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
              label={t("owner")}
              placeholder={t("customerPlaceholder")}
              required
              searchable
              data={customerOptions}
              limit={5}
              autoComplete="nope"
              key={form.key("customerId")}
              {...form.getInputProps("customerId")}
            />

            <SimpleGrid cols={2} spacing="md">
              <Autocomplete
                label={t("brand")}
                placeholder={t("brandPlaceholder")}
                required
                data={optionsData?.brands ?? []}
                limit={5}
                autoComplete="nope"
                key={form.key("brand")}
                {...form.getInputProps("brand")}
              />
              <TextInput
                label={t("model")}
                placeholder={t("modelPlaceholder")}
                required
                autoComplete="nope"
                key={form.key("model")}
                {...form.getInputProps("model")}
              />
            </SimpleGrid>

            <SimpleGrid cols={2} spacing="md">
              <Autocomplete
                label={t("category")}
                placeholder={t("categoryPlaceholder")}
                required
                data={optionsData?.categories ?? []}
                limit={5}
                autoComplete="nope"
                key={form.key("category")}
                {...form.getInputProps("category")}
              />
              <TextInput
                label={t("serialNo")}
                placeholder={t("serialNoPlaceholder")}
                autoComplete="nope"
                key={form.key("serialNo")}
                {...form.getInputProps("serialNo")}
              />
            </SimpleGrid>

            <Textarea
              label={t("notes")}
              placeholder={t("notesPlaceholder")}
              minRows={3}
              maxRows={5}
              autoComplete="nope"
              key={form.key("notes")}
              {...form.getInputProps("notes")}
            />

            <Group justify="flex-end" mt="lg">
              <Button variant="default" onClick={createHandlers.close}>
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={createMutation.isPending} px="xl">
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={editOpened}
        onClose={() => {
          setEditingDevice(null);
          editHandlers.close();
        }}
        title={
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {t("edit")}
            </Text>
            <Text size="xs" c="dimmed">
              {t("editDescription")}
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
          onSubmit={editForm.onSubmit((values) =>
            updateMutation.mutate({ ...values, id: editingDevice!.id })
          )}
          style={{ paddingTop: "8px" }}
        >
          <Stack gap="md">
            <Select
              label={t("owner")}
              placeholder={t("customerPlaceholder")}
              required
              searchable
              data={customerOptions}
              limit={5}
              autoComplete="nope"
              key={editForm.key("customerId")}
              {...editForm.getInputProps("customerId")}
            />

            <SimpleGrid cols={2} spacing="md">
              <Autocomplete
                label={t("brand")}
                required
                data={optionsData?.brands ?? []}
                limit={5}
                autoComplete="nope"
                key={editForm.key("brand")}
                {...editForm.getInputProps("brand")}
              />
              <TextInput
                label={t("model")}
                required
                autoComplete="nope"
                key={editForm.key("model")}
                {...editForm.getInputProps("model")}
              />
            </SimpleGrid>

            <SimpleGrid cols={2} spacing="md">
              <Autocomplete
                label={t("category")}
                required
                data={optionsData?.categories ?? []}
                limit={5}
                autoComplete="nope"
                key={editForm.key("category")}
                {...editForm.getInputProps("category")}
              />
              <TextInput
                label={t("serialNo")}
                autoComplete="nope"
                key={editForm.key("serialNo")}
                {...editForm.getInputProps("serialNo")}
              />
            </SimpleGrid>

            <Textarea
              label={t("notes")}
              minRows={3}
              maxRows={5}
              autoComplete="nope"
              key={editForm.key("notes")}
              {...editForm.getInputProps("notes")}
            />

            <Group justify="flex-end" mt="lg">
              <Button variant="default" onClick={() => { setEditingDevice(null); editHandlers.close(); }}>
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
