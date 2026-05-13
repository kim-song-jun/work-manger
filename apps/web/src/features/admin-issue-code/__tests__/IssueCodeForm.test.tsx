/**
 * Test: features/admin-issue-code · IssueCodeForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  관리자 발급 폼은 단순하지만 잘못된 제출(빈 값 → null 전송, 권한 거부 토스트)
 *       회귀가 발생하면 invite 흐름이 깨진다. B-CODE-04 (backlog) acceptance —
 *       admin-issue-code feature 에 최소 2 vitest case (정상 발급 / 권한 거부).
 * Covers:
 *   - 빈 max_uses + 빈 expires_at 으로 제출 시 createCompanyCode 가 null/null 전달
 *   - max_uses 입력 시 numeric coercion
 *   - 권한 거부 (mutation 실패) 시 에러 표시
 * Out of scope:
 *   - 발급 후 코드 카드 표시 → 부모 AdminCodesPage 책임
 *   - i18n key 전환 → 별도 i18n parity 테스트
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { IssueCodeForm } from "../ui/IssueCodeForm";
import "@shared/i18n";

type CreateCompanyCodeArg = { max_uses: number | null; expires_at: string | null };
type CompanyCodeResp = {
  id: string;
  code: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};
const createCompanyCodeMock = vi.fn<(arg: CreateCompanyCodeArg) => Promise<CompanyCodeResp>>(async () => ({
  id: "c1",
  code: "ABCDEF",
  max_uses: null,
  uses: 0,
  expires_at: null,
  revoked_at: null,
  created_at: "2026-05-13T00:00:00Z",
}));

vi.mock("@entities/company-code", async () => ({
  createCompanyCode: (arg: CreateCompanyCodeArg) => createCompanyCodeMock(arg),
}));

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <IssueCodeForm />
    </QueryClientProvider>,
  );
}

describe("IssueCodeForm", () => {
  beforeEach(() => {
    createCompanyCodeMock.mockClear();
  });

  it("submits with null max_uses and null expires_at when both empty", async () => {
    // Why: 두 옵션 모두 비워두면 BE 가 무제한 / 만료 없음으로 해석.
    //      문자열 "" 가 아니라 null 로 보내야 한다.
    renderForm();
    const submit = screen.getByRole("button", { name: /발급|issue/i });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(createCompanyCodeMock).toHaveBeenCalledTimes(1);
    });
    expect(createCompanyCodeMock).toHaveBeenCalledWith({
      max_uses: null,
      expires_at: null,
    });
  });

  it("coerces max_uses string to number on submit", async () => {
    renderForm();
    const inputs = screen.getAllByRole("spinbutton");
    await userEvent.type(inputs[0], "10");
    const submit = screen.getByRole("button", { name: /발급|issue/i });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(createCompanyCodeMock).toHaveBeenCalledWith({
        max_uses: 10,
        expires_at: null,
      });
    });
  });

  it("surfaces a permission / failure error message when the mutation rejects", async () => {
    // Why: ADMIN 권한 없는 사용자가 호출하면 403. UI 는 에러 상태를 노출해야 한다.
    createCompanyCodeMock.mockImplementationOnce(async () => {
      throw new Error("permission_denied");
    });
    renderForm();
    const submit = screen.getByRole("button", { name: /발급|issue/i });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(document.body.textContent ?? "").toMatch(/permission_denied|Error/);
    });
  });
});
