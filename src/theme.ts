import { createTheme } from "@mantine/core";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const theme = createTheme({
  fontFamily: inter.style.fontFamily,
  headings: {
    fontFamily: inter.style.fontFamily,
    fontWeight: "600",
  },
  primaryColor: "blue",
  defaultRadius: "md",
  components: {
    Card: {
      defaultProps: {
        radius: "md",
        withBorder: true,
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
export type Theme = typeof theme;
