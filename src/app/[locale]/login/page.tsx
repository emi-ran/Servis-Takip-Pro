"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Card,
  Title,
  Container,
  Stack,
  Text,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconTool, IconLock } from "@tabler/icons-react";
import { useState } from "react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: "uncontrolled" as const,
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (v: string) => (/^[^\s@]+@[^\s@]+$/.test(v) ? null : "Geçerli bir e-posta girin"),
      password: (v: string) => (v.length < 1 ? "Şifre gerekli" : null),
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
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Hata",
        message: tc("error"),
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--mantine-color-gray-light)",
      }}
    >
      <Container size={400} px="md">
        <Card
          withBorder
          shadow="xl"
          p="xl"
          radius="lg"
          style={{
            borderColor: "var(--mantine-color-default-border)",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Stack align="center" gap="xs" mb="lg">
            <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: "blue", to: "cyan" }}>
              <IconTool size={26} stroke={1.5} />
            </ThemeIcon>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {tc("appName")}
            </Title>
            <Text c="dimmed" size="xs" fw={500}>
              {t("profile")}
            </Text>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label={t("email")}
                placeholder="admin@ornek.com"
                key={form.key("email")}
                {...form.getInputProps("email")}
                disabled={loading}
                required
                styles={{
                  label: { fontWeight: 500, marginBottom: "4px" }
                }}
              />
              <PasswordInput
                label={t("password")}
                placeholder="••••••••"
                key={form.key("password")}
                {...form.getInputProps("password")}
                disabled={loading}
                required
                leftSection={<IconLock size={16} stroke={1.5} />}
                styles={{
                  label: { fontWeight: 500, marginBottom: "4px" }
                }}
              />
              <Button type="submit" fullWidth mt="md" size="md" loading={loading}>
                {t("login")}
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    </Box>
  );
}

