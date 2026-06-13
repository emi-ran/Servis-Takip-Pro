"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";
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
  Badge,
  Tooltip,
  PasswordInput,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconUsers,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

type StaffUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: "ADMIN" | "TECHNICIAN";
};

type UserFormData = {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: "ADMIN" | "TECHNICIAN";
};

const roleColors: Record<string, string> = {
  ADMIN: "blue",
  TECHNICIAN: "teal",
};

const emptyForm: UserFormData = {
  name: "",
  surname: "",
  email: "",
  password: "",
  role: "TECHNICIAN",
};

export default function StaffPage() {
  const t = useTranslations("staff");
  const ct = useTranslations("common");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formOpened, formHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const isEditing = editingUser !== null;

  const { data, isLoading, isError } = useQuery<{ users: StaffUser[] }>({
    queryKey: ["staff"],
    queryFn: () => apiClient("/api/auth/users"),
  });

  const createMutation = useMutation({
    mutationFn: (input: UserFormData) =>
      apiClient("/api/auth/users", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      notifications.show({ title: ct("success"), message: t("created"), color: "green" });
      closeForm();
    },
    onError: (err: Error) => {
      try {
        const body = JSON.parse(err.message);
        notifications.show({ title: ct("errorTitle"), message: body.message ?? ct("error"), color: "red" });
      } catch {
        notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UserFormData> }) =>
      apiClient(`/api/auth/users/${id}`, { method: "PUT", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      notifications.show({ title: ct("success"), message: t("updated"), color: "green" });
      closeForm();
    },
    onError: (err: Error) => {
      try {
        const body = JSON.parse(err.message);
        notifications.show({ title: ct("errorTitle"), message: body.message ?? ct("error"), color: "red" });
      } catch {
        notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/api/auth/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      deleteHandlers.close();
      setDeletingId(null);
    },
    onError: (err: Error) => {
      try {
        const body = JSON.parse(err.message);
        notifications.show({ title: ct("errorTitle"), message: body.message ?? ct("error"), color: "red" });
      } catch {
        notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
      }
    },
  });

  function validateForm(): boolean {
    const errors: Partial<Record<keyof UserFormData, string>> = {};
    if (!formData.name.trim()) errors.name = t("nameRequired");
    if (!formData.surname.trim()) errors.surname = t("surnameRequired");
    if (!formData.email.trim()) {
      errors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("emailInvalid");
    }
    if (!isEditing) {
      if (!formData.password) {
        errors.password = t("passwordRequired");
      } else if (formData.password.length < 6) {
        errors.password = t("passwordMin");
      }
    } else if (formData.password && formData.password.length < 6) {
      errors.password = t("passwordMin");
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreateForm() {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
    formHandlers.open();
  }

  function openEditForm(staffUser: StaffUser) {
    setEditingUser(staffUser);
    setFormData({
      name: staffUser.name,
      surname: staffUser.surname,
      email: staffUser.email,
      password: "",
      role: staffUser.role,
    });
    setFormErrors({});
    formHandlers.open();
  }

  function closeForm() {
    formHandlers.close();
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function handleSave() {
    if (!validateForm()) return;
    if (isEditing) {
      const payload: Record<string, unknown> = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      updateMutation.mutate({ id: editingUser.id, input: payload as Partial<UserFormData> });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleDelete() {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId);
  }

  if (user?.role !== "ADMIN") {
    return (
      <Stack gap="lg">
        <Title order={2}>{t("title")}</Title>
        <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
          {ct("error")}
        </Alert>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>{t("title")}</Title>
          <Button leftSection={<IconPlus size={18} />} onClick={openCreateForm}>
            {t("new")}
          </Button>
        </Group>

        <Text c="dimmed" size="sm">{t("pageDescription")}</Text>

        {isLoading ? (
          <Stack gap="sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={50} radius="sm" />
            ))}
          </Stack>
        ) : isError ? (
          <Alert icon={<IconAlertCircle size={16} />} title={ct("errorTitle")} color="red" radius="md">
            {ct("error")}
          </Alert>
        ) : (data?.users?.length ?? 0) === 0 ? (
          <Alert icon={<IconUsers size={16} />} color="blue" radius="md">
            <Text>{t("noStaff")}</Text>
            <Button variant="light" size="sm" mt="sm" leftSection={<IconPlus size={16} />} onClick={openCreateForm}>
              {t("addFirst")}
            </Button>
          </Alert>
        ) : (
          <Table.ScrollContainer minWidth={500}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("name")}</Table.Th>
                  <Table.Th>{t("surname")}</Table.Th>
                  <Table.Th>{t("email")}</Table.Th>
                  <Table.Th>{t("role")}</Table.Th>
                  <Table.Th w={100}>{ct("actions")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.users?.map((staffUser) => (
                  <Table.Tr key={staffUser.id}>
                    <Table.Td>
                      <Text size="sm">{staffUser.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{staffUser.surname}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{staffUser.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={roleColors[staffUser.role] || "gray"}>
                        {staffUser.role === "ADMIN" ? t("role_admin") : t("role_technician")}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        {staffUser.id !== user?.id && (
                          <Tooltip label={ct("edit")} position="top" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={() => openEditForm(staffUser)}
                            >
                              <IconEdit size={16} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {staffUser.id !== user?.id && (
                          <Tooltip label={ct("delete")} position="top" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                setDeletingId(staffUser.id);
                                deleteHandlers.open();
                              }}
                            >
                              <IconTrash size={16} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={isEditing ? t("edit") : t("new")}
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {isEditing ? t("editDescription") : t("createDescription")}
          </Text>

          <TextInput
            label={t("name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            error={formErrors.name}
            required
          />

          <TextInput
            label={t("surname")}
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.currentTarget.value })}
            error={formErrors.surname}
            required
          />

          <TextInput
            label={t("email")}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
            error={formErrors.email}
            required
          />

          <PasswordInput
            label={isEditing ? t("passwordOptional") : t("password")}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
            error={formErrors.password}
            required={!isEditing}
          />

          <Select
            label={t("role")}
            data={[
              { value: "ADMIN", label: t("role_admin") },
              { value: "TECHNICIAN", label: t("role_technician") },
            ]}
            value={formData.role}
            onChange={(v) => setFormData({ ...formData, role: (v as "ADMIN" | "TECHNICIAN") ?? "TECHNICIAN" })}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeForm}>
              {ct("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              loading={isEditing ? updateMutation.isPending : createMutation.isPending}
            >
              {ct("save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteOpened} onClose={deleteHandlers.close} title={ct("delete")} size="sm">
        <Stack gap="md">
          <Text>{t("deleteConfirm")}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={deleteHandlers.close}>
              {ct("cancel")}
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>
              {ct("delete")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
