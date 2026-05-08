/**
 * Test: entities/trip · createTrip
 * Type: Unit (vitest, jsdom)
 * Why:  m-trip submission must POST to /v1/trip/requests with the exact JSON
 *       body the backend expects; a regression here causes silent 4xx and
 *       sends users into a confusing "submitting…" loop without feedback.
 * Covers:
 *   - POSTs to /v1/trip/requests with method=POST and JSON body
 *   - Returns the data envelope payload
 *   - Surfaces non-2xx as HttpError
 * Out of scope:
 *   - Toast / mutation wiring (covered in TripRequestForm tests)
 *   - End-to-end approval cycle (BE integration test)
 * Coverage target: 100% lines for createTrip.ts
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTrip } from "../createTrip";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 201,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/trip · createTrip", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts the body to /v1/trip/requests as JSON", async () => {
    const spy = mockFetchOnce({
      data: {
        id: "trip-1",
        kind: "BUSINESS_TRIP",
        start_date: "2026-06-01",
        end_date: "2026-06-02",
        location_label: "Busan",
        purpose: "Client meeting",
        status: "PENDING",
        decided_at: null,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
    });

    const trip = await createTrip({
      kind: "BUSINESS_TRIP",
      start_date: "2026-06-01",
      end_date: "2026-06-02",
      location_label: "Busan",
      purpose: "Client meeting",
    });

    expect(trip.id).toBe("trip-1");
    expect(trip.status).toBe("PENDING");
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/trip/requests");
    expect(init.method).toBe("POST");
    expect(init.body).toBeTypeOf("string");
    const sent = JSON.parse(init.body as string);
    expect(sent.kind).toBe("BUSINESS_TRIP");
    expect(sent.location_label).toBe("Busan");
  });

  it("throws HttpError on non-2xx", async () => {
    mockFetchOnce(
      { error: { code: "INVALID_RANGE", message: "bad range" } },
      { ok: false, status: 422 },
    );
    await expect(
      createTrip({
        kind: "BUSINESS_TRIP",
        start_date: "2026-06-10",
        end_date: "2026-06-01",
        location_label: "X",
      }),
    ).rejects.toThrow();
  });
});
