/**
 * Test: features/admin-approve-batch · BulkActionBar
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Bulk-action bar gates destructive operations on the approval queue.
 *       It must stay disabled when nothing is selected (no accidental clicks)
 *       and forward clicks to the right handler when items are selected.
 * Covers:
 *   - Both buttons disabled when selectedCount === 0
 *   - Approve and reject handlers fire when count > 0
 *   - Selected count text reflects the prop
 * Out of scope:
 *   - The actual fan-out (covered by batchDecide via page test)
 *   - Loading spinner (left to disabled prop semantics)
 * Coverage target: 100% branches for BulkActionBar.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@shared/i18n";
import { BulkActionBar } from "../BulkActionBar";

describe("features/admin-approve-batch · BulkActionBar", () => {
  it("disables both buttons when selectedCount is 0", () => {
    render(
      <BulkActionBar
        selectedCount={0}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );
    const approve = screen.getByRole("button", { name: /일괄 승인|Approve selected/ });
    const reject = screen.getByRole("button", { name: /일괄 반려|Reject selected/ });
    expect(approve).toBeDisabled();
    expect(reject).toBeDisabled();
  });

  it("fires onApprove and onReject when count > 0", async () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(
      <BulkActionBar
        selectedCount={3}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /일괄 승인|Approve selected/ }));
    expect(onApprove).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: /일괄 반려|Reject selected/ }));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("displays the selected count using the i18n template", () => {
    render(
      <BulkActionBar
        selectedCount={7}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );
    expect(screen.getByTestId("bulk-action-count").textContent).toMatch(/7/);
  });
});
