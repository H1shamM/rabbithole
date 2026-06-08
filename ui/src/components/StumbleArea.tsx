import { getFaviconUrl, estimateReadingTime } from "../utils/contentHelpers";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface StumbleResult {
  id: string;
  url: string;
  proxyUrl?: string;
  title?: string;
  description?: string;
  category: string;
  source: string;
}

interface StumbleAreaProps {
  showIframe: boolean;
  loading: boolean;
  error: string | null;
  current: StumbleResult | null;
  iframeError: boolean;
  onRetry: () => void;
  onClose: () => void;
  onIframeLoad: () => void;
}

export function StumbleArea({
  showIframe,
  loading,
  error,
  current,
  iframeError,
  onRetry,
  onClose,
  onIframeLoad,
}: StumbleAreaProps) {
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === "test");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only observe if not in test environment.
    if (process.env.NODE_ENV === "test") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 flex flex-col gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[60%]" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-destructive">
        <p>⚠️ {error}</p>
        <button className="mt-2 text-primary underline" onClick={onRetry}>
          Try Again
        </button>
      </Card>
    );
  }

  if (!showIframe && !current) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-foreground">
          Ready to explore?
        </h2>
        <p className="mb-4">
          Click Stumble to discover the web, one page at a time!
        </p>
        <Button className="stumble-btn" onClick={onRetry}>
          🎲 Stumble
        </Button>
      </Card>
    );
  }

  if (showIframe && current && !iframeError) {
    const iframeSrc = isVisible
      ? current.proxyUrl || current.url
      : "about:blank";
    return (
      <div className="iframe-container" ref={containerRef}>
        <div className="iframe-header">
          <div className="stumble-card-header">
            <img
              src={getFaviconUrl(current.source)}
              alt=""
              className="source-favicon"
              loading="lazy"
            />
            <span className="stumble-category">{current.category}</span>
            <span className="stumble-source">{current.source}</span>
            {estimateReadingTime(current.description) && (
              <span className="reading-time">
                {estimateReadingTime(current.description)}
              </span>
            )}
          </div>
          <span className="iframe-title">{current.title || current.url}</span>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close iframe"
          >
            ✖
          </button>
        </div>
        <iframe
          src={iframeSrc}
          title="Stumbled page"
          className="iframe"
          onLoad={onIframeLoad}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    );
  }

  if (showIframe && iframeError && current) {
    return (
      <Card className="p-6 text-center text-destructive">
        <p>This page cannot be displayed inside the app.</p>
        <code className="block my-2">{current.url}</code>
        <div className="flex justify-center gap-2">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Open in new tab
          </a>
          <button className="text-secondary underline" onClick={onRetry}>
            Try Another
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </Card>
    );
  }

  return null;
}
