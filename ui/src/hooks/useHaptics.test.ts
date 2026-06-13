import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHaptics } from "./useHaptics";
import { Capacitor } from "@capacitor/core";

// Mock Capacitor and Haptics
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    impact: vi.fn(),
  },
  ImpactStyle: {
    Light: "LIGHT",
    Medium: "MEDIUM",
    Heavy: "HEAVY",
  },
}));

// We need to import the mocked modules to setup expectations
import { Haptics, ImpactStyle } from "@capacitor/haptics";

describe("useHaptics", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not call Haptics.impact on web platform", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    const { result } = renderHook(() => useHaptics());

    await result.current.impact("heavy");
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it("calls Haptics.impact with Light style by default on native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    await result.current.impact(); // default
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
  });

  it("calls Haptics.impact with Heavy style on native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    await result.current.impact("heavy");
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Heavy });
  });

  it("calls Haptics.impact with Medium style on native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    await result.current.impact("medium");
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
  });
});
