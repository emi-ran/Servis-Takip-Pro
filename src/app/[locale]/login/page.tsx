"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Stack,
  Center,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { notifications } from "@mantine/notifications";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const form = useForm<FormValues>({
    validate: zodResolver(schema),
    initialValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: FormValues) {
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
      });
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Container size={420} my={80}>
      <Center>
        <Title order={1} mb="lg">
          Servis Takip
        </Title>
      </Center>
      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label={t("email")}
              placeholder="admin@ornek.com"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("password")}
              placeholder="••••••••"
              {...form.getInputProps("password")}
            />
            <Button type="submit" fullWidth mt="sm">
              {t("login")}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
