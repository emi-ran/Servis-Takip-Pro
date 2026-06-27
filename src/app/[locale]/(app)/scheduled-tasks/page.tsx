"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { Pagination } from "@/components/ui/pagination";
import { DateTimePicker, MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";
import classes from "./page.module.css";

type TaskType = "CIHAZ_ALINACAK" | "CIHAZ_BIRAKILACAK" | "BAKIM" | "KURULUM" | "DIGER";
type TaskStatus = "PLANLANDI" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "IPTAL";

interface CustomerOption {
  id: string;
  name: string;
  surname: string;
  nickname: string | null;
  phone: string;
}

interface UserOption {
  id: string;
  name: string;
  surname: string;
  role: string;
}

interface ScheduledTask {
  id: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  date: string;
  status: TaskStatus;
  customer: {
    id: string;
    name: string;
    surname: string;
    phone: string;
    address: string | null;
  };
  assignedUser: {
    id: string;
    name: string;
    surname: string;
  } | null;
}

interface ListResponse {
  scheduledTasks: ScheduledTask[];
  total: number;
  page: number;
  pageSize: number;
}

const taskTypeColors: Record<TaskType, string> = {
  CIHAZ_ALINACAK: "blue",
  CIHAZ_BIRAKILACAK: "teal",
  BAKIM: "orange",
  KURULUM: "violet",
  DIGER: "gray",
};

const statusColors: Record<TaskStatus, string> = {
  PLANLANDI: "blue",
  DEVAM_EDIYOR: "yellow",
  TAMAMLANDI: "green",
  IPTAL: "gray",
};

const statusClassNames: Record<TaskStatus, string> = {
  PLANLANDI: classes.statusPlanned,
  DEVAM_EDIYOR: classes.statusInProgress,
  TAMAMLANDI: classes.statusDone,
  IPTAL: classes.statusCancelled,
};

function padDatePart(part: number) {
  return String(part).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function toTimeLabel(value: string) {
  return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function toDateTimeInputValue(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:00`;
}

function getMonthDays(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: string[] = [];

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    days.push(toDateKey(date));
  }

  return days;
}

export default function ScheduledTasksPage() {
  const t = useTranslations("scheduledTasks");
  const ct = useTranslations("common");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(toDateKey(new Date()));
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const listParams: Record<string, string> = { page: String(page), pageSize: "20" };
  if (query) listParams.query = query;
  if (statusFilter) listParams.status = statusFilter;
  if (typeFilter) listParams.taskType = typeFilter;

  const calendarParams: Record<string, string> = {
    pageSize: "1000",
    dateFrom: `${calendarMonth}-01`,
    dateTo: `${calendarMonth}-${String(new Date(Number(calendarMonth.slice(0, 4)), Number(calendarMonth.slice(5, 7)), 0).getDate()).padStart(2, "0")}`,
  };

  const { data, isLoading, isError, error } = useQuery<ListResponse>({
    queryKey: ["scheduled-tasks", listParams],
    queryFn: () => apiClient("/api/scheduled-tasks", { params: listParams }),
  });

  const { data: calendarData } = useQuery<ListResponse>({
    queryKey: ["scheduled-tasks-calendar", calendarParams],
    queryFn: () => apiClient("/api/scheduled-tasks", { params: calendarParams }),
  });

  const { data: customersData } = useQuery<{ customers: CustomerOption[] }>({
    queryKey: ["customers-mini"],
    queryFn: () => apiClient("/api/customers", { params: { pageSize: "1000" } }),
  });

  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ["users-mini"],
    queryFn: () => apiClient("/api/auth/users"),
  });

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      customerId: "",
      title: "",
      description: "",
      taskType: "CIHAZ_ALINACAK" as TaskType,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "PLANLANDI" as TaskStatus,
      assignedUserId: "",
    },
    validate: {
      customerId: (value: string) => (value ? null : t("customerRequired")),
      title: (value: string) => (value.trim() ? null : t("titleRequired")),
      date: (value: string) => (value ? null : t("dateRequired")),
    },
  });

  const customerOptions = (customersData?.customers ?? []).map((customer) => ({
    value: customer.id,
    label: `${customer.name} ${customer.surname}${customer.nickname ? ` (${customer.nickname})` : ""} — ${formatPhone(customer.phone)}`,
  }));

  const userOptions = (usersData?.users ?? []).map((user) => ({
    value: user.id,
    label: `${user.name} ${user.surname}`,
  }));

  const taskTypeOptions = [
    { value: "CIHAZ_ALINACAK", label: t("type_label.CIHAZ_ALINACAK") },
    { value: "CIHAZ_BIRAKILACAK", label: t("type_label.CIHAZ_BIRAKILACAK") },
    { value: "BAKIM", label: t("type_label.BAKIM") },
    { value: "KURULUM", label: t("type_label.KURULUM") },
    { value: "DIGER", label: t("type_label.DIGER") },
  ];

  const statusOptions = [
    { value: "PLANLANDI", label: t("status_label.PLANLANDI") },
    { value: "DEVAM_EDIYOR", label: t("status_label.DEVAM_EDIYOR") },
    { value: "TAMAMLANDI", label: t("status_label.TAMAMLANDI") },
    { value: "IPTAL", label: t("status_label.IPTAL") },
  ];

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (editingTask) {
        return apiClient(`/api/scheduled-tasks/${editingTask.id}`, { method: "PUT", body: values });
      }
      return apiClient("/api/scheduled-tasks", { method: "POST", body: values });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks-calendar"] });
      notifications.show({ title: ct("success"), message: editingTask ? t("updated") : t("created"), color: "green" });
      form.reset();
      setEditingTask(null);
      close();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/api/scheduled-tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks-calendar"] });
      notifications.show({ title: ct("success"), message: t("deleted"), color: "green" });
      setDeleteId(null);
      closeDelete();
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  function openCreateModal() {
    setEditingTask(null);
    form.reset();
    open();
  }

  function openEditModal(task: ScheduledTask) {
    setEditingTask(task);
    form.setValues({
      customerId: task.customer.id,
      title: task.title,
      description: task.description || "",
      taskType: task.taskType,
      date: toDateTimeInputValue(task.date),
      status: task.status,
      assignedUserId: task.assignedUser?.id || "",
    });
    open();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;
  const calendarTasksByDate = (calendarData?.scheduledTasks ?? []).reduce<Record<string, ScheduledTask[]>>((acc, task) => {
    const key = toDateKey(new Date(task.date));
    acc[key] = [...(acc[key] ?? []), task];
    return acc;
  }, {});
  const calendarDays = getMonthDays(calendarMonth);
  const calendarTaskDays = calendarDays.filter((day) => (calendarTasksByDate[day]?.length ?? 0) > 0);
  const calendarTaskCount = calendarData?.total ?? calendarData?.scheduledTasks.length ?? 0;
  const selectedDayHasTasks = (calendarTasksByDate[selectedCalendarDay]?.length ?? 0) > 0;
  const activeCalendarDay = selectedCalendarDay.startsWith(calendarMonth) && (selectedDayHasTasks || calendarTaskDays.length === 0)
    ? selectedCalendarDay
    : calendarTaskDays[0] ?? `${calendarMonth}-01`;

  const { data: activeDayData } = useQuery<ListResponse>({
    queryKey: ["scheduled-tasks-day", activeCalendarDay],
    queryFn: () => apiClient("/api/scheduled-tasks", {
      params: { pageSize: "1000", dateFrom: activeCalendarDay, dateTo: activeCalendarDay },
    }),
  });

  const activeDayTasks = activeDayData?.scheduledTasks ?? calendarTasksByDate[activeCalendarDay] ?? [];
  const activeDayTaskCount = activeDayData?.total ?? activeDayTasks.length;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={2}>
          <Title order={2} fw={800}>{t("title")}</Title>
          <Text size="sm" c="dimmed">{t("pageDescription")}</Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal} w={{ base: "100%", sm: "auto" }}>
          {t("new")}
        </Button>
      </Group>

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list" leftSection={<IconSearch size={14} />}>{t("listView")}</Tabs.Tab>
          <Tabs.Tab value="calendar" leftSection={<IconCalendar size={14} />}>{t("calendarView")}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="md">
          <Stack gap="md">
            <Group wrap="wrap" align="flex-start">
              <TextInput
                placeholder={t("searchPlaceholder")}
                leftSection={<IconSearch size={16} stroke={1.5} />}
                value={query}
                onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }}
                w={{ base: "100%", sm: "auto" }}
                miw={{ sm: 240 }}
                flex={1}
              />
              <Select
                placeholder={t("filterByType")}
                data={taskTypeOptions}
                value={typeFilter}
                onChange={(value) => { setTypeFilter(value); setPage(1); }}
                clearable
                w={{ base: "100%", sm: 190 }}
              />
              <Select
                placeholder={t("filterByStatus")}
                data={statusOptions}
                value={statusFilter}
                onChange={(value) => { setStatusFilter(value); setPage(1); }}
                clearable
                w={{ base: "100%", sm: 180 }}
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
            ) : !data || data.scheduledTasks.length === 0 ? (
              <Card withBorder radius="md" p="xl">
                <Stack align="center" gap="xs">
                  <IconCalendar size={40} stroke={1} opacity={0.3} />
                  <Text size="sm" c="dimmed">{t("noTasks")}</Text>
                  <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                    {t("createFirst")}
                  </Button>
                </Stack>
              </Card>
            ) : (
              <>
                <Stack gap="sm" hiddenFrom="sm">
                  {data.scheduledTasks.map((task) => (
                    <Card key={task.id} withBorder radius="md" p="md">
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={4} style={{ minWidth: 0 }}>
                            <Text size="xs" c="dimmed" fw={600}>
                              {new Date(task.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                            </Text>
                            <Text size="sm" fw={700} lineClamp={1}>{task.title}</Text>
                            {task.description && <Text size="xs" c="dimmed" lineClamp={2}>{task.description}</Text>}
                          </Stack>
                          <Badge size="xs" variant="light" color={statusColors[task.status]}>
                            {t(`status_label.${task.status}`)}
                          </Badge>
                        </Group>

                        <Stack gap={4}>
                          <Group justify="space-between" gap="xs" wrap="nowrap">
                            <Text size="xs" c="dimmed">{t("customer")}</Text>
                            <Anchor component={Link} href={`/customers/${task.customer.id}`} prefetch={false} size="xs" fw={600} lineClamp={1}>
                              {task.customer.name} {task.customer.surname}
                            </Anchor>
                          </Group>
                          <Group justify="space-between" gap="xs" wrap="nowrap">
                            <Text size="xs" c="dimmed">{t("taskType")}</Text>
                            <Badge size="xs" variant="light" color={taskTypeColors[task.taskType]}>{t(`type_label.${task.taskType}`)}</Badge>
                          </Group>
                          <Group justify="space-between" gap="xs" wrap="nowrap">
                            <Text size="xs" c="dimmed">{t("assignedUser")}</Text>
                            <Text size="xs" fw={500} ta="right" lineClamp={1}>
                              {task.assignedUser ? `${task.assignedUser.name} ${task.assignedUser.surname}` : "—"}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">{formatPhone(task.customer.phone)}</Text>
                        </Stack>

                        <Group justify="flex-end" gap="xs">
                          <ActionIcon variant="subtle" color="blue" size="lg" onClick={() => openEditModal(task)} aria-label={ct("edit")}>
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="lg"
                            onClick={() => { setDeleteId(task.id); openDelete(); }}
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
                  <Table.ScrollContainer minWidth={900}>
                    <Table striped>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{t("date")}</Table.Th>
                          <Table.Th>{t("title_field")}</Table.Th>
                          <Table.Th>{t("customer")}</Table.Th>
                          <Table.Th>{t("taskType")}</Table.Th>
                          <Table.Th>{t("status")}</Table.Th>
                          <Table.Th>{t("assignedUser")}</Table.Th>
                          <Table.Th>{ct("actions")}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {data.scheduledTasks.map((task) => (
                          <Table.Tr key={task.id}>
                            <Table.Td>
                              <Text size="sm" fw={600}>{new Date(task.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap={2}>
                                <Text size="sm" fw={600}>{task.title}</Text>
                                {task.description && <Text size="xs" c="dimmed" lineClamp={1}>{task.description}</Text>}
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap={0}>
                                <Anchor component={Link} href={`/customers/${task.customer.id}`} prefetch={false} size="sm" fw={500}>
                                  {task.customer.name} {task.customer.surname}
                                </Anchor>
                                <Text size="xs" c="dimmed">{formatPhone(task.customer.phone)}</Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="sm" variant="light" color={taskTypeColors[task.taskType]}>{t(`type_label.${task.taskType}`)}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="sm" variant="light" color={statusColors[task.status]}>{t(`status_label.${task.status}`)}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{task.assignedUser ? `${task.assignedUser.name} ${task.assignedUser.surname}` : "—"}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs" wrap="nowrap">
                                <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(task)} aria-label={ct("edit")}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => { setDeleteId(task.id); openDelete(); }}
                                  aria-label={ct("delete")}
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
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="calendar" pt="md">
          <Stack gap="md">
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <MonthPickerInput
                label={t("month")}
                value={`${calendarMonth}-01`}
                onChange={(value) => {
                  if (value) {
                    const nextMonth = value.slice(0, 7);
                    setCalendarMonth(nextMonth);
                    setSelectedCalendarDay(`${nextMonth}-01`);
                  }
                }}
                valueFormat="MMMM YYYY"
                dropdownType="modal"
                allowDeselect={false}
                w={{ base: "100%", sm: 260 }}
              />
              <Group gap="xs">
                <Badge variant="light" color="blue" size="lg">
                  {t("taskCount", { count: calendarTaskCount })}
                </Badge>
                <Badge variant="light" color="gray" size="lg">
                  {t("busyDayCount", { count: calendarTaskDays.length })}
                </Badge>
              </Group>
            </Group>

            <div className={classes.calendarLayout}>
              <Card withBorder radius="lg" p="md" className={classes.dayRailCard}>
                <Stack gap="sm">
                  <Text size="sm" fw={800}>{t("daysWithTasks")}</Text>
                  {calendarTaskDays.length === 0 ? (
                    <Text size="sm" c="dimmed">{t("noTaskForMonth")}</Text>
                  ) : (
                    <div className={classes.dayRail}>
                      {calendarTaskDays.map((day) => {
                        const dayTasks = calendarTasksByDate[day] ?? [];
                        const isActive = day === activeCalendarDay;
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`${classes.dayButton} ${isActive ? classes.dayButtonActive : ""}`}
                            onClick={() => setSelectedCalendarDay(day)}
                          >
                            <span className={classes.dayButtonDate}>
                              {new Date(day).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                            </span>
                            <span className={classes.dayButtonWeekday}>
                              {new Date(day).toLocaleDateString("tr-TR", { weekday: "long" })}
                            </span>
                            <span className={classes.dayButtonCount}>{t("taskCount", { count: dayTasks.length })}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Stack>
              </Card>

              <Card withBorder radius="lg" p="md" className={classes.agendaCard}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                    <Stack gap={2}>
                      <Text size="lg" fw={900}>
                        {new Date(activeCalendarDay).toLocaleDateString("tr-TR", { day: "2-digit", month: "long" })}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {new Date(activeCalendarDay).toLocaleDateString("tr-TR", { weekday: "long" })}
                      </Text>
                    </Stack>
                    <Badge variant="light" color="blue" size="lg">
                      {t("taskCount", { count: activeDayTaskCount })}
                    </Badge>
                  </Group>

                  {activeDayTasks.length === 0 ? (
                    <Stack align="center" gap="xs" py="xl">
                      <IconCalendar size={40} stroke={1} opacity={0.35} />
                      <Text size="sm" c="dimmed">{t("noTaskForDay")}</Text>
                    </Stack>
                  ) : (
                    <Stack gap="sm">
                      {activeDayTasks.map((task) => (
                        <Card key={task.id} withBorder radius="md" p="md" className={`${classes.agendaTask} ${statusClassNames[task.status]}`}>
                          <Stack gap="sm">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                              <Stack gap={4} style={{ minWidth: 0 }}>
                                <Group gap="xs" wrap="nowrap">
                                  <Text fw={900} size="lg">{toTimeLabel(task.date)}</Text>
                                  <Badge size="sm" variant="light" color={statusColors[task.status]}>{t(`status_label.${task.status}`)}</Badge>
                                  <Badge size="sm" variant="outline" color={taskTypeColors[task.taskType]}>{t(`type_label.${task.taskType}`)}</Badge>
                                </Group>
                                <Text fw={800} size="md" lineClamp={2}>{task.title}</Text>
                              </Stack>
                              <Group gap={4} wrap="nowrap">
                                <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(task)} aria-label={ct("edit")}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => { setDeleteId(task.id); openDelete(); }}
                                  aria-label={ct("delete")}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>

                            <Group gap="lg" align="flex-start" wrap="wrap">
                              <Stack gap={2} className={classes.detailBlock}>
                                <Text size="xs" c="dimmed">{t("customer")}</Text>
                                <Anchor component={Link} href={`/customers/${task.customer.id}`} prefetch={false} size="sm" fw={700}>
                                  {task.customer.name} {task.customer.surname}
                                </Anchor>
                                <Text size="xs" c="dimmed">{formatPhone(task.customer.phone)}</Text>
                              </Stack>
                              <Stack gap={2} className={classes.detailBlock}>
                                <Text size="xs" c="dimmed">{t("assignedUser")}</Text>
                                <Text size="sm" fw={600}>{task.assignedUser ? `${task.assignedUser.name} ${task.assignedUser.surname}` : "—"}</Text>
                              </Stack>
                            </Group>

                            {task.description && (
                              <Text size="sm" c="dimmed">{task.description}</Text>
                            )}
                            {task.customer.address && (
                              <Text size="xs" c="dimmed">{task.customer.address}</Text>
                            )}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </div>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={() => { form.reset(); setEditingTask(null); close(); }}
        title={editingTask ? t("edit") : t("new")}
        radius="lg"
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput label={t("title_field")} placeholder={t("titlePlaceholder")} key={form.key("title")} {...form.getInputProps("title")} required />
            <Select
              label={t("customer")}
              placeholder={t("customerPlaceholder")}
              data={customerOptions}
              key={form.key("customerId")}
              {...form.getInputProps("customerId")}
              searchable
              required
              nothingFoundMessage={ct("noResults")}
            />
            <Group grow>
              <Select label={t("taskType")} data={taskTypeOptions} key={form.key("taskType")} {...form.getInputProps("taskType")} required />
              <Select label={t("status")} data={statusOptions} key={form.key("status")} {...form.getInputProps("status")} required />
            </Group>
            <DateTimePicker
              label={t("date")}
              valueFormat="DD.MM.YYYY HH:mm"
              dropdownType="modal"
              key={form.key("date")}
              {...form.getInputProps("date")}
              required
            />
            <Select
              label={t("assignedUser")}
              placeholder={t("assignedUserPlaceholder")}
              data={userOptions}
              key={form.key("assignedUserId")}
              {...form.getInputProps("assignedUserId")}
              searchable
              clearable
              nothingFoundMessage={ct("noResults")}
            />
            <Textarea
              label={t("description")}
              placeholder={t("descriptionPlaceholder")}
              autosize
              minRows={3}
              key={form.key("description")}
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => { form.reset(); setEditingTask(null); close(); }}>{ct("cancel")}</Button>
              <Button type="submit" loading={saveMutation.isPending}>{ct("save")}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title={ct("confirm")} centered>
        <Stack>
          <Text size="sm">{t("deleteConfirm")}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDelete}>{ct("cancel")}</Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); }}>
              {ct("delete")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
