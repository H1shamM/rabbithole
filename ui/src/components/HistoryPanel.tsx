// ui/src/components/HistoryPanel.tsx
import React from 'react';
import { SkeletonLoader } from './SkeletonLoader';

interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  rating_val: 'like' | 'dislike';
  timestamp: Date;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  loading?: boolean;
}

export function HistoryPanel({ history, showHistory, setShowHistory, loading }: HistoryPanelProps) {
  return (
    <div className="history-section">
      <button className="btn secondary history-toggle" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? '🔽 Hide History' : '📋 View History'} ({history.length})
      </button>
      {showHistory && (
        <div className="history-panel">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : history.length === 0 ? (
            <p className="history-empty">📜 No history yet. Start exploring!</p>
          ) : (
            <ul className="history-list">
              {history.slice(0, 10).map((item) => (
                <li key={item.timestamp.toString()} className="history-item">
                  <span className="history-rating">{item.rating_val === 'like' ? '👍' : '👎'}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="history-url">
                    {item.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}