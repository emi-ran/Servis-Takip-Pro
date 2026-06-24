"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Button, Container, Paper, PasswordInput, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconBuildingStore, IconLock, IconUserShield } from "@tabler/icons-react";
import { useRouter } from "@/lib/navigation";
import { LogoMark } from "@/components/ui/logo-mark";
import classes from "./page.module.css";

interface SetupValues {
  companyName: string;
  companySlug: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  adminSurname: string;
}

function normalizeSlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function SetupForm() {
  const t = useTranslations("setup");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SetupValues>({
    mode: "uncontrolled",
    initialValues: {
      companyName: "",
      companySlug: "",
      adminEmail: "",
      adminPassword: "",
      adminName: "",
      adminSurname: "",
    },
    validate: {
      companyName: (value) => (value.trim().length < 1 ? t("companyNameRequired") : null),
      companySlug: (value) => {
        const slug = normalizeSlug(value);
        return slug.length > 0 && /^[a-z0-9-]+$/.test(slug) ? null : t("companySlugInvalid");
      },
      adminEmail: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : t("emailInvalid")),
      adminPassword: (value) => (value.length < 8 ? t("passwordInvalid") : null),
      adminName: (value) => (value.trim().length < 1 ? t("adminNameRequired") : null),
      adminSurname: (value) => (value.trim().length < 1 ? t("adminSurnameRequired") : null),
    },
  });

  async function handleSubmit(values: SetupValues) {
    setLoading(true);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          companyName: values.companyName.trim(),
          companySlug: normalizeSlug(values.companySlug),
          adminEmail: values.adminEmail.trim().toLowerCase(),
          adminName: values.adminName.trim(),
          adminSurname: values.adminSurname.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        notifications.show({
          color: "red",
          title: tc("errorTitle"),
          message: data.message || tc("error"),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: tc("success"),
        message: t("successMessage"),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: tc("errorTitle"),
        message: tc("error"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className={classes.shell}>
      <Container size="lg" className={classes.container}>
        <Paper className={classes.panel} radius="xl" shadow="xl">
          <Box className={classes.brandSide}>
            <Stack gap="lg" className={classes.brandContent}>
              <LogoMark size={56} />
              <Box>
                <Title order={1} className={classes.title}>{t("title")}</Title>
                <Text className={classes.subtitle}>{t("subtitle")}</Text>
              </Box>
              <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" className={classes.metrics}>
                <Box className={classes.metric}><IconBuildingStore size={19} stroke={1.7} /><Text size="xs" fw={700}>{t("metricCompany")}</Text></Box>
                <Box className={classes.metric}><IconUserShield size={19} stroke={1.7} /><Text size="xs" fw={700}>{t("metricAdmin")}</Text></Box>
                <Box className={classes.metric}><IconLock size={19} stroke={1.7} /><Text size="xs" fw={700}>{t("metricSafe")}</Text></Box>
              </SimpleGrid>
            </Stack>
          </Box>

          <Box className={classes.formSide}>
            <Stack gap="xs" mb="xl">
              <Text className={classes.eyebrow}>{t("eyebrow")}</Text>
              <Title order={2} className={classes.formTitle}>{t("formTitle")}</Title>
              <Text c="dimmed" size="sm">{t("formDescription")}</Text>
            </Stack>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput label={t("companyName")} placeholder={t("companyNamePlaceholder")} key={form.key("companyName")} {...form.getInputProps("companyName")} disabled={loading} required size="md" />
                <TextInput
                  label={t("companySlug")}
                  placeholder={t("companySlugPlaceholder")}
                  key={form.key("companySlug")}
                  {...form.getInputProps("companySlug")}
                  disabled={loading}
                  required
                  size="md"
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput label={t("adminName")} key={form.key("adminName")} {...form.getInputProps("adminName")} disabled={loading} required size="md" />
                  <TextInput label={t("adminSurname")} key={form.key("adminSurname")} {...form.getInputProps("adminSurname")} disabled={loading} required size="md" />
                </SimpleGrid>
                <TextInput label={t("adminEmail")} placeholder={t("adminEmailPlaceholder")} key={form.key("adminEmail")} {...form.getInputProps("adminEmail")} disabled={loading} required size="md" />
                <PasswordInput label={t("adminPassword")} placeholder={t("adminPasswordPlaceholder")} key={form.key("adminPassword")} {...form.getInputProps("adminPassword")} disabled={loading} required size="md" />
                <Button type="submit" fullWidth size="md" loading={loading} className={classes.submitButton}>{t("submit")}</Button>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
