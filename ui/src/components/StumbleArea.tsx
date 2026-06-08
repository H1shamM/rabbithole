import { getFaviconUrl } from "../utils/contentHelpers";
import { useEffect, useRef, useState } from "react";
import { Compass, Shuffle, AlertTriangle, X, ExternalLink } from "lucide-react";
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

/**
 * The central discovery surface: shows the empty/ready state, a loading
 * skeleton, the embedded page (iframe) for the current stumble, or an error
 * fallback when a page cannot be framed.
 */
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
  const [isVisible, setIsVisible] = useState(import.meta.env.MODE === "test");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (import.meta.env.MODE === "test") return;

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
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </Card>
    );
  }

  if (!showIframe && !current) {
    return (
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to explore?
          </h2>
          <p className="max-w-sm text-muted-foreground">
            Hit Stumble to discover the web, one hidden gem at a time.
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={onRetry}>
          <Shuffle />
          Stumble
        </Button>
      </Card>
    );
  }

  if (showIframe && current && !iframeError) {
    const iframeSrc = isVisible
      ? current.proxyUrl || current.url
      : "about:blank";
    return (
      <Card className="overflow-hidden p-0" ref={containerRef}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <img
            src={getFaviconUrl(current.source)}
            alt=""
            className="size-5 shrink-0 rounded"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {current.title || current.url}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {current.category} · {current.source}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Open in new tab"
          >
            <a href={current.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close iframe"
          >
            <X />
          </Button>
        </div>
        <iframe
          src={iframeSrc}
          title="Stumbled page"
          className="h-[70vh] w-full border-none bg-white"
          onLoad={onIframeLoad}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </Card>
    );
  }

  if (showIframe && iframeError && current) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <AlertTriangle className="size-6" />
        </div>
        <p className="font-medium">This page can&apos;t be displayed here.</p>
        <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {current.url}
        </code>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <a href={current.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Open in new tab
            </a>
          </Button>
          <Button onClick={onRetry} className="gap-2">
            <Shuffle className="size-4" />
            Try another
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
