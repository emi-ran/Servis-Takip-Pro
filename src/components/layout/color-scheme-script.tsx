export function ColorSchemeScript() {
  return (
    <script
      id="mantine-color-scheme"
      dangerouslySetInnerHTML={{
        __html: `
        try {
          var mantineColorScheme = localStorage.getItem("mantine-color-scheme-value");
          if (mantineColorScheme) {
            document.documentElement.setAttribute("data-mantine-color-scheme", mantineColorScheme);
          } else {
            var mantinePrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute(
              "data-mantine-color-scheme",
              mantinePrefersDark ? "dark" : "light"
            );
          }
        } catch(e) {}
      `,
      }}
    />
  );
}
