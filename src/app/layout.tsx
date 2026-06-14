import { mantineHtmlProps } from "@mantine/core";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <body>{children}</body>
    </html>
  );
}
