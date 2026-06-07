// ui/src/components/RecommendationsPanel.tsx
import React from 'react';

interface Recommendation {
  id: string;
  url: string;
  title?: string;
}

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="recommendations-section">
      <h2>Recommended for you</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations yet. Keep rating content!</p>
      ) : (
        <ul className="recommendations-list">
          {Array.isArray(recommendations) && recommendations.map((item) => (
            <li key={item.id} className="recommendation-item">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title || item.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
