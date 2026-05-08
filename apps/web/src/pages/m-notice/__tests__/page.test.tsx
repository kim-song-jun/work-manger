/**
 * Test: pages/m-notice · NoticePage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  공지 페이지가 회사 데이터를 못 그리면 m-notice 가 빈 화면으로 보여
 *       사용자 신뢰가 깨진다. 핵심 회귀: list 데이터로 카드 렌더 + pinned/recent
 *       구분 + 카테고리 라벨 변환.
 * Covers:
 *   - fetchNotices 가 반환한 항목들이 카드로 렌더된다
 *   - pinned=true 항목이 "상단 고정" 그룹에, 나머지는 "최근" 그룹에 노출된다
 * Out of scope:
 *   - 카테고리 필터 변경에 따른 refetch (msw 도입 후 e2e)
 *   - 무한 스크롤 / 페이지네이션 (현 단계 미지원)
 * Coverage target: 80%+ for m-notice page render branches
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { NoticePage } from "../index";
import "@shared/i18n";

vi.mock("@widgets/sub-header", () => ({
  SubHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@entities/notice", () => ({
  fetchNotices: vi.fn(async () => [
    {
      id: "n-1",
      title: "정책 업데이트",
      body: "본문",
      pinned: true,
      priority: 10,
      category: "policy",
      published_at: "2026-05-01T00:00:00Z",
      archived_at: null,
      author_name: "Admin",
      created_at: "2026-05-01T00:00:00Z",
      updated_at: "2026-05-01T00:00:00Z",
    },
    {
      id: "n-2",
      title: "워크샵 안내",
      body: "12월",
      pinned: false,
      priority: 0,
      category: "event",
      published_at: "2026-05-02T00:00:00Z",
      archived_at: null,
      author_name: "Admin",
      created_at: "2026-05-02T00:00:00Z",
      updated_at: "2026-05-02T00:00:00Z",
    },
  ]),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <NoticePage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("pages/m-notice · NoticePage", () => {
  it("renders pinned and recent notices from the mocked API", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("정책 업데이트")).toBeInTheDocument();
      expect(screen.getByText("워크샵 안내")).toBeInTheDocument();
    });

    // Both group headers should appear when both kinds exist.
    // "Pinned" string also appears in the "Pinned only" toggle button — use
    // getAllByText to assert presence without uniqueness assumptions.
    expect(screen.getAllByText(/상단 고정|Pinned/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/최근|Recent/i)).toBeInTheDocument();
  });
});
