// ui/src/components/ActionButtons.tsx
import { ThumbsUp, ThumbsDown, Star, Share2, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  showIframe: boolean;
  current: {
    id: string;
    url: string;
    title?: string;
    category: string;
    source: string;
  } | null;
  loading: boolean;
  rating: "like" | "dislike" | null;
  rateLoading: boolean;
  isFavorite: boolean;
  onRate: (type: "like" | "dislike") => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onNext: () => void;
}

/**
 * Floating action bar for the active stumble: rate, favorite, share, and
 * advance to the next page. Renders nothing when no page is shown.
 */
export function ActionButtons({
  showIframe,
  current,
  loading,
  rating,
  rateLoading,
  isFavorite,
  onRate,
  onToggleFavorite,
  onShare,
  onNext,
}: ActionButtonsProps) {
  if (!showIframe || !current) return null;

  return (
    <div className="sticky bottom-4 z-20 mx-auto flex w-fit items-center gap-1.5 rounded-full border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-md">
      <Button
        variant={rating === "like" ? "default" : "ghost"}
        size="icon-lg"
        className="rounded-full"
        onClick={() => onRate("like")}
        disabled={rateLoading}
        aria-label="Like"
      >
        <ThumbsUp />
      </Button>
      <Button
        variant={rating === "dislike" ? "default" : "ghost"}
        size="icon-lg"
        className="rounded-full"
        onClick={() => onRate("dislike")}
        disabled={rateLoading}
        aria-label="Dislike"
      >
        <ThumbsDown />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <Button
        variant="ghost"
        size="icon-lg"
        className={cn(
          "rounded-full",
          isFavorite && "text-yellow-500 hover:text-yellow-500",
        )}
        onClick={onToggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      >
        <Star className={isFavorite ? "fill-current" : undefined} />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        onClick={onShare}
        aria-label="Share"
      >
        <Share2 />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <Button
        variant="default"
        size="lg"
        className="rounded-full px-4"
        onClick={onNext}
        disabled={loading}
      >
        <Shuffle />
        {loading ? "Finding…" : "Next Stumble"}
      </Button>
    </div>
  );
}
