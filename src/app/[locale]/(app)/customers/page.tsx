"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";
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
  TextInput as TextInputField,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconUsers,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { useRouter } from "@/lib/navigation";

type Customer = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string | null;
  address: string | null;
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

const customerSchema = z.object({
  name: z.string().min(1, "Ad zorunlu"),
  surname: z.string().min(1, "Soyad zorunlu"),
  phone: z.string().min(1, "Telefon zorunlu"),
  email: z.string().email("Geçersiz e-posta").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export default function CustomersPage() {
  const t = useTranslations("customers");
  const ct = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [createOpened, createHandlers] = useDisclosure(false);
  const [editOpened, editHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<CustomersResponse>({
    queryKey: ["customers", page, search],
    queryFn: () =>
      apiClient("/api/customers", {
        params: { page: String(page), pageSize: "20", query: search },
      }),
  });

  const createForm = useForm({
    initialValues: { name: "", surname: "", phone: "", email: "", address: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? "Ad zorunlu" : null),
      surname: (v: string) => (v.length < 1 ? "Soyad zorunlu" : null),
      phone: (v: string) => (v.length < 1 ? "Telefon zorunlu" : null),
      email: (v: string) =>
        v && v.length > 0 && !z.string().email().safeParse(v).success
          ? "Geçersiz e-posta"
          : null,
    },
  });

  const editForm = useForm({
    initialValues: { name: "", surname: "", phone: "", email: "", address: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? "Ad zorunlu" : null),
      surname: (v: string) => (v.length < 1 ? "Soyad zorunlu" : null),
      phone: (v: string) => (v.length < 1 ? "Telefon zorunlu" : null),
      email: (v: string) =>
        v && v.length > 0 && !z.string().email().safeParse(v).success
          ? "Geçersiz e-posta"
          : null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: typeof createForm.values) =>
      apiClient("/api/customers", { method: "POST", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: "Başarılı", message: "Müşteri oluşturuldu", color: "green" });
      createForm.reset();
      createHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: "Hata", message: err.message, color: "red" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: typeof editForm.values & { id: string }) =>
      apiClient(`/api/customers/${values.id}`, { method: "PUT", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: "Başarılı", message: "Müşteri güncellendi", color: "green" });
      setEditingCustomer(null);
      editHandlers.close();
    },
    onError: (err: Error) => {
      notifications.show({ title: "Hata", message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      notifications.show({ title: "Başarılı", message: "Müşteri silindi", color: "green" });
      deleteHandlers.close();
      setDeletingId(null);
    },
    onError: (err: Error) => {
      notifications.show({ title: "Hata", message: err.message, color: "red" });
    },
  });

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearch(query);
  }, [query]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const rows = (data?.customers ?? []).map((customer) => (
    <Table.Tr key={customer.id}>
      <Table.Td>
        <Text
          component={Link}
          href={`/customers/${customer.id}`}
          td="underline"
          c="blue"
          style={{ cursor: "pointer" }}
        >
          {customer.name} {customer.surname}
        </Text>
      </Table.Td>
      <Table.Td>{customer.phone}</Table.Td>
      <Table.Td>{customer.email || "—"}</Table.Td>
      <Table.Td>{customer._count.devices}</Table.Td>
      <Table.Td>{customer._count.serviceRecords}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => {
              setEditingCustomer(customer);
              editForm.setValues({
                name: customer.name,
                surname: customer.surname,
                phone: customer.phone,
                email: customer.email || "",
                address: customer.address || "",
              });
              editHandlers.open();
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => {
              setDeletingId(customer.id);
              deleteHandlers.open();
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{t("title")}</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
          {t("new")}
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder={ct("search") + "..."}
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <Button variant="light" onClick={handleSearch}>
          {ct("search")}
        </Button>
      </Group>

      {isLoading ? (
        <Stack>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </Stack>
      ) : isError ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={ct("error")}
          color="red"
        >
          {(error as Error)?.message || "Bir hata oluştu"}
        </Alert>
      ) : data?.customers.length === 0 ? (
        <Alert
          icon={<IconUsers size={16} />}
          title={t("noCustomers")}
          color="gray"
        >
          <Text mb="sm">{t("addFirst")}</Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={createHandlers.open}
          >
            {t("new")}
          </Button>
        </Alert>
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("name")} {t("surname")}</Table.Th>
                <Table.Th>{t("phone")}</Table.Th>
                <Table.Th>{t("email")}</Table.Th>
                <Table.Th>{t("deviceCount")}</Table.Th>
                <Table.Th>{t("serviceCount")}</Table.Th>
                <Table.Th>{ct("actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={setPage} />
            </Group>
          )}
        </>
      )}

      <Modal
        opened={createOpened}
        onClose={() => { createForm.reset(); createHandlers.close(); }}
        title={t("new")}
      >
        <form
          onSubmit={createForm.onSubmit((values) => createMutation.mutate(values))}
        >
          <Stack>
            <TextInputField
              label={t("name")}
              required
              {...createForm.getInputProps("name")}
            />
            <TextInputField
              label={t("surname")}
              required
              {...createForm.getInputProps("surname")}
            />
            <TextInputField
              label={t("phone")}
              required
              {...createForm.getInputProps("phone")}
            />
            <TextInputField
              label={t("email")}
              {...createForm.getInputProps("email")}
            />
            <TextInputField
              label={t("address")}
              {...createForm.getInputProps("address")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={createHandlers.close}>
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={editOpened}
        onClose={() => { setEditingCustomer(null); editHandlers.close(); }}
        title={t("edit")}
      >
        <form
          onSubmit={editForm.onSubmit((values) =>
            updateMutation.mutate({ ...values, id: editingCustomer!.id })
          )}
        >
          <Stack>
            <TextInputField
              label={t("name")}
              required
              {...editForm.getInputProps("name")}
            />
            <TextInputField
              label={t("surname")}
              required
              {...editForm.getInputProps("surname")}
            />
            <TextInputField
              label={t("phone")}
              required
              {...editForm.getInputProps("phone")}
            />
            <TextInputField
              label={t("email")}
              {...editForm.getInputProps("email")}
            />
            <TextInputField
              label={t("address")}
              {...editForm.getInputProps("address")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => { setEditingCustomer(null); editHandlers.close(); }}>
                {ct("cancel")}
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                {ct("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={() => { setDeletingId(null); deleteHandlers.close(); }}
        title={t("deleteConfirm")}
      >
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => { setDeletingId(null); deleteHandlers.close(); }}>
            {ct("cancel")}
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
          >
            {ct("delete")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
