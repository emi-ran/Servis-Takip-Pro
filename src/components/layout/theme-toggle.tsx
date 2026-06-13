"use client";

import { useState, useEffect } from "react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ width: 36, height: 36 }} />;
  }

  return (
    <ActionIcon
      onClick={() => setColorScheme(colorScheme === "light" ? "dark" : "light")}
      variant="default"
      size="md"
      radius="md"
      aria-label="Toggle color scheme"
    >
      {colorScheme === "light" ? (
        <IconMoon size={18} stroke={1.5} />
      ) : (
        <IconSun size={18} stroke={1.5} />
      )}
    </ActionIcon>
  );
}
