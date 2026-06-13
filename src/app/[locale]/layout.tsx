import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/tr";

import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { QueryProvider } from "@/components/providers/query-provider";
import { ColorSchemeScript } from "@/components/layout/color-scheme-script";
import { theme } from "@/theme";

type Props = {
  children: React.ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ColorSchemeScript />
        <Notifications />
        <DatesProvider settings={{ locale: "tr", firstDayOfWeek: 1, weekendDays: [0, 6] }}>
          <QueryProvider>{children}</QueryProvider>
        </DatesProvider>
      </MantineProvider>
    </NextIntlClientProvider>
  );
}
