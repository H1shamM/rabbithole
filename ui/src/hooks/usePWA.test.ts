import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePWA } from "./usePWA";

describe("usePWA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with isInstallable as false", () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isInstallable).toBe(false);
  });

  it("should set isInstallable to true when beforeinstallprompt event is fired", () => {
    const { result } = renderHook(() => usePWA());

    const event = new Event("beforeinstallprompt");
    // @ts-expect-error - Mocking the custom event
    event.preventDefault = vi.fn();

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("should call prompt when showInstallPrompt is called", async () => {
    const { result } = renderHook(() => usePWA());

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt");
    // @ts-expect-error - Mocking event.prompt
    event.prompt = mockPrompt;
    // @ts-expect-error - Mocking event.userChoice
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    // @ts-expect-error - Mocking event.preventDefault
    event.preventDefault = vi.fn();

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.showInstallPrompt();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
  });
});
