import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/shared/styles/tokens.css";
import "../src/shared/styles/index.css";
import "../src/shared/i18n";
// B-CODE-07: import handlers from the per-entity shared registry directly.
// The legacy `src/test/msw/handlers.ts` re-exports the same list for vitest.
import { handlers } from "../src/shared/msw/handlers";

// Boots the MSW worker for the Storybook iframe. Default handlers come from the
// shared registry used by Vitest, so a story renders the same data shape as a
// unit test by default. Stories override per-test via `parameters.msw.handlers`.
initialize({
  onUnhandledRequest: "bypass",
  serviceWorker: { url: "./mockServiceWorker.js" },
});

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
    msw: { handlers },
  },
  loaders: [mswLoader],
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
