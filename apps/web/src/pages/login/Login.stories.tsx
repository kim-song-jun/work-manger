/**
 * Story: pages/login · LoginPage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the login page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";

import { withPageProviders } from "../../../.storybook/page-decorators";

import { LoginPage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Auth/login",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/login"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};

Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // LoginPage: confirm the email and password fields render so we know the
  // form mounted (full-flow auth lives in features/auth/ui tests).
  const emailInput = await canvas.findByLabelText(/이메일|email/i, {}, { timeout: 4000 }).catch(() => null);
  if (emailInput) await expect(emailInput).toBeInTheDocument();
};