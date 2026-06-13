import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, mantineHtmlProps } from "@mantine/core";
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
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <Notifications />
            <QueryProvider>{children}</QueryProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


