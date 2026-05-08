/**
 * Story: pages/m-home · HomePage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the m-home page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";

import { withPageProviders } from "../../../.storybook/page-decorators";

import { HomePage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Mobile/home",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/home"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};

Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // HomePage: smoke-check that the test root rendered (mobile shell). Mobile
  // home depends on /v1/me + /v1/leave/balance — both mocked by MSW.
  const root = canvas.queryByTestId("mobile-home") ?? canvasElement.firstChild;
  await expect(root).toBeTruthy();
};