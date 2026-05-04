/**
 * Story: pages/m-inbox · InboxPage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the m-inbox page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { withPageProviders } from "../../../.storybook/page-decorators";
import { InboxPage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Mobile/inbox",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/inbox"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};