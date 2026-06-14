"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { Pagination } from "@/components/ui/pagination";
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
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { Link } from "@/lib/navigation";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconUsers,
  IconDeviceLaptop,
  IconTool,
  IconPhone,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { normalizePhone, isValidPhone, formatPhone, formatPhoneInput } from "@/lib/phone";
import { GoogleAddressInput } from "@/components/features/customers/google-address-input";
import classes from "./page.module.css";

type Customer = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string | null;
  address: string | null;
  nickname: string | null;
  createdAt: string;
  _count: {
    devices: number;
    serviceRecords: number;
  };
};

type CustomersResponse = {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
};

export default function CustomersPage() {
  const t = useTranslations("customers");
  const ct = useTranslations("common");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [createPhoneValue, setCreatePhoneValue] = useState("");
  const [editPhoneValue, setEditPhoneValue] = useState("");

  const [createOpened, createHandlers] = useDisclosure(false);
  const [editOpened, editHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<CustomersResponse>({
    queryKey: ["customers", page, debouncedSearch],
    queryFn: () =>
      apiClient("/api/customers", {
        params: { page: String(page), pageSize: "20", query: debouncedSearch },
      }),
  });

  const phoneValidate = (v: string) => {
    if (v.length < 1) return t("phoneRequired");
    if (!isValidPhone(normalizePhone(v))) return t("phoneInvalid");
    return null;
  };

  const createForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { name: "", surname: "", phone: "", email: "", address: "", nickname: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? t("nameRequired") : null),
      surname: (v: string) => (v.length < 1 ? t("surnameRequired") : null),
      phone: phoneValidate,
      email: (v: string) => {
        const trimmed = v.trim();
        return trimmed && !z.string().email().safeParse(trimmed).success
          ? t("emailInvalid")
          : null;
      },
    },
  });

  const editForm = useForm({
    mode: "uncontrolled" as const,
    initialValues: { name: "", surname: "", phone: "", email: "", address: "", nickname: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? t("nameRequired") : null),
      surname: (v: string) => (v.length < 1 ? t("surnameRequired") : null),
      phone: phoneValidate,
      email: (v: string) => {
        const trimmed = v.trim();
        return trimmed && !z.string().email().safeParse(trimmed).success
          ? t("emailInvalid")
          : null;
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof createForm.values) =>
      apiClient("/api/customers", { method: "POST", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: ct("success"), message: t("created"), color: "green" });
      createForm.reset();
      setCreatePhoneValue("");
      createHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: typeof editForm.values & { id: string }) =>
      apiClient(`/api/customers/${values.id}`, { method: "PUT", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: ct("success"), message: t("updated"), color: "green" });
      setEditingCustomer(null);
      editHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      deleteHandlers.close();
      setDeletingId(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: "Hata", message: err.message, color: "red" });
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const rows = (data?.customers ?? []).map((customer) => (
    <Table.Tr key={customer.id}>
      <Table.Td>
        <Text
          component={Link}
          href={`/customers/${customer.id}`}
          prefetch={false}
          c="blue"
          fw={600}
          size="sm"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          {customer.name} {customer.surname}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatPhone(customer.phone)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={customer.email ? undefined : "dimmed"}>
          {customer.email || "—"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Badge
            size="sm"
            variant="light"
            color="blue"
            leftSection={<IconDeviceLaptop size={12} stroke={1.5} />}
          >
            {customer._count.devices}
          </Badge>
          <Badge
            size="sm"
            variant="light"
            color="teal"
            leftSection={<IconTool size={12} stroke={1.5} />}
          >
            {customer._count.serviceRecords}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={ct("edit")} position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setEditingCustomer(customer);
                editForm.setValues({
                  name: customer.name,
                  surname: customer.surname,
                  phone: formatPhoneInput(customer.phone),
                  email: customer.email || "",
                  address: customer.address || "",
                  nickname: customer.nickname || "",
                });
                setEditPhoneValue(formatPhoneInput(customer.phone));
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
                setDeletingId(customer.id);
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
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: "30%" }}>{t("nameSurname")}</Table.Th>
                    <Table.Th style={{ width: "20%" }}>{t("phone")}</Table.Th>
                    <Table.Th style={{ width: "25%" }}>{t("email")}</Table.Th>
                    <Table.Th style={{ width: "15%" }}>{t("deviceService")}</Table.Th>
                    <Table.Th style={{ width: "10%" }}>{ct("actions")}</Table.Th>
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
        ) : data?.customers.length === 0 ? (
          <Card withBorder shadow="sm" p="xl" ta="center" radius="md">
            <Stack align="center" gap="xs">
              <IconUsers size={48} stroke={1} opacity={0.3} />
              <Text fw={600}>{t("noCustomers")}</Text>
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
              <Table.ScrollContainer minWidth={600}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t("nameSurname")}</Table.Th>
                      <Table.Th>{t("phone")}</Table.Th>
                      <Table.Th>{t("email")}</Table.Th>
                      <Table.Th>{t("deviceService")}</Table.Th>
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
          createForm.reset();
          setCreatePhoneValue("");
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
        size="xl"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        transitionProps={{ transition: "fade", duration: 150 }}
      >
        <form
          autoComplete="nope"
          onSubmit={createForm.onSubmit((values) =>
            createMutation.mutate({ ...values, phone: normalizePhone(values.phone) })
          )}
          className={classes.editForm}
        >
          <Stack gap="lg">

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Card withBorder radius="lg" p="md" className={classes.editSection}>
                <Stack gap="md">
                  <Stack gap={2}>
                    <Text fw={700}>{t("nameSurname")}</Text>
                    <Text size="xs" c="dimmed">
                      {t("createDescription")}
                    </Text>
                  </Stack>
                  <TextInput
                    label={t("name")}
                    placeholder={t("namePlaceholder")}
                    required
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={createForm.key("name")}
                    {...createForm.getInputProps("name")}
                  />
                  <TextInput
                    label={t("surname")}
                    placeholder={t("surnamePlaceholder")}
                    required
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={createForm.key("surname")}
                    {...createForm.getInputProps("surname")}
                  />
                  <TextInput
                    label={t("nickname")}
                    placeholder={t("nicknamePlaceholder")}
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={createForm.key("nickname")}
                    {...createForm.getInputProps("nickname")}
                  />
                </Stack>
              </Card>

              <Card withBorder radius="lg" p="md" className={classes.editSection}>
                <Stack gap="md">
                  <Stack gap={2}>
                    <Text fw={700}>{t("phone")}</Text>
                    <Text size="xs" c="dimmed">
                      {t("email")}
                    </Text>
                  </Stack>
                  <TextInput
                    label={t("phone")}
                    placeholder="0555 555 55 55"
                    required
                    autoComplete="nope"
                    leftSection={<IconPhone size={16} stroke={1.5} />}
                    value={createPhoneValue}
                    error={createForm.errors.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.currentTarget.value);
                      setCreatePhoneValue(formatted);
                      createForm.setFieldValue("phone", formatted);
                    }}
                    onFocus={(e) => {
                      if (!e.currentTarget.value) {
                        setCreatePhoneValue("0");
                        createForm.setFieldValue("phone", "0");
                      }
                    }}
                    onBlur={(e) => {
                      const formatted = formatPhoneInput(e.currentTarget.value);
                      setCreatePhoneValue(formatted);
                      createForm.setFieldValue("phone", formatted);
                    }}
                  />
                  <TextInput
                    label={t("email")}
                    placeholder="ahmet@ornek.com"
                    autoComplete="nope"
                    leftSection={<IconMail size={16} stroke={1.5} />}
                    key={createForm.key("email")}
                    {...createForm.getInputProps("email")}
                  />
                </Stack>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="lg" p="md" className={classes.editSection}>
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={700}>{t("address")}</Text>
                  <Text size="xs" c="dimmed">
                    {t("addressPlaceholder")}
                  </Text>
                </Stack>
                <GoogleAddressInput
                  key="create-customer-address"
                  label={t("address")}
                  placeholder={t("addressPlaceholder")}
                  value={createForm.getValues().address}
                  error={createForm.errors.address}
                  onChange={(value) => createForm.setFieldValue("address", value)}
                />
              </Stack>
            </Card>

            <Group justify="flex-end" className={classes.editActions}>
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
          setEditingCustomer(null);
          setEditPhoneValue("");
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
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        transitionProps={{ transition: "fade", duration: 150 }}
      >
        <form
          autoComplete="nope"
          onSubmit={editForm.onSubmit((values) =>
            updateMutation.mutate({ ...values, phone: normalizePhone(values.phone), id: editingCustomer!.id })
          )}
          className={classes.editForm}
        >
          <Stack gap="lg">
            <Card withBorder radius="lg" p="md" className={classes.editSummaryCard}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <ThemeIcon size={48} radius="xl" variant="light" color="blue">
                    <IconUser size={24} stroke={1.6} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={700} size="lg">
                      {editingCustomer?.name} {editingCustomer?.surname}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {editPhoneValue || t("phone")}
                    </Text>
                  </Stack>
                </Group>
                {editingCustomer?.nickname && (
                  <Badge variant="light" color="gray" size="lg" className={classes.nicknameBadge}>
                    {editingCustomer.nickname}
                  </Badge>
                )}
              </Group>
            </Card>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Card withBorder radius="lg" p="md" className={classes.editSection}>
                <Stack gap="md">
                  <Stack gap={2}>
                    <Text fw={700}>{t("nameSurname")}</Text>
                    <Text size="xs" c="dimmed">
                      {t("editDescription")}
                    </Text>
                  </Stack>
                  <TextInput
                    label={t("name")}
                    required
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={editForm.key("name")}
                    {...editForm.getInputProps("name")}
                  />
                  <TextInput
                    label={t("surname")}
                    required
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={editForm.key("surname")}
                    {...editForm.getInputProps("surname")}
                  />
                  <TextInput
                    label={t("nickname")}
                    autoComplete="nope"
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    key={editForm.key("nickname")}
                    {...editForm.getInputProps("nickname")}
                  />
                </Stack>
              </Card>

              <Card withBorder radius="lg" p="md" className={classes.editSection}>
                <Stack gap="md">
                  <Stack gap={2}>
                    <Text fw={700}>{t("phone")}</Text>
                    <Text size="xs" c="dimmed">
                      {t("email")}
                    </Text>
                  </Stack>
                  <TextInput
                    label={t("phone")}
                    required
                    autoComplete="nope"
                    leftSection={<IconPhone size={16} stroke={1.5} />}
                    value={editPhoneValue}
                    error={editForm.errors.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.currentTarget.value);
                      setEditPhoneValue(formatted);
                      editForm.setFieldValue("phone", formatted);
                    }}
                    onFocus={(e) => {
                      if (!e.currentTarget.value) {
                        setEditPhoneValue("0");
                        editForm.setFieldValue("phone", "0");
                      }
                    }}
                    onBlur={(e) => {
                      const formatted = formatPhoneInput(e.currentTarget.value);
                      setEditPhoneValue(formatted);
                      editForm.setFieldValue("phone", formatted);
                    }}
                  />
                  <TextInput
                    label={t("email")}
                    autoComplete="nope"
                    leftSection={<IconMail size={16} stroke={1.5} />}
                    key={editForm.key("email")}
                    {...editForm.getInputProps("email")}
                  />
                </Stack>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="lg" p="md" className={classes.editSection}>
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={700}>{t("address")}</Text>
                  <Text size="xs" c="dimmed">
                    {t("addressPlaceholder")}
                  </Text>
                </Stack>
                <GoogleAddressInput
                  key={`${editingCustomer?.id ?? "edit"}-${editingCustomer?.address ?? ""}`}
                  label={t("address")}
                  placeholder={t("addressPlaceholder")}
                  value={editForm.getValues().address}
                  error={editForm.errors.address}
                  onChange={(value) => editForm.setFieldValue("address", value)}
                />
              </Stack>
            </Card>

            <Group justify="flex-end" className={classes.editActions}>
              <Button
                variant="default"
                onClick={() => {
                  setEditingCustomer(null);
                  setEditPhoneValue("");
                  editHandlers.close();
                }}
              >
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
        onClose={() => {
          setDeletingId(null);
          deleteHandlers.close();
        }}
        title={
          <Text fw={700} size="md">
            {t("deleteConfirm")}
          </Text>
        }
        radius="md"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Group justify="flex-end" mt="lg">
          <Button
            variant="default"
            onClick={() => {
              setDeletingId(null);
              deleteHandlers.close();
            }}
          >
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
