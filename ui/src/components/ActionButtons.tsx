// ui/src/components/ActionButtons.tsx
import { Button } from "@/components/ui/button";

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
    <div className="flex justify-center gap-2 mt-4">
      <Button
        variant={rating === "like" ? "default" : "outline"}
        size="sm"
        onClick={() => onRate("like")}
        disabled={rateLoading}
        aria-label="Like"
      >
        👍
      </Button>
      <Button
        variant={rating === "dislike" ? "default" : "outline"}
        size="sm"
        onClick={() => onRate("dislike")}
        disabled={rateLoading}
        aria-label="Dislike"
      >
        👎
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFavorite}
        className={isFavorite ? "text-yellow-500" : ""}
        aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      >
        {isFavorite ? "⭐" : "☆"}
      </Button>
      <Button variant="outline" size="sm" onClick={onShare} aria-label="Share">
        📤
      </Button>
      <Button variant="default" size="sm" onClick={onNext} disabled={loading}>
        {loading ? "..." : "➡️ Next Stumble"}
      </Button>
    </div>
  );
}
