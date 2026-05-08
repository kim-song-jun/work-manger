import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LoginForm } from "./LoginForm";

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta: Meta<typeof LoginForm> = {
  title: "features/auth/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};
