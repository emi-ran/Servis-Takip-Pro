import { mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { ColorSchemeScript } from "@/components/layout/color-scheme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servis Takip",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
