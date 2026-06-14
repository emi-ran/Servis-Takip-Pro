"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Container,
  Stack,
  Text,
  Box,
  Paper,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendarCheck, IconDeviceLaptop, IconLock, IconShieldCheck } from "@tabler/icons-react";
import { LogoMark } from "@/components/ui/logo-mark";
import classes from "./page.module.css";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${t("login")} - ${tc("appName")}`;
  }, [t, tc]);

  useEffect(() => {
    async function redirectToSetupIfNeeded() {
      const response = await fetch("/api/setup", { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      if (data.canSetup) {
        router.replace("/setup");
      }
    }

    void redirectToSetupIfNeeded();
  }, [router]);

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (v: string) => (/^[^\s@]+@[^\s@]+$/.test(v) ? null : t("emailInvalid")),
      password: (v: string) => (v.length < 1 ? t("passwordRequired") : null),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        notifications.show({
          color: "red",
          title: "Hata",
          message: data.message || t("loginError"),
          autoClose: 5000,
        });
        return;
      }

      router.push("/dashboard");
    } catch {
      notifications.show({
        color: "red",
        title: tc("errorTitle"),
        message: tc("error"),
        autoClose: 5000,
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
            <Badge className={classes.badge} variant="light" color="blue">
              {t("badge")}
            </Badge>
            <Stack gap="lg" className={classes.brandContent}>
              <Box className={classes.logoWrap}>
                <LogoMark size={56} />
              </Box>
              <Box>
                <Title order={1} className={classes.title}>
                  {tc("appName")}
                </Title>
                <Text className={classes.subtitle}>{t("subtitle")}</Text>
              </Box>
              <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" className={classes.metrics}>
                <Box className={classes.metric}>
                  <IconDeviceLaptop size={19} stroke={1.7} />
                  <Text size="xs" fw={700}>{t("metricDevices")}</Text>
                </Box>
                <Box className={classes.metric}>
                  <IconCalendarCheck size={19} stroke={1.7} />
                  <Text size="xs" fw={700}>{t("metricTasks")}</Text>
                </Box>
                <Box className={classes.metric}>
                  <IconShieldCheck size={19} stroke={1.7} />
                  <Text size="xs" fw={700}>{t("metricSecure")}</Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </Box>

          <Box className={classes.formSide}>
            <Stack gap="xs" mb="xl">
              <Text className={classes.eyebrow}>{t("formEyebrow")}</Text>
              <Title order={2} className={classes.formTitle}>{t("formTitle")}</Title>
              <Text c="dimmed" size="sm">{t("formDescription")}</Text>
            </Stack>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label={t("email")}
                  placeholder={t("emailPlaceholder")}
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                  disabled={loading}
                  required
                  size="md"
                  classNames={{ label: classes.inputLabel }}
                />
                <PasswordInput
                  label={t("password")}
                  placeholder={t("passwordPlaceholder")}
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                  disabled={loading}
                  required
                  size="md"
                  leftSection={<IconLock size={16} stroke={1.7} />}
                  classNames={{ label: classes.inputLabel }}
                />
                <Button type="submit" fullWidth size="md" loading={loading} className={classes.submitButton}>
                  {t("login")}
                </Button>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
