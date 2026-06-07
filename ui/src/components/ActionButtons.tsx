// ui/src/components/ActionButtons.tsx
import React from 'react';

interface ActionButtonsProps {
  showIframe: boolean;
  current: { id: string; url: string; title?: string; category: string; source: string } | null;
  loading: boolean;
  rating: 'like' | 'dislike' | null;
  rateLoading: boolean;
  isFavorite: boolean;
  onRate: (type: 'like' | 'dislike') => void;
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
  if (!current || !showIframe) {
    return (
      <button className="btn primary stumble-btn" onClick={onNext} disabled={loading}>
        {loading ? 'Stumbling...' : '🎲 Stumble'}
      </button>
    );
  }

  return (
    <div className="action-bar">
      <div className="rating-group">
        <button
          className={`btn rate-btn ${rating === 'like' ? 'active' : ''}`}
          onClick={() => onRate('like')}
          disabled={rateLoading || rating !== null}
          aria-label="Like"
        >
          👍
        </button>
        <button
          className={`btn rate-btn ${rating === 'dislike' ? 'active' : ''}`}
          onClick={() => onRate('dislike')}
          disabled={rateLoading || rating !== null}
          aria-label="Dislike"
        >
          👎
        </button>
      </div>
      <button
        className={`btn rate-btn ${isFavorite ? 'active' : ''} favorite-btn`}
        onClick={onToggleFavorite}
        aria-label="Save to favorites"
      >
        {isFavorite ? '⭐' : '☆'}
      </button>
      <button className="btn rate-btn" onClick={onShare} aria-label="Share">📤</button>
      <button className="btn secondary next-btn" onClick={onNext} disabled={loading}>
        {loading ? '...' : '➡️ Next Stumble'}
      </button>
    </div>
  );
}