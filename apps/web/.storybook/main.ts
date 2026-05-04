import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Glob already covers page stories (src/pages/**/*.stories.tsx).
  stories: [
    "../src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    // Surfaces MSW request handlers in the Storybook UI panel; the actual
    // worker registration happens in `.storybook/preview.ts`.
    "msw-storybook-addon",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: false },
  core: { disableTelemetry: true },
};

export default config;
