import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrowse } from "../hooks/useBrowse";
import type { PreviewResult } from "../hooks/usePreview";

interface PreviewCardProps {
  url: string;
  /** Fallbacks used while the preview loads or when the page has no metadata. */
  fallbackTitle?: string;
  fallbackDescription?: string;
  preview: PreviewResult | null;
  loading: boolean;
}

/**
 * A rich "open this site" card for content that can't be embedded inline
 * (interactive sites, image galleries). Shows the page's preview image when
 * available, with title/description, a domain hint, and a prominent open
 * action (in-app native WebView on mobile via useBrowse, new tab on web).
 */
export function PreviewCard({
  url,
  fallbackTitle,
  fallbackDescription,
  preview,
  loading,
}: PreviewCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const { open } = useBrowse();

  if (loading && !preview) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="space-y-3 p-5">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const title = preview?.title || fallbackTitle || url;
  const description = preview?.description || fallbackDescription || null;
  const image = imgFailed ? null : (preview?.image ?? null);
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Hero image */}
      <button
        type="button"
        onClick={() => open(url)}
        className="block w-full cursor-pointer"
        aria-label={`Open ${title}`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="aspect-video w-full bg-muted object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
            <Globe className="size-12 opacity-30" />
          </div>
        )}
      </button>

      {/* Content */}
      <div className="space-y-2 p-5">
        <h2 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </h2>
        {description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Globe className="size-3" />
          <span className="truncate">{hostname}</span>
        </div>
        <button
          onClick={() => open(url)}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          <ExternalLink className="size-4" />
          Open the site
        </button>
      </div>
    </div>
  );
}
