import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStumble } from "./useStumble";

describe("useStumble - sessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const makeFetchMock = () => {
    let n = 0;
    return vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: String(++n),
          url: "http://t.com",
          category: "test",
          source: "test",
        }),
      } as Response),
    );
  };

  it("persists seen history to sessionStorage", async () => {
    const fetchMock = makeFetchMock();

    const { result, unmount } = renderHook(() => useStumble(fetchMock, "test"));

    await act(async () => {
      await result.current.fetchStumble();
    });

    expect(JSON.parse(sessionStorage.getItem("stumble:seen:test")!)).toContain("1");
    
    // Remount
    unmount();
    
    const { result: result2 } = renderHook(() => useStumble(fetchMock, "test"));
    
    // The history param should already contain the seen ID from sessionStorage
    await act(async () => {
      await result2.current.fetchStumble();
    });
    
    expect(fetchMock.mock.calls.at(-1)![0]).toContain("history=1");
  });
});
