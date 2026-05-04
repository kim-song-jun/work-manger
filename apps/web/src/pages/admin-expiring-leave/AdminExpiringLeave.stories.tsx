/**
 * Story: pages/admin-expiring-leave · AdminExpiringLeavePage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the admin-expiring-leave page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { withPageProviders } from "../../../.storybook/page-decorators";
import { AdminExpiringLeavePage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Admin/admin-expiring-leave",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/admin/expiring-leave"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};