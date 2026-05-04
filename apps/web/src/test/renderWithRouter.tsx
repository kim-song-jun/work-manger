/**
 * Test util: render a component inside a MemoryRouter for components
 * that depend on react-router-dom (e.g. NavLink, Link).
 *
 * Why a wrapper: keeps individual test files terse and avoids each test
 * needing to import / configure the router boilerplate themselves.
 */
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, type RenderOptions } from "@testing-library/react";

export function renderWithRouter(
  ui: ReactElement,
  { route = "/", ...options }: { route?: string } & RenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    ),
    ...options,
  });
}
