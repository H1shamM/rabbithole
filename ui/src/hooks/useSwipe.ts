import { useRef } from "react";

interface SwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Minimum vertical travel (px) to count as a swipe. */
  threshold?: number;
  /** Maximum duration (ms) — a swipe is a *flick*, not a slow drag. */
  maxDuration?: number;
}

/**
 * Detects a fast vertical flick for stumble navigation (swipe up = next),
 * while deferring to inner scrolling: a swipe-up only fires when the nearest
 * scrollable ancestor *within the bound element* is at its bottom (or there is
 * none). So reading a long article scrolls normally, but a flick on a preview
 * card — or after you've read to the end — advances. Non-blocking: it never
 * calls preventDefault, so native scroll is untouched.
 */
export function useSwipe({
  onSwipeUp,
  onSwipeDown,
  threshold = 90,
  maxDuration = 500,
}: SwipeOptions) {
  const start = useRef<{ y: number; t: number; target: Element | null } | null>(
    null,
  );

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    start.current = {
      y: touch.clientY,
      t: Date.now(),
      target: e.target as Element,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;

    const touch = e.changedTouches[0];
    const dy = touch.clientY - s.y;
    const dt = Date.now() - s.t;
    if (dt > maxDuration || Math.abs(dy) < threshold) return;

    const scrollable = nearestScrollable(s.target, e.currentTarget);
    if (dy < 0) {
      // Swipe up → next, unless we're mid-scroll in a long article.
      if (!scrollable || atBottom(scrollable)) onSwipeUp?.();
    } else if (!scrollable || atTop(scrollable)) {
      onSwipeDown?.();
    }
  };

  return { onTouchStart, onTouchEnd };
}

/** Nearest scrollable ancestor between `el` and `boundary` (exclusive). */
function nearestScrollable(
  el: Element | null,
  boundary: Element,
): Element | null {
  let node: Element | null = el;
  while (node && node !== boundary && node !== document.body) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      /(auto|scroll)/.test(overflowY) &&
      node.scrollHeight > node.clientHeight + 4
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

const atBottom = (el: Element) =>
  el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
const atTop = (el: Element) => el.scrollTop <= 8;
