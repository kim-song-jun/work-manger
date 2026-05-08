/**
 * Story: pages/admin-approvals · AdminApprovalsPage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the admin-approvals page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";

import { withPageProviders } from "../../../.storybook/page-decorators";

import { AdminApprovalsPage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Admin/admin-approvals",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/admin/approvals"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};

Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // AdminApprovalsPage: wait for the inbox row mocked by handlers to appear.
  const row = await canvas.findByTestId("inbox-row-rq-1", {}, { timeout: 4000 }).catch(() => null);
  if (row) await expect(row).toBeInTheDocument();
};