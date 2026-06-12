import { useEffect, useRef, useState, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { X, ChevronUp, ThumbsUp, ThumbsDown, Heart, Moon, Sun } from "lucide-react";
import { getFaviconUrl } from "../utils/contentHelpers";
import { useHaptics } from "../hooks/useHaptics";
import type { StumbleResult } from "../hooks/useStumble";

type Overlay =
  (typeof import("@teamhive/capacitor-webview-overlay"))["WebviewOverlay"];

interface LiveFeedProps {
  current: StumbleResult | null;
  onNext: () => void;
  onExit: () => void;
  onRate: (rating: "like" | "dislike") => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  /** App tools surfaced in the reels chrome so you don't have to exit: the
   *  menu (library/categories/search) trigger + a dark-mode toggle. */
  menu?: ReactNode;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

/**
 * Live feed mode (BV1, #280): the current stumble's site renders inline,
 * full-screen, in a native WebView (@teamhive/capacitor-webview-overlay) — the
 * "reels of live websites" surface. The native overlay occupies the middle
 * element only, so the top/bottom app chrome (rendered in the Capacitor
 * WebView) stays visible above it. Tap Next → loadUrl the next stumble.
 * Native-only; on web it shows an install hint.
 */
export function LiveFeed({
  current,
  onNext,
  onExit,
  onRate,
  onToggleFavorite,
  isFavorite,
  menu,
  darkMode,
  onToggleDark,
}: LiveFeedProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const overlay = useRef<Overlay | null>(null);
  const openedUrl = useRef<string | null>(null);
  const native = Capacitor.isNativePlatform();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { impact } = useHaptics();
  const swipeStart = useRef<{ y: number; t: number } | null>(null);

  // Advance to the next site with a tactile tap. The freeze-swap transition
  // (toggleSnapshot) is handled by the loadUrl effect below.
  const advance = () => {
    impact("medium");
    onNext();
  };

  // The bottom handle is React chrome (outside the native overlay's element),
  // so it reliably captures the flick the live WebView would otherwise eat.
  const onHandleTouchStart = (e: React.TouchEvent) => {
    swipeStart.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const onHandleTouchEnd = (e: React.TouchEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s) return;
    const dy = e.changedTouches[0].clientY - s.y;
    const dt = Date.now() - s.t;
    if (dy < -45 && dt < 600) advance();
  };

  // Open the inline webview once on mount; close it on exit.
  useEffect(() => {
    if (!native || !elRef.current || !current) return;
    let cancelled = false;
    (async () => {
      const mod = await import("@teamhive/capacitor-webview-overlay");
      if (cancelled || !elRef.current) return;
      overlay.current = mod.WebviewOverlay;
      // Loading bar (chrome) + reveal the new page once it has loaded.
      mod.WebviewOverlay.onProgress((p) => {
        const v = p.value > 1 ? p.value / 100 : p.value;
        setProgress(v);
        if (v < 1) setLoading(true);
      });
      mod.WebviewOverlay.onPageLoaded(() => {
        setProgress(1);
        setLoading(false);
      });
      try {
        await mod.WebviewOverlay.open({
          url: current.url,
          element: elRef.current,
        });
        openedUrl.current = current.url;
      } catch (e) {
        console.error("[LiveFeed] open failed", e);
      }
    })();
    return () => {
      cancelled = true;
      overlay.current?.close().catch(() => {});
      overlay.current = null;
      openedUrl.current = null;
    };
    // Open once; URL changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  // Swap to the next site (loadUrl) whenever the current stumble changes. The
  // WebView navigates live (always scrollable) — the loading bar covers the
  // load. (No snapshot freeze: some sites never fire onPageLoaded, which left a
  // frozen, unscrollable snapshot.)
  useEffect(() => {
    const url = current?.url;
    if (!url || !overlay.current || openedUrl.current === url) return;
    openedUrl.current = url;
    setLoading(true);
    setProgress(0);
    overlay.current.loadUrl(url).catch((e) => {
      console.error("[LiveFeed] loadUrl failed", e);
    });
  }, [current?.url]);

  if (!native) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background p-8 text-center">
        <div className="space-y-3">
          <p className="text-lg font-semibold">Live feed runs in the app</p>
          <p className="text-sm text-muted-foreground">
            Install the Android app to browse live sites inline.
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={onExit}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top chrome */}
      <div
        className="flex items-center gap-2 px-3 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }}
      >
        {/* Menu (library / categories / search) — reach app functions without
            leaving reels. */}
        {menu && <div className="shrink-0">{menu}</div>}
        {current && (
          <img
            src={getFaviconUrl(current.source)}
            alt=""
            className="size-6 shrink-0 rounded-md border border-border"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {current?.title || current?.url}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {current?.source}
          </p>
        </div>
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        )}
        <button
          onClick={onExit}
          aria-label="Exit live feed"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Loading bar — sits in the chrome (outside the overlay rect) so it
          stays visible above the native view. */}
      <div className="h-0.5 w-full bg-muted">
        {loading && (
          <div
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        )}
      </div>

      {/* The native live-site overlay is positioned over this element. */}
      <div ref={elRef} className="flex-1 bg-white" />

      {/* Bottom chrome: swipe-up handle + action bar (rating cluster + Next). */}
      <div
        className="border-t border-border"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        {/* Flick this handle up to advance — it lives in the chrome (outside
            the native overlay), so the gesture isn't eaten by the live site. */}
        <div
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
          onClick={advance}
          role="button"
          aria-label="Swipe up for the next site"
          className="flex touch-none flex-col items-center gap-1 pb-1 pt-2.5"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Swipe up for next
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                impact("light");
                onRate("dislike");
              }}
              aria-label="Dislike"
              className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ThumbsDown className="size-5" />
            </button>
            <button
              onClick={() => {
                impact("light");
                onToggleFavorite();
              }}
              aria-label="Save to favorites"
              className={
                "grid size-11 place-items-center rounded-full transition-colors hover:bg-muted " +
                (isFavorite
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Heart className={isFavorite ? "size-5 fill-current" : "size-5"} />
            </button>
            <button
              onClick={() => {
                impact("light");
                onRate("like");
              }}
              aria-label="Like"
              className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ThumbsUp className="size-5" />
            </button>
          </div>
          <button
            onClick={advance}
            aria-label="Next stumble"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition active:scale-95"
          >
            <ChevronUp className="size-5" /> Next
          </button>
        </div>
      </div>
    </div>
  );
}
