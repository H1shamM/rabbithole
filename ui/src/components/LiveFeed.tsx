import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ChevronUp, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { getFaviconUrl } from "../utils/contentHelpers";
import { useHaptics } from "../hooks/useHaptics";
import type { StumbleResult } from "../hooks/useStumble";

type Overlay =
  (typeof import("@teamhive/capacitor-webview-overlay"))["WebviewOverlay"];

// Make old/desktop sites render mobile-friendly: a phone user-agent (so
// responsive sites serve their mobile layout) + force a device-width viewport
// (so non-responsive sites render at device width instead of a zoomed-out
// ~980px desktop layout). The viewport fix is re-applied after every load.
const MOBILE_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const FIX_VIEWPORT = `(function(){try{var m=document.querySelector('meta[name="viewport"]');if(!m){m=document.createElement('meta');m.setAttribute('name','viewport');(document.head||document.documentElement).appendChild(m);}m.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');}catch(e){}})();`;

interface LiveFeedProps {
  current: StumbleResult | null;
  onNext: () => void;
  onRate: (rating: "like" | "dislike") => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

/**
 * The live-site discovery surface on mobile: the current stumble's website
 * renders **inline in the content area** via a native WebView overlay
 * (@teamhive/capacitor-webview-overlay). It lives *inside the normal app shell*
 * — the app header (search / menu / dark / account) stays above it and is
 * always available — so this is not a separate full-screen "mode". The native
 * overlay covers the middle element only; the context bar above and the action
 * bar below are React chrome. Native-only. Fills its parent (h-full).
 */
export function LiveFeed({
  current,
  onNext,
  onRate,
  onToggleFavorite,
  isFavorite,
}: LiveFeedProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const overlay = useRef<Overlay | null>(null);
  const openedUrl = useRef<string | null>(null);
  const native = Capacitor.isNativePlatform();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { impact } = useHaptics();
  const swipeStart = useRef<{ y: number; t: number } | null>(null);

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

  // Open the inline webview once on mount; close it on unmount.
  useEffect(() => {
    if (!native || !elRef.current || !current) return;
    let cancelled = false;
    (async () => {
      const mod = await import("@teamhive/capacitor-webview-overlay");
      if (cancelled || !elRef.current) return;
      overlay.current = mod.WebviewOverlay;
      mod.WebviewOverlay.onProgress((p) => {
        const v = p.value > 1 ? p.value / 100 : p.value;
        setProgress(v);
        if (v < 1) setLoading(true);
      });
      mod.WebviewOverlay.onPageLoaded(() => {
        setProgress(1);
        setLoading(false);
        // Re-apply the mobile viewport after every navigation.
        mod.WebviewOverlay.evaluateJavaScript(FIX_VIEWPORT).catch(() => {});
      });
      try {
        await mod.WebviewOverlay.open({
          url: current.url,
          element: elRef.current,
          userAgent: MOBILE_UA,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  // Navigate the same overlay to each new stumble. The WebView stays live
  // (always scrollable) — the loading bar covers the load.
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
      <div className="grid h-full place-items-center bg-background p-8 text-center text-sm text-muted-foreground">
        Live site browsing runs in the Android app.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Context bar: which site you're viewing. */}
      <div className="flex items-center gap-2 px-4 py-2">
        {current && (
          <img
            src={getFaviconUrl(current.source)}
            alt=""
            className="size-5 shrink-0 rounded border border-border"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {current?.title || current?.url}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {current?.source}
          </p>
        </div>
      </div>

      {/* Loading bar — outside the overlay rect so it stays visible. */}
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

      {/* Bottom: swipe-up handle + action bar (rating cluster + Next). */}
      <div className="border-t border-border pb-3">
        <div
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
          onClick={advance}
          role="button"
          aria-label="Swipe up for the next site"
          className="flex touch-none flex-col items-center gap-1 pb-1 pt-2"
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
