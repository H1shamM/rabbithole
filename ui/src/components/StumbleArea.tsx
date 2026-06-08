import { getFaviconUrl, estimateReadingTime } from "../utils/contentHelpers";
import { useEffect, useRef, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      <div className="skeleton-stumble">
        <div className="skeleton-circle skeleton-shimmer" />
        <div
          className="skeleton-line skeleton-shimmer"
          style={{ width: "60%" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>⚠️ {error}</p>
        <button className="btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  if (!showIframe && !current) {
    return (
      <div className="stumble-card empty-state">
        <div className="empty-icon">🚀</div>
        <h2>Ready to explore?</h2>
        <p>Click Stumble to discover the web, one page at a time!</p>
      </div>
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
      <div className="iframe-fallback">
        <p>This page cannot be displayed inside the app.</p>
        <code className="fallback-url">{current.url}</code>
        <div className="fallback-actions">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open in new tab
          </a>
          <button className="btn-secondary" onClick={onRetry}>
            Try Another
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return null;
}
