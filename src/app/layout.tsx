import { mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
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
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
