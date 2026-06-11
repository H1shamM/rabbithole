import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { TouchEvent } from "react";
import { useSwipe } from "./useSwipe";

function touch(y: number): TouchEvent {
  const el = document.createElement("div");
  return {
    touches: [{ clientY: y }],
    changedTouches: [{ clientY: y }],
    target: el,
    currentTarget: el,
  } as unknown as TouchEvent;
}

describe("useSwipe", () => {
  it("fires onSwipeUp on a fast upward flick", () => {
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeUp }));
    result.current.onTouchStart(touch(300));
    result.current.onTouchEnd(touch(180));
    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  it("fires onSwipeDown on a downward flick", () => {
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeDown }));
    result.current.onTouchStart(touch(180));
    result.current.onTouchEnd(touch(320));
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it("ignores a small movement that is not a swipe", () => {
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeUp }));
    result.current.onTouchStart(touch(300));
    result.current.onTouchEnd(touch(282)); // 18px < threshold
    expect(onSwipeUp).not.toHaveBeenCalled();
  });
});
