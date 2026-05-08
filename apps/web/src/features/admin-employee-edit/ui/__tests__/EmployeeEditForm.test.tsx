/**
 * Test: features/admin-employee-edit · EmployeeEditForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Permission/role mutations are high-blast-radius (a wrong role removes
 *       the OWNER's only admin). zod schema enforces role required + length
 *       limits; this test guards both the validation and the submit payload.
 * Covers:
 *   - Submits clean defaults to onSubmit unchanged
 *   - Position over 50 chars surfaces position error and blocks submit
 *   - Toggling active calls onSubmit with active=false
 * Out of scope:
 *   - Network failure paths (handled by mutation hook in page)
 *   - Role guard on backend side (server-only)
 * Coverage target: ≥ 90% lines for EmployeeEditForm.tsx + schema.ts
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@shared/i18n";
import { EmployeeEditForm } from "../EmployeeEditForm";
import type { EmployeeEditValues } from "../../model/schema";

const baseDefaults: EmployeeEditValues = {
  role: "EMPLOYEE",
  position: "백엔드",
  department: "엔지니어링",
  active: true,
};

describe("features/admin-employee-edit · EmployeeEditForm", () => {
  it("submits defaults unchanged when user just clicks save", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeEditForm defaultValues={baseDefaults} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /저장|Save/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      role: "EMPLOYEE",
      position: "백엔드",
      department: "엔지니어링",
      active: true,
    });
  });

  it("blocks submit and surfaces error when position exceeds 50 chars", async () => {
    const onSubmit = vi.fn();
    render(
      <EmployeeEditForm
        defaultValues={{ ...baseDefaults, position: "" }}
        onSubmit={onSubmit}
      />,
    );
    const positionInput = screen.getByLabelText(/직책|Position/);
    await userEvent.type(positionInput, "x".repeat(51));
    await userEvent.click(screen.getByRole("button", { name: /저장|Save/ }));
    await waitFor(() => {
      expect(screen.getByText(/50자|50 chars/)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("toggles active=false when the active checkbox is clicked", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeEditForm defaultValues={baseDefaults} onSubmit={onSubmit} />);
    const checkbox = screen.getByLabelText(/활성|Active/);
    await userEvent.click(checkbox);
    await userEvent.click(screen.getByRole("button", { name: /저장|Save/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ active: false });
  });
});
