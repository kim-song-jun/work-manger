/**
 * Story: pages/m-help · HelpPage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the m-help page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { withPageProviders } from "../../../.storybook/page-decorators";
import { HelpPage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Mobile/help",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/help"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};