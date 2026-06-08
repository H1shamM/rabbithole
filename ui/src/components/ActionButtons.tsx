// ui/src/components/ActionButtons.tsx
import React from "react";
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
    <div className="action-bar">
      <Button
        variant={rating === "like" ? "default" : "secondary"}
        size="sm"
        onClick={() => onRate("like")}
        disabled={rateLoading}
        className="rate-btn"
        aria-label="Like"
      >
        👍
      </Button>
      <Button
        variant={rating === "dislike" ? "default" : "secondary"}
        size="sm"
        onClick={() => onRate("dislike")}
        disabled={rateLoading}
        className="rate-btn"
        aria-label="Dislike"
      >
        👎
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggleFavorite}
        className={`favorite-btn ${isFavorite ? "active" : ""}`}
        aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      >
        {isFavorite ? "⭐" : "☆"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onShare}
        aria-label="Share"
      >
        📤
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onNext}
        disabled={loading}
        className="next-btn"
      >
        {loading ? "..." : "➡️ Next Stumble"}
      </Button>
    </div>
  );
}
