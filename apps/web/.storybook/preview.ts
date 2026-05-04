import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/shared/styles/tokens.css";
import "../src/shared/styles/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "ink-50",
      values: [
        { name: "white", value: "#FFFFFF" },
        { name: "ink-50", value: "#F9FAFB" },
        { name: "ink-100", value: "#F2F4F6" },
        { name: "dark", value: "#131720" },
      ],
    },
    layout: "centered",
    controls: { expanded: true },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "theme-dark",
        mint: "theme-mint",
        violet: "theme-violet",
        coral: "theme-coral",
      },
      defaultTheme: "light",
      parentSelector: "body",
    }),
  ],
};

export default preview;
