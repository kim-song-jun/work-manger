/**
 * Story: pages/onboarding-company-code · CompanyCodePage
 * Type: Visual (Storybook + msw)
 * Why:  Renders the onboarding-company-code page in isolation so visual regressions can be
 *       caught by chromatic and design QA can flip themes/backgrounds.
 *       Network calls fall through to msw handlers in src/test/msw/handlers.ts.
 * Out of scope:
 *   - Stateful flows / form submission (covered by RTL unit tests)
 *   - Real backend integration (covered by Playwright e2e)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { withPageProviders } from "../../../.storybook/page-decorators";
import { CompanyCodePage as Page } from "./index";
const meta: Meta<typeof Page> = {
  title: "Pages/Onboarding/company-code",
  component: Page,
  parameters: { layout: "fullscreen" },
  decorators: [withPageProviders(["/onboarding/company-code"])],
};
export default meta;
type Story = StoryObj<typeof Page>;
export const Default: Story = {};