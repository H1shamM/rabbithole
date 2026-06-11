import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PreviewResult } from "../hooks/usePreview";
import { useBrowse } from "../hooks/useBrowse";

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
 * available, with title/description and a prominent open-in-new-tab action.
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
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
    );
  }

  const title = preview?.title || fallbackTitle || url;
  const description = preview?.description || fallbackDescription || null;
  const image = imgFailed ? null : (preview?.image ?? null);

  return (
    <Card className="overflow-hidden">
      {image ? (
        <button
          type="button"
          onClick={() => open(url)}
          className="block w-full cursor-pointer"
          aria-label={`Open ${title}`}
        >
          <img
            src={image}
            alt={title}
            className="max-h-[60vh] w-full bg-muted object-contain"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </button>
      ) : (
        <div className="grid h-48 w-full place-items-center bg-muted text-muted-foreground">
          <Globe className="size-12 opacity-40" />
        </div>
      )}

      <div className="space-y-3 p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Button className="gap-2" onClick={() => open(url)}>
          <ExternalLink className="size-4" />
          Open the site
        </Button>
      </div>
    </Card>
  );
}
