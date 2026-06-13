import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { QueryProvider } from "@/components/providers/query-provider";

type Props = {
  children: React.ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider>
            <Notifications />
            <QueryProvider>
              {children}
            </QueryProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
