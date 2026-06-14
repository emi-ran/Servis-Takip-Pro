"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Select,
  Textarea,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter, Link } from "@/lib/navigation";
import { apiClient } from "@/lib/api";
import { formatPhone } from "@/lib/phone";

type Customer = { id: string; name: string; surname: string; nickname: string | null; phone: string };
type Device = { id: string; brand: string; model: string; category: string; serialNo: string };

export default function NewServiceRecordPage() {
  const t = useTranslations("serviceRecords");
  const ct = useTranslations("common");
  const router = useRouter();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: { customerId: "", deviceId: "", faultDescription: "", priority: "NORMAL" },
    validate: {
      customerId: (v: string) => (v.length < 1 ? t("customerRequired") : null),
      deviceId: (v: string) => (v.length < 1 ? t("deviceRequired") : null),
      faultDescription: (v: string) => (v.length < 1 ? t("faultRequired") : null),
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

  const customerOptions = (customersData?.customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} ${c.surname}${c.nickname ? ` (${c.nickname})` : ""} — ${formatPhone(c.phone)}`,
  }));

  const deviceOptions = (devicesData?.devices ?? []).map((d) => ({
    value: d.id,
    label: `${d.brand} ${d.model} — ${d.category}${d.serialNo ? ` (${d.serialNo})` : ""}`,
  }));

  const createMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      apiClient<{ serviceRecord: { id: string } }>("/api/service-records", {
        method: "POST",
        body: values,
      }),
    onSuccess: (data) => {
      notifications.show({ title: ct("success"), message: t("created"), color: "green" });
      router.push(`/service-records/${data.serviceRecord.id}`);
    },
    onError: (err: Error) => {
      notifications.show({ title: ct("errorTitle"), message: err.message, color: "red" });
    },
  });

  return (
    <>
      <Group mb="lg">
        <Button
          variant="subtle"
          component={Link}
          href="/service-records"
          leftSection={<IconArrowLeft size={16} />}
        >
          {t("backToList")}
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="xl" maw={640}>
        <form
          autoComplete="nope"
          onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
        >
          <Stack gap="lg">
            <Title order={3} fw={700}>
              {t("new")}
            </Title>
            <Text size="sm" c="dimmed">
              {t("createDescription")}
            </Text>

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
                setSelectedCustomerId(value || "");
              }}
            />

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

            <Group justify="flex-end" mt="md">
              <Button variant="default" component={Link} href="/service-records">
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
      </Card>
    </>
  );
}
