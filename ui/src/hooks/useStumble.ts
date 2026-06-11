import { useState, useCallback, useRef, useEffect } from "react";
import type { AuthenticatedFetch } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export interface StumbleResult {
  id: string;
  url: string;
  proxyUrl?: string;
  title?: string;
  description?: string;
  category: string;
  source: string;
  type?: "article" | "image" | "video" | "interactive";
}

export function useStumble(
  authenticatedFetch: AuthenticatedFetch,
  category: string,
) {
  const [current, setCurrent] = useState<StumbleResult | null>(null);
  const [nextStumble, setNextStumble] = useState<StumbleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeLoadedRef = useRef(false);
  const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIdsRef = useRef<string[]>([]);
  const prevCategory = useRef(category);
  const storageKey = `stumble:seen:${category}`;
  // The id currently shown, and the last id the user actively engaged with
  // (rated/saved). Advancing past a shown-but-not-engaged item reports a skip,
  // a soft implicit-negative signal for topic targeting (#206).
  const currentIdRef = useRef<string | null>(null);
  const engagedIdRef = useRef<string | null>(null);

  // Initialize from storage on mount (once)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      seenIdsRef.current = stored ? JSON.parse(stored) : [];
    } catch {
      seenIdsRef.current = [];
    }
  }, [storageKey]);

  useEffect(() => {
    // Reset when category actually changes
    if (prevCategory.current === category) return;
    prevCategory.current = category;

     
    setNextStumble(null);
    seenIdsRef.current = [];
    sessionStorage.removeItem(storageKey);
    // Switching category isn't a skip — drop the outgoing-item tracking.
    currentIdRef.current = null;
    engagedIdRef.current = null;
  }, [category, storageKey]);

  const markSeen = useCallback((id: string) => {
    if (id && !seenIdsRef.current.includes(id)) {
      seenIdsRef.current.push(id);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(seenIdsRef.current));
      } catch (e) {
        console.warn("Could not persist stumble history", e);
      }
    }
  }, [storageKey]);

  const historyParam = useCallback(() => {
    const seen = seenIdsRef.current;
    return seen.length ? `&history=${encodeURIComponent(seen.join(","))}` : "";
  }, []);

  /** Mark the current item as actively engaged (rated/saved) — suppresses skip. */
  const markEngaged = useCallback((id: string) => {
    engagedIdRef.current = id;
  }, []);

  /** Report a skip for the outgoing item if the user never engaged with it. */
  const reportSkip = useCallback(() => {
    const id = currentIdRef.current;
    if (id && id !== engagedIdRef.current) {
      Promise.resolve(
        authenticatedFetch(`/skip`, {
          method: "POST",
          body: JSON.stringify({ assetId: id }),
        }),
      ).catch(() => {});
    }
  }, [authenticatedFetch]);

  const clearIframeTimeout = useCallback(() => {
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }
  }, []);

  const setBlockedState = useCallback(() => {
    setIframeError(true);
    clearIframeTimeout();
    if (current) {
      // Blocked pages are auto-disliked; mark engaged so advancing doesn't also
      // count a skip on top of the dislike.
      engagedIdRef.current = current.id;
      authenticatedFetch(`/rate`, {
        method: "POST",
        body: JSON.stringify({
          assetId: current.id,
          isPositive: false,
          note: "blocked",
        }),
      }).catch(console.error);
    }
  }, [current, authenticatedFetch, clearIframeTimeout]);

  const startIframeTimeout = useCallback(() => {
    clearIframeTimeout();
    iframeLoadedRef.current = false;
    iframeTimeoutRef.current = setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setBlockedState();
      }
    }, 5000);
  }, [clearIframeTimeout, setBlockedState]);

  const prefetchNext = useCallback(async () => {
    try {
      const res = await authenticatedFetch(
        `/stumble?category=${category}${historyParam()}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.type !== "video" && !data.url.includes("/embed/")) {
        data.proxyUrl = `${API_BASE}/proxy?url=${encodeURIComponent(data.url)}`;
      } else {
        data.proxyUrl = data.url;
      }
      setNextStumble(data);
    } catch (err) {
      console.debug("Prefetch failed", err);
      setNextStumble(null);
    }
  }, [category, authenticatedFetch, historyParam]);

  const fetchStumble = useCallback(async () => {
    // Advancing past the current item without engaging = an implicit skip.
    reportSkip();
    // If we have a pre-fetched next stumble, use it
    if (nextStumble) {
      markSeen(nextStumble.id);
      setCurrent(nextStumble);
      currentIdRef.current = nextStumble.id;
      setShowIframe(true);
      setLoading(false);
      setIframeError(false);
      setNextStumble(null);
      startIframeTimeout();

      // Pre-fetch another one in the background
      prefetchNext();
      return;
    }

    setLoading(true);
    setError(null);
    setShowIframe(false);
    setIframeError(false);
    iframeLoadedRef.current = false;
    clearIframeTimeout();

    try {
      const res = await authenticatedFetch(
        `/stumble?category=${category}${historyParam()}`,
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to fetch stumble: ${res.status} - ${text.slice(0, 100)}`,
        );
      }
      const data: StumbleResult = await res.json();

      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid response format");
      }

      // Add proxy URL
      if (data.type !== "video" && !data.url.includes("/embed/")) {
        data.proxyUrl = `${API_BASE}/proxy?url=${encodeURIComponent(data.url)}`;
      } else {
        data.proxyUrl = data.url;
      }
      markSeen(data.id);
      setCurrent(data);
      currentIdRef.current = data.id;
      setShowIframe(true);
      startIframeTimeout();

      // Pre-fetch another one
      prefetchNext();
    } catch (err: unknown) {
      console.error("Stumble fetch error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    category,
    authenticatedFetch,
    clearIframeTimeout,
    startIframeTimeout,
    nextStumble,
    prefetchNext,
    markSeen,
    historyParam,
    reportSkip,
  ]);

  const handleClose = useCallback(() => {
    setShowIframe(false);
    setIframeError(false);
    clearIframeTimeout();
    iframeLoadedRef.current = false;
  }, [clearIframeTimeout]);

  const handleIframeLoad = useCallback(() => {
    iframeLoadedRef.current = true;
    clearIframeTimeout();
    setIframeError(false);
  }, [clearIframeTimeout]);

  return {
    current,
    loading,
    error,
    showIframe,
    iframeError,
    fetchStumble,
    handleClose,
    handleIframeLoad,
    markEngaged,
  };
}
